import React, { useMemo, useState } from 'react';
import { Button } from '../../../../shared/components/ui';

const statusStyles = {
  novo: 'bg-blue-50 text-blue-700 border border-blue-100',
  preparando: 'bg-amber-50 text-amber-700 border border-amber-100',
  pronto: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  enviado: 'bg-slate-50 text-slate-700 border border-slate-200',
};

const mockOrders = [
  {
    id: '#4512',
    client: 'Ana Clara',
    items: 'Salmão grelhado, limonada',
    total: 'R$ 78,00',
    time: 'Há 2 min',
    status: 'novo',
    eta: '08 min',
  },
  {
    id: '#4511',
    client: 'Lucas Ribeiro',
    items: 'Burger artesanal, batata',
    total: 'R$ 52,50',
    time: 'Há 5 min',
    status: 'preparando',
    eta: '14 min',
  },
  {
    id: '#4510',
    client: 'Juliana Alves',
    items: 'Risoto de cogumelos',
    total: 'R$ 64,00',
    time: 'Há 10 min',
    status: 'preparando',
    eta: '10 min',
  },
  {
    id: '#4509',
    client: 'Carlos Daniel',
    items: 'Pizza marguerita',
    total: 'R$ 48,00',
    time: 'Há 16 min',
    status: 'pronto',
    eta: 'Para retirada',
  },
  {
    id: '#4508',
    client: 'Fernanda Rocha',
    items: 'Bowl asiático, chá gelado',
    total: 'R$ 56,00',
    time: 'Há 22 min',
    status: 'enviado',
    eta: 'Entregador a caminho',
  },
];

const Orders = () => {
  const [filter, setFilter] = useState('todos');

  const columns = useMemo(
    () => [
      { key: 'novo', title: 'Novos', helper: 'chegaram agora' },
      { key: 'preparando', title: 'Preparando', helper: 'na cozinha' },
      { key: 'pronto', title: 'Prontos', helper: 'para retirar' },
      { key: 'enviado', title: 'Em entrega', helper: 'a caminho' },
    ],
    []
  );

  const filteredOrders =
    filter === 'todos' ? mockOrders : mockOrders.filter((order) => order.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">Pedidos em andamento</p>
          <h1 className="text-2xl font-bold text-gray-900">Trilha de preparação</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" className="border border-gray-200 text-gray-700">Exportar</Button>
          <Button>Nova cozinha</Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {['todos', ...columns.map((c) => c.key)].map((key) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-full border text-sm font-medium transition ${
              filter === key
                ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                : 'bg-white text-gray-700 border-gray-200 hover:border-[var(--accent)]/50'
            }`}
          >
            {key === 'todos' ? 'Todos' : key.charAt(0).toUpperCase() + key.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {columns.map((column) => (
          <div key={column.key} className="bg-white rounded-3xl border border-gray-100 shadow-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{column.helper}</p>
                <h3 className="text-lg font-semibold text-gray-900">{column.title}</h3>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                {mockOrders.filter((o) => o.status === column.key).length}
              </span>
            </div>

            {filteredOrders
              .filter((order) => order.status === column.key)
              .map((order) => (
                <div key={order.id} className="rounded-2xl border border-gray-100 p-4 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{order.id}</p>
                      <p className="font-semibold text-gray-900">{order.client}</p>
                    </div>
                    <span
                      className={`text-xs px-3 py-1 rounded-full capitalize ${statusStyles[order.status]}`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{order.items}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">{order.time}</p>
                      <p className="text-sm font-semibold text-gray-900">{order.total}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Previsão</p>
                      <p className="text-sm font-semibold text-[var(--accent)]">{order.eta}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="ghost" className="border border-gray-200 text-gray-700">
                      Detalhes
                    </Button>
                    {order.status !== 'enviado' && (
                      <Button size="sm" className="flex-1">
                        Avançar etapa
                      </Button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;