import React, { useMemo, useState } from 'react';
import { Button, Input, Modal } from '../../../../shared/components/ui';
import { useStorefront } from '../../../../shared/generalContext.jsx';

const money = (n) => (n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const Menu = () => {
  const {
    tenant,
    menuCategories,
    menuItems,
    optionGroups,
    options,
    maps,
    getOptionGroupsForItem,
    getOptionsForGroup,
    // actions
    saveMenuItem,
    deleteMenuItem,
    toggleItemAvailability,
    saveMenuCategory,
    reorderMenuCategories,
    saveOptionGroup,
    deleteOptionGroup,
    saveOption,
    deleteOption,
    saveBanner,
  } = useStorefront();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    price: '',
    is_available: true,
    photo_url: '',
    category_id: '',
  });
  const [groupsForm, setGroupsForm] = useState([]); // [{id?, name, is_required, min, max, options:[{id?, name, additional_charge}]}]
  const [bannerForm, setBannerForm] = useState({ banner_image: '', enabled: false });

  const sortedCategories = useMemo(
    () => [...menuCategories].sort((a, b) => (a.order || 0) - (b.order || 0)),
    [menuCategories]
  );

  const itemsSorted = useMemo(() => {
    const orderMap = new Map(sortedCategories.map((c, i) => [c.id, i]));
    return [...menuItems].sort((a, b) => {
      const ca = orderMap.get(a.category_id) ?? 999;
      const cb = orderMap.get(b.category_id) ?? 999;
      if (ca !== cb) return ca - cb;
      return a.name.localeCompare(b.name);
    });
  }, [menuItems, sortedCategories]);

  const openNewItem = () => {
    setEditingItemId(null);
    setItemForm({ name: '', description: '', price: '', is_available: true, photo_url: '', category_id: sortedCategories[0]?.id || '' });
    setGroupsForm([]);
    setBannerForm({ banner_image: '', enabled: false });
    setIsModalOpen(true);
  };

  const openEditItem = (item) => {
    setEditingItemId(item.id);
    setItemForm({
      id: item.id,
      name: item.name || '',
      description: item.description || '',
      price: item.price ?? '',
      is_available: !!item.is_available,
      photo_url: item.photo_url || '',
      category_id: item.category_id || '',
    });
    const existingGroups = getOptionGroupsForItem(item.id).map((g) => ({
      id: g.id,
      name: g.name,
      is_required: !!g.is_required,
      min: g.min ?? 0,
      max: g.max ?? 1,
      options: getOptionsForGroup(g.id).map((o) => ({ id: o.id, name: o.name, additional_charge: o.additional_charge ?? 0 })),
    }));
    setGroupsForm(existingGroups);
    setBannerForm({ banner_image: '', enabled: false });
    setIsModalOpen(true);
  };

  const handleSaveItem = () => {
    const payload = {
      id: editingItemId || undefined,
      name: itemForm.name,
      description: itemForm.description,
      price: parseFloat(itemForm.price || 0),
      is_available: !!itemForm.is_available,
      photo_url: itemForm.photo_url,
      category_id: itemForm.category_id,
      tenant_id: tenant.id,
    };
    saveMenuItem(payload);

    // persist option groups and options
    const itemIdFinal = editingItemId || payload.id; // if created, id comes from reducer state with Date.now(); we can't read it here; next render will reflect
    groupsForm.forEach((grp) => {
      const grpPayload = {
        id: grp.id,
        item_id: editingItemId || payload.id || itemForm.id, // fallbacks
        name: grp.name,
        is_required: !!grp.is_required,
        min: Number(grp.min ?? 0),
        max: Number(grp.max ?? 1),
      };
      saveOptionGroup(grpPayload);
      grp.options.forEach((opt) => {
        saveOption({ id: opt.id, group_id: grpPayload.id, name: opt.name, additional_charge: Number(opt.additional_charge || 0) });
      });
    });

    // optional banner
    if (bannerForm.enabled && bannerForm.banner_image) {
      saveBanner({ banner_image: bannerForm.banner_image, product_link: editingItemId || payload.id, tenant_id: tenant.id });
    }

    setIsModalOpen(false);
    setEditingItemId(null);
    setItemForm({ name: '', description: '', price: '', is_available: true, photo_url: '', category_id: sortedCategories[0]?.id || '' });
    setGroupsForm([]);
    setBannerForm({ banner_image: '', enabled: false });
  };

  const handleRemoveItem = (id) => {
    deleteMenuItem(id);
  };

  const handleToggleAvailability = (id) => {
    toggleItemAvailability(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">Curadoria do cardápio</p>
          <h1 className="text-2xl font-bold text-gray-900">Itens com cara de app</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" className="border border-gray-200 text-gray-700">Sincronizar</Button>
          <Button onClick={openNewItem}>Adicionar item</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {sortedCategories.map((category, idx) => {
          const activeCount = menuItems.filter((mi) => mi.category_id === category.id && mi.is_available).length;
          return (
            <div key={category.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-700">
                {category.name}
              </div>
              <div className="mt-2 flex gap-2">
                <Button size="sm" variant="ghost" className="border border-gray-200" disabled={idx===0} onClick={() => {
                  const ids = sortedCategories.map((c) => c.id);
                  if (idx>0) {
                    [ids[idx-1], ids[idx]] = [ids[idx], ids[idx-1]];
                    reorderMenuCategories(ids);
                  }
                }}>↑</Button>
                <Button size="sm" variant="ghost" className="border border-gray-200" disabled={idx===sortedCategories.length-1} onClick={() => {
                  const ids = sortedCategories.map((c) => c.id);
                  if (idx<sortedCategories.length-1) {
                    [ids[idx+1], ids[idx]] = [ids[idx], ids[idx+1]];
                    reorderMenuCategories(ids);
                  }
                }}>↓</Button>
              </div>
              <p className="mt-3 text-2xl font-bold text-gray-900">{activeCount}</p>
              <p className="text-sm text-gray-500">itens ativos</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-lg p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-gray-500">Itens ao vivo</p>
            <h2 className="text-xl font-semibold text-gray-900">Lista pronta para o cliente</h2>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" className="border border-gray-200 text-gray-700">Duplicar</Button>
            <Button>Publicar alterações</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {itemsSorted.map((item) => (
            <div key={item.id} className="rounded-2xl border border-gray-100 p-4 bg-gray-50/60 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-gray-500">{maps.categoryMap[item.category_id]?.name || '—'}</p>
                  <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full ${item.is_available ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                  {item.is_available ? 'Ativo' : 'Pausado'}
                </span>
              </div>
              <div>
                <p className="text-xl font-bold text-[var(--accent)]">{money(item.price)}</p>
                <div className="mt-2 w-full flex flex-wrap gap-2 justify-start">
                  <Button size="sm" variant="ghost" className="min-w-[120px] border border-gray-200 text-gray-700" onClick={() => openEditItem(item)}>Editar</Button>
                  <Button size="sm" variant="ghost" className="min-w-[120px] border border-gray-200 text-gray-700" onClick={() => handleToggleAvailability(item.id)}>
                    {item.is_available ? 'Ocultar' : 'Ativar'}
                  </Button>
                  <Button size="sm" variant="ghost" className="border border-gray-200 text-red-600" onClick={() => handleRemoveItem(item.id)}>Remover</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItemId ? 'Editar item' : 'Adicionar item ao cardápio'}>
        <div className="space-y-4">
          <Input
            label="Nome do prato"
            value={itemForm.name}
            onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
            placeholder="Ex: Ravioli de ricota"
          />
          <Input
            label="Descrição"
            value={itemForm.description}
            onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
            placeholder="Fale sobre textura, ingredientes e diferenciais"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Preço"
              type="number"
              value={itemForm.price}
              onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
              placeholder="0,00"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
              <select
                value={itemForm.category_id}
                onChange={(e) => setItemForm({ ...itemForm, category_id: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              >
                <option value="">Selecione</option>
                {sortedCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input id="available" type="checkbox" checked={!!itemForm.is_available} onChange={(e) => setItemForm({ ...itemForm, is_available: e.target.checked })} />
            <label htmlFor="available" className="text-sm text-gray-700">Disponível para venda</label>
          </div>
          <Input
            label="URL da foto"
            value={itemForm.photo_url}
            onChange={(e) => setItemForm({ ...itemForm, photo_url: e.target.value })}
            placeholder="https://..."
          />

          {/* Grupos de opções */}
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">Grupos de opções</h4>
              <Button size="sm" variant="ghost" className="border border-gray-200" onClick={() => setGroupsForm([...groupsForm, { name: '', is_required: false, min: 0, max: 1, options: [] }])}>Adicionar grupo</Button>
            </div>
            {groupsForm.map((grp, gi) => (
              <div key={gi} className="border border-gray-200 rounded-xl p-3 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <Input label="Nome do grupo" value={grp.name} onChange={(e) => {
                    const next = [...groupsForm]; next[gi].name = e.target.value; setGroupsForm(next);
                  }} />
                  <div className="flex items-end gap-2">
                    <label className="text-sm text-gray-700">Obrigatório</label>
                    <input type="checkbox" checked={!!grp.is_required} onChange={(e) => { const next = [...groupsForm]; next[gi].is_required = e.target.checked; setGroupsForm(next); }} />
                  </div>
                  <Input label="Mín" type="number" value={grp.min} onChange={(e) => { const next = [...groupsForm]; next[gi].min = Number(e.target.value || 0); setGroupsForm(next); }} />
                  <Input label="Máx" type="number" value={grp.max} onChange={(e) => { const next = [...groupsForm]; next[gi].max = Number(e.target.value || 1); setGroupsForm(next); }} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Opções</span>
                    <Button size="sm" variant="ghost" className="border border-gray-200" onClick={() => {
                      const next = [...groupsForm];
                      next[gi].options = [...(next[gi].options || []), { name: '', additional_charge: 0 }];
                      setGroupsForm(next);
                    }}>Adicionar opção</Button>
                  </div>
                  {(grp.options || []).map((opt, oi) => (
                    <div key={oi} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Input label="Nome" value={opt.name} onChange={(e) => { const next = [...groupsForm]; next[gi].options[oi].name = e.target.value; setGroupsForm(next); }} />
                      <Input label="Adicional (R$)" type="number" value={opt.additional_charge} onChange={(e) => { const next = [...groupsForm]; next[gi].options[oi].additional_charge = e.target.value; setGroupsForm(next); }} />
                      <div className="flex items-end">
                        <Button size="sm" variant="ghost" className="border border-gray-200 text-red-600" onClick={() => { const next = [...groupsForm]; next[gi].options.splice(oi, 1); setGroupsForm(next); }}>Remover</Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end">
                  <Button size="sm" variant="ghost" className="border border-gray-200 text-red-600" onClick={() => { const next = [...groupsForm]; next.splice(gi, 1); setGroupsForm(next); }}>Remover grupo</Button>
                </div>
              </div>
            ))}
          </div>

          {/* Banner opcional */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2">
              <input id="banner-enabled" type="checkbox" checked={bannerForm.enabled} onChange={(e) => setBannerForm({ ...bannerForm, enabled: e.target.checked })} />
              <label htmlFor="banner-enabled" className="text-sm text-gray-700">Associar banner a este item</label>
            </div>
            {bannerForm.enabled && (
              <Input label="Imagem do banner (URL)" value={bannerForm.banner_image} onChange={(e) => setBannerForm({ ...bannerForm, banner_image: e.target.value })} placeholder="https://..." />
            )}
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="ghost" className="border border-gray-200 text-gray-700" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveItem}>{editingItemId ? 'Salvar alterações' : 'Criar item'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Menu;
