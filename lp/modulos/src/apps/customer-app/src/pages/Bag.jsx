import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../../../shared/components/ui';
import { useStorefront } from '../../../../features/context/generalContext.jsx';

const Bag = () => {
  const navigate = useNavigate();
  const {
    tenant,
    addresses,
    maps,
    cart,
    cartTotals,
    getCartDetailedItems,
    updateCartItem,
    removeCartItem,
    setCartAddress,
    setCartPaymentChannel,
    setCartChangeFor,
    setCartNotes,
    placeOrder,
  } = useStorefront();

  const selectedAddress = maps.addressMap[cart.address_id] || addresses[0];

  const handleCheckout = () => {
    const orderId = placeOrder();
    if (orderId) {
      navigate(`/app/pedidos/${orderId}`);
    }
  };

  const detailedItems = getCartDetailedItems();

  if (!detailedItems.length) {
    return (
      <div className="rounded-3xl bg-white p-10 text-center shadow">
        <p className="text-4xl mb-3">🛍️</p>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Sua sacola está vazia</h2>
        <p className="text-gray-600 mb-6">
          Explore o cardápio e adicione um item para começar seu pedido.
        </p>
        <Link to="/app">
          <Button>Ver cardápio</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.7fr_1fr]">
      <section className="space-y-6">
        <article className="rounded-3xl bg-white p-6 shadow">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 uppercase tracking-[0.3em]">Endereço</p>
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedAddress?.label || 'Selecione um endereço'}
              </h2>
            </div>
            <Link to="/app/enderecos" className="text-sm font-semibold text-[var(--accent)]">
              Gerenciar
            </Link>
          </header>
          <div className="mt-3 rounded-2xl border border-gray-100 p-4 text-sm text-gray-600">
            <p>
              {selectedAddress?.street}, {selectedAddress?.street_number} ·{' '}
              {maps.neighborhoodMap[selectedAddress?.neighborhood_id]?.name}
            </p>
            {selectedAddress?.city && (
              <p>
                {selectedAddress.city}
              </p>
            )}
            {selectedAddress?.complement && <p>Complemento: {selectedAddress.complement}</p>}
            <div className="mt-3 flex flex-wrap gap-3">
              {addresses.map((address) => (
                <button
                  key={address.id}
                  type="button"
                  className={`rounded-full border px-3 py-1 text-xs ${
                    cart.address_id === address.id
                      ? 'border-[var(--accent)] text-[var(--accent)]'
                      : 'border-gray-200 text-gray-500'
                  }`}
                  onClick={() => setCartAddress(address.id)}
                >
                  {address.street}, {address.street_number}
                </button>
              ))}
            </div>
          </div>
        </article>

        <article className="rounded-3xl bg-white p-6 shadow space-y-4">
          <header>
            <p className="text-sm text-gray-400 uppercase tracking-[0.3em]">Pagamento</p>
            <h2 className="text-xl font-semibold text-gray-900">Escolha a forma de pagamento</h2>
          </header>
          <div className="grid gap-4 md:grid-cols-3">
            {tenant.payment_channels.map((channel) => (
              <button
                key={channel}
                type="button"
                onClick={() => setCartPaymentChannel(channel)}
                className={`rounded-2xl border p-4 text-sm font-semibold capitalize transition ${
                  cart.payment_channel === channel
                    ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-contrast)]'
                    : 'border-gray-200 text-gray-500 hover:text-gray-900'
                }`}
              >
                {channel}
              </button>
            ))}
          </div>
          {cart.payment_channel === 'cash' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Troco para quanto?
              </label>
              <input
                type="text"
                value={cart.change}
                onChange={(event) => setCartChangeFor(event.target.value)}
                placeholder="Ex: R$ 100,00"
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
              />
            </div>
          )}
        </article>

        <article className="rounded-3xl bg-white p-6 shadow space-y-4">
          <header>
            <p className="text-sm text-gray-400 uppercase tracking-[0.3em]">Itens</p>
            <h2 className="text-xl font-semibold text-gray-900">Revise sua sacola</h2>
          </header>

          <div className="space-y-4">
            {detailedItems.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 rounded-2xl border border-gray-100 p-4"
              >
                <div className="h-24 w-24 overflow-hidden rounded-xl">
                  <img src={item.item?.photo_url} alt={item.item?.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex flex-1 flex-col gap-2">
                  <div className="flex justify-between">
                    <p className="text-lg font-semibold text-gray-900">{item.item?.name}</p>
                    <span className="text-lg font-semibold text-gray-900">
                      R$ {Number(item.line_total).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2">{item.item?.description}</p>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center rounded-full border border-gray-200">
                      <button
                        type="button"
                        className="px-3 py-1 text-xl"
                        onClick={() => updateCartItem(item.id, item.quantity - 1)}
                      >
                        -
                      </button>
                      <span className="px-3 text-sm font-semibold">{item.quantity}</span>
                      <button
                        type="button"
                        className="px-3 py-1 text-xl"
                        onClick={() => updateCartItem(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      className="text-sm font-semibold text-red-500"
                      onClick={() => removeCartItem(item.id)}
                    >
                      remover
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Observações para a cozinha
            </label>
            <textarea
              value={cart.notes}
              onChange={(event) => setCartNotes(event.target.value)}
              placeholder="Ex: tirar cebola, mandar molho à parte..."
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
              rows={3}
            />
          </div>
        </article>
      </section>

      <aside className="rounded-3xl bg-white p-6 shadow space-y-4 h-fit">
        <h2 className="text-lg font-semibold text-gray-900">Resumo do pedido</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>R$ {cartTotals.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Serviço</span>
            <span>R$ {cartTotals.serviceFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Entrega</span>
            <span>R$ {cartTotals.deliveryFee.toFixed(2)}</span>
          </div>
          {cartTotals.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Descontos</span>
              <span>- R$ {cartTotals.discount.toFixed(2)}</span>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
          <span className="text-base font-semibold text-gray-900">Total</span>
          <span className="text-3xl font-bold text-black">
            R$ {cartTotals.total.toFixed(2)}
          </span>
        </div>
        <Button className="w-full" onClick={handleCheckout}>
          Finalizar pedido
        </Button>
        <p className="text-xs text-gray-500">
          Ao finalizar, você será direcionado para acompanhar o status em tempo real.
        </p>
      </aside>
    </div>
  );
};

export default Bag;
