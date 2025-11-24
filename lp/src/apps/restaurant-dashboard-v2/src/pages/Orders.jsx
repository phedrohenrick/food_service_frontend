import React, { useMemo, useState } from 'react';
import { useTenant } from '../context/TenantContext';

const statusMap = {
  CREATED: 'Criado',
  PAYMENT_AUTHORIZED: 'Pagamento Autorizado',
  ACCEPTED: 'Aceito',
  IN_PREPARATION: 'Em preparo',
  READY: 'Pronto',
  WAITING_FOR_COLLECTION: 'Aguardando retirada',
  ON_ROUTE: 'A caminho',
  DELIVERED: 'Entregue',
  COMPLETED: 'Finalizado',
  CANCELED: 'Cancelado',
};

const kitchenQueue = [
  { id: '#2032', items: ['Cheeseburger', 'Batata média'], status: 'IN_PREPARATION', startedAt: '12:33', eta: '05m' },
  { id: '#2033', items: ['Combo Clássico'], status: 'ACCEPTED', startedAt: '12:35', eta: '12m' },
  { id: '#2034', items: ['Veggie Burger'], status: 'READY', startedAt: '12:31', eta: 'Pronto' },
];

const OrderCard = ({ order }) => (
  <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{order.id}</p>
        <p className="text-sm text-gray-600">Início: {order.startedAt}</p>
      </div>
      <span className="text-xs px-2 py-1 rounded bg-[var(--accent)]/10 text-[var(--accent)]">{statusMap[order.status]}</span>
    </div>
    <ul className="mt-3 text-sm text-gray-800 list-disc list-inside">
      {order.items.map((i, idx) => (
        <li key={idx}>{i}</li>
      ))}
    </ul>
    <div className="mt-3 flex items-center justify-between">
      <span className="text-sm text-gray-600">ETA {order.eta}</span>
      <div className="inline-flex gap-2">
        <button className="px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm">Imprimir</button>
        <button className="px-3 py-1.5 rounded-md bg-[var(--accent)] text-[var(--accent-contrast)] text-sm hover:bg-[var(--accent-hover)]">Avançar</button>
      </div>
    </div>
  </div>
);

const Orders = () => {
  const { tenant } = useTenant();
  const [filter, setFilter] = useState('IN_PREPARATION');

  const filtered = useMemo(() => kitchenQueue.filter((o) => o.status === filter), [filter]);

  const filters = [
    { key: 'ACCEPTED', label: 'Aceitos' },
    { key: 'IN_PREPARATION', label: 'Em preparo' },
    { key: 'READY', label: 'Prontos' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Pedidos em produção</h2>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm bg-[var(--accent)] text-[var(--accent-contrast)]`}>
          {tenant.isOpen ? 'Aberto' : 'Fechado'}
        </span>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto">
        {filters.map((f) => (
          <button
            key={f.key}
            className={`px-3 py-1.5 rounded-md border text-sm whitespace-nowrap ${
              filter === f.key
                ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {filtered.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
};

export default Orders;