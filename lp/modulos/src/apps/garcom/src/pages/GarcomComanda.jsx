import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../../shared/services/api';
import useDraftOrder from '../../../../shared/hooks/useDraftOrder';
import { SendButton } from '../../../../shared/components/ui';

const formatCurrency = (n) =>
  (Number(n) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function GarcomComanda({ slug }) {
  const { tabId } = useParams();
  const navigate = useNavigate();

  const [tab, setTab] = useState(null);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [sendingFeedback, setSendingFeedback] = useState('');
  const [view, setView] = useState('tab');

  const draft = useDraftOrder(slug, tab?.tableId, tabId, { scope: 'garcom' });

  const fetchTab = useCallback(async () => {
    try {
      const data = await api.get(`/tabs/${tabId}`);
      setTab(data);
      if (data?.status === 'CLOSED') {
        navigate(data?.tableId ? `/${slug}/garcom/mesa/${data.tableId}` : `/${slug}/garcom`);
      }
    } catch (e) {
      setError('Erro ao carregar comanda');
    }
  }, [tabId, slug, navigate]);

  useEffect(() => {
    const load = async () => {
      try {
        const [tabData, cats, items] = await Promise.all([
          api.get(`/tabs/${tabId}`),
          api.get('/menu-categories'),
          api.get('/menu-items'),
        ]);
        setTab(tabData);
        if (tabData?.status === 'CLOSED') {
          navigate(tabData?.tableId ? `/${slug}/garcom/mesa/${tabData.tableId}` : `/${slug}/garcom`);
          return;
        }
        setCategories(cats || []);
        setMenuItems((items || []).filter((i) => i.isAvailable !== false));
        if (cats && cats.length > 0) setActiveCategory(cats[0].id);
      } catch (e) {
        setError('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [tabId, slug, navigate]);

  const openItemModal = (item) => {
    setSelectedItem(item);
    setSelectedOptions({});
    setQuantity(1);
    setNotes('');
  };

  const closeItemModal = () => {
    setSelectedItem(null);
    setSelectedOptions({});
    setQuantity(1);
    setNotes('');
  };

  const toggleOption = (groupId, optionId, isMultiple) => {
    setSelectedOptions((prev) => {
      if (isMultiple) {
        const current = prev[groupId] || [];
        const exists = current.includes(optionId);
        return { ...prev, [groupId]: exists ? current.filter((id) => id !== optionId) : [...current, optionId] };
      } else {
        return { ...prev, [groupId]: [optionId] };
      }
    });
  };

  const handleAddItem = () => {
    if (!selectedItem) return;
    setAdding(true);
    setError('');
    const groups = selectedItem.optionGroups || [];
    const selectedOptionEntries = [];
    Object.values(selectedOptions)
      .flat()
      .forEach((optId) => {
        for (const g of groups) {
          const opt = (g.options || []).find((o) => o.id === optId);
          if (opt) {
            selectedOptionEntries.push({
              optionId: opt.id,
              optionNameSnapshot: opt.name,
              additionalCharge: Number(
                opt.additionalPrice ?? opt.additional_charge ?? 0
              ),
            });
            break;
          }
        }
      });
    draft.addDraft({
      menuItemId: selectedItem.id,
      menuItemName: selectedItem.name,
      menuItemPhotoUrl: selectedItem.photoUrl || selectedItem.photo_url || null,
      quantity,
      notes: notes || '',
      unitPrice: Number(selectedItem.price || 0),
      options: selectedOptionEntries,
    });
    closeItemModal();
    setView('tab');
    setAdding(false);
  };

  const handleSendDraft = async () => {
    if (draft.sending || draft.drafts.length === 0) return;
    const result = await draft.sendAll();
    if (result.sent > 0) {
      setSendingFeedback('Pedido enviado para a cozinha!');
      setTimeout(() => setSendingFeedback(''), 2500);
      await fetchTab();
    }
  };

  const filteredItems = activeCategory
    ? menuItems.filter((i) => i.categoryId?.id === activeCategory)
    : menuItems;

  const groupsForItem = selectedItem?.optionGroups || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-700 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate(tab?.tableId ? `/${slug}/garcom/mesa/${tab.tableId}` : `/${slug}/garcom`)}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Voltar
        </button>
        <div className="text-center flex-1 min-w-0 px-2">
          <p className="text-sm font-bold text-gray-900 truncate">
            Mesa {tab?.tableNumber}
            {tab?.customerName ? ` · ${tab.customerName}` : ''}
          </p>
          <p className="text-xs text-gray-500">{formatCurrency(tab?.total)}</p>
        </div>
        <div className="w-16 shrink-0" />
      </div>

      {error && (
        <div className="mx-4 mt-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
          <button className="ml-2 underline" onClick={() => setError('')}>Ok</button>
        </div>
      )}

      {/* Tab switch */}
      <div className="px-4 pt-4">
        <div className="flex rounded-xl bg-gray-100 p-1">
          <button
            onClick={() => setView('tab')}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
              view === 'tab' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
            }`}
          >
            Comanda ({draft.drafts.length + (tab?.orders || []).filter((o) => o.status !== 'CANCELED').length})
          </button>
          <button
            onClick={() => setView('menu')}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
              view === 'menu' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
            }`}
          >
            Cardápio
          </button>
        </div>
      </div>

      {/* Comanda view */}
      {view === 'tab' && (
        <div className="px-4 py-4 space-y-4">
          {(() => {
            const orders = (tab?.orders || []).filter((o) => o.status !== 'CANCELED');
            const hasDraft = draft.drafts.length > 0;
            if (orders.length === 0 && !hasDraft) {
              return (
                <div className="flex flex-col items-center justify-center h-48 text-center space-y-2">
                  <svg className="w-10 h-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-gray-400 font-medium text-sm">Comanda vazia</p>
                  <button
                    onClick={() => setView('menu')}
                    className="text-sm font-semibold text-gray-700 underline"
                  >
                    Adicionar itens
                  </button>
                </div>
              );
            }
            return (
              <>
                {hasDraft && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Pedindo agora</h2>
                        <p className="text-[11px] text-gray-500 mt-0.5">Revise e envie para a cozinha.</p>
                      </div>
                      <span className="rounded-full bg-amber-100 text-amber-800 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide">
                        Não enviado
                      </span>
                    </div>

                    <ul className="space-y-2">
                      {draft.drafts.map((item) => {
                        const optionsTotal = (item.options || []).reduce(
                          (s, o) => s + Number(o.additionalCharge || 0),
                          0
                        );
                        const lineTotal = (Number(item.unitPrice) + optionsTotal) * item.quantity;
                        return (
                          <li key={item.draftId} className="flex items-start gap-3 rounded-2xl bg-white p-3 shadow-sm border border-amber-100">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900">{item.quantity}× {item.menuItemName}</p>
                              {item.options && item.options.length > 0 && (
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {item.options.map((o) => o.optionNameSnapshot).join(', ')}
                                </p>
                              )}
                              {item.notes && <p className="text-xs text-gray-400 italic mt-0.5">"{item.notes}"</p>}
                              <p className="text-sm font-bold text-gray-900 mt-1">{formatCurrency(lineTotal)}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => draft.removeDraft(item.draftId)}
                              disabled={draft.sending}
                              className="shrink-0 w-8 h-8 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 disabled:opacity-40 transition-colors"
                              title="Remover do pedido"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </li>
                        );
                      })}
                    </ul>

                    {draft.sendError && (
                      <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
                        {draft.sendError}
                        <button className="underline ml-3" onClick={() => draft.setSendError('')}>OK</button>
                      </div>
                    )}

                    <SendButton
                      onClick={handleSendDraft}
                      loading={draft.sending}
                      loadingLabel="Enviando para a cozinha..."
                      className="py-3.5 text-sm"
                    >
                      Enviar para a cozinha · {formatCurrency(draft.totalDraft)}
                    </SendButton>
                  </div>
                )}

                {orders.length > 0 && (
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Já enviado</h2>
                        <p className="text-[11px] text-gray-500 mt-0.5">Pedidos na cozinha.</p>
                      </div>
                      <span className="rounded-full bg-green-100 text-green-800 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide">
                        {orders.length} pedido{orders.length === 1 ? '' : 's'}
                      </span>
                    </div>

                    {orders.map((order) => {
                      const items = order.orderItem || [];
                      return (
                        <div key={order.id} className="rounded-2xl bg-white shadow-sm overflow-hidden">
                          <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between gap-3">
                            <p className="text-xs text-gray-500">
                              Pedido #{order.id} ·{' '}
                              {order.createdAt
                                ? new Date(order.createdAt).toLocaleTimeString('pt-BR', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : ''}
                            </p>
                            <span className="text-[10px] font-bold uppercase tracking-wide text-gray-600">
                              {order.status}
                            </span>
                          </div>
                          <ul className="divide-y divide-gray-100">
                            {items.map((item) => {
                              const optionsTotal = (item.options || []).reduce(
                                (s, o) => s + Number(o.additionalCharge || 0),
                                0
                              );
                              const lineTotal =
                                (Number(item.unitPrice) + optionsTotal) * item.quantity;
                              return (
                                <li key={item.id} className="px-4 py-2.5">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-semibold text-gray-900">
                                        {item.quantity}× {item.itemNameSnapshot}
                                      </p>
                                      {item.options && item.options.length > 0 && (
                                        <p className="text-xs text-gray-500 mt-0.5">
                                          {item.options.map((o) => o.optionNameSnapshot).join(', ')}
                                        </p>
                                      )}
                                      {item.notes && (
                                        <p className="text-xs text-gray-400 italic mt-0.5">{item.notes}</p>
                                      )}
                                    </div>
                                    <p className="text-sm font-bold text-gray-900 shrink-0">
                                      {formatCurrency(lineTotal)}
                                    </p>
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      );
                    })}

                    <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
                      <span className="font-semibold text-gray-900">Total</span>
                      <span className="text-xl font-bold text-gray-900">
                        {formatCurrency(tab.total)}
                      </span>
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}

      {sendingFeedback && (
        <div className="fixed inset-x-4 bottom-6 z-50 flex justify-center pointer-events-none">
          <div className="rounded-2xl bg-green-600 text-white px-5 py-3 shadow-2xl text-sm font-semibold">
            {sendingFeedback}
          </div>
        </div>
      )}

      {/* Menu view */}
      {view === 'menu' && (
        <div className="pb-4">
          {/* Category pills */}
          <div className="px-4 pt-4 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-gray-900 text-white'
                    : 'bg-white border border-gray-200 text-gray-700'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="px-4 space-y-3">
            {filteredItems.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-8">Nenhum item nesta categoria</p>
            ) : (
              filteredItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => openItemModal(item)}
                  className="w-full flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm text-left active:scale-[0.98] transition-transform"
                >
                  {item.photoUrl ? (
                    <img
                      src={item.photoUrl}
                      alt={item.name}
                      className="w-14 h-14 rounded-xl object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                      <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                    {item.description && (
                      <p className="text-xs text-gray-500 truncate mt-0.5">{item.description}</p>
                    )}
                    <p className="text-sm font-bold text-gray-900 mt-1">{formatCurrency(item.price)}</p>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-gray-900 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Add item modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
          onClick={closeItemModal}
        >
          <div
            className="w-full max-w-lg bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedItem.photoUrl && (
              <img
                src={selectedItem.photoUrl}
                alt={selectedItem.name}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-5 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selectedItem.name}</h3>
                {selectedItem.description && (
                  <p className="text-sm text-gray-500 mt-1">{selectedItem.description}</p>
                )}
                <p className="text-base font-bold text-gray-900 mt-1">{formatCurrency(selectedItem.price)}</p>
              </div>

              {/* Option groups */}
              {groupsForItem.map((group) => (
                <div key={group.id} className="space-y-2">
                  <p className="text-sm font-semibold text-gray-900">{group.name}</p>
                  {(group.options || []).map((opt) => {
                    const selected = (selectedOptions[group.id] || []).includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        onClick={() => toggleOption(group.id, opt.id, (group.maxOptions || 1) > 1)}
                        className={`w-full flex items-center justify-between rounded-xl border px-4 py-3 text-sm transition-colors ${
                          selected
                            ? 'border-gray-900 bg-gray-50'
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        <span className="font-medium text-gray-900">{opt.name}</span>
                        <span className="flex items-center gap-3">
                          {opt.additionalPrice > 0 && (
                            <span className="text-gray-500">+ {formatCurrency(opt.additionalPrice)}</span>
                          )}
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selected ? 'border-gray-900 bg-gray-900' : 'border-gray-300'
                          }`}>
                            {selected && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))}

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observação (opcional)</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: sem cebola, bem passado..."
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                />
              </div>

              {/* Quantity */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Quantidade</span>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="text-lg font-bold w-5 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddItem}
                disabled={adding}
                className="w-full rounded-2xl bg-gray-900 py-4 text-sm font-bold text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                {adding ? 'Adicionando...' : `Adicionar ao pedido • ${formatCurrency(selectedItem.price * quantity)}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
