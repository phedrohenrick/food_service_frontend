import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Input, Modal } from '../../../../shared/components/ui';
import { useStorefront } from '../../../../shared/generalContext.jsx';
import { formatOrderStatus } from '../../../../shared/utils/orderStatus';
import FeatureLock from '../components/FeatureLock';
import { Inbox, Utensils, Printer } from 'lucide-react';
import { useThermalPrinter } from '../hooks/useThermalPrinter';

// Estilos para colunas da pipeline
const pipelineStyles = {
  novo: 'bg-blue-50 text-blue-700 border border-blue-100',
  preparando: 'bg-amber-50 text-amber-700 border border-amber-100',
  pronto: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  enviado: 'bg-slate-50 text-slate-700 border border-slate-200',
};

// Estilos para status atuais (último status do pedido)
const statusPills = {
  CREATED: 'bg-green-100 text-green-800 border border-green-400',
  PAYMENT_AUTHORIZED: 'bg-blue-100 text-blue-700',
  ACCEPTED: 'bg-blue-100 text-blue-700',
  IN_PREPARATION: 'bg-amber-100 text-amber-800',
  READY: 'bg-emerald-100 text-emerald-700',
  ON_ROUTE: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  COMPLETED: 'bg-green-200 text-green-800',
  CANCELED: 'bg-red-100 text-red-700',
};

const fmtDate = (iso) =>
  new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(
    new Date(iso)
  );
const money = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

const pipelineKeyForStatus = (status) => {
  switch (status) {
    case 'CREATED':
    case 'PAYMENT_AUTHORIZED':
    case 'ACCEPTED':
      return 'novo';
    case 'IN_PREPARATION':
      return 'preparando';
    case 'READY':
      return 'pronto';
    case 'ON_ROUTE':
    case 'DELIVERED':
    case 'COMPLETED':
    case 'CANCELED':
      return 'enviado';
    default:
      return 'novo';
  }
};

const nextStatus = (current) => {
  switch (current) {
    case 'CREATED':
      return 'ACCEPTED';
    case 'PAYMENT_AUTHORIZED':
    case 'ACCEPTED':
      return 'IN_PREPARATION';
    case 'IN_PREPARATION':
      return 'READY';
    case 'READY':
      return 'ON_ROUTE';
    case 'ON_ROUTE':
      return 'DELIVERED';
    case 'DELIVERED':
      return 'COMPLETED';
    default:
      return 'COMPLETED';
  }
};

const Orders = () => {
  const { orders, user, tenant, maps, getOrderDetailed, addOrderStatus, updateOrderStatus, reloadOrders, canUseFeature, entitlements } = useStorefront();
  const [filter, setFilter] = useState('todos');
  const [originFilter, setOriginFilter] = useState('todos');
  const [expanded, setExpanded] = useState(null);
  const [dayClosed, setDayClosed] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportDate, setExportDate] = useState(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const [exportSending, setExportSending] = useState(false);
  const [exportMessage, setExportMessage] = useState('');

  // Polling estável: guarda a referência mais recente de reloadOrders num ref e cria UM
  // único intervalo (deps []). loadData muda de identidade a cada dispatch; sem o ref, o
  // efeito recriava o intervalo a cada render — empilhando polls e estourando conexões
  // (ERR_INSUFFICIENT_RESOURCES / tela piscando).
  const reloadRef = useRef(reloadOrders);
  useEffect(() => { reloadRef.current = reloadOrders; }, [reloadOrders]);
  useEffect(() => {
    let alive = true;
    const tick = () => { if (alive) reloadRef.current?.(); };
    tick();
    const intervalId = setInterval(tick, 12000);
    return () => { alive = false; clearInterval(intervalId); };
  }, []);

  const isToday = (iso) => {
    const d = new Date(iso);
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    return d >= start && d < end;
  };

  const columns = useMemo(
    () => [
      { key: 'novo', title: 'Novos', helper: 'chegaram agora' },
      { key: 'preparando', title: 'Preparando', helper: 'na cozinha' },
      { key: 'pronto', title: 'Prontos', helper: 'para retirar' },
      { key: 'enviado', title: 'Em entrega', helper: 'a caminho' },
    ],
    []
  );

  const ordersWithLast = useMemo(() => {
    return (orders || []).map((o) => {
      const detailed = getOrderDetailed(o.id);
      const last = detailed?.timeline?.[detailed.timeline.length - 1] || null;
      return { order: o, detailed, lastStatus: last?.status || 'CREATED', lastAt: last?.created_at };
    });
  }, [orders, getOrderDetailed]);

  const filteredOrders = useMemo(() => {
    let base = filter === 'todos'
      ? ordersWithLast
      : ordersWithLast.filter((row) => pipelineKeyForStatus(row.lastStatus) === filter);
    if (originFilter === 'mesa') {
      base = base.filter((row) => row.order.tab_id != null);
    } else if (originFilter === 'delivery') {
      base = base.filter((row) => row.order.tab_id == null);
    }
    return base.filter((row) => (dayClosed ? !isToday(row.order.created_at) : true));
  }, [ordersWithLast, filter, originFilter, dayClosed]);

  const openOrdersCount = useMemo(() => {
    return ordersWithLast.filter(
      (row) => !(row.lastStatus === 'DELIVERED' || row.lastStatus === 'COMPLETED' || row.lastStatus === 'CANCELED')
    ).length;
  }, [ordersWithLast]);

  const countByColumn = (key) =>
    ordersWithLast.filter((row) => pipelineKeyForStatus(row.lastStatus) === key && (dayClosed ? !isToday(row.order.created_at) : true)).length;

  const handleCloseDayClick = () => {
    if (openOrdersCount > 0) {
      setConfirmClose(true);
    } else {
      setDayClosed(true);
    }
  };

  const isSameDay = (iso, ymd) => {
    if (!iso || !ymd) return false;
    const d = new Date(iso);
    const [y, m, d2] = ymd.split('-').map((x) => parseInt(x, 10));
    return d.getFullYear() === y && (d.getMonth() + 1) === m && d.getDate() === d2;
  };

  const handleConfirmExport = async () => {
    setExportSending(true);
    setExportMessage('');
    try {
      const dayOrders = ordersWithLast.filter((row) => isSameDay(row.order.created_at, exportDate));
      if (!dayOrders.length) {
        setExportMessage('Nenhum pedido encontrado para o dia selecionado.');
        setExportSending(false);
        return;
      }

      // CSV pronto pra Excel/Sheets em pt-BR: separador ";", decimais com vírgula e BOM p/ acentos.
      const csvCell = (v) => {
        const s = String(v ?? '');
        return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      };
      const num = (v) => (Number(v) || 0).toFixed(2).replace('.', ',');

      const header = ['Pedido', 'Data/Hora', 'Origem', 'Cliente/Mesa', 'Status', 'Subtotal', 'Taxa serviço', 'Entrega', 'Desconto', 'Total', 'Pagamento'];
      const rows = dayOrders
        .slice()
        .sort((a, b) => new Date(a.order.created_at) - new Date(b.order.created_at))
        .map(({ order, lastStatus }) => {
          const isTable = order.tab_id != null;
          const who = isTable
            ? (order.customer_name || `Mesa ${order.table_number ?? ''}`)
            : (user?.name || 'Cliente');
          const serviceFee = order.service_fee ?? (order.subtotal || 0) * 0.08;
          return [
            order.id,
            fmtDate(order.created_at),
            isTable ? 'Mesa' : 'Delivery',
            who,
            formatOrderStatus(lastStatus),
            num(order.subtotal),
            num(serviceFee),
            num(order.delivery_fee),
            num(order.discount),
            num(order.total),
            (order.payment_channel || '').toUpperCase(),
          ].map(csvCell).join(';');
        });
      const totalDia = dayOrders.reduce((s, { order }) => s + (Number(order.total) || 0), 0);
      const csv = '﻿' + [header.join(';'), ...rows, `Total do dia;;;;;;;;;${num(totalDia)};`].join('\r\n');

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pedidos-${exportDate}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setExportMessage(`${dayOrders.length} pedido(s) exportado(s) — baixando "pedidos-${exportDate}.csv".`);
    } catch (e) {
      setExportMessage('Falha ao exportar. Tente novamente.');
    } finally {
      setExportSending(false);
    }
  };

  const canAct = (status) => !(status === 'COMPLETED' || status === 'CANCELED');
  const isClosed = (status) => status === 'COMPLETED' || status === 'CANCELED' || status === 'DELIVERED';
  const sectionCardClass =
    'rounded-[30px] border border-slate-200/80 bg-white/95 shadow-[0_28px_70px_-34px_rgba(15,23,42,0.35)] backdrop-blur-sm';
  const subtleButtonClass =
    'border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50';

  // Impressão térmica (Bluetooth/ESC-POS). A fila do serviço serializa os jobs — sem
  // concorrência mesmo com vários aceites ao mesmo tempo.
  const {
    supported: printerSupported,
    supportedSerial,
    supportedBluetooth,
    status: printerStatus,
    deviceName,
    error: printerError,
    queueLength: printerQueue,
    isConnected: printerConnected,
    autoPrint,
    setAutoPrint,
    connectSerial,
    connectBluetooth,
    tryAutoConnect,
    printReceipt,
  } = useThermalPrinter();

  // Monta o modelo do cupom a partir da linha do pedido (pedido + detalhado + mapas).
  const buildReceiptModel = (row) => {
    const { order, detailed } = row;
    const isTable = order.tab_id != null;
    const address = maps.addressMap[order.address_id];
    const neighborhood = address ? maps.neighborhoodMap[address.neighborhood_id] : null;
    const addressText = address
      ? `${address.street}, ${address.street_number} - ${neighborhood?.name || ''}` +
        `${address.complement ? ' (' + address.complement + ')' : ''} - ${address.city || ''}`
      : '';
    const items = (detailed?.items || []).map((it) => ({
      quantity: it.quantity,
      name: it.item_name_snapshot,
      unitPrice: it.unit_price,
      notes: it.notes,
      options: (it.options || []).map((op) => ({
        name: (op.groupName ? op.groupName + ': ' : '') + (op.option?.name || op.option_name_snapshot || ''),
        charge: op.option?.additional_charge ?? op.additional_charge ?? 0,
      })),
    }));
    return {
      tenantName: tenant?.name || 'Restaurante',
      tenantDoc: tenant?.cnpj_cpf,
      tenantPhone: tenant?.whatsapp_phone || tenant?.phone,
      orderId: order.id,
      createdAt: fmtDate(order.created_at),
      origin: isTable ? 'Mesa' : 'Delivery',
      tableNumber: order.table_number,
      customerName: isTable ? (order.customer_name || '') : (user?.name || ''),
      customerPhone: isTable ? '' : (user?.phone || ''),
      address: isTable ? '' : addressText,
      items,
      subtotal: order.subtotal,
      serviceFee: order.service_fee ?? (order.subtotal || 0) * 0.08,
      deliveryFee: order.delivery_fee,
      discount: order.discount,
      total: order.total,
      payment: order.payment_channel,
      change: order.change,
    };
  };

  // Impressão manual (reimpressão): conecta sob demanda usando o gesto do clique.
  // Prioriza a porta serial (caso da maioria das mini 58mm SPP); cai pra BLE se for o caso.
  const handlePrint = async (row) => {
    try {
      if (!printerConnected) {
        if (supportedSerial) await connectSerial();
        else await connectBluetooth();
      }
      await printReceipt(buildReceiptModel(row));
    } catch (_) {
      /* erro já refletido no status da impressora */
    }
  };

  // Avança o status; ao ACEITAR (CREATED -> ACCEPTED), imprime o cupom automaticamente
  // se o toggle estiver ligado — reconectando sozinho se a porta tiver caído.
  const handleAdvance = async (row) => {
    const { order, lastStatus } = row;
    const wasAccept = lastStatus === 'CREATED';
    const ok = await updateOrderStatus(order.id, nextStatus(lastStatus));
    if (!(ok && wasAccept && autoPrint)) return;
    try {
      if (!printerConnected) {
        const reconnected = await tryAutoConnect(); // silencioso (porta já autorizada)
        if (!reconnected) {
          // Primeira vez na sessão: usa o gesto do próprio clique de aceitar pra conectar.
          if (supportedSerial) await connectSerial();
          else await connectBluetooth();
        }
      }
      await printReceipt(buildReceiptModel(row));
    } catch (_) {
      /* erro já refletido no status da impressora */
    }
  };

  // Bloqueio do painel de pedidos (online_orders) para planos sem acesso. Avalia só após
  // os entitlements carregarem (evita piscar o overlay no load).
  const entitlementsLoaded = entitlements && Object.keys(entitlements).length > 0;
  const ordersAllowed = !entitlementsLoaded || canUseFeature('online_orders');
  const lockStatus = tenant?.subscription_status;
  const isInactive = lockStatus === 'PAST_DUE' || lockStatus === 'CANCELED';
  const lockTitle = lockStatus === 'TRIALING'
    ? 'Período de teste expirado'
    : isInactive ? 'Assinatura inativa' : 'Seu plano não cobre esse recurso';
  const lockMessage = lockStatus === 'TRIALING'
    ? 'Seu período de avaliação gratuito terminou. Ative um plano para receber pedidos no painel.'
    : isInactive
      ? 'Regularize sua assinatura para voltar a receber pedidos no painel.'
      : 'O painel de pedidos online está disponível a partir do plano Delivery.';
  const lockCta = (lockStatus === 'TRIALING' || isInactive) ? 'Ativar assinatura' : 'Ver planos';
  const lockBadge = lockStatus === 'TRIALING'
    ? 'Período grátis expirado'
    : isInactive ? 'Assinatura inativa' : 'Recurso bloqueado';

  return (
    <FeatureLock
      locked={!ordersAllowed}
      title={lockTitle}
      benefit="Receba e gerencie seus pedidos em tempo real, sem depender do WhatsApp."
      message={lockMessage}
      ctaLabel={lockCta}
      badgeLabel={lockBadge}
    >
    <div className="space-y-6 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.96),_rgba(241,245,249,0.92)_44%,_rgba(226,232,240,0.95)_100%)] p-1 rounded-[30px] ">

      <div className={`${sectionCardClass} px-6 py-6`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium tracking-[0.18em] text-slate-500 uppercase">Pedidos em andamento</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Trilha de preparação do dia</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" className={subtleButtonClass} onClick={() => setExportOpen(true)}>Exportar</Button>
            <Button
              variant={dayClosed ? 'ghost' : undefined}
              className={dayClosed ? subtleButtonClass : ''}
              onClick={handleCloseDayClick}
            >
              Fechar expediente (limpar hoje)
            </Button>
          </div>
        </div>

        {/* Barra da impressora térmica */}
        {printerSupported ? (
          <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-200/70 pt-4">
            <div className="flex items-center gap-2">
              <Printer className="h-4 w-4 text-slate-500" strokeWidth={2} />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Impressora</span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                  printerConnected
                    ? 'bg-emerald-100 text-emerald-700'
                    : printerStatus === 'connecting'
                    ? 'bg-amber-100 text-amber-700'
                    : printerStatus === 'error'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    printerConnected ? 'bg-emerald-500' : printerStatus === 'error' ? 'bg-red-500' : 'bg-slate-400'
                  }`}
                />
                {printerStatus === 'printing'
                  ? `Imprimindo…${printerQueue > 1 ? ` (${printerQueue} na fila)` : ''}`
                  : printerConnected
                  ? deviceName || 'Conectada'
                  : printerStatus === 'connecting'
                  ? 'Conectando…'
                  : 'Desconectada'}
              </span>
            </div>
            {supportedSerial && (
              <Button
                size="sm"
                variant="ghost"
                className={subtleButtonClass}
                title="Impressoras USB/cabo (profissionais) ou a porta COM do Bluetooth pareado"
                onClick={() => connectSerial().catch(() => {})}
              >
                {printerConnected ? 'Trocar impressora' : 'Conectar impressora (USB / cabo / Bluetooth)'}
              </Button>
            )}
            {supportedBluetooth && (
              <Button
                size="sm"
                variant="ghost"
                className={subtleButtonClass}
                title="Apenas impressoras que falam Bluetooth BLE"
                onClick={() => connectBluetooth().catch(() => {})}
              >
                Conectar (Bluetooth BLE)
              </Button>
            )}
            <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={autoPrint}
                onChange={(e) => setAutoPrint(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-[var(--accent)] focus:ring-[var(--accent)]"
              />
              Imprimir cupom ao aceitar
            </label>
            {printerError && <span className="text-xs text-red-600">{printerError}</span>}
            <p className="w-full text-[11px] text-slate-400">
              A impressora reconecta sozinha após a 1ª vez. Use <strong>Conectar impressora</strong> para escolher ou trocar de equipamento — serve para as mais profissionais por USB/cabo ao lado do PC.
            </p>
          </div>
        ) : (
          <div className="mt-5 border-t border-slate-200/70 pt-4 text-xs text-slate-500">
            Impressão indisponível neste navegador. Use <strong>Chrome</strong> ou <strong>Edge</strong> no PC para conectar a impressora (USB/cabo ou Bluetooth).
          </div>
        )}
      </div>

      {confirmClose && (
        <div className="rounded-[26px] border border-amber-200 bg-amber-50/95 p-4 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.3)]">
          <p className="text-sm font-medium text-amber-900">
            Há {openOrdersCount} pedidos em aberto (não entregues). Deseja limpar mesmo a aba?
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => { setDayClosed(true); setConfirmClose(false); }}>
              Limpar mesmo
            </Button>
            <Button size="sm" variant="ghost" className={subtleButtonClass} onClick={() => setConfirmClose(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      <Modal isOpen={exportOpen} onClose={() => { setExportOpen(false); setExportMessage(''); }} title="Exportar pedidos do dia" size="md">
        <div className="space-y-3">
          <p className="text-sm text-gray-600">Selecione o dia e baixe uma planilha (CSV) com todos os pedidos — pronta para abrir no Excel ou Google Sheets.</p>
          <Input label="Dia para exportar" type="date" value={exportDate} onChange={(e) => setExportDate(e.target.value)} />
          {exportMessage && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
              {exportMessage}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleConfirmExport} disabled={exportSending}>
              {exportSending ? 'Exportando…' : 'Baixar CSV'}
            </Button>
            <Button variant="ghost" className={subtleButtonClass} onClick={() => { setExportOpen(false); setExportMessage(''); }}>
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>

      <div className="flex flex-wrap gap-3">
        <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold mt-3">STATUS:</span>
        {['todos', ...columns.map((c) => c.key)].map((key) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-full border text-sm font-medium shadow-sm transition ${
              filter === key
              ? 'bg-[var(--accent)] text-[var(--accent-contrast)] border-[var(--accent)]'
                : 'bg-white text-slate-700 border-slate-200 hover:border-[var(--accent)]/50 hover:bg-slate-50'
            }`}
          >
            {key === 'todos' ? 'Todos' : key.charAt(0).toUpperCase() + key.slice(1)}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold mr-1">Origem:</span>
        {[
          { key: 'todos', label: 'Todos' },
          { key: 'delivery', label: 'Delivery' },
          { key: 'mesa', label: 'Mesa' },
        ].map((opt) => (
          <button
            key={opt.key}
            onClick={() => setOriginFilter(opt.key)}
            className={`px-3 py-1.5 rounded-full border text-xs font-medium transition ${
              originFilter === opt.key
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {columns.map((column) => (
          <div key={column.key} className="rounded-[30px] border border-slate-200/80 bg-white/95 p-4 shadow-[0_24px_60px_-34px_rgba(15,23,42,0.35)] space-y-4">
            <div className="flex items-center justify-between rounded-[24px] border border-slate-200 bg-slate-50/80 px-4 py-3">
              <div>
                <p className="text-xs font-medium tracking-[0.16em] text-slate-500 uppercase">{column.helper}</p>
                <h3 className="mt-1 text-lg font-semibold text-slate-950">{column.title}</h3>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full ${pipelineStyles[column.key]}`}>
                {countByColumn(column.key)}
              </span>
            </div>

            {(() => {
              const colOrders = filteredOrders.filter((row) => pipelineKeyForStatus(row.lastStatus) === column.key);
              if (colOrders.length === 0) {
                return (
                  <div className="flex flex-col items-center justify-center rounded-[20px] border border-dashed border-slate-200 py-10 text-center">
                    <Inbox className="h-7 w-7 text-slate-300" strokeWidth={1.5} />
                    <p className="mt-2 text-xs font-medium text-slate-400">Nenhum pedido aqui</p>
                  </div>
                );
              }
              return colOrders.map(({ order, detailed, lastStatus, lastAt }) => {
                const address = maps.addressMap[order.address_id];
                const neighborhood = address ? maps.neighborhoodMap[address.neighborhood_id] : null;
                const statusClass = statusPills[lastStatus] || 'bg-gray-100 text-gray-700';
                const serviceFee = order.service_fee ?? (order.subtotal || 0) * (0.08); // fallback
                const isExpanded = expanded === order.id;

                const isTableOrder = order.tab_id != null;
                return (
                  <div
                    key={order.id}
                    className={`rounded-[26px] border bg-[linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(248,250,252,0.98))] p-4 shadow-[0_18px_45px_-34px_rgba(15,23,42,0.4)] space-y-4 ${
                      isTableOrder ? '' : 'border-slate-500'
                    }`}
                    style={
                      isTableOrder
                        ? {
                            borderColor: 'var(--accent)',
                            borderLeftWidth: '6px',
                          }
                        : undefined
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xs font-medium tracking-[0.12em] text-slate-500 uppercase">Pedido #{order.id}</p>
                          {isTableOrder && (
                            <span
                              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                              style={{
                                background: 'color-mix(in srgb, var(--accent) 14%, transparent)',
                                color: 'var(--accent)',
                              }}
                            >
                              <Utensils className="h-3 w-3" strokeWidth={2.5} /> Mesa {order.table_number ?? '?'}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 font-semibold text-slate-950">
                          {isTableOrder
                            ? (order.customer_name || `Mesa ${order.table_number ?? ''}`)
                            : (user?.name || 'Cliente')}
                        </p>
                        {!isTableOrder && <p className="text-xs text-slate-500">{user?.phone}</p>}
                      </div>
                      <div className="text-right">
                        <div className="relative inline-flex items-center justify-center">
                          {lastStatus === 'CREATED' && (
                            <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60 animate-ping"></span>
                          )}
                          <span className={`relative text-xs px-3 py-1 rounded-full border ${statusClass}`}>
                            {formatOrderStatus(lastStatus)}
                          </span>
                        </div>
                        <p className="mt-1 text-[10px] text-slate-500">{lastAt ? fmtDate(lastAt) : ''}</p>
                      </div>
                    </div>

                    {isTableOrder ? (
                      <div
                        className="rounded-2xl border p-3 text-sm text-slate-700 shadow-sm"
                        style={{
                          borderColor: 'color-mix(in srgb, var(--accent) 30%, transparent)',
                          background: 'color-mix(in srgb, var(--accent) 8%, white)',
                        }}
                      >
                        <p className="font-semibold" style={{ color: 'var(--accent)' }}>
                          Consumo na mesa
                        </p>
                        <p className="truncate">
                          Mesa {order.table_number ?? '?'}
                          {order.customer_name ? ` · ${order.customer_name}` : ''}
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-3 text-sm text-slate-600 shadow-sm">
                        <p>Endereço:</p>
                        <p className="truncate">
                          {address
                            ? `${address.street}, ${address.street_number} · ${neighborhood?.name} (${money(neighborhood?.price)})`
                            : 'Sem endereço'}
                        </p>
                        {address?.complement && (
                          <p className="truncate">{address.complement}</p>
                        )}
                        {address && (
                          <p className="truncate">{address.city} · CEP {address.zip_code}</p>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3">
                      <div className="text-xs text-slate-600">
                        <p>Criado</p>
                        <p className="font-medium text-slate-900">{fmtDate(order.created_at)}</p>
                      </div>
                      <div className="text-xs text-slate-600 text-right">
                        <p>Total</p>
                        <p className="font-semibold text-slate-900">{money(order.total)}</p>
                      </div>
                      <div className="text-xs text-slate-600">
                        <p>Subtotal</p>
                        <p>{money(order.subtotal)}</p>
                      </div>
                      <div className="text-xs text-slate-600">
                        <p>Taxa serviço</p>
                        <p>{money(serviceFee)}</p>
                      </div>
                      <div className="text-xs text-slate-600">
                        <p>Entrega</p>
                        <p>{money(order.delivery_fee)}</p>
                      </div>
                      <div className="text-xs text-slate-600">
                        <p>Desconto</p>
                        <p>{money(order.discount)}</p>
                      </div>
                      <div className="text-xs text-slate-600">
                        <p>Pagamento</p>
                        <p className="uppercase">{order.payment_channel}</p>
                      </div>
                      <div className="text-xs text-slate-600">
                        <p>Troco</p>
                        <p>{order.change || '-'}</p>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="space-y-3 border-t border-slate-200 pt-3">
                        <div>
                          <p className="text-xs font-medium tracking-[0.14em] text-slate-500 uppercase">Itens do pedido</p>
                          <div className="mt-2 space-y-2">
                            {(detailed?.items || []).map((item) => (
                              <div key={item.id} className="rounded-2xl border border-slate-200 bg-white/85 p-3 shadow-sm">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium text-slate-900">
                                    {item.item_name_snapshot}
                                  </p>
                                  <p className="text-sm text-slate-700">{item.quantity} × {money(item.unit_price)}</p>
                                </div>
                                {item?.highlights?.length > 0 && (
                                  <p className="text-[10px] text-amber-700">{item.highlights.join(', ')}</p>
                                )}
                                {item.notes && (
                                  <p className="mt-1 text-xs text-slate-700">Observação: {item.notes}</p>
                                )}
                                {(item.options || []).length > 0 && (
                                  <div className="mt-2 space-y-1 text-xs text-slate-600">
                                    {item.options.map((opt) => (
                                      <div key={opt.id} className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-slate-800">
                                          + {opt.groupName ? `${opt.groupName}: ` : ''}
                                          {opt.option?.name || opt.option_name_snapshot}
                                        </span>
                                        <span>{money(opt.option?.additional_charge ?? opt.additional_charge ?? 0)}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-xs font-medium tracking-[0.14em] text-slate-500 uppercase">Timeline de status</p>
                          <div className="mt-2 space-y-1">
                            {(detailed?.timeline || []).map((st) => (
                              <div key={st.id} className="flex flex-wrap items-center justify-between gap-2 text-xs">
                                <span className={`px-2 py-1 rounded border ${statusPills[st.status] || 'bg-gray-100 text-gray-700'}`}>{formatOrderStatus(st.status)}</span>
                                <span className="w-full text-right text-slate-600 sm:w-auto">{fmtDate(st.created_at)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className={subtleButtonClass}
                        onClick={() => setExpanded((prev) => (prev === order.id ? null : order.id))}
                      >
                        {isExpanded ? 'Ocultar' : 'Detalhes'}
                      </Button>
                      {printerSupported && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className={subtleButtonClass}
                          onClick={() => handlePrint({ order, detailed, lastStatus, lastAt })}
                        >
                          <Printer className="mr-1 h-3.5 w-3.5" strokeWidth={2} /> Imprimir
                        </Button>
                      )}
                      {!isClosed(lastStatus) && (
                        <>
                          <Button
                            size="sm"
                            className="flex-1 min-w-[160px]"
                            onClick={() => handleAdvance({ order, detailed, lastStatus, lastAt })}
                          >
                            {lastStatus === 'CREATED' ? 'Aceitar pedido' : 'Avançar etapa'}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className={`${subtleButtonClass} w-full sm:w-auto`}
                            onClick={() => updateOrderStatus(order.id, 'DELIVERED')}
                          >
                            Entregue
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="w-full border border-red-200 bg-white text-red-700 shadow-sm hover:bg-red-50 sm:w-auto"
                            onClick={() => updateOrderStatus(order.id, 'CANCELED')}
                          >
                            Cancelar
                          </Button>
                        </>
                      )}
                      {isClosed(lastStatus) && (
                        <Button
                          size="sm"
                          className="w-full sm:w-auto"
                          onClick={() => updateOrderStatus(order.id, 'IN_PREPARATION')}
                        >
                          Reabrir
                        </Button>
                      )}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        ))}
      </div>
    </div>
    </FeatureLock>
  );
};

export default Orders;
