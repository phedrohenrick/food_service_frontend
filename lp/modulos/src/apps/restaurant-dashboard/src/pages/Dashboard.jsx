import React from 'react';

const Dashboard = () => {
  const stats = [
    { name: 'Pedidos Hoje', value: '23', change: '+12%', changeType: 'increase' },
    { name: 'Receita Hoje', value: 'R$ 1.234', change: '+8%', changeType: 'increase' },
    { name: 'Pedidos Pendentes', value: '5', change: '-2%', changeType: 'decrease' },
    { name: 'Avaliação Média', value: '4.8', change: '+0.1', changeType: 'increase' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Visão geral do seu restaurante</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`text-sm font-medium ${
                stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Pedidos Recentes</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((order) => (
              <div key={order} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-background-primary rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">#{order}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Pedido #{order}234</p>
                    <p className="text-sm text-gray-600">Cliente {order}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">R$ {(order * 25).toFixed(2)}</p>
                  <p className="text-sm text-green-600">Confirmado</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;