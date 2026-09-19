import React from 'react';
import { Phone } from 'lucide-react';
import { Button, Input } from '../../../../shared/components/ui';
import api from '../../../../shared/services/api';
import { formatPhoneBR, isValidPhone, digitsOnly } from '../../../../shared/utils/customerPhone';

/**
 * Pede o telefone do cliente. Aparece sozinho no primeiro login (dismissible)
 * e é reusado como bloqueio obrigatório antes de finalizar o pedido (required,
 * quando `dismissible` é false).
 */
export default function PhoneCaptureModal({ open, dismissible = false, onClose, onSaved }) {
  const [value, setValue] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');

  if (!open) return null;

  const handleSave = async () => {
    if (!isValidPhone(value)) {
      setError('Digite um telefone válido com DDD, ex: (11) 91234-5678.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await api.patch('/users/me', { phone: digitsOnly(value) });
      onSaved?.();
    } catch (_) {
      setError('Não foi possível salvar agora. Tente de novo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)]">
          <Phone className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Qual é o seu telefone?</h2>

        <div className="mt-4">
          <Input
            label="Telefone com DDD"
            type="tel"
            placeholder="(11) 91234-5678"
            value={value}
            onChange={(e) => {
              setValue(formatPhoneBR(e.target.value));
              if (error) setError('');
            }}
            error={error}
          />
        </div>
        <div className="mt-5 flex flex-col gap-2">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando…' : 'Salvar telefone'}
          </Button>
          {dismissible && (
            <button
              type="button"
              onClick={onClose}
              className="py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              Agora não, quero ver o cardápio
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
