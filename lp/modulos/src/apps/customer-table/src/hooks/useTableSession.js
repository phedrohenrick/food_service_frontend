import { useCallback, useEffect, useState } from 'react';
import api from '../../../../shared/services/api';

const storageKey = (slug, tableId) => `mesa-tab:${slug}:${tableId}`;

const readSession = (slug, tableId) => {
  try {
    const raw = localStorage.getItem(storageKey(slug, tableId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.tabId) return null;
    return parsed;
  } catch (_) {
    return null;
  }
};

const writeSession = (slug, tableId, data) => {
  try {
    localStorage.setItem(storageKey(slug, tableId), JSON.stringify(data));
  } catch (_) {}
};

const clearSession = (slug, tableId) => {
  try {
    localStorage.removeItem(storageKey(slug, tableId));
  } catch (_) {}
};

export default function useTableSession(slug, tableId) {
  const [session, setSession] = useState(() => readSession(slug, tableId));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setSession(readSession(slug, tableId));
  }, [slug, tableId]);

  const identify = useCallback(
    async ({ customerName, customerPhone }) => {
      setLoading(true);
      setError('');
      try {
        const tab = await api.post(`/tabs/open/${tableId}`, {
          customerName: customerName || null,
          customerPhone: customerPhone || null,
        });
        if (!tab?.id) throw new Error('Resposta inválida');
        const next = {
          tabId: tab.id,
          customerName: tab.customerName || customerName || '',
          customerPhone: tab.customerPhone || customerPhone || '',
          tableNumber: tab.tableNumber,
          openedAt: tab.openedAt,
        };
        writeSession(slug, tableId, next);
        setSession(next);
        return next;
      } catch (e) {
        setError('Não foi possível abrir a comanda. Tente novamente.');
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [slug, tableId]
  );

  const recoverByPhone = useCallback(
    async (phone) => {
      const trimmed = String(phone || '').trim();
      if (!trimmed) return null;
      setLoading(true);
      setError('');
      try {
        const tabs = await api.get('/tabs/by-phone', { phone: trimmed });
        const match = (tabs || []).find(
          (t) => String(t.tableId) === String(tableId)
        );
        if (!match) {
          setError('Nenhuma comanda aberta encontrada para este telefone nesta mesa.');
          return null;
        }
        const next = {
          tabId: match.id,
          customerName: match.customerName || '',
          customerPhone: match.customerPhone || trimmed,
          tableNumber: match.tableNumber,
          openedAt: match.openedAt,
        };
        writeSession(slug, tableId, next);
        setSession(next);
        return next;
      } catch (e) {
        setError('Erro ao buscar comanda. Tente novamente.');
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [slug, tableId]
  );

  const refreshTab = useCallback(async () => {
    if (!session?.tabId) return null;
    try {
      const tab = await api.get(`/tabs/${session.tabId}`);
      if (!tab) {
        clearSession(slug, tableId);
        setSession(null);
        return null;
      }
      if (tab.status === 'CLOSED') {
        clearSession(slug, tableId);
        setSession(null);
        return tab;
      }
      return tab;
    } catch (e) {
      return null;
    }
  }, [session?.tabId, slug, tableId]);

  const reset = useCallback(() => {
    clearSession(slug, tableId);
    setSession(null);
  }, [slug, tableId]);

  return {
    session,
    loading,
    error,
    setError,
    identify,
    recoverByPhone,
    refreshTab,
    reset,
  };
}
