import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTenant } from '../context/TenantContext';

const ProductEdit = () => {
  const { productId } = useParams();
  const { tenant } = useTenant();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Editar produto</h2>
          <p className="text-sm text-gray-600">ID: {productId}</p>
        </div>
        <Link to="/dashboard/menu" className="text-sm text-[var(--accent)] hover:underline">Voltar ao cardápio</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <h3 className="font-medium">Dados principais</h3>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Nome</label>
                <input className="mt-1 w-full border border-gray-200 rounded-md p-2" placeholder="Cheeseburger" />
              </div>
              <div>
                <label className="text-sm text-gray-600">Categoria</label>
                <input className="mt-1 w-full border border-gray-200 rounded-md p-2" placeholder="Lanches" />
              </div>
              <div>
                <label className="text-sm text-gray-600">Preço (R$)</label>
                <input type="number" step="0.01" className="mt-1 w-full border border-gray-200 rounded-md p-2" placeholder="24.90" />
              </div>
              <div>
                <label className="text-sm text-gray-600">Tempo de preparo (min)</label>
                <input type="number" className="mt-1 w-full border border-gray-200 rounded-md p-2" placeholder="10" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-gray-600">Descrição</label>
                <textarea className="mt-1 w-full border border-gray-200 rounded-md p-2" rows={3} placeholder="Pão, dois hambúrgueres, queijo e molho especial." />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <h3 className="font-medium">Opções e complementos</h3>
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input className="border border-gray-200 rounded-md p-2" placeholder="Nome da opção" />
                <input type="number" step="0.01" className="border border-gray-200 rounded-md p-2" placeholder="Preço adicional" />
                <button className="px-3 py-2 rounded-md bg-white border border-gray-200 text-gray-700 text-sm hover:bg-gray-50">Adicionar</button>
              </div>
              <p className="text-xs text-gray-500">Ex.: Molho extra, Bacon, Queijo cheddar.</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <h3 className="font-medium">Disponibilidade</h3>
            <div className="mt-4 space-y-3">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" className="rounded" defaultChecked />
                Disponível para venda
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" className="rounded" />
                Exibir no app do cliente
              </label>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <h3 className="font-medium">Imagens</h3>
            <div className="mt-4 space-y-3">
              <input className="w-full border border-gray-200 rounded-md p-2" placeholder="URL da imagem" />
              <button className="px-3 py-2 rounded-md bg-[var(--accent)] text-[var(--accent-contrast)] text-sm hover:bg-[var(--accent-hover)]">Enviar</button>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="px-4 py-2 rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200">Cancelar</button>
            <button className="px-4 py-2 rounded-md bg-[var(--accent)] text-[var(--accent-contrast)] hover:bg-[var(--accent-hover)]">Salvar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductEdit;