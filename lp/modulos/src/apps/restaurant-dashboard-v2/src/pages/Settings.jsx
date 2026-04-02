import React, { useMemo, useState, useEffect } from 'react';
import { Button, Input } from '../../../../shared/components/ui';
import { useStorefront } from '../../../../shared/generalContext.jsx';
import api from '../../../../shared/services/api';

const paymentOptions = [
  { value: 'PIX', label: 'Pix', helper: 'Pagamento instantaneo' },
  { value: 'CARD', label: 'Cartão', helper: 'Crédito e débito' },
  { value: 'CASH', label: 'Dinheiro', helper: 'Pagamento na entrega' },
];

const Settings = () => {
  const {
    tenant,
    neighborhoods,
    user,
    updateTenant,
    saveNeighborhood,
    deleteNeighborhood,
  } = useStorefront();

  const [tenantForm, setTenantForm] = useState(() => ({
    name: tenant?.name || '',
    email: tenant?.email || '',
    slug: tenant?.slug || '',
    cnpj_cpf: tenant?.cnpj_cpf || '',
    address: tenant?.address || '',
    geo_lat: tenant?.geo_lat || '',
    geo_lng: tenant?.geo_lng || '',
    status: tenant?.status || 'ACTIVE',
    photo_url: tenant?.photo_url || '',
    main_color: tenant?.main_color || '#EA1D2C',
    working_hours: tenant?.working_hours || '',
    delivery_method: tenant?.delivery_method || 'own',
    service_fee_percentage: tenant?.service_fee_percentage ?? 0.08,
    payment_channels: Array.isArray(tenant?.payment_channels) && tenant.payment_channels.length
      ? tenant.payment_channels
      : ['pix', 'card', ...(tenant?.accepts_cash ? ['cash'] : [])],
    accepts_cash: !!tenant?.accepts_cash,
  }));

  useEffect(() => {
    if (tenant) {
      setTenantForm(prev => ({
        ...prev,
        name: tenant.name || '',
        email: tenant.email || '',
        slug: tenant.slug || '',
        cnpj_cpf: tenant.cnpj_cpf || '',
        address: tenant.address || '',
        geo_lat: tenant.geo_lat || '',
        geo_lng: tenant.geo_lng || '',
        status: tenant.status || 'ACTIVE',
        photo_url: tenant.photo_url || '',
        main_color: tenant.main_color || '#EA1D2C',
        working_hours: tenant.working_hours || '',
        delivery_method: tenant.delivery_method || 'own',
        service_fee_percentage: tenant.service_fee_percentage ?? 0.08,
        payment_channels: Array.isArray(tenant.payment_channels) && tenant.payment_channels.length
          ? tenant.payment_channels
          : ['pix', 'card', ...(tenant.accepts_cash ? ['cash'] : [])],
        accepts_cash: !!tenant.accepts_cash,
      }));
    }
  }, [tenant]);

  const onTenantChange = (field) => (e) => {
    let value = e?.target?.type === 'checkbox' ? e.target.checked : e?.target?.value ?? e;
    if (field === 'slug') {
      const v = String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      value = v.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
    }
    setTenantForm((prev) => ({ ...prev, [field]: value }));
  };

  const isReservedSlug = (s) => {
    const r = ['app','dashboard','onboarding','login','admin','api','tenant','tenants','orders','menu','settings'];
    return r.includes(s);
  };

  const validateSlug = (s) => {
    if (!s) return 'Informe um slug válido.';
    if (s.length < 3 || s.length > 30) return 'O slug deve ter entre 3 e 30 caracteres.';
    if (!/^[a-z][a-z0-9-]*$/.test(s)) return 'Use letras minúsculas, números e hífen, começando por uma letra.';
    if (/-{2,}/.test(s)) return 'Evite hífens consecutivos.';
    if (s.endsWith('-')) return 'Não termine com hífen.';
    if (isReservedSlug(s)) return 'Este slug é reservado. Escolha outro.';
    return '';
  };

  const saveTenantProfile = async () => {
    const oldSlug = tenant?.slug || '';
    let desiredSlug = (tenantForm.slug || '').trim();
    desiredSlug = desiredSlug.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
    const slugError = validateSlug(desiredSlug);
    if (slugError) {
      showToast(slugError, 'error');
      return;
    }
    if (desiredSlug !== tenantForm.slug) {
      setTenantForm((prev) => ({ ...prev, slug: desiredSlug }));
    }
    if (desiredSlug && desiredSlug !== oldSlug) {
      try {
        const check = await api.get(`/onboarding/slug-available?slug=${desiredSlug}`);
        if (check && check.available === false) {
          showToast('Este slug já está em uso.', 'error');
          return;
        }
      } catch (_) {}
    }
    const success = await updateTenant({
      name: tenantForm.name,
      email: tenantForm.email,
      slug: desiredSlug,
      cnpj_cpf: tenantForm.cnpj_cpf,
      address: tenantForm.address,
      geo_lat: tenantForm.geo_lat,
      geo_lng: tenantForm.geo_lng,
      status: tenantForm.status,
      photo_url: tenantForm.photo_url,
      main_color: tenantForm.main_color,
    });
    if (success) {
      if (oldSlug && desiredSlug && oldSlug !== desiredSlug && typeof window !== 'undefined') {
        try { localStorage.setItem('tenantSlug', desiredSlug); } catch (_) {}
        try { localStorage.setItem('authTenantSlug', desiredSlug); } catch (_) {}
        const path = window.location.pathname || '';
        const search = window.location.search || '';
        const hash = window.location.hash || '';
        const newPath = path.replace(new RegExp(`^/${oldSlug}(?=/|$)`), `/${desiredSlug}`);
        window.location.replace(newPath + search + hash);
        return;
      }
      showToast('Perfil salvo com sucesso!');
    } else {
      showToast('Erro ao salvar perfil.', 'error');
    }
  };

  const saveTenantOps = async () => {
    const selectedPaymentChannels = Array.from(
      new Set((tenantForm.payment_channels || []).filter(Boolean).map((c) => String(c).toLowerCase()))
    );
    const success = await updateTenant({
      working_hours: tenantForm.working_hours,
      delivery_method: tenantForm.delivery_method,
      service_fee_percentage: parseFloat(tenantForm.service_fee_percentage) || 0,
      payment_channels: selectedPaymentChannels,
      accepts_cash: selectedPaymentChannels.includes('cash'),
    });
    if (success) showToast('Configurações salvas com sucesso!');
    else showToast('Erro ao salvar configurações.', 'error');
  };

  const toggleOpen = () => updateTenant({ is_open: !tenant.is_open });
  const togglePaymentChannel = (channel) => {
    const ch = String(channel).toLowerCase();
    setTenantForm((prev) => {
      const currentChannels = Array.isArray(prev.payment_channels) ? prev.payment_channels.map((c) => String(c).toLowerCase()) : [];
      const nextChannels = currentChannels.includes(ch)
        ? currentChannels.filter((item) => item !== ch)
        : [...currentChannels, ch];

      return {
        ...prev,
        payment_channels: nextChannels,
        accepts_cash: nextChannels.includes('cash'),
      };
    });
  };

  // Neighborhoods
  const [newNeighborhood, setNewNeighborhood] = useState({ name: '', price: '' });
  const [editingNeighborhood, setEditingNeighborhood] = useState({}); // id -> {name, price}
  const [toast, setToast] = useState({ message: '', type: '', visible: false });

  const showToast = (message, type = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 3000);
  };

  const neighborhoodsSorted = useMemo(
    () => [...neighborhoods].sort((a, b) => a.name.localeCompare(b.name)),
    [neighborhoods]
  );
  const surfaceClass = 'rounded-[28px] border border-slate-200/80 bg-white/95 shadow-[0_22px_55px_rgba(15,23,42,0.08)]';
  const subtleCardClass = 'rounded-3xl border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] shadow-[0_12px_30px_rgba(15,23,42,0.06)]';

  const saveNewNeighborhood = () => {
    const price = parseFloat(String(newNeighborhood.price).replace(',', '.')) || 0;
    if (!newNeighborhood.name) return;
    saveNeighborhood({ name: newNeighborhood.name, price, tenant_id: tenant.id });
    setNewNeighborhood({ name: '', price: '' });
  };

  const saveNeighborhoodEdit = (id) => {
    const base = editingNeighborhood[id];
    if (!base) return;
    const price = parseFloat(String(base.price).replace(',', '.')) || 0;
    saveNeighborhood({ id, name: base.name, price, tenant_id: tenant.id });
    setEditingNeighborhood((prev) => ({ ...prev, [id]: undefined }));
  };

  return (
    <div className="space-y-6 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.96),rgba(248,250,252,0.98)_40%,rgba(241,245,249,1))] pb-6">
      <div>
        <p className="text-sm font-medium text-slate-500">Perfil e operação</p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Ajustes do sistema</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className={`${surfaceClass} p-6 space-y-5`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-slate-500">Cadastro principal</p>
                <h2 className="text-xl font-semibold tracking-tight text-slate-900">Dados do restaurante</h2>
              </div>
              <Button className="w-full lg:w-auto shadow-[0_12px_30px_rgba(15,23,42,0.12)]" onClick={saveTenantProfile}>
                Salvar perfil
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Input label="ID" value={tenant?.id || ''} disabled />
              <Input label="Nome" value={tenantForm.name} onChange={onTenantChange('name')} />
              <Input label="Email" value={tenantForm.email} onChange={onTenantChange('email')} />
              <Input label="Slug" value={tenantForm.slug} onChange={onTenantChange('slug')} />
              <Input label="CNPJ/CPF" value={tenantForm.cnpj_cpf} onChange={onTenantChange('cnpj_cpf')} />
              <Input label="Endereço" value={tenantForm.address} onChange={onTenantChange('address')} />
              <Input label="Geo Lat" value={tenantForm.geo_lat} onChange={onTenantChange('geo_lat')} />
              <Input label="Geo Lng" value={tenantForm.geo_lng} onChange={onTenantChange('geo_lng')} />
              <Input label="Status" value={tenantForm.status} onChange={onTenantChange('status')} />
            </div>
          </div>

          <div className={`${surfaceClass} p-6 space-y-5`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-slate-500">Marca e experiencia</p>
                <h2 className="text-xl font-semibold tracking-tight text-slate-900">Identidade visual</h2>
              </div>
              <Button className="w-full lg:w-auto shadow-[0_12px_30px_rgba(15,23,42,0.12)]" onClick={saveTenantProfile}>
                Salvar identidade
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_0.9fr]">
              <div className={`${subtleCardClass} p-5`}>
                <div className="flex items-start gap-4">
                  <div
                    className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[22px] border border-slate-200 shadow-sm"
                    style={{ backgroundColor: tenantForm.main_color || '#EA1D2C' }}
                  >
                    <span className="text-lg font-bold text-white/90">
                      {(tenantForm.name || tenant?.name || 'R').slice(0, 1).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Preview da marca</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Ajuste a foto e a cor principal para padronizar dashboard e app do cliente.
                    </p>
                    <div className="mt-3 inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                      Cor ativa: {tenantForm.main_color || '#EA1D2C'}
                    </div>
                  </div>
                </div>

                {tenantForm.photo_url ? (
                  <div className="mt-5 overflow-hidden rounded-[24px] border border-slate-200 bg-slate-100 shadow-sm">
                    <img
                      src={tenantForm.photo_url}
                      alt={tenantForm.name || tenant?.name || 'Restaurante'}
                      className="h-56 w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="mt-5 rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
                    Adicione uma foto para visualizar como sua identidade aparece no sistema.
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className={`${subtleCardClass} p-5`}>
                  <Input label="Foto (URL)" value={tenantForm.photo_url} onChange={onTenantChange('photo_url')} />
                </div>
                <div className={`${subtleCardClass} p-5`}>
                  <p className="mb-3 text-sm font-medium text-slate-700">Cor principal do sistema</p>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <input
                      type="color"
                      value={tenantForm.main_color || '#EA1D2C'}
                      onChange={onTenantChange('main_color')}
                      className="h-16 w-full cursor-pointer rounded-2xl border border-slate-200 bg-white p-2 sm:w-24"
                    />
                    <div className="flex-1">
                      <Input label="Hex" value={tenantForm.main_color} onChange={onTenantChange('main_color')} className="uppercase" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={`${surfaceClass} p-6 space-y-5`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">Entrega e pedidos</p>
                <h2 className="text-xl font-semibold tracking-tight text-slate-900">Parâmetros do delivery</h2>
              </div>
              <Button className="w-full lg:w-auto shadow-[0_12px_30px_rgba(15,23,42,0.12)]" onClick={saveTenantOps}>
                Salvar entrega & taxas
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className={`${subtleCardClass} p-4`}>
                <label className="block text-sm font-medium text-gray-700 mb-2">Método de entrega</label>
                <select
                  value={tenantForm.delivery_method}
                  onChange={onTenantChange('delivery_method')}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                >
                  <option value="own">Própria</option>
                  <option value="pool">Parceiro</option>
                </select>
              </div>
              <div className={`${subtleCardClass} p-4`}>
                <Input
                  label="Taxa de serviço (%)"
                  value={String((tenantForm.service_fee_percentage ?? 0) * 100)}
                  onChange={(e) => onTenantChange('service_fee_percentage')(String(parseFloat(e.target.value) / 100))}
                />
              </div>
              <div className={`${subtleCardClass} p-4`}>
                <p className="text-sm font-medium text-slate-700">Pagamento exibido no app</p>
                <p className="mt-1 text-sm text-slate-500">
                  Escolha os meios de pagamento que o cliente pode visualizar ao finalizar o pedido.
                </p>
                <div className="mt-4 space-y-3">
                  {paymentOptions.map((option) => {
                    const selected = (tenantForm.payment_channels || []).map((c) => String(c).toLowerCase()).includes(option.value.toLowerCase());
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => togglePaymentChannel(option.value)}
                        className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                          selected
                            ? 'border-[var(--accent)] bg-[var(--accent)]/8 shadow-[0_10px_24px_rgba(15,23,42,0.08)]'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <p className={`text-sm font-semibold ${selected ? 'text-[var(--accent)]' : 'text-slate-900'}`}>{option.label}</p>
                          <p className="text-xs text-slate-500">{option.helper}</p>
                        </div>
                        <span
                          className={`inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold ${
                            selected
                              ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-contrast)]'
                              : 'border-slate-300 text-slate-400'
                          }`}
                        >
                          {selected ? '✓' : ''}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className={`${subtleCardClass} p-4`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Funcionamento</p>
                    <p className="text-sm text-slate-500">{tenant.is_open ? 'Loja aberta' : 'Loja fechada'}</p>
                  </div>
                  <Button size="sm" className="w-full lg:w-auto" onClick={toggleOpen}>
                    {tenant.is_open ? 'Fechar' : 'Abrir'}
                  </Button>
                </div>
                <div className="mt-3">
                  <Input label="Horário de funcionamento" value={tenantForm.working_hours} onChange={onTenantChange('working_hours')} />
                </div>
              </div>
              <div className={`${subtleCardClass} p-4`}>
                <p className="text-sm font-semibold text-slate-900 mb-2">Áreas atendidas e taxa por bairro</p>
                <div className="space-y-2">
                  {neighborhoodsSorted.map((n) => {
                    const edit = editingNeighborhood[n.id] ?? { name: n.name, price: n.price };
                    return (
                      <div key={n.id} className="space-y-2 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm">
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            className="w-full lg:flex-1 rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                            value={edit.name}
                            onChange={(e) => setEditingNeighborhood((prev) => ({ ...prev, [n.id]: { ...edit, name: e.target.value } }))}
                          />
                          <input
                            className="w-full lg:w-32 rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                            value={String(edit.price)}
                            onChange={(e) => setEditingNeighborhood((prev) => ({ ...prev, [n.id]: { ...edit, price: e.target.value } }))}
                          />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" className="w-full lg:w-auto" onClick={() => saveNeighborhoodEdit(n.id)}>Salvar</Button>
                          <Button size="sm" variant="ghost" className="w-full lg:w-auto border border-red-200 text-red-700 hover:bg-red-50" onClick={() => deleteNeighborhood(n.id)}>Remover</Button>
                        </div>
                      </div>
                    );
                  })}
                  <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-200">
                    <input
                      className="w-full lg:flex-1 rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                      placeholder="Novo bairro"
                      value={newNeighborhood.name}
                      onChange={(e) => setNewNeighborhood((prev) => ({ ...prev, name: e.target.value }))}
                    />
                    <input
                      className="w-full lg:w-32 rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                      placeholder="Preço"
                      value={newNeighborhood.price}
                      onChange={(e) => setNewNeighborhood((prev) => ({ ...prev, price: e.target.value }))}
                    />
                    <Button size="sm" className="w-full lg:w-auto" onClick={saveNewNeighborhood}>Adicionar</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)] text-[var(--accent-contrast)] rounded-[28px] p-6 shadow-[0_22px_55px_rgba(15,23,42,0.16)]">
            <p className="text-sm uppercase tracking-widest text-[var(--accent-contrast)]/80">experiência</p>
            <h3 className="text-2xl font-semibold mt-2">Seu restaurante como vitrine</h3>
            <p className="text-[var(--accent-contrast)]/80 mt-2">
              Destaque fotos, tempos de preparo reais e mantenha o cardápio sempre atualizado para subir nos resultados.
            </p>
            <Button
              variant="secondary"
              className="mt-4 border border-white/50 bg-white text-[var(--accent)] shadow-[0_12px_30px_rgba(0,0,0,0.12)] hover:bg-white/92"
              onClick={() => {
                const slug = tenant?.slug;
                const path = slug ? `/${slug}/app` : '/app';
                window.open(path, '_blank', 'noopener,noreferrer');
              }}
            >
              Ver como o cliente vê
            </Button>
          </div>

          <div className={`${surfaceClass} p-5 space-y-3`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Equipe</p>
                <h3 className="text-lg font-semibold tracking-tight text-slate-900">Acessos rápidos</h3>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] p-4 shadow-sm">
                <div>
                  <p className="font-semibold text-slate-900">{user?.name || 'Proprietário'}</p>
                  <p className="text-sm text-slate-500">{user?.email}</p>
                  <p className="text-sm text-slate-500">{user?.phone}</p>
                  <p className="text-sm text-slate-500">Status: {user?.status}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Toast Notification */}
      {toast.visible && (
        <div
          className={`fixed bottom-6 right-6 px-6 py-4 rounded-2xl shadow-2xl text-white font-medium transition-all transform translate-y-0 opacity-100 z-50 flex items-center gap-3 ${
            toast.type === 'error' ? 'bg-red-500' : 'bg-green-600'
          }`}
        >
          {toast.type === 'error' ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default Settings;
