// Construtor de cupom ESC/POS para mini-impressoras térmicas 58mm (ex.: Kapbom KA-1445).
// Gera um Uint8Array pronto pra enviar via Bluetooth. Largura padrão: 32 colunas (Fonte A, 58mm).
//
// Acentos são transliterados para ASCII (ç->c, ã->a, …). Esses clones de impressora têm
// suporte de codepage inconsistente; ASCII garante um cupom sempre legível.

const WIDTH = 32;

// ---- comandos ESC/POS ----
const ESC = 0x1b;
const GS = 0x1d;
const LF = 0x0a;

const CMD = {
  init: [ESC, 0x40], // ESC @  (reset)
  alignLeft: [ESC, 0x61, 0x00],
  alignCenter: [ESC, 0x61, 0x01],
  alignRight: [ESC, 0x61, 0x02],
  boldOn: [ESC, 0x45, 0x01],
  boldOff: [ESC, 0x45, 0x00],
  sizeNormal: [GS, 0x21, 0x00], // GS ! 0
  sizeDoubleH: [GS, 0x21, 0x01], // dobra altura
  sizeDoubleW: [GS, 0x21, 0x10], // dobra largura
  sizeDouble: [GS, 0x21, 0x11], // dobra largura + altura
  feed: (n) => [ESC, 0x64, n], // ESC d n  (avança n linhas)
  cut: [GS, 0x56, 0x42, 0x00], // GS V 66 0 (corte parcial; ignorado em impressoras sem cutter)
};

// Remove acentos/diacríticos e troca símbolos não-ASCII por equivalentes seguros.
const toAscii = (str) =>
  String(str ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // tira diacríticos
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[—–]/g, '-')
    .replace(/[^\x20-\x7e]/g, ''); // tira o que sobrar de não-ASCII

const money = (v) =>
  'R$ ' + (Number(v) || 0).toFixed(2).replace('.', ',');

class Builder {
  constructor() {
    this.bytes = [];
  }
  raw(arr) {
    for (let i = 0; i < arr.length; i++) this.bytes.push(arr[i] & 0xff);
    return this;
  }
  text(str) {
    const s = toAscii(str);
    for (let i = 0; i < s.length; i++) this.bytes.push(s.charCodeAt(i) & 0xff);
    return this;
  }
  line(str = '') {
    return this.text(str).raw([LF]);
  }
  // "esquerda" + espaços + "direita", truncando se não couber.
  cols(left, right) {
    let l = toAscii(left);
    const r = toAscii(right);
    const space = WIDTH - r.length;
    if (l.length > space - 1) l = l.slice(0, Math.max(0, space - 1));
    const pad = Math.max(1, WIDTH - l.length - r.length);
    return this.line(l + ' '.repeat(pad) + r);
  }
  rule(ch = '-') {
    return this.line(ch.repeat(WIDTH));
  }
  // Quebra um texto longo em várias linhas de até WIDTH colunas, com prefixo opcional.
  wrap(str, prefix = '') {
    const words = toAscii(str).split(/\s+/);
    let cur = prefix;
    words.forEach((w) => {
      if ((cur + (cur === prefix ? '' : ' ') + w).length > WIDTH) {
        this.line(cur);
        cur = prefix.replace(/\S/g, ' ') + w; // indenta continuação
      } else {
        cur = cur === prefix ? prefix + w : cur + ' ' + w;
      }
    });
    if (cur.trim()) this.line(cur);
    return this;
  }
  build() {
    return new Uint8Array(this.bytes);
  }
}

/**
 * Monta o cupom a partir de um modelo simples (montado em Orders.jsx).
 * @param {Object} r
 * @param {string} r.tenantName
 * @param {string} [r.tenantDoc]
 * @param {string} [r.tenantPhone]
 * @param {number|string} r.orderId
 * @param {string} r.createdAt   - já formatado (ex.: "26/06/2026 14:32")
 * @param {('Mesa'|'Delivery')} r.origin
 * @param {string} [r.tableNumber]
 * @param {string} [r.customerName]
 * @param {string} [r.customerPhone]
 * @param {string} [r.address]
 * @param {Array<{quantity:number,name:string,unitPrice:number,notes?:string,options?:Array<{name:string,charge?:number}>}>} r.items
 * @param {number} r.subtotal
 * @param {number} r.serviceFee
 * @param {number} r.deliveryFee
 * @param {number} r.discount
 * @param {number} r.total
 * @param {string} [r.payment]
 * @param {string} [r.change]
 * @returns {Uint8Array}
 */
export function buildReceipt(r) {
  const b = new Builder();
  b.raw(CMD.init);

  // Cabeçalho da loja
  b.raw(CMD.alignCenter).raw(CMD.boldOn).raw(CMD.sizeDoubleW);
  b.line(r.tenantName || 'Restaurante');
  b.raw(CMD.sizeNormal).raw(CMD.boldOff);
  if (r.tenantDoc) b.line('CNPJ/CPF: ' + r.tenantDoc);
  if (r.tenantPhone) b.line('Tel: ' + r.tenantPhone);
  b.rule('=');

  // Identificação do pedido
  b.raw(CMD.alignLeft).raw(CMD.boldOn);
  b.line('PEDIDO #' + r.orderId);
  b.raw(CMD.boldOff);
  b.line(r.createdAt || '');
  if (r.origin === 'Mesa') {
    b.line('MESA ' + (r.tableNumber || '?'));
    if (r.customerName) b.line('Cliente: ' + r.customerName);
  } else {
    b.line('DELIVERY');
    if (r.customerName) b.line('Cliente: ' + r.customerName);
    if (r.customerPhone) b.line('Tel: ' + r.customerPhone);
    if (r.address) b.wrap(r.address, 'End: ');
  }
  b.rule('-');

  // Itens
  (r.items || []).forEach((it) => {
    const qty = it.quantity || 1;
    const lineTotal = (Number(it.unitPrice) || 0) * qty;
    b.raw(CMD.boldOn);
    b.cols(`${qty}x ${toAscii(it.name)}`, money(lineTotal));
    b.raw(CMD.boldOff);
    (it.options || []).forEach((op) => {
      const charge = Number(op.charge) || 0;
      b.cols('  + ' + toAscii(op.name), charge ? money(charge) : '');
    });
    if (it.notes) b.wrap('Obs: ' + it.notes, '  ');
  });
  b.rule('-');

  // Totais
  b.cols('Subtotal', money(r.subtotal));
  if (Number(r.serviceFee)) b.cols('Taxa de servico', money(r.serviceFee));
  if (Number(r.deliveryFee)) b.cols('Entrega', money(r.deliveryFee));
  if (Number(r.discount)) b.cols('Desconto', '-' + money(r.discount));
  b.raw(CMD.boldOn).raw(CMD.sizeDoubleH);
  b.cols('TOTAL', money(r.total));
  b.raw(CMD.sizeNormal).raw(CMD.boldOff);

  if (r.payment) b.cols('Pagamento', toAscii(r.payment).toUpperCase());
  if (r.change && r.change !== '-') b.cols('Troco', toAscii(r.change));

  // Rodapé
  b.rule('=');
  b.raw(CMD.alignCenter);
  b.line('Priatoo');
  b.line('Bom apetite!');

  b.raw(CMD.feed(4));
  b.raw(CMD.cut);
  return b.build();
}

export default buildReceipt;
