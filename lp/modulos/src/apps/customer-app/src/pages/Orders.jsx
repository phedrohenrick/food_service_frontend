import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../../shared/components/ui';
import { useStorefront } from '../context/StorefrontContext';

const statusPills = {
  CRIADO: 'bg-gray-100 text-gray-700',
  PAGAMENTO_AUTORIZADO: 'bg-blue-100 text-blue-700',
  EM_PREPARO: 'bg-yellow-100 text-yellow-800',
  EM_ROTA: 'bg-purple-100 text-purple-700',
  ENTREGUE: 'bg-green-100 text-green-700',
};

const Orders = () => {
  const { orders } = useStorefront();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Pedidos</p>
          <h1 className="text-3xl font-semibold text-gray-900">Histórico recente</h1>
          <p className="text-sm text-gray-500">
            Veja o status completo, valores e itens pedidos.
          </p>
        </div>
        <Link to="/app">
          <Button variant="ghost" className="text-[var(--accent)]">
            Voltar ao cardápio
          </Button>
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-3xl bg-white p-10 text-center shadow">
          <p className="text-4xl mb-3">🕑</p>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Você ainda não fez pedidos
          </h2>
          <Link to="/app" className="text-[var(--accent-contrast)] font-semibold">
            Comece pelo cardápio
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => (
            <article
              key={order.id}
              className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm space-y-4"
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-semibold text-gray-400">
                  Pedido #{order.id}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    statusPills[order.status] || 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {order.status.replace('_', ' ')}
                </span>
                <span className="text-sm text-gray-500">
                  {new Intl.DateTimeFormat('pt-BR', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  }).format(new Date(order.createdAt))}
                </span>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-gray-400 uppercase tracking-[0.3em]">Resumo</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {order.items.map((item) => item.name).slice(0, 2).join(', ')}
                    {order.items.length > 2 && '...'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)} itens
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 uppercase tracking-[0.3em]">Pagamento</p>
                  <p className="text-sm text-gray-600">Canal: {order.paymentChannel}</p>
                  <p className="text-sm text-gray-600">
                    Total: R$ {order.total.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center justify-end">
                  <Link to={`/app/pedidos/${order.id}`}>
                    <Button variant="outline">Ver detalhes</Button>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
