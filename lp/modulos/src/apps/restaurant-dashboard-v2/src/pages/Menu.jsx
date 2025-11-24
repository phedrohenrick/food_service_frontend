import React, { useState } from 'react';
import { Button, Input, Modal } from '../../../../shared/components/ui';

const categories = [
  { name: 'Pizzas', color: 'bg-red-50 text-red-600', items: 12 },
  { name: 'Burgers', color: 'bg-amber-50 text-amber-600', items: 8 },
  { name: 'Saladas', color: 'bg-emerald-50 text-emerald-600', items: 6 },
  { name: 'Sobremesas', color: 'bg-pink-50 text-pink-600', items: 5 },
];

const Menu = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', price: '', category: '', description: '' });

  const menuItems = [
    {
      id: 1,
      name: 'Pizza Funghi Trufada',
      description: 'Massa fina, creme de parmesão, mix de cogumelos, azeite trufado.',
      price: 68.9,
      category: 'Pizzas',
      available: true,
    },
    {
      id: 2,
      name: 'Burger Braseado',
      description: 'Blend da casa, cheddar inglês, cebola caramelizada, brioche artesanal.',
      price: 42.5,
      category: 'Burgers',
      available: true,
    },
    {
      id: 3,
      name: 'Bowl Fresh',
      description: 'Base de quinoa, salmão grelhado, avocado, legumes crocantes e molho cítrico.',
      price: 36.9,
      category: 'Saladas',
      available: false,
    },
  ];

  const handleSave = () => {
    setIsModalOpen(false);
    setForm({ name: '', price: '', category: '', description: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">Curadoria do cardápio</p>
          <h1 className="text-2xl font-bold text-gray-900">Itens com cara de app</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" className="border border-gray-200 text-gray-700">Sincronizar</Button>
          <Button onClick={() => setIsModalOpen(true)}>Adicionar item</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((category) => (
          <div key={category.name} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${category.color}`}>
              {category.name}
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900">{category.items}</p>
            <p className="text-sm text-gray-500">itens ativos</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-lg p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-gray-500">Itens ao vivo</p>
            <h2 className="text-xl font-semibold text-gray-900">Lista pronta para o cliente</h2>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" className="border border-gray-200 text-gray-700">Duplicar</Button>
            <Button>Publicar alterações</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {menuItems.map((item) => (
            <div key={item.id} className="rounded-2xl border border-gray-100 p-4 bg-gray-50/60 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-gray-500">{item.category}</p>
                  <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full ${item.available ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                  {item.available ? 'Ativo' : 'Pausado'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xl font-bold text-[var(--accent)]">R$ {item.price.toFixed(2)}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" className="border border-gray-200 text-gray-700">Editar</Button>
                  <Button size="sm" variant="ghost" className="border border-gray-200 text-gray-700">Ocultar</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Adicionar item ao cardápio">
        <div className="space-y-4">
          <Input
            label="Nome do prato"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Ex: Ravioli de ricota"
          />
          <Input
            label="Descrição"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Fale sobre textura, ingredientes e diferenciais"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Preço"
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="0,00"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              >
                <option value="">Selecione</option>
                {categories.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="ghost" className="border border-gray-200 text-gray-700" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar item</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Menu;