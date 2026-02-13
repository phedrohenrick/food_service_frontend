import React, { useMemo, useState, useEffect } from 'react';
import { Button, Input } from '../../../../shared/components/ui';
import { useStorefront } from '../../../../shared/generalContext.jsx';

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
        accepts_cash: !!tenant.accepts_cash,
      }));
    }
  }, [tenant]);

  const onTenantChange = (field) => (e) => {
    const value = e?.target?.type === 'checkbox' ? e.target.checked : e?.target?.value ?? e;
    setTenantForm((prev) => ({ ...prev, [field]: value }));
  };

  const saveTenantProfile = async () => {
    const success = await updateTenant({
      name: tenantForm.name,
      email: tenantForm.email,
      slug: tenantForm.slug,
      cnpj_cpf: tenantForm.cnpj_cpf,
      address: tenantForm.address,
      geo_lat: tenantForm.geo_lat,
      geo_lng: tenantForm.geo_lng,
      status: tenantForm.status,
      photo_url: tenantForm.photo_url,
      main_color: tenantForm.main_color,
    });
    if (success) showToast('Perfil salvo com sucesso!');
    else showToast('Erro ao salvar perfil.', 'error');
  };

  const saveTenantOps = async () => {
    const success = await updateTenant({
      working_hours: tenantForm.working_hours,
      delivery_method: tenantForm.delivery_method,
      service_fee_percentage: parseFloat(tenantForm.service_fee_percentage) || 0,
      accepts_cash: !!tenantForm.accepts_cash,
    });
    if (success) showToast('Configurações salvas com sucesso!');
    else showToast('Erro ao salvar configurações.', 'error');
  };

  const toggleOpen = () => updateTenant({ is_open: !tenant.is_open });

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
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-500">Perfil e operação</p>
        <h1 className="text-2xl font-bold text-gray-900">Ajustes com cara de app</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-lg p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm text-gray-500">Identidade</p>
                <h2 className="text-xl font-semibold text-gray-900">Dados do restaurante</h2>
              </div>
              <Button variant="ghost" className="w-full lg:w-auto border border-gray-200 text-gray-700" onClick={saveTenantProfile}>
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
              <Input label="Foto (URL)" value={tenantForm.photo_url} onChange={onTenantChange('photo_url')} />
              <Input label="Cor principal (#hex)" value={tenantForm.main_color} onChange={onTenantChange('main_color')} />
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-lg p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-gray-500">Entrega e pedidos</p>
                <h2 className="text-xl font-semibold text-gray-900">Parâmetros do delivery</h2>
              </div>
              <Button variant="ghost" className="w-full lg:w-auto border border-gray-200 text-gray-700" onClick={saveTenantOps}>
                Salvar entrega & taxas
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Método de entrega</label>
                <select
                  value={tenantForm.delivery_method}
                  onChange={onTenantChange('delivery_method')}
                  className="w-full rounded-2xl border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                >
                  <option value="own">Própria</option>
                  <option value="pool">Parceiro</option>
                </select>
              </div>
              <Input
                label="Taxa de serviço (%)"
                value={String((tenantForm.service_fee_percentage ?? 0) * 100)}
                onChange={(e) => onTenantChange('service_fee_percentage')(String(parseFloat(e.target.value) / 100))}
              />
              <div className="flex items-end">
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={tenantForm.accepts_cash} onChange={onTenantChange('accepts_cash')} />
                  Aceita dinheiro
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Funcionamento</p>
                    <p className="text-sm text-gray-500">{tenant.is_open ? 'Loja aberta' : 'Loja fechada'}</p>
                  </div>
                  <Button size="sm" variant="ghost" className="w-full lg:w-auto border border-gray-200 text-gray-700" onClick={toggleOpen}>
                    {tenant.is_open ? 'Fechar' : 'Abrir'}
                  </Button>
                </div>
                <div className="mt-3">
                  <Input label="Horário de funcionamento" value={tenantForm.working_hours} onChange={onTenantChange('working_hours')} />
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <p className="text-sm font-semibold text-gray-900 mb-2">Áreas atendidas e taxa por bairro</p>
                <div className="space-y-2">
                  {neighborhoodsSorted.map((n) => {
                    const edit = editingNeighborhood[n.id] ?? { name: n.name, price: n.price };
                    return (
                      <div key={n.id} className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            className="w-full lg:flex-1 rounded-2xl border border-gray-200 px-3 py-2 text-sm"
                            value={edit.name}
                            onChange={(e) => setEditingNeighborhood((prev) => ({ ...prev, [n.id]: { ...edit, name: e.target.value } }))}
                          />
                          <input
                            className="w-full lg:w-32 rounded-2xl border border-gray-200 px-3 py-2 text-sm"
                            value={String(edit.price)}
                            onChange={(e) => setEditingNeighborhood((prev) => ({ ...prev, [n.id]: { ...edit, price: e.target.value } }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Button size="sm" variant="ghost" className="w-full lg:w-auto border border-gray-200 text-gray-700" onClick={() => saveNeighborhoodEdit(n.id)}>Salvar</Button>
                          <Button size="sm" variant="ghost" className="w-full lg:w-auto border border-red-200 text-red-700" onClick={() => deleteNeighborhood(n.id)}>Remover</Button>
                        </div>
                      </div>
                    );
                  })}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
                    <input
                      className="w-full lg:flex-1 rounded-2xl border border-gray-200 px-3 py-2 text-sm"
                      placeholder="Novo bairro"
                      value={newNeighborhood.name}
                      onChange={(e) => setNewNeighborhood((prev) => ({ ...prev, name: e.target.value }))}
                    />
                    <input
                      className="w-full lg:w-32 rounded-2xl border border-gray-200 px-3 py-2 text-sm"
                      placeholder="Preço"
                      value={newNeighborhood.price}
                      onChange={(e) => setNewNeighborhood((prev) => ({ ...prev, price: e.target.value }))}
                    />
                    <Button size="sm" variant="ghost" className="w-full lg:w-auto border border-gray-200 text-gray-700" onClick={saveNewNeighborhood}>Adicionar</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)] text-[var(--accent-contrast)] rounded-3xl p-6 shadow-lg">
            <p className="text-sm uppercase tracking-widest text-[var(--accent-contrast)]/80">experiência</p>
            <h3 className="text-2xl font-semibold mt-2">Seu restaurante como vitrine</h3>
            <p className="text-[var(--accent-contrast)]/80 mt-2">
              Destaque fotos, tempos de preparo reais e mantenha o cardápio sempre atualizado para subir nos resultados.
            </p>
            <Button
              variant="secondary"
              className="mt-4 bg-white text-[var(--accent)] hover:bg-white/90"
              onClick={() => window.open('/app', '_blank', 'noopener,noreferrer')}
            >
              Ver como o cliente vê
            </Button>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-lg p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Equipe</p>
                <h3 className="text-lg font-semibold text-gray-900">Acessos rápidos</h3>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-2xl border border-gray-100">
                <div>
                  <p className="font-semibold text-gray-900">{user?.name || 'Proprietário'}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                  <p className="text-sm text-gray-500">{user?.phone}</p>
                  <p className="text-sm text-gray-500">Status: {user?.status}</p>
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
