import React, { useState } from 'react';
import { Button, Input } from '../../../../shared/components/ui';

const Settings = () => {
  const [form, setForm] = useState({
    name: 'Brasa & Massa',
    email: 'contato@brasaemassa.com',
    phone: '(11) 99999-1234',
    address: 'Rua das Laranjeiras, 214',
    city: 'São Paulo',
    state: 'SP',
    deliveryFee: '6,90',
    minOrder: '30,00',
    description: 'Cozinha artesanal com ingredientes frescos, forno a lenha e delivery rápido.',
  });

  const onChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-500">Perfil e operação</p>
        <h1 className="text-2xl font-bold text-gray-900">Ajustes com cara de app</h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Identidade</p>
                <h2 className="text-xl font-semibold text-gray-900">Dados do restaurante</h2>
              </div>
              <Button variant="ghost" className="border border-gray-200 text-gray-700">
                Atualizar logo
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Nome" value={form.name} onChange={onChange('name')} />
              <Input label="Email" value={form.email} onChange={onChange('email')} />
              <Input label="Telefone" value={form.phone} onChange={onChange('phone')} />
              <Input label="Cidade" value={form.city} onChange={onChange('city')} />
              <Input label="Estado" value={form.state} onChange={onChange('state')} />
              <Input label="Endereço" value={form.address} onChange={onChange('address')} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
              <textarea
                value={form.description}
                onChange={onChange('description')}
                rows={3}
                className="w-full rounded-2xl border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Entrega e pedidos</p>
                <h2 className="text-xl font-semibold text-gray-900">Parâmetros do delivery</h2>
              </div>
              <Button variant="ghost" className="border border-gray-200 text-gray-700">
                Atualizar SLA
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="Taxa de entrega" value={form.deliveryFee} onChange={onChange('deliveryFee')} />
              <Input label="Pedido mínimo" value={form.minOrder} onChange={onChange('minOrder')} />
              <Input label="Tempo médio" value="32 min" disabled />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <p className="text-sm font-semibold text-gray-900">Horários</p>
                <p className="text-sm text-gray-500">Seg à dom: 11h às 23h</p>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <p className="text-sm font-semibold text-gray-900">Áreas atendidas</p>
                <p className="text-sm text-gray-500">3,5km • Taxa dinâmica ligada</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)] text-white rounded-3xl p-6 shadow-lg">
            <p className="text-sm uppercase tracking-widest text-white/80">experiência</p>
            <h3 className="text-2xl font-semibold mt-2">Seu restaurante como vitrine</h3>
            <p className="text-white/80 mt-2">
              Destaque fotos, tempos de preparo reais e mantenha o cardápio sempre atualizado para subir nos resultados.
            </p>
            <Button variant="secondary" className="mt-4 bg-white text-[var(--accent)] hover:bg-white/90">
              Ver como o cliente vê
            </Button>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-lg p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Equipe</p>
                <h3 className="text-lg font-semibold text-gray-900">Acessos rápidos</h3>
              </div>
              <Button size="sm" variant="ghost" className="border border-gray-200 text-gray-700">
                Convidar
              </Button>
            </div>
            <div className="space-y-3">
              {[{ name: 'Chefe', role: 'Admin' }, { name: 'Expedição', role: 'Operador' }, { name: 'Financeiro', role: 'Visualizador' }].map((member) => (
                <div key={member.name} className="flex items-center justify-between p-3 rounded-2xl border border-gray-100">
                  <div>
                    <p className="font-semibold text-gray-900">{member.name}</p>
                    <p className="text-sm text-gray-500">{member.role}</p>
                  </div>
                  <Button size="sm" variant="ghost" className="border border-gray-200 text-gray-700">
                    Gerenciar
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;