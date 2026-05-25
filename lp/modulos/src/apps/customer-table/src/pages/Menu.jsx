import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStorefront } from '../../../../shared/generalContext.jsx';

export default function Menu({ slug, tableId }) {
  const { menuCategories, getMenuItemsByCategory } = useStorefront();
  const [categoryFilter, setCategoryFilter] = useState('todos');

  const base = `/${slug}/mesa/${tableId}`;

  const filteredCategories = useMemo(() => {
    return menuCategories
      .filter((category) => categoryFilter === 'todos' || category.id === categoryFilter)
      .map((category) => ({
        ...category,
        items: getMenuItemsByCategory(category.id).filter((item) => item.is_available),
      }))
      .filter((category) => category.items.length > 0);
  }, [menuCategories, categoryFilter, getMenuItemsByCategory]);

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto -mx-4 px-4 scrollbar-hide pb-1">
        <button
          type="button"
          onClick={() => setCategoryFilter('todos')}
          className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition ${
            categoryFilter === 'todos'
              ? 'border-gray-900 bg-gray-900 text-white'
              : 'border-gray-200 bg-white text-gray-700'
          }`}
        >
          Tudo
        </button>
        {menuCategories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setCategoryFilter(category.id)}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              categoryFilter === category.id
                ? 'border-gray-900 bg-gray-900 text-white'
                : 'border-gray-200 bg-white text-gray-700'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {filteredCategories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-2">
          <p className="text-gray-400 font-medium">Cardápio indisponível</p>
          <p className="text-xs text-gray-400">O restaurante ainda não publicou itens.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {filteredCategories.map((category) => (
            <section key={category.id} className="space-y-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{category.name}</h2>
                {category.description && (
                  <p className="text-xs text-gray-500 mt-0.5">{category.description}</p>
                )}
              </div>
              <div className="space-y-3">
                {category.items.map((item) => (
                  <Link
                    key={item.id}
                    to={`${base}/produto/${item.id}`}
                    className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm transition active:scale-[0.98]"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                      {item.description && (
                        <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{item.description}</p>
                      )}
                      <p className="text-base font-bold text-gray-900 mt-2">
                        R$ {(item.price ?? 0).toFixed(2)}
                      </p>
                    </div>
                    {item.photo_url ? (
                      <img
                        src={item.photo_url}
                        alt={item.name}
                        className="w-20 h-20 rounded-xl object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                        <svg
                          className="w-7 h-7 text-gray-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
