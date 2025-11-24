import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTenant } from '../context/TenantContext';

const OrderEdit = () => {
  const { orderId } = useParams();
  const { tenant } = useTenant();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Editar pedido</h2>
          <p className="text-sm text-gray-600">Pedido #{orderId}</p>
        </div>
        <Link to="/dashboard/orders" className="text-sm text-[var(--accent)] hover:underline">Voltar aos pedidos</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <h3 className="font-medium">Status e pagamento</h3>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-600">Status</label>
                <select className="mt-1 w-full border border-gray-200 rounded-md p-2">
                  <option>recebido</option>
                  <option>preparando</option>
                  <option>pronto</option>
                  <option>entregando</option>
                  <option>concluído</option>
                  <option>cancelado</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600">Pagamento</label>
                <select className="mt-1 w-full border border-gray-200 rounded-md p-2">
                  <option>pendente</option>
                  <option>pago</option>
                  <option>estornado</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600">Canal</label>
                <select className="mt-1 w-full border border-gray-200 rounded-md p-2">
                  <option>local</option>
                  <option>delivery</option>
                  <option>retirada</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <h3 className="font-medium">Itens do pedido</h3>
            <div className="mt-4 space-y-4">
              {/* Item editor */}
              <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                <input className="md:col-span-3 border border-gray-200 rounded-md p-2" placeholder="Produto" defaultValue="Cheeseburger" />
                <input type="number" className="md:col-span-1 border border-gray-200 rounded-md p-2" placeholder="Qtd" defaultValue={2} />
                <input type="number" step="0.01" className="md:col-span-1 border border-gray-200 rounded-md p-2" placeholder="Preço" defaultValue={24.9} />
                <button className="md:col-span-1 px-3 py-2 rounded-md bg-white border border-gray-200 text-gray-700 text-sm hover:bg-gray-50">Remover</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                <input className="md:col-span-3 border border-gray-200 rounded-md p-2" placeholder="Produto" defaultValue="Fritas" />
                <input type="number" className="md:col-span-1 border border-gray-200 rounded-md p-2" placeholder="Qtd" defaultValue={1} />
                <input type="number" step="0.01" className="md:col-span-1 border border-gray-200 rounded-md p-2" placeholder="Preço" defaultValue={9.9} />
                <button className="md:col-span-1 px-3 py-2 rounded-md bg-white border border-gray-200 text-gray-700 text-sm hover:bg-gray-50">Remover</button>
              </div>
              <div className="flex gap-3">
                <input className="flex-1 border border-gray-200 rounded-md p-2" placeholder="Novo produto" />
                <input type="number" className="w-24 border border-gray-200 rounded-md p-2" placeholder="Qtd" />
                <input type="number" step="0.01" className="w-28 border border-gray-200 rounded-md p-2" placeholder="Preço" />
                <button className="px-3 py-2 rounded-md bg-white border border-gray-200 text-gray-700 text-sm hover:bg-gray-50">Adicionar</button>
              </div>
              <p className="text-xs text-gray-500">Inclua itens, ajuste quantidades e preços conforme necessário.</p>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <h3 className="font-medium">Observações</h3>
            <textarea className="mt-4 w-full border border-gray-200 rounded-md p-2" rows={3} placeholder="Sem tomate, ponto da carne bem passado." />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <h3 className="font-medium">Cliente</h3>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <input className="border border-gray-200 rounded-md p-2" placeholder="Nome" defaultValue="Ana Souza" />
              <input className="border border-gray-200 rounded-md p-2" placeholder="Telefone" defaultValue="(11) 90000-0000" />
              <input className="md:col-span-2 border border-gray-200 rounded-md p-2" placeholder="E-mail" />
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <h3 className="font-medium">Entrega</h3>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <input className="border border-gray-200 rounded-md p-2" placeholder="Endereço" />
              <input className="border border-gray-200 rounded-md p-2" placeholder="Complemento" />
              <input className="border border-gray-200 rounded-md p-2" placeholder="Bairro" />
              <input className="border border-gray-200 rounded-md p-2" placeholder="Cidade" />
              <input className="border border-gray-200 rounded-md p-2" placeholder="CEP" />
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <h3 className="font-medium">Totais</h3>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <input type="number" step="0.01" className="border border-gray-200 rounded-md p-2" placeholder="Subtotal" defaultValue={59.7} />
              <input type="number" step="0.01" className="border border-gray-200 rounded-md p-2" placeholder="Taxa de entrega" defaultValue={8.0} />
              <input type="number" step="0.01" className="border border-gray-200 rounded-md p-2" placeholder="Desconto" defaultValue={0} />
              <input type="number" step="0.01" className="border border-gray-200 rounded-md p-2" placeholder="Total" defaultValue={67.7} />
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

export default OrderEdit;