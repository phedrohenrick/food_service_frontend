import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../../../shared/components/ui';
import { useStorefront } from '../context/StorefrontContext';

const defaultForm = {
  id: '',
  label: '',
  street: '',
  streetNumber: '',
  neighborhood: '',
  city: '',
  state: 'SP',
  zipCode: '',
  complement: '',
  isDefault: false,
};

const AddressForm = () => {
  const navigate = useNavigate();
  const { addressId } = useParams();
  const { user, saveAddress, setCartAddress } = useStorefront();
  const [formData, setFormData] = useState(defaultForm);

  useEffect(() => {
    if (!addressId) {
      setFormData(defaultForm);
      return;
    }
    const current = user.addresses.find((address) => address.id === addressId);
    if (current) {
      setFormData(current);
    }
  }, [addressId, user.addresses]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const newId = saveAddress(formData);
    setCartAddress(newId);
    navigate('/app/enderecos');
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Endereço</p>
        <h1 className="text-3xl font-semibold text-gray-900">
          {addressId ? 'Editar endereço' : 'Cadastrar novo endereço'}
        </h1>
        <p className="text-sm text-gray-500">
          Essas informações serão usadas para calcular taxas e estimar o tempo de entrega.
        </p>
      </div>

      <form
        className="space-y-6 rounded-3xl bg-white p-8 shadow"
        onSubmit={handleSubmit}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-gray-700">
            Identificação
            <input
              type="text"
              name="label"
              value={formData.label}
              onChange={handleChange}
              placeholder="Casa, trabalho..."
              className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
              required
            />
          </label>
          <label className="text-sm font-medium text-gray-700">
            CEP
            <input
              type="text"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              placeholder="00000-000"
              className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
              required
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
          <label className="text-sm font-medium text-gray-700">
            Rua
            <input
              type="text"
              name="street"
              value={formData.street}
              onChange={handleChange}
              className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
              required
            />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Número
            <input
              type="text"
              name="streetNumber"
              value={formData.streetNumber}
              onChange={handleChange}
              className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
              required
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-gray-700">
            Bairro
            <input
              type="text"
              name="neighborhood"
              value={formData.neighborhood}
              onChange={handleChange}
              className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
              required
            />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Complemento
            <input
              type="text"
              name="complement"
              value={formData.complement}
              onChange={handleChange}
              className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
              placeholder="Bloco, apto..."
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-gray-700">
            Cidade
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
              required
            />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Estado
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 uppercase focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
              maxLength={2}
              required
            />
          </label>
        </div>

        <label className="flex items-center gap-3 text-sm text-gray-700">
          <input
            type="checkbox"
            name="isDefault"
            checked={formData.isDefault}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300 text-[var(--accent-contrast)] focus:ring-[var(--accent)]"
          />
          Definir como endereço principal
        </label>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="submit" className="flex-1">
            {addressId ? 'Atualizar' : 'Salvar endereço'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="flex-1 text-[var(--accent)]"
            onClick={() => navigate('/app/enderecos')}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddressForm;
