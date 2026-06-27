// Transporte para mini-impressoras térmicas ESC/POS (ex.: Kapbom KA-1445).
//
// Suporta DOIS modos de conexão no navegador (Chrome/Edge desktop, HTTPS/localhost):
//   - 'serial'    : Web Serial API. Abre a PORTA COM criada pelo pareamento Bluetooth
//                   Clássico/SPP (driver embutido do Windows). É o que funciona com a
//                   maioria das mini 58mm (KA-1445 inclusa), sem driver de impressora
//                   nem app intermediário.
//   - 'bluetooth' : Web Bluetooth (BLE/GATT). Só para impressoras que falam BLE de verdade.
//
// Pontos centrais (valem para os dois modos):
//   - FILA SERIALIZADA (mutex): jobs entram numa Promise encadeada; só UM cupom imprime
//     por vez, mesmo com vários aceites simultâneos.
//   - CHUNKING: bytes enviados em pedaços com respiro (buffer pequeno dessas impressoras).

const CHUNK_SIZE = 180;
const CHUNK_DELAY_MS = 24;
const SERIAL_BAUD = 9600; // sobre Bluetooth SPP o baud é praticamente ignorado; 9600 é seguro.

// Serviços GATT comuns em clones 58mm BLE (usados no modo bluetooth).
const KNOWN_SERVICES = [
  0x18f0, 0xff00, 0xffe0, 0xffb0,
  '49535343-fe7d-4ae5-8fa9-9fafd205e455',
  0xfee7, 0xfff0,
];

const hasBluetooth = typeof navigator !== 'undefined' && !!navigator.bluetooth;
const hasSerial = typeof navigator !== 'undefined' && !!navigator.serial;

// --- estado da conexão ativa ---
let activeTransport = null; // 'serial' | 'bluetooth' | null
// bluetooth
let device = null;
let characteristic = null;
// serial
let port = null;
let writer = null;

let connecting = null;
let chain = Promise.resolve(); // fila (mutex)

const listeners = new Set();
const state = {
  supported: hasSerial || hasBluetooth,
  supportedSerial: hasSerial,
  supportedBluetooth: hasBluetooth,
  transport: null,
  status: 'disconnected', // disconnected | connecting | connected | printing | error
  deviceName: '',
  error: '',
  queueLength: 0,
};

function emit(patch) {
  Object.assign(state, patch);
  listeners.forEach((fn) => {
    try {
      fn({ ...state });
    } catch (_) {
      /* noop */
    }
  });
}

export function subscribe(fn) {
  listeners.add(fn);
  fn({ ...state });
  return () => listeners.delete(fn);
}

export function getState() {
  return { ...state };
}

export function isSupported() {
  return state.supported;
}

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

/* ------------------------------ modo SERIAL ------------------------------ */

async function ensureSerial() {
  if (port && writer && port.writable) return;
  if (!port) throw new Error('Nenhuma porta selecionada. Clique em "Conectar impressora".');
  // Reabre se a porta caiu.
  if (!port.writable) {
    await port.open({ baudRate: SERIAL_BAUD });
  }
  writer = port.writable.getWriter();
}

export async function connectSerial() {
  if (!hasSerial) {
    const msg = 'Este navegador nao suporta porta serial (use Chrome/Edge no PC).';
    emit({ status: 'error', error: msg });
    throw new Error(msg);
  }
  emit({ status: 'connecting', error: '', transport: 'serial' });

  // 1) Pede a porta ao usuário PRIMEIRO (precisa de gesto/click). Lista todas as portas COM:
  //    USB/cabo (impressoras profissionais ao lado do PC) e a COM do Bluetooth pareado.
  let chosen;
  try {
    chosen = await navigator.serial.requestPort();
  } catch (e) {
    // Cancelou o seletor: mantém a conexão atual (se houver) sem alarde.
    if (e?.name === 'NotFoundError') {
      emit({ status: writer ? 'connected' : 'disconnected', error: '' });
    } else {
      emit({ status: 'error', error: e.message || 'Falha ao abrir a porta.' });
    }
    throw e;
  }

  // 2) Já está nessa mesma porta e aberta? Reaproveita.
  if (chosen === port && port.writable && writer) {
    activeTransport = 'serial';
    emit({ status: 'connected', transport: 'serial', error: '' });
    return { name: state.deviceName || 'Porta serial (COM)' };
  }

  try {
    // 3) Troca de impressora: fecha a anterior pra não vazar a porta.
    if (port && port !== chosen) await closeSerial();
    port = chosen;
    if (!port.writable) await port.open({ baudRate: SERIAL_BAUD });
    writer = port.writable.getWriter();
    activeTransport = 'serial';
    const info = port.getInfo ? port.getInfo() : {};
    const name = info?.usbProductId ? `Porta serial (${info.usbProductId})` : 'Porta serial (COM)';
    emit({ status: 'connected', transport: 'serial', deviceName: name, error: '' });
    return { name };
  } catch (e) {
    emit({ status: 'error', error: e.message || 'Falha ao abrir a porta.' });
    throw e;
  }
}

// Reconexão SILENCIOSA: reabre uma porta já autorizada antes (sem mostrar o seletor).
// Permite "imprimir no aceite" sem clicar em conectar de novo, mesmo após recarregar a página.
export async function tryAutoConnect() {
  if (activeTransport) return true;
  if (!hasSerial) return false;
  try {
    const ports = await navigator.serial.getPorts();
    if (ports && ports.length) {
      port = ports[0];
      if (!port.writable) await port.open({ baudRate: SERIAL_BAUD });
      writer = port.writable.getWriter();
      activeTransport = 'serial';
      emit({ status: 'connected', transport: 'serial', deviceName: 'Porta serial (COM)', error: '' });
      return true;
    }
  } catch (_) {
    /* sem porta autorizada ainda */
  }
  return false;
}

async function writeSerial(bytes) {
  await ensureSerial();
  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    await writer.write(bytes.slice(i, i + CHUNK_SIZE));
    if (i + CHUNK_SIZE < bytes.length) await sleep(CHUNK_DELAY_MS);
  }
}

async function closeSerial() {
  try {
    if (writer) {
      await writer.close().catch(() => {});
      writer.releaseLock();
    }
  } catch (_) {
    /* noop */
  }
  try {
    if (port) await port.close();
  } catch (_) {
    /* noop */
  }
  writer = null;
  port = null;
}

/* ----------------------------- modo BLUETOOTH ---------------------------- */

function onBleDisconnected() {
  characteristic = null;
  emit({ status: 'disconnected', error: '' });
}

async function resolveCharacteristic(server) {
  const services = await server.getPrimaryServices();
  for (const service of services) {
    let chars = [];
    try {
      chars = await service.getCharacteristics();
    } catch (_) {
      continue;
    }
    for (const ch of chars) {
      const p = ch.properties || {};
      if (p.write || p.writeWithoutResponse) return ch;
    }
  }
  return null;
}

async function ensureBle() {
  if (characteristic && device?.gatt?.connected) return characteristic;
  if (!device) throw new Error('Nenhuma impressora pareada. Clique em "Conectar (Bluetooth BLE)".');
  if (connecting) return connecting;
  connecting = (async () => {
    const server = await device.gatt.connect();
    const ch = await resolveCharacteristic(server);
    if (!ch) throw new Error('Nao encontrei uma caracteristica gravavel na impressora.');
    characteristic = ch;
    return ch;
  })();
  try {
    return await connecting;
  } finally {
    connecting = null;
  }
}

export async function connectBluetooth() {
  if (!hasBluetooth) {
    const msg = 'Este navegador nao suporta Bluetooth (use Chrome/Edge).';
    emit({ status: 'error', error: msg });
    throw new Error(msg);
  }
  emit({ status: 'connecting', error: '', transport: 'bluetooth' });
  try {
    device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: KNOWN_SERVICES,
    });
    device.addEventListener('gattserverdisconnected', onBleDisconnected);
    await ensureBle();
    activeTransport = 'bluetooth';
    emit({ status: 'connected', transport: 'bluetooth', deviceName: device.name || 'Impressora', error: '' });
    return { name: device.name || 'Impressora' };
  } catch (e) {
    if (e?.name === 'NotFoundError') {
      emit({ status: characteristic ? 'connected' : 'disconnected', error: '' });
    } else {
      emit({ status: 'error', error: e.message || 'Falha ao conectar.' });
    }
    throw e;
  }
}

async function writeBle(bytes) {
  const ch = await ensureBle();
  const useNoResponse = ch.properties?.writeWithoutResponse;
  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    const chunk = bytes.slice(i, i + CHUNK_SIZE);
    if (useNoResponse && ch.writeValueWithoutResponse) {
      await ch.writeValueWithoutResponse(chunk);
    } else if (ch.writeValueWithResponse) {
      await ch.writeValueWithResponse(chunk);
    } else {
      await ch.writeValue(chunk);
    }
    if (i + CHUNK_SIZE < bytes.length) await sleep(CHUNK_DELAY_MS);
  }
}

/* ------------------------------ API pública ------------------------------ */

export function disconnect() {
  if (activeTransport === 'serial') {
    closeSerial();
  } else if (activeTransport === 'bluetooth') {
    try {
      if (device?.gatt?.connected) device.gatt.disconnect();
    } catch (_) {
      /* noop */
    }
    characteristic = null;
  }
  activeTransport = null;
  emit({ status: 'disconnected', transport: null, deviceName: '', error: '' });
}

async function writeBytes(bytes) {
  if (activeTransport === 'serial') return writeSerial(bytes);
  if (activeTransport === 'bluetooth') return writeBle(bytes);
  throw new Error('Impressora nao conectada. Clique em "Conectar impressora".');
}

/**
 * Enfileira a impressão de um cupom (Uint8Array ESC/POS).
 * Retorna uma Promise que resolve quando ESTE job termina. A fila garante 1 por vez.
 */
export function print(bytes) {
  emit({ queueLength: state.queueLength + 1 });
  const job = chain.then(async () => {
    emit({ status: 'printing', error: '' });
    try {
      await writeBytes(bytes);
      emit({ status: 'connected', error: '' });
      return true;
    } catch (e) {
      emit({ status: 'error', error: e.message || 'Falha ao imprimir.' });
      throw e;
    } finally {
      emit({ queueLength: Math.max(0, state.queueLength - 1) });
    }
  });
  chain = job.catch(() => {}); // mantém a corrente viva mesmo após falha
  return job;
}

const thermalPrinter = {
  isSupported,
  connectSerial,
  connectBluetooth,
  tryAutoConnect,
  disconnect,
  print,
  subscribe,
  getState,
};
export default thermalPrinter;
