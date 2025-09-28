import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../../shared/components/ui';

const Orders = () => {
  const [activeTab, setActiveTab] = useState('current');

  const currentOrders = [
    {
      id: 1,
      restaurant: 'Pizza Palace',
      items: ['Pizza Margherita', 'Coca-Cola 350ml'],
      total: 45.90,
      status: 'preparing',
      estimatedTime: '25-35 min',
      orderTime: '14:30',
      trackingSteps: [
        { step: 'Pedido confirmado', completed: true, time: '14:30' },
        { step: 'Preparando', completed: true, time: '14:35' },
        { step: 'Saiu para entrega', completed: false, time: '' },
        { step: 'Entregue', completed: false, time: '' },
      ]
    },
    {
      id: 2,
      restaurant: 'Sushi Express',
      items: ['Combo Sashimi', 'Temaki Salmão'],
      total: 68.50,
      status: 'confirmed',
      estimatedTime: '30-40 min',
      orderTime: '14:45',
      trackingSteps: [
        { step: 'Pedido confirmado', completed: true, time: '14:45' },
        { step: 'Preparando', completed: false, time: '' },
        { step: 'Saiu para entrega', completed: false, time: '' },
        { step: 'Entregue', completed: false, time: '' },
      ]
    },
  ];

  const orderHistory = [
    {
      id: 3,
      restaurant: 'Burger House',
      items: ['Hambúrguer Clássico', 'Batata Frita', 'Milkshake'],
      total: 42.90,
      status: 'delivered',
      orderDate: '2024-01-15',
      orderTime: '19:20',
    },
    {
      id: 4,
      restaurant: 'Pasta & Co',
      items: ['Lasanha Bolonhesa', 'Salada Caesar'],
      total: 38.50,
      status: 'delivered',
      orderDate: '2024-01-12',
      orderTime: '20:15',
    },
    {
      id: 5,
      restaurant: 'Sweet Dreams',
      items: ['Torta de Chocolate', 'Café Expresso'],
      total: 25.90,
      status: 'cancelled',
      orderDate: '2024-01-10',
      orderTime: '16:30',
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-yellow-100 text-yellow-800';
      case 'delivering': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'preparing': return 'Preparando';
      case 'delivering': return 'Saiu para entrega';
      case 'delivered': return 'Entregue';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Meus Pedidos</h1>
        <p className="text-gray-600">Acompanhe seus pedidos atuais e histórico</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('current')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'current'
                ? 'border-background-primary text-background-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Pedidos Atuais ({currentOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-background-primary text-background-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Histórico ({orderHistory.length})
          </button>
        </nav>
      </div>

      {/* Current Orders */}
      {activeTab === 'current' && (
        <div className="space-y-4">
          {currentOrders.length > 0 ? (
            currentOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      {order.restaurant}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Pedido #{order.id} • {order.orderTime}
                    </p>
                  </div>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-gray-600 mb-2">Itens:</p>
                  <ul className="text-sm text-gray-800">
                    {order.items.map((item, index) => (
                      <li key={index}>• {item}</li>
                    ))}
                  </ul>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Acompanhar pedido:</p>
                  <div className="space-y-2">
                    {order.trackingSteps.map((step, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full ${
                          step.completed ? 'bg-green-500' : 'bg-gray-300'
                        }`}></div>
                        <span className={`text-sm ${
                          step.completed ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {step.step}
                        </span>
                        {step.time && (
                          <span className="text-xs text-gray-500">({step.time})</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-sm text-gray-600">Tempo estimado:</p>
                    <p className="font-medium">{order.estimatedTime}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total:</p>
                    <p className="text-lg font-bold text-gray-900">
                      R$ {order.total.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="flex space-x-3 mt-4">
                  <Button variant="outline" size="sm">
                    Rastrear Pedido
                  </Button>
                  <Button variant="outline" size="sm">
                    Entrar em Contato
                  </Button>
                  {order.status === 'confirmed' && (
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      Cancelar
                    </Button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum pedido ativo
              </h3>
              <p className="text-gray-600 mb-4">
                Você não tem pedidos em andamento no momento
              </p>
              <Link to="/customer-app/restaurants">
                <Button>Fazer Pedido</Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Order History */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {orderHistory.length > 0 ? (
            orderHistory.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      {order.restaurant}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Pedido #{order.id} • {order.orderDate} às {order.orderTime}
                    </p>
                  </div>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-gray-600 mb-2">Itens:</p>
                  <ul className="text-sm text-gray-800">
                    {order.items.map((item, index) => (
                      <li key={index}>• {item}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex space-x-3">
                    <Button variant="outline" size="sm">
                      Ver Detalhes
                    </Button>
                    {order.status === 'delivered' && (
                      <>
                        <Button variant="outline" size="sm">
                          Avaliar
                        </Button>
                        <Button variant="outline" size="sm">
                          Pedir Novamente
                        </Button>
                      </>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      R$ {order.total.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📜</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum pedido no histórico
              </h3>
              <p className="text-gray-600">
                Seus pedidos anteriores aparecerão aqui
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Orders;