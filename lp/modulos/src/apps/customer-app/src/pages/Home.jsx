import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStorefront } from '../../../../shared/generalContext.jsx';

const Home = () => {
  const { tenant, banners, menuCategories, getMenuItemsByCategory } = useStorefront();
  const [searchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('todos');

  const filteredCategories = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return menuCategories
      .filter((category) => categoryFilter === 'todos' || category.id === categoryFilter)
      .map((category) => {
        const items = getMenuItemsByCategory(category.id)
          .filter((item) => {
            if (!item.is_available) return false;
            if (!normalizedSearch) return true;
            return (
              item.name.toLowerCase().includes(normalizedSearch) ||
              item.description.toLowerCase().includes(normalizedSearch)
            );
          });
        return { ...category, items };
      })
      .filter((category) => category.items.length > 0);
  }, [menuCategories, categoryFilter, searchTerm, getMenuItemsByCategory]);

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-4">
        <img
          src={tenant.photo_url}
          alt={tenant.name}
          className="h-14 w-14 rounded-full border border-gray-100 object-cover"
        />

        <div className="flex flex-wrap items-center gap-3 text-sm">
          <div>
            <Link to="/app" className="text-2xl font-semibold text-background-black">
              {tenant.name}
            </Link>

            <span className="text-xs text-gray-600">
              <br />
              <span
                className={`items-center gap-2 px-3 py-1 text-xs font-semibold ${
                  tenant.is_open
                    ? 'rounded-full bg-green-100 text-green-700 mr-2'
                    : 'rounded-full bg-red-100 text-red-700 mr-2'
                }`}
              >
                {tenant.is_open ? 'Aberto' : 'Fechado'}
              </span>
              {tenant.working_hours && (
                <span className="mr-2 text-gray-500 font-medium">
                  {tenant.working_hours}
                </span>
              )}
              Entrega em {tenant.delivery_estimate_min}-{tenant.delivery_estimate_max} min · Taxa R${' '}
              {(tenant.delivery_fee ?? 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <section
        className={`grid gap-4 ${banners.length > 1 ? 'md:grid-cols-2' : 'md:grid-cols-1 md:max-w-4xl'} mx-auto`}
      >
        {banners.map((banner) => (
          <Link
            key={banner.id}
            to={banner.product_link ? `/app/produto/${banner.product_link}` : '/app'}
            className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="absolute inset-0">
              <img src={banner.banner_image} alt={banner.title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
            </div>
            <div className="relative p-6 text-[var(--accent-contrast)] space-y-2">
              <span className="inline-flex rounded-full bg-[var(--accent)] px-3 py-1 text-xs uppercase tracking-wide text-background-white">
                {banner.badge}
              </span>
              <h3 className="text-2xl font-semibold">{banner.title}</h3>
              <p className="text-sm text-white/80">{banner.subtitle}</p>
              <p className="text-sm text-white/70">{banner.description}</p>
              <span className="inline-flex items-center text-sm font-semibold">
                Ver produto →
              </span>
            </div>
          </Link>
        ))}
      </section>

      <section className="space-y-6">
        <div className="flex flex-wrap items-center gap-3 md:justify-center">
          <button
            type="button"
            onClick={() => setCategoryFilter('todos')}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              categoryFilter === 'todos'
                ? 'border-[var(--accent)] bg-[var(--accent)]/80 text-[var(--accent)]'
                : 'border-gray-200 text-gray-500 hover:text-gray-900'
            }`}
          >
            Tudo
          </button>
          {menuCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setCategoryFilter(category.id)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                categoryFilter === category.id
                  ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                  : 'border-gray-200 text-gray-500 hover:text-gray-900'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="space-y-10">
          {filteredCategories.map((category) => (
            <div key={category.id} className="space-y-4">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">{category.name}</h2>
                {category.description && (
                  <p className="text-sm text-gray-500">{category.description}</p>
                )}
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                {category.items.map((item) => (
                  <Link
                    key={item.id}
                    to={`/app/produto/${item.id}`}
                    className="group flex flex-col rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:flex-row"
                  >
                    <div className="flex flex-1 flex-col gap-3 p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-lg font-semibold text-gray-900 group-hover:text-[var(--accent)]">
                          {item.name}
                        </span>
                        {item.highlights?.map((highlight) => (
                          <span
                            key={highlight}
                            className="rounded-full bg-[var(--accent)] px-2 py-1 text-xs font-semibold text-[var(--accent-contrast)]"
                          >
                            {highlight}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 flex-1">{item.description}</p>
                      <p className="text-xl font-semibold text-gray-900">
                        R$ {(item.price ?? 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="h-48 w-full overflow-hidden rounded-2xl sm:h-auto sm:w-48">
                      <img
                        src={item.photo_url}
                        alt={item.name}
                        className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
                      />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
