import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';

const storageKey = (scope, slug, tableId, tabId) =>
  `${scope}-draft:${slug}:${tableId}:${tabId}`;

const readDrafts = (scope, slug, tableId, tabId) => {
  if (!tabId) return [];
  try {
    const raw = localStorage.getItem(storageKey(scope, slug, tableId, tabId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
};

const writeDrafts = (scope, slug, tableId, tabId, drafts) => {
  if (!tabId) return;
  try {
    localStorage.setItem(
      storageKey(scope, slug, tableId, tabId),
      JSON.stringify(drafts)
    );
  } catch (_) {}
};

const dropKey = (scope, slug, tableId, tabId) => {
  if (!tabId) return;
  try {
    localStorage.removeItem(storageKey(scope, slug, tableId, tabId));
  } catch (_) {}
};

const draftId = () => `d-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export default function useDraftOrder(slug, tableId, tabId, options = {}) {
  const scope = options.scope || 'mesa';
  const [drafts, setDrafts] = useState(() => readDrafts(scope, slug, tableId, tabId));
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');

  useEffect(() => {
    setDrafts(readDrafts(scope, slug, tableId, tabId));
  }, [scope, slug, tableId, tabId]);

  const persist = useCallback(
    (next) => {
      writeDrafts(scope, slug, tableId, tabId, next);
      setDrafts(next);
    },
    [scope, slug, tableId, tabId]
  );

  const addDraft = useCallback(
    (item) => {
      const draft = {
        draftId: draftId(),
        menuItemId: item.menuItemId,
        menuItemName: item.menuItemName,
        menuItemPhotoUrl: item.menuItemPhotoUrl || null,
        quantity: item.quantity || 1,
        notes: item.notes || '',
        unitPrice: Number(item.unitPrice) || 0,
        options: Array.isArray(item.options) ? item.options : [],
      };
      persist([...drafts, draft]);
      return draft;
    },
    [drafts, persist]
  );

  const removeDraft = useCallback(
    (draftIdToRemove) => {
      persist(drafts.filter((d) => d.draftId !== draftIdToRemove));
    },
    [drafts, persist]
  );

  const clearDrafts = useCallback(() => {
    dropKey(scope, slug, tableId, tabId);
    setDrafts([]);
  }, [scope, slug, tableId, tabId]);

  const sendAll = useCallback(async () => {
    if (!tabId || drafts.length === 0) return { sent: 0, failed: 0 };
    setSending(true);
    setSendError('');
    try {
      await api.post(`/tabs/${tabId}/orders`, {
        items: drafts.map((d) => ({
          menuItemId: d.menuItemId,
          quantity: d.quantity,
          notes: d.notes || null,
          optionIds: (d.options || []).map((o) => o.optionId).filter(Boolean),
        })),
      });
      const totalSent = drafts.length;
      clearDrafts();
      setSending(false);
      return { sent: totalSent, failed: 0 };
    } catch (e) {
      setSendError('Não foi possível enviar o pedido. Tente novamente.');
      setSending(false);
      return { sent: 0, failed: drafts.length };
    }
  }, [tabId, drafts, clearDrafts]);

  const totalDraft = drafts.reduce((sum, d) => {
    const optionsTotal = (d.options || []).reduce(
      (s, o) => s + Number(o.additionalCharge || 0),
      0
    );
    return sum + (Number(d.unitPrice) + optionsTotal) * d.quantity;
  }, 0);

  const itemCount = drafts.reduce((sum, d) => sum + (d.quantity || 0), 0);

  return {
    drafts,
    itemCount,
    totalDraft,
    addDraft,
    removeDraft,
    clearDrafts,
    sendAll,
    sending,
    sendError,
    setSendError,
  };
}
