import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '../../../../shared/components/ui';
import { useStorefront } from '../../../../shared/generalContext.jsx';

const statusLabel = {
  CREATED: 'Pedido criado',
  PAYMENT_AUTHORIZED: 'Pagamento autorizado',
  ACCEPTED: 'Pedido aceito',
  IN_PREPARATION: 'Em preparo',
  READY: 'Pronto para coleta',
  WAITING_FOR_COLLECTION: 'Aguardando coleta',
  ON_ROUTE: 'Em rota de entrega',
  DELIVERED: 'Entregue',
  COMPLETED: 'Concluído',
  CANCELED: 'Cancelado',
};

const OrderDetails = () => {
  const { orderId } = useParams();
  const { orders, addresses, tenant, getOrderDetailed } = useStorefront();
  const detailed = getOrderDetailed(orderId);
  const order = detailed?.order || null;
  const address = order ? (addresses || []).find((item) => item.id === order.address_id) : null;

  if (!order) {
    return (
      <div className="rounded-3xl bg-white p-10 text-center shadow">
        <p className="text-4xl mb-3">📦</p>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Não encontramos esse pedido
        </h2>
        <Link to="/app/pedidos" className="text-[var(--accent-contrast)] font-semibold">
          Voltar para pedidos
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-gray-400">
            Pedido #{order.id}
          </p>
          <h1 className="text-3xl font-semibold text-gray-900">{tenant.name}</h1>
          <p className="text-sm text-gray-500">
            {new Intl.DateTimeFormat('pt-BR', {
              dateStyle: 'medium',
              timeStyle: 'short',
            }).format(new Date(order.created_at))}
          </p>
        </div>
        <Link to="/app/pedidos">
          <Button variant="ghost" className="text-[var(--accent)]">
            Voltar
          </Button>
        </Link>
      </div>

      <section className="grid gap-6 lg:grid-cols-3">
        <article className="lg:col-span-2 rounded-3xl bg-white p-6 shadow space-y-6">
          <header>
            <h2 className="text-xl font-semibold text-gray-900">Linha do tempo</h2>
            <p className="text-sm text-gray-500">
              Atualizamos cada etapa conforme o pedido avança.
            </p>
          </header>
          <div className="space-y-4">
            {detailed.timeline.map((step, index) => (
              <div key={step.status} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span
                    className={`h-4 w-4 rounded-full border-4 ${
                      step.completed ? 'border-[var(--accent)]' : 'border-gray-200'
                    }`}
                  />
                  {index < detailed.timeline.length - 1 && (
                    <span className="h-12 w-px bg-gradient-to-b from-gray-300 to-transparent" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    {statusLabel[step.status] || step.label}
                  </p>
                  <p className="text-sm text-gray-500">
                    {step.timestamp
                      ? new Intl.DateTimeFormat('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        }).format(new Date(step.timestamp))
                      : 'Aguardando atualização'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </article>
        <article className="space-y-4 rounded-3xl bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-gray-900">Resumo financeiro</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>R$ {order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Serviço</span>
              <span>R$ {order.service_fee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Entrega</span>
              <span>R$ {order.delivery_fee.toFixed(2)}</span>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-gray-100 pt-4">
            <span className="text-base font-semibold text-gray-900">Total</span>
            <span className="text-3xl font-bold text-[var(--accent-contrast)]">
              R$ {order.total.toFixed(2)}
            </span>
          </div>
          <p className="text-sm text-gray-500">
            Pagamento via {order.payment_channel}
            {(order.payment_channel === 'dinheiro' || order.payment_channel === 'CASH') && order.change
              ? ` · Troco para ${order.change}`
              : ''}
          </p>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-3xl bg-white p-6 shadow space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Itens do pedido</h2>
          <div className="space-y-3 text-sm text-gray-600">
            {detailed.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-2xl border border-gray-100 p-4"
              >
                <div>
                  <p className="font-semibold text-gray-900">
                    {item.quantity}x {item.item_name_snapshot}
                  </p>
                  <p className="text-xs text-gray-500">
                    Preço unitário R$ {(item.unit_price ?? 0).toFixed(2)}
                  </p>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  R$ {((item.unit_price ?? 0) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </article>
        <article className="rounded-3xl bg-white p-6 shadow space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Endereço de entrega</h2>
          <div className="rounded-2xl border border-gray-100 p-4 text-sm text-gray-600">
            <p className="font-semibold text-gray-900">{address?.label || 'Endereço'}</p>
            <p>
              {address?.street}, {address?.streetNumber || address?.street_number}
            </p>
            <p>
              {address?.city}
            </p>
            <p>CEP {address?.zipCode || address?.zip_code}</p>
            {address?.complement && <p>Complemento: {address.complement}</p>}
          </div>
          <p className="text-xs text-gray-500">
            Precisa atualizar algo? Edite a sacola antes de emitir um novo pedido.
          </p>
        </article>
      </section>
    </div>
  );
};

export default OrderDetails;
