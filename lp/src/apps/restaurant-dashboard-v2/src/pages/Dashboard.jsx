import React from 'react';
import { useTenant } from '../context/TenantContext';

const StatCard = ({ title, value, trend }) => (
  <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
    <p className="text-sm text-gray-500">{title}</p>
    <div className="mt-2 flex items-baseline gap-2">
      <span className="text-2xl font-semibold text-gray-900">{value}</span>
      {trend && (
        <span className={`text-xs px-2 py-1 rounded bg-[var(--accent)]/10 text-[var(--accent)]`}>{trend}</span>
      )}
    </div>
  </div>
);

const Dashboard = () => {
  const { tenant } = useTenant();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Visão Geral</h2>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm bg-[var(--accent)] text-[var(--accent-contrast)]`}>
          {tenant.isOpen ? 'Aberto' : 'Fechado'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <StatCard title="Pedidos hoje" value="27" trend="+8%" />
        <StatCard title="Tempo médio" value="18m" trend="-2m" />
        <StatCard title="Ticket médio" value="R$ 42,70" trend="+3%" />
        <StatCard title="Itens em falta" value="2" trend="-1" />
      </div>

      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-medium">Fila de produção</h3>
          <button className="px-3 py-1.5 rounded-md bg-[var(--accent)] text-[var(--accent-contrast)] text-sm hover:bg-[var(--accent-hover)]">Ver todos</button>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { id: '#1024', item: 'Cheeseburger Duplo', status: 'IN_PREPARATION', eta: '6 min' },
            { id: '#1025', item: 'Combo Clássico', status: 'ACCEPTED', eta: '10 min' },
            { id: '#1026', item: 'Veggie Burger', status: 'READY', eta: 'Pronto' },
          ].map((order) => (
            <div key={order.id} className="border border-gray-100 rounded-lg p-3 bg-gray-50">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{order.id}</span>
                <span className="text-xs px-2 py-1 rounded bg-[var(--accent)]/10 text-[var(--accent)]">{order.status}</span>
              </div>
              <p className="mt-2 font-medium">{order.item}</p>
              <p className="text-sm text-gray-600">ETA: {order.eta}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;