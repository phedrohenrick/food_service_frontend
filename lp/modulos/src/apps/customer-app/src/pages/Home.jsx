import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../../shared/components/ui';

const Home = () => {
  const featuredRestaurants = [
    {
      id: 1,
      name: 'Pizza Palace',
      cuisine: 'Italiana',
      rating: 4.8,
      deliveryTime: '25-35 min',
      deliveryFee: 'R$ 5,00',
      image: '🍕',
    },
    {
      id: 2,
      name: 'Burger House',
      cuisine: 'Americana',
      rating: 4.6,
      deliveryTime: '20-30 min',
      deliveryFee: 'R$ 4,50',
      image: '🍔',
    },
    {
      id: 3,
      name: 'Sushi Express',
      cuisine: 'Japonesa',
      rating: 4.9,
      deliveryTime: '30-40 min',
      deliveryFee: 'R$ 6,00',
      image: '🍣',
    },
  ];

  const categories = [
    { name: 'Pizza', icon: '🍕', count: 12 },
    { name: 'Hambúrguer', icon: '🍔', count: 8 },
    { name: 'Sushi', icon: '🍣', count: 5 },
    { name: 'Italiana', icon: '🍝', count: 15 },
    { name: 'Brasileira', icon: '🍖', count: 20 },
    { name: 'Sobremesas', icon: '🍰', count: 10 },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-background-primary to-background-primary/80 rounded-2xl p-8 text-white">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold mb-4">
            Comida deliciosa entregue na sua porta
          </h1>
          <p className="text-lg mb-6 opacity-90">
            Descubra os melhores restaurantes da sua região e peça com facilidade
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Digite seu endereço..."
                className="w-full px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
            <Button variant="secondary" size="lg">
              Buscar Restaurantes
            </Button>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Categorias</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Link
              key={category.name}
              to={`/customer-app/restaurants?category=${category.name.toLowerCase()}`}
              className="bg-white rounded-lg p-4 text-center hover:shadow-md transition-shadow border border-gray-200"
            >
              <div className="text-3xl mb-2">{category.icon}</div>
              <h3 className="font-medium text-gray-900">{category.name}</h3>
              <p className="text-sm text-gray-500">{category.count} restaurantes</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Restaurants */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Restaurantes em Destaque</h2>
          <Link
            to="/customer-app/restaurants"
            className="text-background-primary hover:text-background-primary/80 font-medium"
          >
            Ver todos
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredRestaurants.map((restaurant) => (
            <Link
              key={restaurant.id}
              to={`/customer-app/restaurant/${restaurant.id}`}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
            >
              <div className="h-48 bg-gray-100 flex items-center justify-center text-6xl">
                {restaurant.image}
              </div>
              
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900 mb-1">
                  {restaurant.name}
                </h3>
                <p className="text-gray-600 mb-2">{restaurant.cuisine}</p>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1">
                    <span className="text-yellow-500">⭐</span>
                    <span className="font-medium">{restaurant.rating}</span>
                  </div>
                  <span className="text-gray-500">{restaurant.deliveryTime}</span>
                  <span className="text-gray-500">{restaurant.deliveryFee}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Promotional Banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              🎉 Primeira entrega grátis!
            </h3>
            <p className="text-gray-600">
              Cadastre-se agora e ganhe frete grátis no seu primeiro pedido
            </p>
          </div>
          <Button variant="primary">
            Cadastrar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;