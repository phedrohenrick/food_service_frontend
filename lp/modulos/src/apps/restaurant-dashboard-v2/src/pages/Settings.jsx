import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button, Input } from '../../../../shared/components/ui';
import { useStorefront } from '../../../../shared/generalContext.jsx';
import api from '../../../../shared/services/api';
import { validateCpfOrCnpj } from '../../../../shared/utils/validators';
import BrandPreviewPhone from '../components/BrandPreviewPhone';

const paymentOptions = [
  { value: 'PIX', label: 'Pix', helper: 'Pagamento instantaneo' },
  { value: 'CARD', label: 'Cartão', helper: 'Crédito e débito' },
  { value: 'CASH', label: 'Dinheiro', helper: 'Pagamento na entrega' },
];

const Settings = () => {
  const {
    tenant,
    neighborhoods,
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
    whatsapp_phone: tenant?.whatsapp_phone || '',
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
        whatsapp_phone: tenant.whatsapp_phone || '',
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

  const storeLinkOrigin =
    typeof window !== 'undefined' ? window.location.origin : '';
  const storeLinkSuffix = '/app';
  const slugInputRef = useRef(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isEditingSlug, setIsEditingSlug] = useState(false);
  const [slugCheck, setSlugCheck] = useState({ slug: '', status: 'idle' });

  const buildStoreUrl = (slug) =>
    `${storeLinkOrigin}/${String(slug || '').trim()}${storeLinkSuffix}`;

  const handleCopyStoreLink = async () => {
    const slug = String(tenantForm.slug || '').trim();
    if (!slug) return;
    const fullUrl = buildStoreUrl(slug);
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(fullUrl);
      } else {
        const ta = document.createElement('textarea');
        ta.value = fullUrl;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 1800);
    } catch (_) {}
  };

  const enterSlugEdit = () => {
    setIsEditingSlug(true);
    requestAnimationFrame(() => {
      const el = slugInputRef.current;
      if (el) {
        el.focus();
        el.select();
      }
    });
  };

  useEffect(() => {
    const raw = String(tenantForm.slug || '').trim();
    if (!isEditingSlug && !raw) return;
    let cancelled = false;
    let timeoutId = null;
    const tenantSlug = tenant?.slug || '';

    const run = async () => {
      if (!raw) {
        if (!cancelled) setSlugCheck({ slug: '', status: 'empty' });
        return;
      }
      const validationMsg = validateSlug(raw);
      if (validationMsg) {
        if (!cancelled) setSlugCheck({ slug: raw, status: 'invalid', message: validationMsg });
        return;
      }
      if (raw === tenantSlug) {
        if (!cancelled) setSlugCheck({ slug: raw, status: 'available' });
        return;
      }
      if (!cancelled) setSlugCheck({ slug: raw, status: 'checking' });
      try {
        const result = await api.get(`/onboarding/slug-available?slug=${encodeURIComponent(raw)}`);
        if (cancelled) return;
        const available = !result || result.available !== false;
        setSlugCheck({ slug: raw, status: available ? 'available' : 'taken' });
      } catch (_) {
        if (!cancelled) setSlugCheck({ slug: raw, status: 'available' });
      }
    };

    timeoutId = setTimeout(run, 350);
    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [tenantForm.slug, isEditingSlug, tenant?.slug]);

  const slugStatus = slugCheck.slug === String(tenantForm.slug || '').trim() ? slugCheck.status : 'idle';
  const slugBlockingError =
    slugStatus === 'taken' || slugStatus === 'invalid' || slugStatus === 'empty';

  const handleSlugBlur = () => {
    if (slugBlockingError) return;
    setIsEditingSlug(false);
  };

  const handleSlugKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!slugBlockingError) {
        e.currentTarget.blur();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.currentTarget.blur();
    }
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
    const trimmedName = (tenantForm.name || '').trim();
    if (!trimmedName || trimmedName.toLowerCase() === 'minha loja') {
      showToast('Preencha o nome da loja antes de salvar.', 'error');
      return;
    }
    const trimmedDocument = (tenantForm.cnpj_cpf || '').trim();
    if (!trimmedDocument) {
      showToast('Preencha o CPF ou CNPJ antes de salvar.', 'error');
      return;
    }
    const documentError = validateCpfOrCnpj(trimmedDocument);
    if (documentError) {
      showToast(documentError, 'error');
      return;
    }
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
      whatsapp_phone: tenantForm.whatsapp_phone,
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
  const [deliveryAlertCollapsed, setDeliveryAlertCollapsed] = useState(false);

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
              {(() => {
                const docError = validateCpfOrCnpj(tenantForm.cnpj_cpf);
                const slugBlocking = slugStatus === 'taken' || slugStatus === 'invalid' || slugStatus === 'checking' || slugStatus === 'empty';
                const disabled = slugBlocking || !!docError;
                const reason =
                  slugStatus === 'taken' ? 'O link informado já está em uso.' :
                  slugStatus === 'invalid' ? 'Corrija o link da loja antes de salvar.' :
                  slugStatus === 'checking' ? 'Verificando disponibilidade do link...' :
                  slugStatus === 'empty' ? 'Informe um link válido.' :
                  docError ? docError :
                  undefined;
                return (
                  <Button
                    className="w-full lg:w-auto shadow-[0_12px_30px_rgba(15,23,42,0.12)]"
                    onClick={saveTenantProfile}
                    data-wizard="store-save"
                    disabled={disabled}
                    title={reason}
                  >
                    Salvar perfil
                  </Button>
                );
              })()}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Input label="ID" value={tenant?.id || ''} disabled />
              <Input label="Nome" value={tenantForm.name} onChange={onTenantChange('name')} wrapperProps={{ 'data-wizard': 'store-name' }} />
              <Input label="Email" value={tenantForm.email} onChange={onTenantChange('email')} />
              <div className="mb-4" data-wizard="store-slug">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link da loja
                </label>
                <div
                  className={`relative flex items-center w-full rounded-lg border bg-white transition-colors ${
                    slugBlockingError && isEditingSlug
                      ? 'border-red-400 ring-2 ring-red-200'
                      : isEditingSlug
                        ? 'border-transparent ring-2 ring-background-primary'
                        : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    ref={slugInputRef}
                    type="text"
                    value={tenantForm.slug}
                    onChange={onTenantChange('slug')}
                    onBlur={handleSlugBlur}
                    onKeyDown={handleSlugKeyDown}
                    placeholder="sua-loja"
                    aria-label="Identificador da loja no link"
                    className={`flex-1 min-w-0 px-3 py-2 text-gray-900 font-medium bg-transparent focus:outline-none ${
                      isEditingSlug ? '' : 'sr-only'
                    }`}
                  />

                  {!isEditingSlug && (
                    <button
                      type="button"
                      onClick={enterSlugEdit}
                      className="flex-1 min-w-0 text-left px-3 py-2 text-gray-900 truncate cursor-text hover:bg-gray-50 rounded-l-lg"
                      title="Clique para editar o slug"
                    >
                      {tenantForm.slug
                        ? buildStoreUrl(tenantForm.slug)
                        : <span className="text-gray-400">Defina o link da sua loja</span>}
                    </button>
                  )}

                  {isEditingSlug && (
                    <span className="px-2 py-2 text-xs text-gray-400 whitespace-nowrap select-none">
                      {slugStatus === 'checking'
                        ? 'Verificando...'
                        : slugStatus === 'available'
                          ? '✓ disponível'
                          : ''}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={handleCopyStoreLink}
                    disabled={!String(tenantForm.slug || '').trim() || isEditingSlug}
                    title={linkCopied ? 'Link copiado!' : 'Copiar link completo'}
                    aria-label="Copiar link da loja"
                    className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-l border-gray-200 rounded-r-lg transition-colors ${
                      linkCopied
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed'
                    }`}
                  >
                    {linkCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    <span className="hidden sm:inline">{linkCopied ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>

                {isEditingSlug && slugStatus === 'taken' && (
                  <p className="mt-1 text-sm text-red-600">
                    O link "{slugCheck.slug}" já está em uso. Escolha outro.
                  </p>
                )}
                {isEditingSlug && slugStatus === 'invalid' && (
                  <p className="mt-1 text-sm text-red-600">
                    {slugCheck.message || 'Link inválido.'}
                  </p>
                )}
                {isEditingSlug && slugStatus === 'empty' && (
                  <p className="mt-1 text-sm text-red-600">
                    Informe um link válido.
                  </p>
                )}
                {!isEditingSlug && (
                  <p className="mt-1 text-xs text-gray-500">
                    Clique no campo para alterar. Divulgue esse link no Instagram, WhatsApp, Google Maps e onde mais quiser.
                  </p>
                )}
              </div>
              <Input
                label="CNPJ/CPF"
                value={tenantForm.cnpj_cpf}
                onChange={onTenantChange('cnpj_cpf')}
                wrapperProps={{ 'data-wizard': 'store-document' }}
                error={validateCpfOrCnpj(tenantForm.cnpj_cpf)}
              />
              <Input
                label="WhatsApp da loja"
                value={tenantForm.whatsapp_phone}
                onChange={onTenantChange('whatsapp_phone')}
                placeholder="Ex: +55 11 98888-7777"
                error={(() => {
                  const v = String(tenantForm.whatsapp_phone || '').trim();
                  if (!v) return '';
                  const digits = v.replace(/\D/g, '');
                  if (digits.length < 10 || digits.length > 15) {
                    return 'Número inválido. Use DDD + número (ex: 11 98888-7777).';
                  }
                  return '';
                })()}
              />
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

              <div className={`${subtleCardClass} p-4`} data-wizard="working-hours">
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
                  {neighborhoodsSorted.length > 0 && (
                    <div className="hidden lg:flex items-center gap-2 px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <span className="flex-1">Bairro</span>
                      <span className="w-32 text-right">Taxa de entrega (R$)</span>
                      <span className="w-[160px]" aria-hidden="true" />
                    </div>
                  )}
                  {neighborhoodsSorted.map((n) => {
                    const edit = editingNeighborhood[n.id] ?? { name: n.name, price: n.price };
                    return (
                      <div key={n.id} className="space-y-2 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm">
                        <div className="flex flex-wrap items-center gap-2">
                          <label className="w-full lg:flex-1">
                            <span className="lg:hidden block text-xs font-medium text-slate-500 mb-1">Bairro</span>
                            <input
                              className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                              value={edit.name}
                              aria-label="Nome do bairro"
                              onChange={(e) => setEditingNeighborhood((prev) => ({ ...prev, [n.id]: { ...edit, name: e.target.value } }))}
                            />
                          </label>
                          <label className="w-full lg:w-32">
                            <span className="lg:hidden block text-xs font-medium text-slate-500 mb-1">Taxa (R$)</span>
                            <input
                              className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                              value={String(edit.price)}
                              aria-label="Taxa de entrega em reais"
                              inputMode="decimal"
                              onChange={(e) => setEditingNeighborhood((prev) => ({ ...prev, [n.id]: { ...edit, price: e.target.value } }))}
                            />
                          </label>
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
                  <div className="pt-3 border-t border-slate-200">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Adicionar novo bairro</p>
                    <div className="flex flex-wrap items-end gap-2">
                      <label className="w-full lg:flex-1">
                        <span className="block text-xs font-medium text-slate-500 mb-1">Bairro</span>
                        <input
                          className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                          placeholder="Ex: Centro"
                          value={newNeighborhood.name}
                          onChange={(e) => setNewNeighborhood((prev) => ({ ...prev, name: e.target.value }))}
                        />
                      </label>
                      <label className="w-full lg:w-32">
                        <span className="block text-xs font-medium text-slate-500 mb-1">Taxa (R$)</span>
                        <input
                          className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                          placeholder="0,00"
                          inputMode="decimal"
                          value={newNeighborhood.price}
                          onChange={(e) => setNewNeighborhood((prev) => ({ ...prev, price: e.target.value }))}
                        />
                      </label>
                      <Button size="sm" className="w-full lg:w-auto" onClick={saveNewNeighborhood}>Adicionar</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <BrandPreviewPhone
            tenantSlug={tenant?.slug}
            mainColor={tenantForm.main_color}
          />
        </div>
      </div>

      {pendingUnrecognized.length > 0 && (
        <div className="fixed bottom-5 right-5 z-50 w-80 select-none">
          <div
            className="rounded-2xl bg-white border border-orange-200 overflow-hidden"
            style={{ boxShadow: '0 8px 32px -4px rgba(234,88,12,0.30), 0 2px 8px -2px rgba(0,0,0,0.08)' }}
          >
            <button
              type="button"
              onClick={() => setDeliveryAlertCollapsed((v) => !v)}
              className="w-full flex items-center justify-between px-5 py-4 transition-colors"
              style={{ background: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)' }}
            >
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <span className="absolute -inset-1 rounded-full bg-white/30 animate-ping" />
                  <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 border border-white/40">
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                    </svg>
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-white">Atenção necessária</p>
                  <p className="text-xs text-orange-100">
                    {pendingUnrecognized.length > 0
                      ? `${pendingUnrecognized.length} bairro${pendingUnrecognized.length > 1 ? 's' : ''} sem taxa cadastrada`
                      : 'Bairros não atendidos'}
                  </p>
                </div>
              </div>
              <svg
                className={`h-4 w-4 text-white/80 transition-transform duration-200 ${deliveryAlertCollapsed ? '' : 'rotate-180'}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div className="h-0.5 bg-orange-100" />

            <div
              className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{ maxHeight: deliveryAlertCollapsed ? '0px' : '400px', opacity: deliveryAlertCollapsed ? 0 : 1 }}
            >
              <div className="bg-white px-4 py-3 space-y-3 max-h-80 overflow-y-auto">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Clientes fizeram pedidos nesses bairros. Defina uma taxa ou marque como não atendido.
                </p>

                {pendingUnrecognized.length > 0 && (
                  <div className="space-y-2">
                    {pendingUnrecognized.map((n) => (
                      <div key={n.id} className="rounded-2xl border border-orange-200 bg-orange-50 p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="flex h-2 w-2 rounded-full bg-orange-500 flex-shrink-0" />
                          <span className="text-sm font-bold text-slate-800">{n.name}</span>
                        </div>
                        {addPriceMap[n.id] !== undefined ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="Taxa (R$)"
                              value={addPriceMap[n.id]}
                              onChange={(e) => setAddPriceMap((prev) => ({ ...prev, [n.id]: e.target.value }))}
                              className="flex-1 rounded-xl border border-orange-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                            />
                            <Button size="sm" onClick={() => handleAddUnrecognized(n)}>OK</Button>
                            <button
                              type="button"
                              onClick={() => setAddPriceMap((prev) => { const next = { ...prev }; delete next[n.id]; return next; })}
                              className="text-xs text-slate-400 hover:text-slate-600"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            <button
                              type="button"
                              onClick={() => setAddPriceMap((prev) => ({ ...prev, [n.id]: '' }))}
                              className="rounded-xl bg-orange-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-orange-600 transition-colors"
                            >
                              + Adicionar taxa
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

              </div>
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
