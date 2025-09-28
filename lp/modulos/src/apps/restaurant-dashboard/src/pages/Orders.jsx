import React, { useState } from 'react';
import { Button } from '../../../../shared/components/ui';

const Orders = () => {
  const [filter, setFilter] = useState('all');

  const orders = [
    { id: 1, customer: 'João Silva', items: 'Pizza Margherita, Coca-Cola', total: 45.90, status: 'pending', time: '10:30' },
    { id: 2, customer: 'Maria Santos', items: 'Hambúrguer, Batata Frita', total: 32.50, status: 'preparing', time: '10:25' },
    { id: 3, customer: 'Pedro Costa', items: 'Salada Caesar, Suco Natural', total: 28.00, status: 'ready', time: '10:20' },
    { id: 4, customer: 'Ana Oliveira', items: 'Lasanha, Refrigerante', total: 38.90, status: 'delivered', time: '10:15' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'preparing': return 'Preparando';
      case 'ready': return 'Pronto';
      case 'delivered': return 'Entregue';
      default: return status;
    }
  };

  const filteredOrders = filter === 'all' ? orders : orders.filter(order => order.status === filter);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
        <p className="text-gray-600">Gerencie todos os pedidos do seu restaurante</p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'all', label: 'Todos' },
              { key: 'pending', label: 'Pendentes' },
              { key: 'preparing', label: 'Preparando' },
              { key: 'ready', label: 'Prontos' },
              { key: 'delivered', label: 'Entregues' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  filter === tab.key
                    ? 'border-background-primary text-background-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            {filteredOrders.length} pedido(s) encontrado(s)
          </h2>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredOrders.map((order) => (
            <div key={order.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium text-gray-900">
                      Pedido #{order.id}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-1">Cliente: {order.customer}</p>
                  <p className="text-gray-600 mb-2">Itens: {order.items}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">Horário: {order.time}</p>
                    <p className="text-lg font-bold text-gray-900">R$ {order.total.toFixed(2)}</p>
                  </div>
                </div>
                <div className="ml-6 flex space-x-2">
                  {order.status === 'pending' && (
                    <Button size="sm" variant="primary">
                      Aceitar
                    </Button>
                  )}
                  {order.status === 'preparing' && (
                    <Button size="sm" variant="primary">
                      Marcar Pronto
                    </Button>
                  )}
                  {order.status === 'ready' && (
                    <Button size="sm" variant="primary">
                      Entregar
                    </Button>
                  )}
                  <Button size="sm" variant="outline">
                    Detalhes
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Orders;