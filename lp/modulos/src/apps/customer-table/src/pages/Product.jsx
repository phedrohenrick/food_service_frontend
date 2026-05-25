import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useStorefront } from '../../../../shared/generalContext.jsx';
import useDraftOrder from '../../../../shared/hooks/useDraftOrder';

export default function Product({ slug, tableId, session }) {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { maps, menuItems, getOptionGroupsForItem, getOptionsForGroup } = useStorefront();

  const base = `/${slug}/mesa/${tableId}`;
  const tabId = session?.session?.tabId;
  const draft = useDraftOrder(slug, tableId, tabId);

  const product = useMemo(
    () =>
      maps?.menuItemMap?.[productId] ||
      menuItems.find((mi) => String(mi.id) === String(productId)),
    [productId, maps?.menuItemMap, menuItems]
  );

  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [feedback, setFeedback] = useState('');

  const optionGroups = useMemo(() => {
    if (!product) return [];

    const fromNested = () => {
      if (!product.optionGroups || product.optionGroups.length === 0) return [];
      const groups = product.optionGroups.map((g) => {
        const rawOptions = Array.isArray(g.options) ? g.options : [];
        const filtered = rawOptions.filter(
          (o) => o.active === undefined || o.active === null || o.active === true
        );
        return {
          ...g,
          required: g.required ?? g.isRequired ?? g.is_required ?? false,
          minOptions: g.minOptions ?? g.min ?? 0,
          maxOptions: (g.maxOptions ?? g.max ?? filtered.length) || 0,
          options: filtered.map((o) => ({
            ...o,
            additionalPrice:
              o.additionalPrice !== undefined ? o.additionalPrice : o.additional_charge || 0,
          })),
        };
      });
      return groups.filter((g) => Array.isArray(g.options) && g.options.length > 0);
    };

    const fromContext = () => {
      const ctxGroups = getOptionGroupsForItem(product.id);
      return ctxGroups
        .map((g) => ({
          ...g,
          required: g.is_required,
          minOptions: g.min,
          maxOptions: g.max,
          options: getOptionsForGroup(g.id).map((o) => ({
            ...o,
            additionalPrice: o.additional_charge,
          })),
        }))
        .filter((g) => Array.isArray(g.options) && g.options.length > 0);
    };

    const nested = fromNested();
    return nested.length > 0 ? nested : fromContext();
  }, [product, getOptionGroupsForItem, getOptionsForGroup]);

  const totalPrice = useMemo(() => {
    if (!product) return 0;
    let total = product.price;
    Object.values(selectedOptions)
      .flat()
      .forEach((optId) => {
        for (const group of optionGroups) {
          const option = group.options?.find((o) => o.id === optId);
          if (option) {
            total += option.additionalPrice || 0;
            break;
          }
        }
      });
    return total * quantity;
  }, [product, selectedOptions, quantity, optionGroups]);

  const toggleOption = (groupId, optionId, maxOptions) => {
    setSelectedOptions((prev) => {
      const current = prev[groupId] || [];
      const isSelected = current.includes(optionId);
      const max = maxOptions && maxOptions > 0 ? maxOptions : Infinity;
      if (max === 1) {
        return { ...prev, [groupId]: isSelected ? [] : [optionId] };
      }
      if (isSelected) return { ...prev, [groupId]: current.filter((id) => id !== optionId) };
      if (current.length >= max) return prev;
      return { ...prev, [groupId]: [...current, optionId] };
    });
  };

  const validate = () => {
    for (const group of optionGroups) {
      if (group.required) {
        const count = (selectedOptions[group.id] || []).length;
        if (count < (group.minOptions || 1)) {
          setValidationError(
            `Selecione pelo menos ${group.minOptions || 1} opção(ões) em "${group.name}".`
          );
          return false;
        }
      }
    }
    return true;
  };

  const handleAdd = () => {
    if (!tabId || submitting || !validate()) return;
    setSubmitting(true);
    const selectedOptionEntries = [];
    Object.values(selectedOptions)
      .flat()
      .forEach((optId) => {
        for (const group of optionGroups) {
          const option = group.options?.find((o) => o.id === optId);
          if (option) {
            selectedOptionEntries.push({
              optionId: option.id,
              optionNameSnapshot: option.name,
              additionalCharge: Number(option.additionalPrice || 0),
            });
            break;
          }
        }
      });
    draft.addDraft({
      menuItemId: product.id,
      menuItemName: product.name,
      menuItemPhotoUrl: product.photo_url || product.photoUrl || null,
      quantity,
      notes: notes || '',
      unitPrice: Number(product.price || 0),
      options: selectedOptionEntries,
    });
    setFeedback(`${quantity}× ${product.name} adicionado ao pedido`);
    setTimeout(() => navigate(`${base}/comanda`), 600);
  };

  if (!product) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm space-y-3">
        <p className="text-4xl">🔍</p>
        <h2 className="text-lg font-bold text-gray-900">Produto não encontrado</h2>
        <Link to={base} className="inline-block text-sm font-semibold text-gray-700 underline">
          Voltar ao cardápio
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Link
        to={base}
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Cardápio
      </Link>

      {product.photo_url && (
        <div className="overflow-hidden rounded-2xl">
          <img src={product.photo_url} alt={product.name} className="h-60 w-full object-cover" />
        </div>
      )}

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
        {product.description && (
          <p className="text-sm text-gray-600">{product.description}</p>
        )}
        <p className="text-xl font-bold text-gray-900">R$ {(product.price ?? 0).toFixed(2)}</p>
      </div>

      {optionGroups.map((group) => (
        <div key={group.id} className="rounded-2xl border border-gray-100 bg-white p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">{group.name}</h3>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {group.minOptions > 0 ? `Mínimo: ${group.minOptions}` : ''}
                {group.maxOptions ? ` · Máximo: ${group.maxOptions}` : ''}
              </p>
            </div>
            {group.required && (
              <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded uppercase">
                Obrigatório
              </span>
            )}
          </div>
          <div className="space-y-2">
            {group.options?.map((opt) => {
              const isSelected = (selectedOptions[group.id] || []).includes(opt.id);
              return (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => toggleOption(group.id, opt.id, group.maxOptions)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-sm transition-colors ${
                    isSelected
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-100 bg-white hover:bg-gray-50'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-gray-900' : 'border-gray-300'
                      }`}
                    >
                      {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-gray-900" />}
                    </span>
                    <span className="text-gray-900 font-medium">{opt.name}</span>
                  </span>
                  {opt.additionalPrice > 0 && (
                    <span className="text-gray-600 font-semibold">
                      + R$ {opt.additionalPrice.toFixed(2)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="rounded-2xl border border-gray-100 bg-white p-4 space-y-2">
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
          Observações
        </label>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ex: sem cebola, ponto bem passado..."
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
        />
      </div>

      {validationError && (
        <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
          {validationError}
          <button className="underline ml-3" onClick={() => setValidationError('')}>
            OK
          </button>
        </div>
      )}

      {feedback && (
        <div className="fixed inset-x-4 bottom-24 z-50 flex justify-center pointer-events-none">
          <div className="rounded-2xl bg-green-600 text-white px-5 py-3 shadow-2xl text-sm font-semibold">
            {feedback}
          </div>
        </div>
      )}

      <div className="sticky bottom-20 -mx-4 px-4 py-3 bg-gradient-to-t from-gray-50 to-transparent">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 rounded-full bg-white border border-gray-200 px-3 py-2 shrink-0">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-7 h-7 flex items-center justify-center text-gray-700 hover:text-gray-900"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
              </svg>
            </button>
            <span className="text-base font-bold w-5 text-center">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="w-7 h-7 flex items-center justify-center text-gray-700 hover:text-gray-900"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={submitting}
            className="flex-1 rounded-2xl bg-gray-900 py-3.5 text-sm font-bold text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Adicionando...' : `Adicionar ao pedido · R$ ${totalPrice.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
