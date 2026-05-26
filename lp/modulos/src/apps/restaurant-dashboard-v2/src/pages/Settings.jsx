import React, { useMemo, useState, useEffect } from 'react';
import { Button, Input } from '../../../../shared/components/ui';
import { useStorefront } from '../../../../shared/generalContext.jsx';
import { getKeycloak } from '../../../../shared/auth/keycloak';
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
    canUseFeature,
    entitlements,
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
    working_open: (() => {
      const s = tenant?.working_hours || '';
      const m = s.split(/-|até|às/).map(v => v.trim());
      return m[0] && /^\d{2}:\d{2}$/.test(m[0]) ? m[0] : '';
    })(),
    working_close: (() => {
      const s = tenant?.working_hours || '';
      const m = s.split(/-|até|às/).map(v => v.trim());
      return m[1] && /^\d{2}:\d{2}$/.test(m[1]) ? m[1] : '';
    })(),
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
        working_open: (() => {
          const s = tenant?.working_hours || '';
          const m = s.split(/-|até|às/).map(v => v.trim());
          return m[0] && /^\d{2}:\d{2}$/.test(m[0]) ? m[0] : '';
        })(),
        working_close: (() => {
          const s = tenant?.working_hours || '';
          const m = s.split(/-|até|às/).map(v => v.trim());
          return m[1] && /^\d{2}:\d{2}$/.test(m[1]) ? m[1] : '';
        })(),
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
  const saveWorkingHours = async () => {
    const open = (tenantForm.working_open || '').trim();
    const close = (tenantForm.working_close || '').trim();
    if (!/^\d{2}:\d{2}$/.test(open) || !/^\d{2}:\d{2}$/.test(close)) {
      showToast('Informe horários válidos no formato HH:MM.', 'error');
      return;
    }
    const text = `${open} - ${close}`;
    const success = await updateTenant({ working_hours: text });
    if (success) {
      setTenantForm((prev) => ({ ...prev, working_hours: text }));
      showToast('Horário salvo com sucesso!');
    } else {
      showToast('Erro ao salvar horário.', 'error');
    }
  };
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
  const [editingNeighborhood, setEditingNeighborhood] = useState({});
  const [toast, setToast] = useState({ message: '', type: '', visible: false });
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    try { localStorage.removeItem('authToken'); } catch (_) {}
    try { localStorage.removeItem('tenantSlug'); } catch (_) {}
    try { localStorage.removeItem('authTenantSlug'); } catch (_) {}
    getKeycloak().logout({ redirectUri: window.location.origin });
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 3000);
  };

  const neighborhoodsSorted = useMemo(
    () =>
      [...neighborhoods]
        .filter((n) => String(n.status || 'ACTIVE').toUpperCase() !== 'REJECTED')
        .sort((a, b) => a.name.localeCompare(b.name)),
    [neighborhoods]
  );

  const neighborhoodsRejected = useMemo(
    () =>
      [...neighborhoods]
        .filter((n) => String(n.status || '').toUpperCase() === 'REJECTED')
        .sort((a, b) => a.name.localeCompare(b.name)),
    [neighborhoods]
  );

  const handleRestoreRejectedNeighborhood = async (n) => {
    const ok = await saveNeighborhood({
      id: n.id,
      name: n.name,
      price: Number(n.price) || 0,
      tenant_id: tenant.id,
      status: 'ACTIVE',
    });
    if (ok !== false) {
      showToast(`"${n.name}" voltou para a lista de áreas atendidas.`);
    } else {
      showToast('Erro ao reativar bairro.', 'error');
    }
  };

  const handleDeactivateNeighborhood = async (n) => {
    const ok = await saveNeighborhood({
      id: n.id,
      name: n.name,
      price: Number(n.price) || 0,
      tenant_id: tenant.id,
      status: 'REJECTED',
    });
    if (ok !== false) {
      showToast(`"${n.name}" movido para bairros não atendidos. Pode reativar a qualquer momento.`);
    } else {
      showToast('Erro ao desativar bairro.', 'error');
    }
  };

  const [unrecognizedNeighborhoods, setUnrecognizedNeighborhoods] = useState([]);
  const [addPriceMap, setAddPriceMap] = useState({});
  const addedUnrecognizedIdsRef = React.useRef(new Set());

  useEffect(() => {
    if (!tenant?.id) return;
    api.get(`/unrecognized-neighborhoods/by-tenant/${tenant.id}`)
      .then(data => {
        const all = Array.isArray(data) ? data : [];
        setUnrecognizedNeighborhoods(all.filter(n => !addedUnrecognizedIdsRef.current.has(n.id)));
      })
      .catch(() => {});
  }, [tenant?.id]);

  const pendingUnrecognized = unrecognizedNeighborhoods.filter(n => n.status === 'PENDING');
  const rejectedUnrecognized = unrecognizedNeighborhoods.filter(n => n.status === 'REJECTED');

  const handleRejectUnrecognized = async (id) => {
    const updated = await api.put(`/unrecognized-neighborhoods/${id}/reject`).catch(() => null);
    if (updated) {
      setUnrecognizedNeighborhoods(prev => prev.map(n => n.id === id ? { ...n, status: 'REJECTED' } : n));
    }
  };

  const handleRevertUnrecognized = async (id) => {
    const updated = await api.put(`/unrecognized-neighborhoods/${id}/revert`).catch(() => null);
    if (updated) {
      setUnrecognizedNeighborhoods(prev => prev.map(n => n.id === id ? { ...n, status: 'PENDING' } : n));
    }
  };

  const handleAddUnrecognized = async (unrecognized) => {
    const price = parseFloat(String(addPriceMap[unrecognized.id] ?? '').replace(',', '.')) || 0;
    await saveNeighborhood({ name: unrecognized.name, price, tenant_id: tenant.id });
    await api.delete(`/unrecognized-neighborhoods/${unrecognized.id}`).catch(() => {});
    addedUnrecognizedIdsRef.current.add(unrecognized.id);
    setUnrecognizedNeighborhoods(prev => prev.filter(n => n.id !== unrecognized.id));
    setAddPriceMap(prev => { const next = { ...prev }; delete next[unrecognized.id]; return next; });
    showToast(`Bairro "${unrecognized.name}" adicionado com sucesso!`);
  };
  const surfaceClass = 'rounded-[28px] border border-slate-200/80 bg-white/95 shadow-[0_22px_55px_rgba(15,23,42,0.08)]';
  const subtleCardClass = 'rounded-3xl border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] shadow-[0_12px_30px_rgba(15,23,42,0.06)]';

  const saveNewNeighborhood = () => {
    const price = parseFloat(String(newNeighborhood.price).replace(',', '.')) || 0;
    if (!newNeighborhood.name) return;
    const existing = neighborhoods.find(
      n => n.name.trim().toLowerCase() === newNeighborhood.name.trim().toLowerCase()
    );
    saveNeighborhood({ ...(existing ? { id: existing.id } : {}), name: newNeighborhood.name.trim(), price, tenant_id: tenant.id });
    setNewNeighborhood({ name: '', price: '' });
  };

  const saveNeighborhoodEdit = (id) => {
    const base = editingNeighborhood[id];
    if (!base) return;
    const price = parseFloat(String(base.price).replace(',', '.')) || 0;
    saveNeighborhood({ id, name: base.name, price, tenant_id: tenant.id });
    setEditingNeighborhood((prev) => ({ ...prev, [id]: undefined }));
  };

  const handleDeleteNeighborhood = async (id) => {
    try {
      await deleteNeighborhood(id);
    } catch (err) {
      const isConstraint =
        String(err?.message || err?.response?.data || '').toLowerCase().includes('foreign key') ||
        String(err?.response?.status) === '500';
      if (isConstraint) {
        showToast('Este bairro está vinculado a endereços de clientes e não pode ser removido.', 'error');
      } else {
        showToast('Erro ao remover bairro.', 'error');
      }
    }
  };

  return (
    <div className="space-y-6 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.96),rgba(248,250,252,0.98)_40%,rgba(241,245,249,1))] pb-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">Perfil e operação</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Ajustes do sistema</h1>
        </div>
        <Button
          variant="ghost"
          className="border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-[var(--accent)] hover:text-[var(--accent)]"
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new Event('restaurant-dashboard:wizard-restart'));
            }
          }}
        >
          Ajuda
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className={`${surfaceClass} p-6 space-y-5`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-slate-500">Cadastro principal</p>
                <h2 className="text-xl font-semibold tracking-tight text-slate-900">Dados do restaurante</h2>
              </div>
              <Button
                className="w-full lg:w-auto shadow-[0_12px_30px_rgba(15,23,42,0.12)]"
                onClick={saveTenantProfile}
                data-wizard="store-save"
              >
                Salvar perfil
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Input label="ID" value={tenant?.id || ''} disabled />
              <Input label="Nome" value={tenantForm.name} onChange={onTenantChange('name')} wrapperProps={{ 'data-wizard': 'store-name' }} />
              <Input label="Email" value={tenantForm.email} onChange={onTenantChange('email')} />
              <Input label="Slug" value={tenantForm.slug} onChange={onTenantChange('slug')} wrapperProps={{ 'data-wizard': 'store-slug' }} />
              <Input label="CNPJ/CPF" value={tenantForm.cnpj_cpf} onChange={onTenantChange('cnpj_cpf')} wrapperProps={{ 'data-wizard': 'store-document' }} />
              <Input label="Endereço" value={tenantForm.address} onChange={onTenantChange('address')} />
              <Input label="Geo Lat" value={tenantForm.geo_lat} onChange={onTenantChange('geo_lat')} />
              <Input label="Geo Lng" value={tenantForm.geo_lng} onChange={onTenantChange('geo_lng')} />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] pt-1">
              <div className={`${subtleCardClass} p-4`}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Status da conta</p>
                    <p className="mt-1 text-base font-semibold text-slate-900">{tenantForm.status || 'ACTIVE'}</p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                      String(tenantForm.status || '').toUpperCase() === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                        : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      String(tenantForm.status || '').toUpperCase() === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-400'
                    }`} />
                    {String(tenantForm.status || '').toUpperCase() === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <p className="mt-3 text-xs text-slate-500">Controlado pela plataforma. Em caso de dúvida fale com o suporte.</p>
              </div>

              <div className={`${subtleCardClass} p-4`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={!!tenant.is_open}
                      aria-label={tenant.is_open ? 'Pausar atendimento' : 'Reabrir atendimento'}
                      onClick={toggleOpen}
                      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 ${
                        tenant.is_open ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                          tenant.is_open ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Funcionamento</p>
                      <p className="text-base font-semibold text-slate-900">
                        {tenant.is_open ? 'Loja aberta' : 'Loja fechada'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {tenant.is_open ? 'Recebendo pedidos no momento.' : 'Pausada — clientes verão a loja como indisponível.'}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="border border-slate-200 bg-white hover:border-[var(--accent)] hover:text-[var(--accent)]" onClick={saveWorkingHours}>
                    Salvar horário
                  </Button>
                </div>

                <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-end gap-3">
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-1">Abre às</label>
                    <input
                      type="time"
                      value={tenantForm.working_open}
                      onChange={(e) => onTenantChange('working_open')(e)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40"
                    />
                  </div>
                  <span className="pb-2.5 text-xs font-medium text-slate-400">até</span>
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-1">Fecha às</label>
                    <input
                      type="time"
                      value={tenantForm.working_close}
                      onChange={(e) => onTenantChange('working_close')(e)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={`${surfaceClass} p-6 space-y-5`} data-wizard="brand-identity">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-slate-500">Marca e experiencia</p>
                <h2 className="text-xl font-semibold tracking-tight text-slate-900">Identidade visual</h2>
              </div>
              <Button className="w-full lg:w-auto shadow-[0_12px_30px_rgba(15,23,42,0.12)]" onClick={saveTenantProfile}  wrapperProps={{ 'data-wizard': 'store-save' }} >
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

          <div className={`${surfaceClass} p-6 space-y-5`} data-wizard="delivery-settings">
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
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Bairros não atendidos</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Áreas que você marcou como fora da entrega. Reative quando quiser voltar a atender.
                    </p>
                  </div>
                  {neighborhoodsRejected.length > 0 && (
                    <span className="inline-flex shrink-0 items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                      {neighborhoodsRejected.length}
                    </span>
                  )}
                </div>

                <div className="mt-3 space-y-2">
                  {neighborhoodsRejected.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-6 text-center">
                      <p className="text-sm text-slate-500">Nenhum bairro marcado como não atendido.</p>
                      <p className="mt-1 text-xs text-slate-400">
                        Quando você rejeitar uma área, ela aparece aqui pra reativação rápida.
                      </p>
                    </div>
                  ) : (
                    neighborhoodsRejected.map((n) => (
                      <div
                        key={n.id}
                        className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white px-3 py-2.5 shadow-sm opacity-70 transition hover:opacity-100"
                      >
                        <div className="min-w-0 flex items-center gap-2.5">
                          <span className="inline-flex h-2 w-2 shrink-0 rounded-full bg-slate-400" aria-hidden="true" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-700 line-through decoration-slate-300">
                              {n.name}
                            </p>
                            <p className="text-[11px] uppercase tracking-wider text-slate-400">Não entrega</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRestoreRejectedNeighborhood(n)}
                          className="shrink-0 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100"
                        >
                          Entregar nesse bairro
                        </button>
                      </div>
                    ))
                  )}
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
                          <Button
                            size="sm"
                            variant="ghost"
                            className="w-full lg:w-auto border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                            onClick={() => handleDeactivateNeighborhood(n)}
                            title="Move o bairro para 'Não atendidos'. Você pode reativar a qualquer momento."
                          >
                            Desativar
                          </Button>
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

          {(pendingUnrecognized.length > 0 || rejectedUnrecognized.length > 0) && (
            <div
              id="delivery-alert"
              className="rounded-[28px] overflow-hidden shadow-[0_24px_64px_rgba(234,88,12,0.45)] ring-2 ring-orange-400"
            >
              {/* Header — gradiente forte */}
              <div className="bg-gradient-to-br from-orange-500 via-orange-500 to-amber-400 px-5 pt-5 pb-4">
                <div className="flex items-start gap-3">
                  <div className="relative flex-shrink-0">
                    <span className="absolute -inset-1.5 rounded-full bg-white/30 animate-ping" />
                    <span className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 border border-white/40 backdrop-blur-sm">
                      <svg className="h-6 w-6 text-white drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                      </svg>
                    </span>
                  </div>
                  <div>
                    <p className="text-base font-bold text-white leading-tight">Atenção necessária!</p>
                    <p className="text-sm text-orange-100 mt-0.5 leading-snug">
                      {pendingUnrecognized.length > 0
                        ? `${pendingUnrecognized.length} bairro${pendingUnrecognized.length > 1 ? 's' : ''} sem taxa de entrega cadastrada`
                        : 'Bairros marcados como não atendidos'}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-orange-100/90 leading-relaxed">
                  Clientes fizeram pedidos nesses bairros. Defina uma taxa ou marque como não atendido.
                </p>
              </div>

              {/* Body — fundo branco */}
              <div className="bg-white px-5 py-4 space-y-3">
                {pendingUnrecognized.length > 0 && (
                  <div className="space-y-2">
                    {pendingUnrecognized.map(n => (
                      <div key={n.id} className="rounded-2xl border border-orange-200 bg-orange-50 p-3">
                        <div className="flex items-center gap-2 mb-2.5">
                          <span className="flex h-2 w-2 rounded-full bg-orange-500 flex-shrink-0" />
                          <span className="text-sm font-bold text-slate-800">{n.name}</span>
                        </div>
                        {addPriceMap[n.id] !== undefined ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="Taxa de entrega (R$)"
                              value={addPriceMap[n.id]}
                              onChange={e => setAddPriceMap(prev => ({ ...prev, [n.id]: e.target.value }))}
                              className="flex-1 rounded-xl border border-orange-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                            />
                            <Button size="sm" onClick={() => handleAddUnrecognized(n)}>Confirmar</Button>
                            <button
                              type="button"
                              onClick={() => setAddPriceMap(prev => { const next = { ...prev }; delete next[n.id]; return next; })}
                              className="text-xs text-slate-400 hover:text-slate-600 whitespace-nowrap"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => setAddPriceMap(prev => ({ ...prev, [n.id]: '' }))}
                              className="rounded-xl bg-orange-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-orange-600 transition-colors shadow-sm shadow-orange-300"
                            >
                              + Adicionar à lista
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRejectUnrecognized(n.id)}
                              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-50 transition-colors"
                            >
                              Não entrego aqui
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {rejectedUnrecognized.length > 0 && (
                  <div className={pendingUnrecognized.length > 0 ? 'pt-2 border-t border-orange-100' : ''}>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Não atendidos</p>
                    <div className="space-y-1.5">
                      {rejectedUnrecognized.map(n => (
                        <div key={n.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                          <span className="text-sm text-slate-400 line-through">{n.name}</span>
                          <button
                            type="button"
                            onClick={() => handleRevertUnrecognized(n.id)}
                            className="text-xs font-bold text-orange-500 hover:text-orange-700 transition-colors"
                          >
                            Reverter
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

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

          <div className={`${surfaceClass} p-5 space-y-4`} id="plano">
            <div>
              <p className="text-sm text-slate-500">Assinatura</p>
              <h3 className="text-lg font-semibold tracking-tight text-slate-900">Meu Plano</h3>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {tenant?.plan_code === 'PRO_TRIAL' ? 'Pro (Trial)' :
                     tenant?.plan_code === 'PRO' ? 'Pro' :
                     tenant?.plan_code === 'ENTERPRISE' ? 'Enterprise' : 'Grátis'}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {tenant?.subscription_status === 'TRIALING' ? 'Período de teste' :
                     tenant?.subscription_status === 'ACTIVE' ? 'Ativo' :
                     tenant?.subscription_status === 'PAST_DUE' ? 'Pagamento pendente' :
                     tenant?.subscription_status === 'CANCELED' ? 'Cancelado' : 'Sem assinatura'}
                  </p>
                </div>
                {tenant?.plan_code && tenant.plan_code !== 'FREE' && (
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    {tenant.plan_code}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                {(!tenant?.plan_code || tenant.plan_code === 'FREE' || tenant.plan_code === 'PRO_TRIAL') && (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const res = await api.post('/subscriptions/checkout', { priceId: 'pro_monthly' });
                        if (res?.url) window.location.href = res.url;
                      } catch (e) {
                        console.error('Checkout error', e);
                      }
                    }}
                    className="flex-1 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/25"
                  >
                    Fazer upgrade
                  </button>
                )}
                {tenant?.subscription_status === 'ACTIVE' && tenant?.plan_code !== 'FREE' && tenant?.plan_code !== 'PRO_TRIAL' && (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const res = await api.post('/subscriptions/billing-portal', {});
                        if (res?.url) window.location.href = res.url;
                      } catch (e) {
                        console.error('Portal error', e);
                      }
                    }}
                    className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Gerenciar assinatura
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className={`${surfaceClass} p-5 space-y-4`}>
            <div>
              <p className="text-sm text-slate-500">Conta</p>
              <h3 className="text-lg font-semibold tracking-tight text-slate-900">Sessão</h3>
            </div>
            <div className="rounded-2xl border border-red-100 bg-red-50 p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100">
                  <svg className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-red-900">Encerrar sessão</p>
                  <p className="text-xs text-red-600 mt-0.5">Você será desconectado do sistema.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLogoutModal(true)}
                className="w-full rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors shadow-sm"
              >
                Sair da conta
              </button>
            </div>
          </div>
        </div>
      </div>

      {showLogoutModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setShowLogoutModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Encerrar sessão</h2>
                <p className="text-sm text-slate-500 mt-0.5">Você sairá do painel agora.</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Tem certeza que deseja sair? Você precisará fazer login novamente para acessar o painel do restaurante.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-600/25"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      )}
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
