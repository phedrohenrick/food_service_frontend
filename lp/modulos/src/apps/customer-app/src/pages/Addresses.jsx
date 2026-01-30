import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../../shared/components/ui';
import { useStorefront } from '../../../../shared/generalContext.jsx';
import api from '../../../../shared/services/api';

const Addresses = () => {
  const { addresses, cart, setCartAddress, setAddresses } = useStorefront();

  useEffect(() => {
    const loadAddresses = async () => {
      try {
        // TODO: Obter userId real da autenticação. Por enquanto fixo em 1.
        const userId = 1;

        const [addressesData, neighborhoodsData] = await Promise.all([
          api.get(`/user-addresses/by-user/${userId}`),
        ]);

        const neighborhoodIndex = Array.isArray(neighborhoodsData)
          ? neighborhoodsData.reduce((acc, neighborhood) => {
              acc[String(neighborhood.id)] = neighborhood;
              return acc;
            }, {})
          : {};

        const normalized = Array.isArray(addressesData)
          ? addressesData.map((item, index) => {
              const neighborhoodId = item.neighborhoodId ? String(item.neighborhoodId) : '';
              const neighborhood = neighborhoodIndex[neighborhoodId];

              return {
                id: String(item.id),
                user_id: String(item.userId || userId),
                street: item.street,
                streetNumber: item.streetNumber,
                street_number: item.streetNumber,
                neighborhood_id: neighborhoodId,
                neighborhoodName: neighborhood?.name || '',
                city: item.city,
                state: item.state,
                zipCode: item.zipCode,
                zip_code: item.zipCode,
                complement: item.complement,
                geo_lat: item.geoLat,
                geo_lng: item.geoLng,
                is_default: index === 0, // Assumindo o primeiro como default se não houver flag
              };
            })
          : [];

        setAddresses(normalized);
      } catch (error) {
        console.error('Erro ao carregar endereços:', error);
      }
    };

    loadAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        {(addresses || []).map((address) => (
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
              cart.address_id === address.id
                ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                : 'border-gray-100 bg-white hover:border-[var(--accent)]/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">{address.label || 'Endereço'}</h2>
              <div className="flex gap-2">
                
                <Link
                  to={`/app/enderecos/${address.id}`}
                  onClick={(event) => event.stopPropagation()}
                  className="text-sm font-semibold text-[var(--accent-contrast)]"
                >
                  Editar
                 
                </Link>
                
                {(address.isDefault || address.is_default) && (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                     Endereço Principal
                  </span>
                )}
              </div>
            </div>
            <div className="mt-3 space-y-1 text-sm text-gray-600">
              <p>
                {address.street}, {address.streetNumber || address.street_number}
              </p>
              <p>
                {address.neighborhoodName || address.neighborhood || 'Bairro'} · {address.city}
                {address.state ? ` - ${address.state}` : ''}
              </p>
              <p>CEP {(address.zipCode || address.zip_code || '')}</p>
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
                    cart.address_id === address.id
                      ? 'text-[var(--accent-contrast)]'
                      : 'text-[var(--accent-contrast)] hover:text-gray-700'
                  }`}
                >
                  {cart.address_id === address.id ? "" : 'Entregar aqui'}
                </button>
                {cart.address_id === address.id && (
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
