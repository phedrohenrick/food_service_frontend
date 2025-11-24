import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../../../shared/components/ui';
import { useStorefront } from '../../../../features/context/generalContext.jsx';

const Product = () => {
  const { productSlug } = useParams();
  const navigate = useNavigate();
  const { maps, addToCart, menuItems } = useStorefront();
  const product = maps.menuItemMap[productSlug] || menuItems.find((mi) => mi.slug === productSlug);
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState('');
  const [added, setAdded] = useState(false);

  const relatedItems = useMemo(() => {
    if (!product) return [];
    return menuItems.filter((item) => item.id !== product.id).slice(0, 3);
  }, [menuItems, product]);

  if (!product) {
    return (
      <div className="rounded-3xl bg-white p-10 text-center shadow">
        <p className="text-4xl mb-3">🔍</p>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Produto não encontrado
        </h2>
        <p className="text-gray-600 mb-6">
          Talvez ele tenha saído do cardápio ou o link esteja incorreto.
        </p>
        <Link to="/app" className="text-[var(--accent-contrast)] font-semibold">
          Voltar ao cardápio
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product.id, quantity);
    setFeedback(`${quantity}x ${product.name} adicionado à sacola`);
    setAdded(true);
    setTimeout(() => setFeedback(''), 3000);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
      <section className="rounded-3xl bg-white p-6 shadow space-y-6">
        <div className="overflow-hidden rounded-2xl">
          <img
            src={product.photo_url}
            alt={product.name}
            className="h-80 w-full object-cover"
          />
        </div>
        <div className="space-y-4">
          <p className="text-sm text-gray-400 uppercase tracking-[0.3em]">
            {maps.categoryMap[product.category_id]?.name}
          </p>
          <h1 className="text-3xl font-semibold text-gray-900">{product.name}</h1>
          <p className="text-gray-600 text-lg">{product.description}</p>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-3xl font-bold text-black">
              R$ {product.price.toFixed(2)}
            </p>
            {product.highlights?.map((highlight) => (
              <span
                key={highlight}
                className="rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-semibold text-white"
              >
                {highlight}
              </span>
            ))}
          </div>
          <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 p-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <button
                type="button"
                className="h-12 w-12 rounded-full border border-gray-200 text-2xl"
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
              >
                -
              </button>
              <span className="text-2xl font-semibold">{quantity}</span>
              <button
                type="button"
                className="h-12 w-12 rounded-full border border-gray-200 text-2xl"
                onClick={() => setQuantity((current) => current + 1)}
              >
                +
              </button>
            </div>
            <Button className="flex-1" onClick={handleAddToCart}>
              Adicionar à sacola · R$ {(product.price * quantity).toFixed(2)}
            </Button>
            <Button variant="ghost" onClick={() => navigate('/app/sacola')}>
              {added ? 'Finalizar compra' : 'Ir para a sacola'}
            </Button>
          </div>
          {feedback && (
            <p className="rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700">
              {feedback}
            </p>
          )}
        </div>
      </section>
      <aside className="space-y-6 rounded-3xl bg-white p-6 shadow-lg">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Mais pedidos do momento
          </h2>
          <p className="text-sm text-gray-500">
            Inspire-se em outros pratos para adicionar ao pedido.
          </p>
        </div>
        <div className="space-y-4">
          {relatedItems.map((item) => (
            <article
              key={item.id}
              className="flex gap-4 rounded-2xl border border-gray-100 p-4"
            >
              <div className="h-20 w-20 overflow-hidden rounded-xl">
                <img
                  src={item.photo_url}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1">
                <Link
                  to={`/app/produto/${item.slug || item.id}`}
                  className="text-base font-semibold text-gray-900 hover:text-[var(--accent-contrast)]"
                >
                  {item.name}
                </Link>
                <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-semibold text-gray-900 ">
                    R$ {item.price.toFixed(2)}
                  </span>
                  <button
                    type="button"
                    className="text-sm font-semibold text-[var(--accent)]"
                    onClick={() => addToCart(item.id, 1)}
                  >
                    Adicionar +
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </aside>
    </div>
  );
};

export default Product;
