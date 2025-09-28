import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../../shared/components/ui';

const Restaurants = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('rating');

  const restaurants = [
    {
      id: 1,
      name: 'Pizza Palace',
      cuisine: 'Italiana',
      rating: 4.8,
      deliveryTime: '25-35 min',
      deliveryFee: 5.00,
      minOrder: 20.00,
      image: '🍕',
      isOpen: true,
      category: 'pizza',
    },
    {
      id: 2,
      name: 'Burger House',
      cuisine: 'Americana',
      rating: 4.6,
      deliveryTime: '20-30 min',
      deliveryFee: 4.50,
      minOrder: 15.00,
      image: '🍔',
      isOpen: true,
      category: 'hamburguer',
    },
    {
      id: 3,
      name: 'Sushi Express',
      cuisine: 'Japonesa',
      rating: 4.9,
      deliveryTime: '30-40 min',
      deliveryFee: 6.00,
      minOrder: 25.00,
      image: '🍣',
      isOpen: false,
      category: 'sushi',
    },
    {
      id: 4,
      name: 'Pasta & Co',
      cuisine: 'Italiana',
      rating: 4.7,
      deliveryTime: '25-35 min',
      deliveryFee: 5.50,
      minOrder: 18.00,
      image: '🍝',
      isOpen: true,
      category: 'italiana',
    },
    {
      id: 5,
      name: 'Churrascaria Gaúcha',
      cuisine: 'Brasileira',
      rating: 4.5,
      deliveryTime: '35-45 min',
      deliveryFee: 7.00,
      minOrder: 30.00,
      image: '🍖',
      isOpen: true,
      category: 'brasileira',
    },
    {
      id: 6,
      name: 'Sweet Dreams',
      cuisine: 'Sobremesas',
      rating: 4.8,
      deliveryTime: '15-25 min',
      deliveryFee: 3.00,
      minOrder: 10.00,
      image: '🍰',
      isOpen: true,
      category: 'sobremesas',
    },
  ];

  const categories = [
    { value: 'all', label: 'Todos' },
    { value: 'pizza', label: 'Pizza' },
    { value: 'hamburguer', label: 'Hambúrguer' },
    { value: 'sushi', label: 'Sushi' },
    { value: 'italiana', label: 'Italiana' },
    { value: 'brasileira', label: 'Brasileira' },
    { value: 'sobremesas', label: 'Sobremesas' },
  ];

  const sortOptions = [
    { value: 'rating', label: 'Melhor avaliados' },
    { value: 'deliveryTime', label: 'Mais rápidos' },
    { value: 'deliveryFee', label: 'Menor taxa de entrega' },
    { value: 'name', label: 'Nome A-Z' },
  ];

  const filteredRestaurants = restaurants
    .filter(restaurant => {
      const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          restaurant.cuisine.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || restaurant.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'deliveryFee':
          return a.deliveryFee - b.deliveryFee;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'deliveryTime':
          return parseInt(a.deliveryTime) - parseInt(b.deliveryTime);
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Restaurantes</h1>
        <p className="text-gray-600">Encontre os melhores restaurantes da sua região</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nome do restaurante ou tipo de comida..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-background-primary focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-background-primary focus:border-transparent"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ordenar por
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-background-primary focus:border-transparent"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          {filteredRestaurants.length} restaurante(s) encontrado(s)
        </p>
      </div>

      {/* Restaurants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRestaurants.map((restaurant) => (
          <div
            key={restaurant.id}
            className={`bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden ${
              !restaurant.isOpen ? 'opacity-75' : ''
            }`}
          >
            <div className="relative">
              <div className="h-48 bg-gray-100 flex items-center justify-center text-6xl">
                {restaurant.image}
              </div>
              
              {!restaurant.isOpen && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Fechado
                  </span>
                </div>
              )}
            </div>
            
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-lg text-gray-900">
                  {restaurant.name}
                </h3>
                <div className="flex items-center space-x-1">
                  <span className="text-yellow-500">⭐</span>
                  <span className="font-medium text-sm">{restaurant.rating}</span>
                </div>
              </div>
              
              <p className="text-gray-600 mb-3">{restaurant.cuisine}</p>
              
              <div className="space-y-2 text-sm text-gray-500 mb-4">
                <div className="flex items-center justify-between">
                  <span>Tempo de entrega:</span>
                  <span>{restaurant.deliveryTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Taxa de entrega:</span>
                  <span>R$ {restaurant.deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Pedido mínimo:</span>
                  <span>R$ {restaurant.minOrder.toFixed(2)}</span>
                </div>
              </div>
              
              <Link to={`/customer-app/restaurant/${restaurant.id}`}>
                <Button 
                  className="w-full" 
                  disabled={!restaurant.isOpen}
                  variant={restaurant.isOpen ? 'primary' : 'outline'}
                >
                  {restaurant.isOpen ? 'Ver Cardápio' : 'Fechado'}
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredRestaurants.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum restaurante encontrado
          </h3>
          <p className="text-gray-600">
            Tente ajustar os filtros ou buscar por outros termos
          </p>
        </div>
      )}
    </div>
  );
};

export default Restaurants;