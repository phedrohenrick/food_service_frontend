import React, { useState } from 'react';
import { Button, Modal, Input } from '../../../../shared/components/ui';

const Menu = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [menuItems, setMenuItems] = useState([
    { id: 1, name: 'Pizza Margherita', description: 'Molho de tomate, mussarela, manjericão', price: 35.90, category: 'Pizza', available: true },
    { id: 2, name: 'Hambúrguer Clássico', description: 'Pão, carne, alface, tomate, queijo', price: 28.50, category: 'Hambúrguer', available: true },
    { id: 3, name: 'Salada Caesar', description: 'Alface, croutons, parmesão, molho caesar', price: 22.00, category: 'Salada', available: false },
    { id: 4, name: 'Lasanha Bolonhesa', description: 'Massa, molho bolonhesa, queijo', price: 32.90, category: 'Massa', available: true },
  ]);

  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
  });

  const categories = ['Pizza', 'Hambúrguer', 'Salada', 'Massa', 'Bebida', 'Sobremesa'];

  const handleAddItem = () => {
    if (newItem.name && newItem.price) {
      const item = {
        id: Date.now(),
        ...newItem,
        price: parseFloat(newItem.price),
        available: true,
      };
      setMenuItems([...menuItems, item]);
      setNewItem({ name: '', description: '', price: '', category: '' });
      setIsModalOpen(false);
    }
  };

  const toggleAvailability = (id) => {
    setMenuItems(menuItems.map(item => 
      item.id === id ? { ...item, available: !item.available } : item
    ));
  };

  const deleteItem = (id) => {
    setMenuItems(menuItems.filter(item => item.id !== id));
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cardápio</h1>
          <p className="text-gray-600">Gerencie os itens do seu cardápio</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          Adicionar Item
        </Button>
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 mb-1">{item.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-background-primary">
                    R$ {item.price.toFixed(2)}
                  </span>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                    {item.category}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className={`w-3 h-3 rounded-full ${item.available ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="text-sm text-gray-600">
                  {item.available ? 'Disponível' : 'Indisponível'}
                </span>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant={item.available ? 'outline' : 'primary'}
                  onClick={() => toggleAvailability(item.id)}
                >
                  {item.available ? 'Desativar' : 'Ativar'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => deleteItem(item.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  Excluir
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Item Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Adicionar Novo Item"
      >
        <div className="space-y-4">
          <Input
            label="Nome do Item"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            placeholder="Ex: Pizza Margherita"
            required
          />
          
          <Input
            label="Descrição"
            value={newItem.description}
            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            placeholder="Descreva os ingredientes..."
          />
          
          <Input
            label="Preço"
            type="number"
            step="0.01"
            value={newItem.price}
            onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
            placeholder="0.00"
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria
            </label>
            <select
              value={newItem.category}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-background-primary focus:border-transparent"
            >
              <option value="">Selecione uma categoria</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddItem}>
              Adicionar Item
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Menu;