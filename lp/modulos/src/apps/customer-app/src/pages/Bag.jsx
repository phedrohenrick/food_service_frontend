import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../../../shared/components/ui';
import { useStorefront } from '../../../../shared/generalContext.jsx';
import { LiaShoppingBagSolid } from "react-icons/lia";
import api from '../../../../shared/services/api';
import { loginWithRedirect } from '../../../../shared/auth/keycloak';

const Bag = () => {
  const navigate = useNavigate();
  const {
    tenant,
    addresses,
    neighborhoods,
    user,
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
    setAddresses,
    placeOrder,
  } = useStorefront();

  const [activeAddresses, setActiveAddresses] = React.useState([]);
  const [addressAlertOpen, setAddressAlertOpen] = React.useState(false);
  const [unsupportedAreaOpen, setUnsupportedAreaOpen] = React.useState(false);
  const [selectedAddressId, setSelectedAddressId] = React.useState(
    cart.address_id ? String(cart.address_id) : null
  );
  const [selectedPaymentChannel, setSelectedPaymentChannel] = React.useState(
    cart.payment_channel ?? null
  );

  const handleSelectAddress = (id) => {
    const sid = id != null ? String(id) : null;
    setSelectedAddressId(sid);
    setCartAddress(id);
  };

  const handleSelectPaymentChannel = (channel) => {
    setSelectedPaymentChannel(channel);
    setCartPaymentChannel(channel);
  };

  React.useEffect(() => {
    const loadActiveAddresses = async () => {
      try {
        const hasToken = (() => {
          try { return !!localStorage.getItem('authToken'); } catch (_) { return false; }
        })();
        if (!hasToken) {
          setActiveAddresses([]);
          return;
        }
        const effectiveUserId = user?.id;
        if (!effectiveUserId) {
          setActiveAddresses([]);
          return;
        }

        const raw = await api
          .get(`/user-addresses/by-user/${effectiveUserId}/active`)
          .catch(() => []);

        const normalized = Array.isArray(raw)
          ? raw.map((item) => ({
              ...item,
              id: String(item.id),
              streetNumber: item.streetNumber || item.street_number,
              zipCode: item.zipCode || item.zip_code,
            }))
          : [];

        setActiveAddresses(normalized);

        // Sincroniza com o contexto: cartTotals usa state.addresses pra olhar
        // address.neighborhood_id. Se o cliente acabou de cadastrar endereço,
        // o loadData inicial não tem ele e a taxa volta zerada.
        if (typeof setAddresses === 'function' && normalized.length) {
          const forContext = normalized.map((a) => ({
            ...a,
            user_id: String(a.userId || a.user_id || effectiveUserId),
            zip_code: a.zipCode || a.zip_code,
            street_number: a.streetNumber || a.street_number,
            neighborhood_id: a.neighborhoodId ?? a.neighborhood_id ?? null,
            neighborhood_name: a.neighborhoodName ?? a.neighborhood_name ?? '',
            is_default: a.isDefault ?? a.is_default ?? false,
          }));
          setAddresses(forContext);
        }
      } catch (e) {
        console.error('Erro ao carregar endereços ativos na sacola:', e);
      }
    };

    loadActiveAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const baseAddresses = Array.isArray(activeAddresses) ? activeAddresses : [];

  const addressList = baseAddresses
    ? baseAddresses.filter((addr) => addr.active === undefined || addr.active === null || addr.active === true)
    : [];

  const selectedAddress =
    selectedAddressId != null
      ? addressList.find((addr) => addr.id === selectedAddressId) || null
      : null;

  const selectedAddressCoverage = React.useMemo(() => {
    if (selectedAddressId == null) return { rejected: false, pickup: true };
    if (!selectedAddress) return { rejected: false };

    const list = Array.isArray(neighborhoods) ? neighborhoods : [];
    const addrNbId = selectedAddress.neighborhoodId ?? selectedAddress.neighborhood_id ?? null;
    const addrNbName = String(
      selectedAddress.neighborhoodName ?? selectedAddress.neighborhood?.name ?? ''
    ).trim().toLowerCase();

    let matched = null;
    if (addrNbId != null) {
      matched = list.find((n) => String(n.id) === String(addrNbId)) || null;
    }
    if (!matched && addrNbName) {
      matched = list.find((n) => String(n.name).trim().toLowerCase() === addrNbName) || null;
    }

    const status = matched?.status ? String(matched.status).toUpperCase() : null;
    if (status === 'REJECTED') {
      return {
        rejected: true,
        neighborhoodName: matched.name || selectedAddress.neighborhoodName || '',
      };
    }
    return { rejected: false };
  }, [selectedAddressId, selectedAddress, neighborhoods]);

  const getPaymentChannelLabel = (channel) => {
    const normalized = String(channel || '').toLowerCase();
    if (normalized === 'card') return 'Cartão';
    if (normalized === 'pix') return 'Pix';
    if (normalized === 'cash') return 'Dinheiro';
    return channel;
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      await loginWithRedirect(window.location.href);
      return;
    }
    if (!addressList.length && selectedAddressId == null) {
      setAddressAlertOpen(true);
      return;
    }
    if (selectedAddressId != null && selectedAddressCoverage.rejected) {
      setUnsupportedAreaOpen(true);
      return;
    }
    const orderId = await placeOrder();
    if (orderId) {
      const p = window.location?.pathname || '';
      const m = /^\/([^/]+)\/app(\/|$)/i.exec(p);
      const basePrefix = m && m[1] ? `/${m[1]}/app` : '/app';
      navigate(`${basePrefix}/pedidos`);
    }
  };

  const detailedItems = getCartDetailedItems();

  // line_total já inclui adicionais. Pra exibir base e adicionais separados
  // sem visualmente "somar duas vezes", calculamos o total apenas da base.
  const splitLineTotals = (item) => {
    const qty = Number(item?.quantity) || 1;
    const optionsTotalPerUnit = (item?.selectedOptions || []).reduce(
      (sum, o) => sum + (Number(o.additional_charge) || 0),
      0
    );
    const lineTotal = Number(item?.line_total) || 0;
    const optionsTotal = optionsTotalPerUnit * qty;
    return {
      qty,
      lineTotal,
      optionsTotal,
      baseLineTotal: Math.max(lineTotal - optionsTotal, 0),
      optionsWithCharge: (item?.selectedOptions || []).filter(
        (o) => Number(o.additional_charge) > 0
      ),
    };
  };

  const hasToken = (() => {
    try { return !!localStorage.getItem('authToken'); } catch (_) { return false; }
  })();
  const hasUser = !!user?.id;
  const isAuthenticated = hasUser && hasToken;
  // Token presente mas user ainda não chegou: estado de loading — não mostrar a
  // tela de login (o usuário acabou de autenticar; loadData ainda está em vôo).
  const isAuthLoading = hasToken && !hasUser;

  if (!hasToken) {
    return (
      <div className="rounded-3xl bg-white p-10 text-center shadow flex flex-col items-center">
        <LiaShoppingBagSolid className="text-4xl text-gray-900 mb-3" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Entre para continuar</h2>
        <p className="text-gray-600 mb-6">
          Faça login ou cadastre-se para finalizar seu pedido e salvar seus endereços.
        </p>
        <div className="flex gap-3">
          <Button onClick={() => loginWithRedirect(window.location.href)}>
            Fazer login
          </Button>
          <Link to={(() => {
            const p = window.location?.pathname || '';
            const m = /^\/([^/]+)\/app(\/|$)/i.exec(p);
            return m && m[1] ? `/${m[1]}/app` : '/app';
          })()}>
            <Button variant="outline">Voltar ao cardápio</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isAuthLoading) {
    return (
      <div className="rounded-3xl bg-white p-10 text-center shadow flex flex-col items-center">
        <LiaShoppingBagSolid className="text-4xl text-gray-900 mb-3 animate-pulse" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Carregando sua conta...</h2>
        <p className="text-gray-600">Só um instante enquanto preparamos sua sacola.</p>
      </div>
    );
  }

  if (!detailedItems.length) {
    return (
      <div className="rounded-3xl bg-white p-10 text-center shadow flex flex-col items-center">
        <LiaShoppingBagSolid className="text-4xl text-gray-900 mb-3" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Sua sacola está vazia</h2>
        <p className="text-gray-600 mb-6">
          Explore o cardápio e adicione um item para começar seu pedido.
        </p>
        <Link to={(() => {
          const p = window.location?.pathname || '';
          const m = /^\/([^/]+)\/app(\/|$)/i.exec(p);
          return m && m[1] ? `/${m[1]}/app` : '/app';
        })()}>
          <Button>Ver cardápio</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      {addressAlertOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-2 text-xl font-bold text-gray-900">Endereço obrigatório</h3>
            <p className="mb-6 text-gray-600">
              Cadastre um endereço de entrega ativo para finalizar seu pedido.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setAddressAlertOpen(false)}
              >
                Fechar
              </Button>
            <Link to={(() => {
              const p = window.location?.pathname || '';
              const m = /^\/([^/]+)\/app(\/|$)/i.exec(p);
              const basePrefix = m && m[1] ? `/${m[1]}/app` : '/app';
              return `${basePrefix}/enderecos`;
            })()} >
                <Button onClick={() => setAddressAlertOpen(false)}>
                  Cadastrar endereço
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {unsupportedAreaOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-2 text-xl font-bold text-gray-900">Bairro fora da área de entrega</h3>
            <p className="mb-6 text-gray-600">
              {selectedAddressCoverage.neighborhoodName
                ? `Não entregamos no bairro "${selectedAddressCoverage.neighborhoodName}" no momento.`
                : 'Esse endereço não está na nossa área de entrega no momento.'}
              {' '}Escolha outro endereço, retire na loja ou entre em contato com o restaurante.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setUnsupportedAreaOpen(false);
                  handleSelectAddress(null);
                }}
              >
                Retirar na loja
              </Button>
              <Button onClick={() => setUnsupportedAreaOpen(false)}>
                Entendi
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-8 xl:grid-cols-[1.7fr_1fr]">
      <section className="space-y-6">
        <article className="rounded-3xl bg-white p-6 shadow">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 uppercase tracking-[0.3em]">Endereço</p>
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedAddressId == null
                  ? 'Retirar na loja'
                  : selectedAddress?.label || 'Selecione um endereço'}
              </h2>
            </div>
            <Link to={(() => {
              const p = window.location?.pathname || '';
              const m = /^\/([^/]+)\/app(\/|$)/i.exec(p);
              const basePrefix = m && m[1] ? `/${m[1]}/app` : '/app';
              return `${basePrefix}/enderecos`;
            })()} className="text-sm font-semibold text-gray-800">
              Gerenciar
            </Link>
          </header>
          <div className="mt-3 rounded-2xl border border-gray-100 p-4 text-sm text-gray-600">
            {selectedAddressId == null ? (
              <p>Você escolheu retirar o pedido na loja.</p>
            ) : selectedAddress ? (
              <>
                <p>
                  {selectedAddress?.street}, {selectedAddress?.streetNumber || selectedAddress?.street_number} ·{' '}
                  {selectedAddress?.neighborhoodName || 'Bairro'}
                </p>
                {selectedAddress?.city && (
                  <p>
                    {selectedAddress.city}
                  </p>
                )}
                {selectedAddress?.complement && <p>Complemento: {selectedAddress.complement}</p>}
              </>
            ) : (
              <div className="flex flex-col items-center py-4">
                <p className="mb-3 text-gray-500">Nenhum endereço selecionado</p>
                <Link to={(() => {
                  const p = window.location?.pathname || '';
                  const m = /^\/([^/]+)\/app(\/|$)/i.exec(p);
                  const basePrefix = m && m[1] ? `/${m[1]}/app` : '/app';
                  return `${basePrefix}/enderecos`;
                })()}>
                  <Button>Cadastrar endereço</Button>
                </Link>
              </div>
            )}
            <div className="mt-3 flex flex-wrap gap-3">
              <button
                type="button"
                className={`rounded-full border px-3 py-1 text-xs ${
                  selectedAddressId == null
                    ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-contrast)]'
                    : 'border-gray-300 text-gray-700'
                }`}
                onClick={() => handleSelectAddress(null)}
              >
                Retirar na loja
              </button>
              {addressList.map((address) => (
                <button
                  key={address.id}
                  type="button"
                  className={`rounded-full border px-3 py-1 text-xs ${
                    selectedAddressId === address.id
                      ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-contrast)]'
                      : 'border-gray-300 text-gray-700'
                  }`}
                  onClick={() => handleSelectAddress(address.id)}
                >
                  {address.street}, {address.streetNumber || address.street_number} • {address.label}
                </button>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 text-sm">
              <span className="text-gray-500">Taxa de entrega</span>
              <span className={`font-semibold ${selectedAddressId != null && selectedAddressCoverage.rejected ? 'text-red-600' : 'text-gray-900'}`}>
                {selectedAddressId != null && selectedAddressCoverage.rejected
                  ? 'Indisponível'
                  : (selectedAddressId == null || (cartTotals.deliveryFee ?? 0) === 0
                      ? 'Grátis'
                      : `R$ ${(cartTotals.deliveryFee ?? 0).toFixed(2)}`)}
              </span>
            </div>
            {selectedAddressId != null && selectedAddressCoverage.rejected && (
              <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <p className="font-semibold">Não entregamos nesse endereço</p>
                <p className="mt-1 text-red-600">
                  {selectedAddressCoverage.neighborhoodName
                    ? `O restaurante não atende o bairro "${selectedAddressCoverage.neighborhoodName}".`
                    : 'O restaurante não atende esse bairro.'}
                  {' '}Escolha outro endereço ou opte por retirar na loja.
                </p>
              </div>
            )}
          </div>
        </article>

        <article className="rounded-3xl bg-white p-6 shadow space-y-4">
          <header>
            <p className="text-sm text-gray-400 uppercase tracking-[0.3em]">Pagamento</p>
            <h2 className="text-xl font-semibold text-gray-900">Escolha a forma de pagamento</h2>
          </header>
          <div className="grid gap-4 xl:grid-cols-3">
            {tenant.payment_channels.map((channel) => (
              <button
                key={channel}
                type="button"
                onClick={() => handleSelectPaymentChannel(channel)}
                className={`rounded-2xl border p-4 text-sm font-semibold capitalize transition ${
                  selectedPaymentChannel === channel
                    ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-contrast)]'
                    : 'border-gray-200 text-gray-500 hover:text-gray-900'
                }`}
              >
                {getPaymentChannelLabel(channel)}
              </button>
            ))}
          </div>
          {(selectedPaymentChannel === 'cash' || selectedPaymentChannel === 'CASH') && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Troco para quanto?
              </label>
              <input
                type="text"
                value={cart.change ?? ''}
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
            {detailedItems.map((item) => {
              const grouped = (item.selectedOptions || []).reduce((acc, opt) => {
                const key = opt.group?.name || opt.groupName || 'Opções';
                if (!acc[key]) acc[key] = [];
                acc[key].push(opt);
                return acc;
              }, {});
              const groupEntries = Object.entries(grouped);
              const { baseLineTotal, optionsTotal } = splitLineTotals(item);

              return (
                <div key={item.id} className="space-y-2">
                  <div className="flex gap-4 rounded-2xl border border-gray-100 p-4">
                    <div className="h-24 w-24 overflow-hidden rounded-xl">
                      <img src={item.item?.photo_url} alt={item.item?.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex flex-1 flex-col gap-2">
                      <div className="flex justify-between gap-3">
                        <p className="text-lg font-semibold text-gray-900">{item.item?.name}</p>
                        <span className="text-right shrink-0">
                          <span className="block text-lg font-semibold text-gray-900">
                            R$ {baseLineTotal.toFixed(2)}
                          </span>
                          {optionsTotal > 0 && (
                            <span className="block text-xs text-gray-400">
                              + R$ {optionsTotal.toFixed(2)} em adicionais
                            </span>
                          )}
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

                  {groupEntries.length > 0 && (
                    <div className="space-y-2">
                      {groupEntries.map(([groupName, opts]) => (
                        <div
                          key={groupName}
                          className="rounded-2xl border border-gray-100 p-4"
                        >
                          <p className="text-xs font-semibold text-gray-700">{groupName}</p>
                          <div className="mt-1 space-y-0.5 text-xs text-gray-600">
                            {opts.map((opt, idx) => (
                              <p key={idx}>
                                {opt.name}
                                {opt.additional_charge
                                  ? ` (+ R$ ${Number(opt.additional_charge).toFixed(2)})`
                                  : ''}
                              </p>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>


        </article>
      </section>

      <aside className="rounded-3xl bg-white p-6 shadow space-y-4 h-fit">
        <h2 className="text-lg font-semibold text-gray-900">Resumo do pedido</h2>
        <div className="space-y-3 text-sm text-gray-700">
          {detailedItems.map((item) => {
            const { qty, baseLineTotal, optionsWithCharge } = splitLineTotals(item);
            return (
              <div key={item.id} className="space-y-1">
                <div className="flex justify-between gap-3">
                  <span className="min-w-0 truncate">
                    {qty}x {item.item?.name}
                  </span>
                  <span className="shrink-0">R$ {baseLineTotal.toFixed(2)}</span>
                </div>
                {optionsWithCharge.length > 0 && (
                  <div className="space-y-0.5 pl-4 text-xs text-gray-500">
                    {optionsWithCharge.map((opt, idx) => (
                      <div key={`${item.id}-opt-${idx}`} className="flex justify-between gap-3">
                        <span className="min-w-0 truncate">+ {opt.name}</span>
                        <span className="shrink-0">
                          R$ {(Number(opt.additional_charge) * qty).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-4 space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>R$ {(cartTotals.subtotal ?? 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Serviço</span>
            <span>R$ {(cartTotals.serviceFee ?? 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Entrega</span>
            {selectedAddressId != null && selectedAddressCoverage.rejected ? (
              <span className="font-semibold text-red-600">Indisponível</span>
            ) : (
              <span>R$ {(cartTotals.deliveryFee ?? 0).toFixed(2)}</span>
            )}
          </div>
          {cartTotals.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Descontos</span>
              <span>- R$ {(cartTotals.discount ?? 0).toFixed(2)}</span>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
          <span className="text-base font-semibold text-gray-900">Total</span>
          <span className="text-3xl font-bold text-black">
            R$ {(cartTotals.total ?? 0).toFixed(2)}
          </span>
        </div>
        <Button
          className="w-full"
          onClick={handleCheckout}
          disabled={selectedAddressId != null && selectedAddressCoverage.rejected}
        >
          Finalizar pedido
        </Button>
        <p className="text-xs text-gray-500">
          Ao finalizar, você será direcionado para acompanhar o status em tempo real.
        </p>
      </aside>
      </div>
    </>
  );
};

export default Bag;
