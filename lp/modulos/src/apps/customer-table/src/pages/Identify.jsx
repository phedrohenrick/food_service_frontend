import React, { useEffect, useMemo, useState } from 'react';
import api from '../../../../shared/services/api';

const formatPhone = (raw) => {
  const digits = String(raw || '').replace(/\D/g, '').slice(0, 11);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const onlyDigits = (s) => String(s || '').replace(/\D/g, '');

export default function Identify({ slug, tableId, tenant, session }) {
  const [mode, setMode] = useState('new');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [tablesLoading, setTablesLoading] = useState(true);
  const [tableNumber, setTableNumber] = useState(null);

  const phoneDigits = useMemo(() => onlyDigits(phone), [phone]);
  const phoneValid = phoneDigits.length === 0 || phoneDigits.length === 10 || phoneDigits.length === 11;

  useEffect(() => {
    let cancelled = false;
    api
      .get('/tables')
      .then((tables) => {
        if (cancelled) return;
        const match = (tables || []).find((t) => String(t.id) === String(tableId));
        setTableNumber(match?.number ?? null);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setTablesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tableId]);

  const canSubmit = mode === 'new'
    ? name.trim().length >= 2 && phoneValid
    : phoneDigits.length === 10 || phoneDigits.length === 11;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      if (mode === 'new') {
        await session.identify({
          customerName: name.trim(),
          customerPhone: phoneDigits || null,
        });
      } else {
        await session.recoverByPhone(phoneDigits);
      }
    } catch (_) {
      // erro já é tratado no hook (session.error)
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col">
      <div className="mx-auto w-full max-w-md flex-1 flex flex-col px-5 pt-10 pb-8">
        <div className="flex flex-col items-center text-center space-y-3">
          {tenant?.photo_url ? (
            <img
              src={tenant.photo_url}
              alt={tenant.name}
              className="h-16 w-16 rounded-full border border-gray-100 object-cover shadow-sm"
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-gray-100" />
          )}
          <p className="text-xs uppercase tracking-[0.25em] text-gray-400 font-semibold">
            {tenant?.name || 'Restaurante'}
          </p>
          <h1 className="text-3xl font-bold text-gray-900">
            {tablesLoading
              ? 'Bem-vindo!'
              : tableNumber != null
              ? `Mesa ${String(tableNumber).padStart(2, '0')}`
              : 'Bem-vindo!'}
          </h1>
          <p className="text-sm text-gray-500 max-w-xs">
            {mode === 'new'
              ? 'Para começar seu pedido, conte para a gente quem está na mesa.'
              : 'Informe o telefone usado quando abriu a comanda.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {mode === 'new' && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                Seu nome
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: João"
                autoFocus
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
              Telefone {mode === 'new' && <span className="font-normal normal-case text-gray-400">(opcional)</span>}
            </label>
            <input
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              placeholder="(11) 98765-4321"
              autoFocus={mode === 'recover'}
              className={`w-full rounded-2xl border bg-white px-4 py-3.5 text-base focus:outline-none focus:ring-2 ${
                phoneValid
                  ? 'border-gray-200 focus:ring-gray-900 focus:border-transparent'
                  : 'border-red-300 focus:ring-red-500'
              }`}
            />
            {!phoneValid && (
              <p className="text-xs text-red-600 mt-1.5">Telefone inválido. Use 10 ou 11 dígitos.</p>
            )}
            {mode === 'new' && (
              <p className="text-xs text-gray-400 mt-1.5">
                Usamos só para você reabrir a comanda se sair do navegador.
              </p>
            )}
          </div>

          {session.error && (
            <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {session.error}
              <button
                type="button"
                className="ml-2 underline"
                onClick={() => session.setError('')}
              >
                OK
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className="w-full rounded-2xl bg-gray-900 py-4 text-base font-bold text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {submitting
              ? mode === 'new'
                ? 'Abrindo comanda...'
                : 'Buscando...'
              : mode === 'new'
              ? 'Abrir minha comanda'
              : 'Recuperar comanda'}
          </button>

          <button
            type="button"
            onClick={() => {
              session.setError('');
              setMode(mode === 'new' ? 'recover' : 'new');
            }}
            className="w-full text-center text-sm font-semibold text-gray-500 hover:text-gray-900 py-2"
          >
            {mode === 'new'
              ? 'Já tenho uma comanda — recuperar pelo telefone'
              : 'Sou novo aqui — abrir nova comanda'}
          </button>
        </form>
      </div>
    </div>
  );
}
