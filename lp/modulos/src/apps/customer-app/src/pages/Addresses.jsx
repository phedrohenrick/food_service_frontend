import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaTrash } from 'react-icons/fa';
import { Button } from '../../../../shared/components/ui';
import { useStorefront } from '../../../../shared/generalContext.jsx';
import api from '../../../../shared/services/api';

const Addresses = () => {
  const { addresses: addressesList, userId, cart, setCartAddress, deleteAddress } = useStorefront();
  const [addresses, setAddresses] = React.useState([]);
  const [alertModal, setAlertModal] = React.useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null
  });

  const handleDeleteAddress = (id) => {
    setAlertModal({
      isOpen: true,
      title: 'Remover endereço',
      message: 'Tem certeza que deseja remover este endereço?',
      onConfirm: async () => {
        if (deleteAddress) {
          await deleteAddress(id);
        } else {
          console.error("Função deleteAddress não encontrada no contexto");
        }
        setAlertModal({ ...alertModal, isOpen: false });
      },
      onCancel: () => setAlertModal({ ...alertModal, isOpen: false })
    });
  };

  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const effectiveUserId = userId || 1;
        if (!effectiveUserId) {
          return;
        }

        const raw = await api
          .get(`/user-addresses/by-user/${effectiveUserId}/active`)
          .catch(() => []);

        const normalized = Array.isArray(raw)
          ? raw.map(item => ({
              id: String(item.id),
              user_id: String(item.userId || effectiveUserId),
              label: item.label,
              street: item.street,
              streetNumber: item.streetNumber,
              neighborhood: item.neighborhood,
              neighborhoodName: item.neighborhoodName,
              city: item.city,
              state: item.state,
              zip_code: item.zipCode,
              complement: item.complement,
              is_default: item.isDefault,
              geo_lat: item.geoLat,
              geo_lng: item.geoLng,
            }))
          : [];

        setAddresses(normalized);
      } catch (error) {
        console.error('Erro ao carregar endereços:', error);
      }
    };

    loadAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressesList, userId]); // Updated dependencies

  return (
    <div className="space-y-8 relative">
      {alertModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-2 text-xl font-bold text-gray-900">{alertModal.title}</h3>
            <p className="mb-6 text-gray-600">{alertModal.message}</p>
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={alertModal.onCancel}
              >
                Cancelar
              </Button>
              <Button 
                onClick={alertModal.onConfirm}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Endereços</p>
          <h1 className="text-3xl font-semibold text-gray-900">Locais de entrega</h1>
          <p className="text-sm text-gray-500">
            Selecione ou cadastre os endereços que estarão disponíveis para a entrega.
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
              <h2 className="text-xl font-semibold text-gray-900">{address.label || "Endereço"}</h2>
              <div className="flex gap-2">
                
                <Link
                  to={`/app/enderecos/${address.id}`}
                  onClick={(event) => event.stopPropagation()}
                  className="text-sm font-semibold text-[var(--accent-contrast)]"
                >
                  Editar
                 
                </Link>
                
                {(cart.address_id === address.id) && (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                     Selecionado
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
              <div className="flex items-center">
                {cart.address_id === address.id ? (
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
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCartAddress(address.id);
                    }}
                    className="text-sm font-bold text-[var(--accent-contrast)] hover:text-gray-700"
                  >
                    Entregar aqui
                  </button>
                )}
              </div>

              {cart.address_id === address.id && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteAddress(address.id);
                  }}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Excluir endereço"
                >
                  <FaTrash size={14} />
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Addresses;
