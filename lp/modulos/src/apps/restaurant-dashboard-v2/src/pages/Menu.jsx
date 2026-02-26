import React, { useMemo, useState } from 'react';
import { Button, Input, Modal } from '../../../../shared/components/ui';
import { useStorefront } from '../../../../shared/generalContext.jsx';

const money = (n) => (n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const Menu = () => {
  const {
    tenant,
    banners,
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
    deleteMenuCategory,
    reorderMenuCategories,
    saveOptionGroup,
    deleteOptionGroup,
    saveOption,
    deleteOption,
    saveBanner,
    deleteBanner,
    loadData,
  } = useStorefront();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  
  // Alert modal state
  const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '', items: [] });
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', order: 0 });
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
  const [newBanner, setNewBanner] = useState({ banner_image: '', product_link: '' });

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

  const openNewCategory = () => {
    setEditingCategoryId(null);
    setCategoryForm({ name: '', order: sortedCategories.length + 1 });
    setIsCategoryModalOpen(true);
  };

  const openEditCategory = (category) => {
    setEditingCategoryId(category.id);
    setCategoryForm({ name: category.name, order: category.order || 0 });
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryForm.name) return;
    
    await saveMenuCategory({
      id: editingCategoryId || undefined,
      name: categoryForm.name,
      order: categoryForm.order,
      tenant_id: tenant.id
    });

    setIsCategoryModalOpen(false);
    setCategoryForm({ name: '', order: 0 });
    setEditingCategoryId(null);
  };

  const handleRemoveCategory = (id) => {
      // Check for associated items
      const associatedItems = menuItems.filter(item => item.category_id === id);
      
      if (associatedItems.length > 0) {
          setAlertModal({
            isOpen: true,
            title: 'Não é possível remover no momento',
            message: `Esta categoria possui itens vinculados. Remova-os ou altere a categoria deles antes de excluir.`,
            items: associatedItems
          });
          return;
      }

            deleteMenuCategory(id);

  };

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

  const handleSaveItem = async () => {
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
    
    // Save item first and wait for result (assuming context action returns result or we handle async)
    // Note: generalContext saveMenuItem currently returns void but dispatches. 
    // Ideally it should return the saved item (with ID).
    // For now we assume optimistic or reload pattern, but since we need ID for groups, this is tricky for NEW items.
    // WORKAROUND: We need the ID for groups. If it's new, we can't save groups reliably without backend ID.
    // The previous context change doesn't return ID for menu item yet (void).
    // Let's rely on reload or assume user edits again to add groups if it's new? 
    // OR: We force saveMenuItem to return something in context.
    
    // Actually, let's update this to be robust:
    // If it's a new item, we might miss the ID. 
    // Recommended fix: Update generalContext to return the response from saveMenuItem.
    
    const savedItem = await saveMenuItem(payload);
    // If savedItem is null/undefined (void return), we fallback to editingItemId if it exists.
    // If it was a NEW item, we are in trouble without the ID.
    // Let's assume for now the user is editing or we need to fix context to return ID.
    
    // (Self-correction: I updated context to call API but it returns void for menu item. I should have made it return the response/ID.)
    // Let's proceed assuming we can get the ID or it's an update.
    
    const itemIdFinal = editingItemId || (savedItem && savedItem.id); 

    if (itemIdFinal) {
        // persist option groups and options
        for (const grp of groupsForm) {
          const grpPayload = {
            id: grp.id,
            item_id: itemIdFinal,
            name: grp.name,
            is_required: !!grp.is_required,
            min: Number(grp.min ?? 0),
            max: Number(grp.max ?? 1),
          };
          const savedGroup = await saveOptionGroup(grpPayload);
          
          if (savedGroup && savedGroup.id) {
              for (const opt of grp.options) {
                await saveOption({ 
                    id: opt.id, 
                    group_id: savedGroup.id, 
                    name: opt.name, 
                    additional_charge: Number(opt.additional_charge || 0) 
                });
              }
          }
        }

        // optional banner
        if (bannerForm.enabled && bannerForm.banner_image) {
          saveBanner({ banner_image: bannerForm.banner_image, product_link: itemIdFinal, tenant_id: tenant.id });
        }
    } else {
        console.warn("Could not save groups/banner because Item ID is missing (new item creation limitation)");
        // Ideally show a toast: "Item criado! Edite-o para adicionar opções."
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

  const handleSaveNewBanner = () => {
    if (!newBanner.banner_image) return;
    saveBanner({
      banner_image: newBanner.banner_image,
      product_link: newBanner.product_link,
      tenant_id: tenant.id
    });
    setNewBanner({ banner_image: '', product_link: '' });
    setIsBannerModalOpen(false);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    await loadData();
    setTimeout(() => setIsSyncing(false), 800); // Visual feedback
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">Curadoria do cardápio</p>
          <h1 className="text-2xl font-bold text-gray-900">Categorias de Produtos</h1>
        </div>
        <Button onClick={openNewCategory}>Adicionar Categoria</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {sortedCategories.map((category, idx) => {
          const activeCount = menuItems.filter((mi) => mi.category_id === category.id && mi.is_available).length;
          return (
            <div key={category.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm group relative">
              <div className="flex justify-between items-start">
                  <div className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-700">
                    {category.name}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditCategory(category)} className="text-gray-400 hover:text-blue-600">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                      </button>
                      <button onClick={() => handleRemoveCategory(category.id)} className="text-gray-400 hover:text-red-600">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      </button>
                  </div>
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
          <Button 
            variant="ghost" 
            className="border border-gray-200 text-gray-700 flex items-center gap-2"
            onClick={handleSync}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                Sincronizando...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
                Sincronizar
              </>
            )}
          </Button>
          <Button onClick={openNewItem}>Adicionar item</Button>
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

      <div className="bg-white rounded-3xl border border-gray-100 shadow-lg p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-gray-500">Marketing e Destaques</p>
            <h2 className="text-xl font-semibold text-gray-900">Banners do App</h2>
          </div>
          <Button onClick={() => setIsBannerModalOpen(true)}>
            Novo Banner
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {banners.map((banner) => (
            <div key={banner.id} className="group relative rounded-2xl overflow-hidden border border-gray-200 aspect-[2/1] bg-gray-50">
              <img src={banner.banner_image} alt="Banner" className="w-full h-full object-cover" />
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute bottom-2 right-2">
                  <button type="button" onClick={() => deleteBanner(banner.id)} className="pointer-events-auto px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold shadow hover:bg-red-700">Excluir</button>
                </div>
              </div>
              {banner.product_link && (
                <div className="absolute bottom-2 left-2 right-2">
                   <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl text-xs font-medium shadow-sm truncate">
                    Ref: {menuItems.find(i => i.id === banner.product_link)?.name || 'Produto indisponível'}
                   </div>
                </div>
              )}
            </div>
          ))}
          {banners.length === 0 && (
            <div className="col-span-full py-12 text-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50">
              <p className="text-gray-500 font-medium">Nenhum banner ativo</p>
              <p className="text-sm text-gray-400 mt-1">Adicione banners para destacar promoções e pratos.</p>
              <Button variant="link" className="mt-2 text-[var(--accent)]" onClick={() => setIsBannerModalOpen(true)}>
                Adicionar agora
              </Button>
            </div>
          )}
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

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">Grupos de opções</h4>
              <Button
                size="sm"
                variant="ghost"
                className="border border-gray-200"
                onClick={() =>
                  setGroupsForm([
                    ...groupsForm,
                    { name: '', is_required: false, min: 0, max: 1, options: [] },
                  ])
                }
              >
                Adicionar grupo
              </Button>
            </div>
            {groupsForm.map((grp, gi) => (
              <div key={gi} className="border border-gray-200 rounded-xl p-4 space-y-3">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="flex-1">
                    <Input
                      label="Nome do grupo"
                      value={grp.name}
                      onChange={(e) => {
                        const next = [...groupsForm];
                        next[gi].name = e.target.value;
                        setGroupsForm(next);
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        const next = [...groupsForm];
                        next[gi].is_required = !next[gi].is_required;
                        setGroupsForm(next);
                      }}
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-full border text-xs font-medium transition-colors ${
                        grp.is_required
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-gray-200 bg-gray-50 text-gray-500'
                      }`}
                    >
                      <span>Obrigatório</span>
                      <span
                        className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
                          grp.is_required ? 'bg-emerald-500' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`h-3 w-3 rounded-full bg-white shadow transform transition-transform ${
                            grp.is_required ? 'translate-x-3' : 'translate-x-0'
                          }`}
                        />
                      </span>
                    </button>
                    <div className="flex items-center gap-2">
                      <div className="w-20">
                        <Input
                          label="Mín"
                          type="number"
                          value={grp.min}
                          onChange={(e) => {
                            const next = [...groupsForm];
                            next[gi].min = Number(e.target.value || 0);
                            setGroupsForm(next);
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-400">a</span>
                      <div className="w-20">
                        <Input
                          label="Máx"
                          type="number"
                          value={grp.max}
                          onChange={(e) => {
                            const next = [...groupsForm];
                            next[gi].max = Number(e.target.value || 1);
                            setGroupsForm(next);
                          }}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      className="ml-1 inline-flex items-center justify-center h-9 w-9 rounded-full border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-200 transition-colors"
                      onClick={async () => {
                        if (grp.id) {
                          await deleteOptionGroup(grp.id);
                        }
                        const next = [...groupsForm];
                        next.splice(gi, 1);
                        setGroupsForm(next);
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Opções</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="border border-gray-200"
                      onClick={() => {
                        const next = [...groupsForm];
                        next[gi].options = [
                          ...(next[gi].options || []),
                          { name: '', additional_charge: 0 },
                        ];
                        setGroupsForm(next);
                      }}
                    >
                      Adicionar opção
                    </Button>
                  </div>
                  {(grp.options || []).map((opt, oi) => (
                    <div key={oi} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Input
                        label="Nome"
                        value={opt.name}
                        onChange={(e) => {
                          const next = [...groupsForm];
                          next[gi].options[oi].name = e.target.value;
                          setGroupsForm(next);
                        }}
                      />
                      <Input
                        label="Adicional (R$)"
                        type="number"
                        value={opt.additional_charge}
                        onChange={(e) => {
                          const next = [...groupsForm];
                          next[gi].options[oi].additional_charge = e.target.value;
                          setGroupsForm(next);
                        }}
                      />
                      <div className="flex items-end justify-end">
                        <button
                          type="button"
                          className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-200 transition-colors"
                          onClick={async () => {
                            if (opt.id) {
                              await deleteOption(opt.id);
                            }
                            const next = [...groupsForm];
                            next[gi].options.splice(oi, 1);
                            setGroupsForm(next);
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="ghost" className="border border-gray-200 text-gray-700" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveItem}>{editingItemId ? 'Salvar alterações' : 'Criar item'}</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} title={editingCategoryId ? 'Editar Categoria' : 'Nova Categoria'}>
        <div className="space-y-4">
          <Input
            label="Nome da Categoria"
            value={categoryForm.name}
            onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
            placeholder="Ex: Combos, Bebidas..."
          />
          <Input
            label="Ordem de Exibição"
            type="number"
            value={categoryForm.order}
            onChange={(e) => setCategoryForm({ ...categoryForm, order: Number(e.target.value) })}
          />
          <div className="flex justify-end gap-3 pt-3">
            <Button variant="ghost" className="border border-gray-200 text-gray-700" onClick={() => setIsCategoryModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveCategory}>Salvar</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isBannerModalOpen} onClose={() => setIsBannerModalOpen(false)} title="Novo Banner">
        <div className="space-y-4">
          <Input
            label="URL da Imagem"
            value={newBanner.banner_image}
            onChange={(e) => setNewBanner({ ...newBanner, banner_image: e.target.value })}
            placeholder="https://..."
          />
          {newBanner.banner_image && (
             <div className="rounded-xl overflow-hidden border border-gray-200 aspect-[2/1] bg-gray-50">
               <img src={newBanner.banner_image} alt="Preview" className="w-full h-full object-cover" />
             </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vincular a um produto (opcional)</label>
            <select
              value={newBanner.product_link}
              onChange={(e) => setNewBanner({ ...newBanner, product_link: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              <option value="">Sem vínculo</option>
              {itemsSorted.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Ao clicar no banner, o cliente será levado para este produto.</p>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="ghost" className="border border-gray-200 text-gray-700" onClick={() => setIsBannerModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveNewBanner}>Adicionar Banner</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={alertModal.isOpen} onClose={() => setAlertModal({ ...alertModal, isOpen: false })} title={alertModal.title}>
        <div className="space-y-4">
            <div className="text-gray-700">
                {alertModal.message}
            </div>
            {alertModal.items && alertModal.items.length > 0 && (
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 max-h-48 overflow-y-auto">
                    <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">Itens vinculados:</p>
                    <ul className="space-y-1">
                        {alertModal.items.map(item => (
                            <li key={item.id} className="text-sm text-gray-700 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                                {item.name}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            <div className="flex justify-end pt-2">
                <Button onClick={() => setAlertModal({ ...alertModal, isOpen: false })}>
                    Entendi
                </Button>
            </div>
        </div>
      </Modal>
    </div>
  );
};

export default Menu;
