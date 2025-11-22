import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../../shared/components/ui';
import { useStorefront } from '../context/StorefrontContext';

const Addresses = () => {
  const { user, cart, setCartAddress } = useStorefront();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Endereços</p>
          <h1 className="text-3xl font-semibold text-gray-900">Locais de entrega</h1>
          <p className="text-sm text-gray-500">
            Selecione ou cadastre os endereços que estarão disponíveis durante o checkout.
          </p>
        </div>
        <Link to="/app/enderecos/novo">
          <Button>Adicionar endereço</Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {user.addresses.map((address) => (
          <article
            key={address.id}
            onClick={() => setCartAddress(address.id)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setCartAddress(address.id);
              }
            }}
            tabIndex={0}
            className={`rounded-3xl border p-6 shadow-sm transition cursor-pointer focus:outline-none ${
              cart.selectedAddressId === address.id
                ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                : 'border-gray-100 bg-white hover:border-[var(--accent)]/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">{address.label}</h2>
              <div className="flex gap-2">
                
                <Link
                  to={`/app/enderecos/${address.id}`}
                  onClick={(event) => event.stopPropagation()}
                  className="text-sm font-semibold text-[var(--accent-contrast)]"
                >
                  Editar
                 
                </Link>
                
                {address.isDefault && (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                     Endereço Principal
                  </span>
                )}
              </div>
            </div>
            <div className="mt-3 space-y-1 text-sm text-gray-600">
              <p>
                {address.street}, {address.streetNumber}
              </p>
              <p>
                {address.neighborhood} · {address.city} - {address.state}
              </p>
              <p>CEP {address.zipCode}</p>
              {address.complement && <p>Complemento: {address.complement}</p>}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCartAddress(address.id);
                  }}
                  className={`text-sm font-bold ${
                    cart.selectedAddressId === address.id
                      ? 'text-[var(--accent-contrast)]'
                      : 'text-[var(--accent-contrast)] hover:text-gray-700'
                  }`}
                >
                  {cart.selectedAddressId === address.id ? "": 'Entregar aqui'}
                </button>
                {cart.selectedAddressId === address.id && (
                  <Link
                    to="/app/sacola"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      size="sm"
                      className="!px-3 !py-1 text-xs"
                    >
                      Ir para a sacola
                    </Button>
                  </Link>
                )}
              </div>
              <p className="text-xs text-gray-500 ml-4">Distância estimada 2,3 km</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Addresses;
