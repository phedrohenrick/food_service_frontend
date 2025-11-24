import React from 'react';
import { useTenant } from '../context/TenantContext';

const Settings = () => {
  const { tenant } = useTenant();

  return (
    <div>
      <h2 className="text-xl font-semibold">Configurações</h2>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <h3 className="font-medium">Informações do restaurante</h3>
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-sm text-gray-600">Nome</label>
              <input className="mt-1 w-full border border-gray-200 rounded-md p-2" defaultValue={tenant.name} />
            </div>
            <div>
              <label className="text-sm text-gray-600">Slug</label>
              <input className="mt-1 w-full border border-gray-200 rounded-md p-2" defaultValue={tenant.slug} />
            </div>
            <div>
              <label className="text-sm text-gray-600">Aberto</label>
              <select className="mt-1 w-full border border-gray-200 rounded-md p-2" defaultValue={tenant.isOpen ? '1' : '0'}>
                <option value="1">Sim</option>
                <option value="0">Não</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <h3 className="font-medium">Cores</h3>
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-sm text-gray-600">Cor principal</label>
              <input className="mt-1 w-full border border-gray-200 rounded-md p-2" defaultValue={tenant.mainColor} />
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-md" style={{ background: 'var(--accent)' }} />
              <span className="text-sm text-gray-600">Prévia do accent</span>
            </div>
            <button className="px-3 py-1.5 rounded-md bg-[var(--accent)] text-[var(--accent-contrast)] text-sm hover:bg-[var(--accent-hover)]">Salvar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;