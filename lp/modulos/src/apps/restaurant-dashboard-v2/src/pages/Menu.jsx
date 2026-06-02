import React, { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Smartphone, Sparkles, X } from 'lucide-react';
import { Button, Input, Modal } from '../../../../shared/components/ui';
import { useStorefront } from '../../../../shared/generalContext.jsx';
import MobilePreviewWidget from '../components/MobilePreviewWidget';

// Keep in sync with InitialTenantDataService on the backend.
const SEED_ITEM_NAMES = new Set([
  'X-Bacon', 'X-Salada', 'Double Cheddar', 'Coca-Cola Lata',
  'Spaghetti Carbonara', 'Fettuccine Alfredo', 'Água com gás',
]);
const isSeedItem = (item) => SEED_ITEM_NAMES.has(String(item?.name || '').trim());

const money = (n) => (n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const productImageFallback =
  'https://i.postimg.cc/JnVpHr75/Nenhuma-Imagem-adicionada-(2).png';

const getTenantStoreBaseUrl = (tenantSlug) => {
  if (typeof window === 'undefined') return '';
  const origin = window.location.origin;
  return tenantSlug ? `${origin}/${tenantSlug}/app` : `${origin}/app`;
};

const buildBannerProductLink = (tenantSlug, productId) => {
  if (!productId) return '';
  return `${getTenantStoreBaseUrl(tenantSlug)}/produto/${productId}`;
};

const extractProductIdFromBannerLink = (productLink) => {
  if (!productLink) return '';
  const value = String(productLink).trim();
  const match = value.match(/\/produto\/([^/?#]+)/i);
  if (match?.[1]) return match[1];
  return value;
};

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
    canUseFeature,
    getEntitlementLimit,
  } = useStorefront();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  
  // Alert modal state
  const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '', items: [] });
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Confirmar',
    tone: 'danger',
    onConfirm: null,
  });
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
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

  const location = useLocation();
  const cleanSeedsRequested = useMemo(() => {
    const params = new URLSearchParams(location.search || '');
    return params.get('clean-seeds') === '1';
  }, [location.search]);
  const seedItems = useMemo(() => (menuItems || []).filter(isSeedItem), [menuItems]);
  const [seedBannerDismissed, setSeedBannerDismissed] = useState(false);
  const [isDeletingSeeds, setIsDeletingSeeds] = useState(false);
  const showSeedBanner =
    cleanSeedsRequested && seedItems.length > 0 && !seedBannerDismissed;

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

  const showValidationAlert = (title, message, items = []) => {
    setAlertModal({ isOpen: true, title, message, items });
  };

  const showConfirmModal = ({ title, message, confirmLabel = 'Confirmar', tone = 'danger', onConfirm }) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      confirmLabel,
      tone,
      onConfirm,
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      title: '',
      message: '',
      confirmLabel: 'Confirmar',
      tone: 'danger',
      onConfirm: null,
    });
  };

  const handleConfirmAction = async () => {
    const action = confirmModal.onConfirm;
    closeConfirmModal();
    if (typeof action === 'function') {
      await action();
    }
  };

  const handleRemoveCategory = async (id) => {
      // Check for associated items
      const associatedItems = menuItems.filter(item => item.category_id === id);
      
      if (associatedItems.length > 0) {
          showValidationAlert(
            'Não é possível remover no momento',
            'Esta categoria possui itens vinculados. Remova-os ou altere a categoria deles antes de excluir.',
            associatedItems
          );
          return;
      }

      showConfirmModal({
        title: 'Excluir categoria',
        message: 'Essa categoria será removida permanentemente. Essa ação não poderá ser desfeita.',
        confirmLabel: 'Excluir categoria',
        onConfirm: async () => {
          await deleteMenuCategory(id);
        },
      });

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
    const existingBanner = banners.find((banner) => extractProductIdFromBannerLink(banner.product_link) === String(item.id));
    setBannerForm({
      banner_image: existingBanner?.banner_image || '',
      enabled: !!existingBanner,
    });
    setIsModalOpen(true);
  };

  const handleSaveItem = async () => {
    const normalizedGroups = groupsForm
      .map((grp) => ({
        ...grp,
        name: (grp.name || '').trim(),
        options: (grp.options || []).map((opt) => ({
          ...opt,
          name: (opt.name || '').trim(),
        })),
      }))
      .filter((grp) => grp.name || grp.options.length > 0 || grp.id);

    const invalidGroup = normalizedGroups.find((grp) => !grp.name);
    if (invalidGroup) {
      showValidationAlert(
        'Grupo de opções incompleto',
        'Todo grupo de opções precisa ter um nome antes de salvar o produto.'
      );
      return;
    }

    const groupWithoutOptions = normalizedGroups.find((grp) => grp.options.length === 0);
    if (groupWithoutOptions) {
      showValidationAlert(
        'Grupo sem opções',
        `O grupo "${groupWithoutOptions.name}" precisa ter pelo menos uma opção antes de salvar o produto.`
      );
      return;
    }

    const optionWithoutName = normalizedGroups.find((grp) => grp.options.some((opt) => !opt.name));
    if (optionWithoutName) {
      showValidationAlert(
        'Opção incompleta',
        `Todas as opções do grupo "${optionWithoutName.name}" precisam ter nome antes de salvar o produto.`
      );
      return;
    }

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
    
    const itemIdFinal = editingItemId || (savedItem && savedItem.id); 

    if (itemIdFinal) {
        // persist option groups and options
        for (const grp of normalizedGroups) {
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
          await saveBanner({
            banner_image: bannerForm.banner_image,
            product_link: buildBannerProductLink(tenant?.slug, itemIdFinal),
            tenant_id: tenant.id
          });
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

  const handleDeleteAllSeeds = () => {
    if (seedItems.length === 0) return;
    showConfirmModal({
      title: 'Apagar itens de exemplo',
      message: `Os ${seedItems.length} itens de exemplo serão removidos. Em seguida, adicione seus próprios pratos.`,
      confirmLabel: 'Apagar exemplos',
      onConfirm: async () => {
        setIsDeletingSeeds(true);
        try {
          for (const seed of seedItems) {
            await deleteMenuItem(seed.id);
          }
        } finally {
          setIsDeletingSeeds(false);
        }
      },
    });
  };

  const handleRemoveItem = async (id) => {
    showConfirmModal({
      title: 'Excluir produto',
      message: 'Esse produto será removido permanentemente do cardápio.',
      confirmLabel: 'Excluir produto',
      onConfirm: async () => {
        await deleteMenuItem(id);
      },
    });
  };

  const handleToggleAvailability = (id) => {
    toggleItemAvailability(id);
  };

  const handleSaveNewBanner = () => {
    if (!newBanner.banner_image) return;
    const selectedProductId = newBanner.product_link ? String(newBanner.product_link) : '';
    saveBanner({
      banner_image: newBanner.banner_image,
      product_link: selectedProductId ? buildBannerProductLink(tenant?.slug, selectedProductId) : '',
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

  const statsCardClass =
    ' overflow-hidden rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.45)]';
  const sectionCardClass =
    'rounded-[30px] border border-slate-200/80 bg-white/95 shadow-[0_28px_70px_-34px_rgba(15,23,42,0.35)] backdrop-blur-sm';
  const subtleButtonClass =
    'border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50';
  const plusTileClass =
    'group flex aspect-[2/1] items-center justify-center rounded-[26px] border border-dashed border-slate-300 bg-slate-100/85 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent)] hover:bg-slate-50 hover:shadow-[0_18px_45px_-28px_rgba(15,23,42,0.4)]';

  return (
    <div className="space-y-6 rounded-[32px] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.96),_rgba(241,245,249,0.92)_44%,_rgba(226,232,240,0.95)_100%)] bg-fixed p-1">
      <div className="rounded-[32px] border border-slate-200/80 bg-white/90 px-6 py-6 shadow-[0_24px_70px_-36px_rgba(15,23,42,0.45)] backdrop-blur-sm" >
        <div className="flex flex-wrap items-center justify-between gap-4" >
          <div data-wizard="menu-start">
            <p className="text-sm font-medium tracking-[0.18em] text-slate-500 uppercase">Curadoria do cardápio</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Categorias de Produtos</h1>
          </div>
          <div className="flex items-center gap-3">
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
            <Button
              variant="ghost"
              className="border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-[var(--accent)] hover:text-[var(--accent)] inline-flex items-center gap-2"
              onClick={() => setShowPreview((v) => !v)}
            >
              <Smartphone className="h-4 w-4" />
              {showPreview ? 'Fechar pré-visualização' : 'Ver como cliente'}
            </Button>
            {/* <Button
              variant="ghost"
              className={`flex items-center gap-2 ${subtleButtonClass}`}
              onClick={handleSync}
              disabled={isSyncing}
            >
              {isSyncing ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-transparent"></div>
                  Sincronizando...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
                  Sincronizar
                </>
              )}
            </Button> */}
            <Button onClick={openNewCategory}>Adicionar Categoria</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4" data-wizard="menu-categories">
        {sortedCategories.map((category, idx) => {
          const activeCount = menuItems.filter((mi) => mi.category_id === category.id && mi.is_available).length;
          return (
            <div key={category.id} className={`${statsCardClass} group`}>
              <div className="pointer-events-none absolute inset-x-5 top-0 h-20 rounded-b-[28px] bg-gradient-to-b from-slate-100 to-transparent" />
              <div className="relative flex justify-between items-start">
                  <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                    {category.name}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditCategory(category)} className="rounded-full border border-transparent p-2 text-slate-600 transition-colors hover:border-sky-200 hover:bg-sky-50 hover:text-sky-600">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                      </button>
                      <button onClick={() => handleRemoveCategory(category.id)} className="rounded-full border border-transparent p-2 text-slate-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      </button>
                  </div>
              </div>
              <div className="relative mt-4 flex gap-2">
                <Button size="sm" variant="ghost" className={subtleButtonClass} disabled={idx===0} onClick={() => {
                  const ids = sortedCategories.map((c) => c.id);
                  if (idx>0) {
                    [ids[idx-1], ids[idx]] = [ids[idx], ids[idx-1]];
                    reorderMenuCategories(ids);
                  }
                }}>↑</Button>
                <Button size="sm" variant="ghost" className={subtleButtonClass} disabled={idx===sortedCategories.length-1} onClick={() => {
                  const ids = sortedCategories.map((c) => c.id);
                  if (idx<sortedCategories.length-1) {
                    [ids[idx+1], ids[idx]] = [ids[idx], ids[idx+1]];
                    reorderMenuCategories(ids);
                  }
                }}>↓</Button>
              </div>
              <p className="relative mt-6 text-3xl font-bold tracking-tight text-slate-950">{activeCount}</p>
              <p className="relative text-sm font-medium text-slate-500">itens ativos</p>
            </div>
          );
        })}
      </div>



      {showSeedBanner && (
        <div className="flex items-start gap-4 rounded-[28px] border border-[color:var(--accent)]/25 bg-[color:var(--accent)]/5 px-5 py-4 shadow-[0_18px_45px_-32px_rgba(15,23,42,0.45)]">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-white shadow-md"
            style={{ background: 'var(--accent)' }}
          >
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900">
              Esses {seedItems.length} itens são apenas exemplos
            </p>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              Apague-os e adicione seus próprios pratos para o cardápio refletir o seu restaurante.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={handleDeleteAllSeeds}
                disabled={isDeletingSeeds}
              >
                {isDeletingSeeds ? 'Apagando...' : `Apagar ${seedItems.length} exemplos`}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className={subtleButtonClass}
                onClick={openNewItem}
              >
                Adicionar item próprio
              </Button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSeedBannerDismissed(true)}
            className="rounded-full p-1.5 text-slate-400 hover:bg-white/70 hover:text-slate-600 transition-colors"
            title="Dispensar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className={`${sectionCardClass} p-6 space-y-5`} data-wizard="menu-overview">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium tracking-[0.16em] text-slate-500 uppercase">Itens ao vivo</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Lista pronta para o cliente</h2>
          </div>
        <div className="flex items-center gap-2">
          {(() => {
            const limit = getEntitlementLimit('max_menu_items');
            const atLimit = limit !== -1 && menuItems.length >= limit;
            return atLimit
              ? <span className="text-xs text-amber-600 font-medium">Limite de {limit} itens atingido — faça upgrade</span>
              : <Button onClick={openNewItem} data-wizard="menu-add-item">Adicionar item</Button>;
          })()}
        </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {itemsSorted.map((item) => (
            <div key={item.id} className="group rounded-[28px] border border-slate-200/80 bg-[linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(248,250,252,0.98))] p-4 shadow-[0_18px_50px_-34px_rgba(15,23,42,0.45)]">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{maps.categoryMap[item.category_id]?.name || '—'}</p>
                  <h3 className="text-lg font-semibold text-slate-950">{item.name}</h3>
                  <p className="line-clamp-3 text-sm leading-relaxed text-slate-600">{item.description}</p>
                  <p className="text-xl font-bold text-[var(--accent)]">{money(item.price)}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-3">
                  <span className={`text-xs px-3 py-1 rounded-full border ${item.is_available ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-100 text-slate-500'}`}>
                  {item.is_available ? 'Ativo' : 'Pausado'}
                  </span>
                  <div className="h-20 w-20 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-inner">
                    <img
                      src={item.photo_url || productImageFallback}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-300"
                    />
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-white/85 p-3 shadow-sm">
                <div className="mt-3 w-full flex flex-wrap gap-2 justify-start">
                  <Button size="sm" variant="ghost" className={`min-w-[120px] ${subtleButtonClass}`} onClick={() => openEditItem(item)}>Editar</Button>
                  <Button size="sm" variant="ghost" className={`min-w-[120px] ${subtleButtonClass}`} onClick={() => handleToggleAvailability(item.id)}>
                    {item.is_available ? 'Ocultar' : 'Ativar'}
                  </Button>
                  <Button size="sm" variant="ghost" className="border border-red-200 bg-white text-red-600 shadow-sm hover:bg-red-50" onClick={() => handleRemoveItem(item.id)}>Remover</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`${sectionCardClass} p-6 space-y-5`} data-wizard="menu-banners">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium tracking-[0.16em] text-slate-500 uppercase">Marketing e Destaques</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Banners do App</h2>
          </div>
          <Button onClick={() => setIsBannerModalOpen(true)}>
            Novo Banner
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {banners.map((banner) => (
            <div key={banner.id} className="group relative overflow-hidden rounded-[26px] border border-slate-200 bg-slate-100 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.4)] aspect-[2/1]">
              <img src={banner.banner_image} alt="Banner" className="w-full h-full object-cover" />
              <div className="pointer-events-none absolute inset-0 bg-slate-950/0 opacity-0 backdrop-blur-none transition-all duration-200 group-hover:bg-slate-950/20 group-hover:opacity-100 group-hover:backdrop-blur-[3px]">
                <div className="absolute bottom-2 right-2 translate-y-2 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={async () => {
                      showConfirmModal({
                        title: 'Excluir banner',
                        message: 'Esse banner deixará de aparecer no app do cliente.',
                        confirmLabel: 'Excluir banner',
                        onConfirm: async () => {
                          await deleteBanner(banner.id);
                        },
                      });
                    }}
                    className="pointer-events-auto px-3 py-1.5 rounded-lg bg-red-600 text-white text-xls font-semibold shadow hover:bg-red-700"
                  >
                    Excluir
                  </button>
                </div>
              </div>
              {banner.product_link && (
                <div className="absolute bottom-2 left-2 right-2">
                   <div className="bg-white/92 backdrop-blur px-3 py-1.5 rounded-xl text-xs font-medium shadow-sm truncate text-slate-700">
                    Ref: {menuItems.find(i => String(i.id) === extractProductIdFromBannerLink(banner.product_link))?.name || 'indisponível'}
                   </div>
                </div>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => setIsBannerModalOpen(true)}
            className={plusTileClass}
          >
            <div className="flex flex-col items-center gap-4 px-6 text-center">
              <div className="grid w-full grid-cols-3 gap-2">
                <div className="h-14 rounded-2xl border border-slate-200 bg-slate-200/90" />
                <div className="h-14 rounded-2xl border border-slate-200 bg-slate-200/80" />
                <div className="h-14 rounded-2xl border border-slate-200 bg-slate-200/70" />
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl font-semibold text-[var(--accent)] shadow-[0_14px_35px_-20px_rgba(15,23,42,0.55)]">+</span>
                <div className="text-left">
                  <p className="text-sm font-semibold text-slate-800">Adicionar novo banner</p>
                  <p className="text-xs text-slate-500">Clique para abrir o cadastro</p>
                </div>
              </div>
            </div>
          </button>
          {banners.length === 0 && (
            <div className="col-span-full py-12 text-center rounded-[26px] border-2 border-dashed border-slate-200 bg-slate-50/70">
              <p className="font-medium text-slate-600">Nenhum banner ativo</p>
              <p className="mt-1 text-sm text-slate-400">Adicione banners para destacar promoções e pratos.</p>
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
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
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
          <div className="h-80 w-80 align-middle overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-inner">
            <img
              src={itemForm.photo_url || productImageFallback}
              className="h-full w-full object-cover transition-transform duration-300"
            />
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
                className={subtleButtonClass}
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
              <div key={gi} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3 shadow-sm">
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
                        showConfirmModal({
                          title: 'Excluir grupo de opções',
                          message: 'Esse grupo e as opções associadas serão removidos do produto.',
                          confirmLabel: 'Excluir grupo',
                          onConfirm: async () => {
                            if (grp.id) {
                              await deleteOptionGroup(grp.id);
                            }
                            const next = [...groupsForm];
                            next.splice(gi, 1);
                            setGroupsForm(next);
                          },
                        });
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
                      className={subtleButtonClass}
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
            placeholder="Ex: Sobremesas..."
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
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
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

      <MobilePreviewWidget
        open={showPreview}
        onClose={() => setShowPreview(false)}
        tenantSlug={tenant?.slug}
      />

      <Modal isOpen={confirmModal.isOpen} onClose={closeConfirmModal} title={confirmModal.title}>
        <div className="space-y-5">
          <div className="rounded-2xl border border-[color:var(--accent)]/15 bg-[color:var(--accent)]/5 px-4 py-4">
            <p className="text-sm leading-6 text-slate-700">{confirmModal.message}</p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" className="border border-slate-200 text-slate-700" onClick={closeConfirmModal}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmAction}
              className={
                confirmModal.tone === 'danger'
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : ''
              }
            >
              {confirmModal.confirmLabel}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Menu;
