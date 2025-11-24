import React from 'react';
import { useTenant } from '../context/TenantContext';

const Menu = () => {
  const { accent } = useTenant();
  const items = [
    { name: 'Cheeseburger', price: 24.9, available: true },
    { name: 'Chicken Burger', price: 26.9, available: false },
    { name: 'Veggie Burger', price: 23.9, available: true },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Cardápio</h2>
        <button className="px-3 py-1.5 rounded-md bg-[var(--accent)] text-[var(--accent-contrast)] text-sm hover:bg-[var(--accent-hover)]">Novo item</button>
      </div>

      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {items.map((it) => (
            <div key={it.name} className="border border-gray-100 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <p className="font-medium">{it.name}</p>
                <span className={`text-xs px-2 py-1 rounded ${it.available ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'bg-gray-100 text-gray-600'}`}>
                  {it.available ? 'Disponível' : 'Indisponível'}
                </span>
              </div>
              <p className="mt-1 text-gray-600">R$ {it.price.toFixed(2)}</p>
              <div className="mt-3 flex gap-2">
                <button className="px-3 py-1.5 rounded-md bg-white border border-gray-200 text-gray-700 text-sm hover:bg-gray-50">Editar</button>
                <button className="px-3 py-1.5 rounded-md bg-white border border-gray-200 text-gray-700 text-sm hover:bg-gray-50">Opções</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Menu;