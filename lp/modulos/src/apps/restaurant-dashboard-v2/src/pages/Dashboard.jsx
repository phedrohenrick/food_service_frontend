import React from 'react';
import { Button } from '../../../../shared/components/ui';

const stats = [
  { label: 'Pedidos hoje', value: '42', helper: '+18% vs ontem', accent: 'bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)] text-white' },
  { label: 'Ticket médio', value: 'R$ 54,20', helper: 'Clientes gastando mais', accent: 'bg-white text-gray-900' },
  { label: 'Tempo de preparo', value: '32 min', helper: 'Dentro da meta', accent: 'bg-white text-gray-900' },
  { label: 'Avaliação', value: '4.9 ★', helper: '152 avaliações', accent: 'bg-white text-gray-900' },
];

const highlights = [
  {
    title: 'Próximos pedidos',
    items: [
      { id: '#3214', customer: 'Marina Costa', items: '2x Hambúrguer artesanal', eta: '8 min', status: 'Preparando' },
      { id: '#3213', customer: 'Felipe Rocha', items: 'Pizza marguerita', eta: '14 min', status: 'Pago' },
      { id: '#3212', customer: 'João Pedro', items: 'Salada + suco', eta: '20 min', status: 'Retirada' },
    ],
  },
  {
    title: 'Itens mais vendidos',
    items: [
      { id: 'PZ1', customer: 'Pizza Pepperoni', items: '18 pedidos', eta: 'R$ 48,00', status: 'Em destaque' },
      { id: 'HB2', customer: 'Burger da Casa', items: '15 pedidos', eta: 'R$ 36,00', status: 'Alta saída' },
      { id: 'SD4', customer: 'Bowl Mediterrâneo', items: '12 pedidos', eta: 'R$ 32,00', status: 'Saudável' },
    ],
  },
];

const Dashboard = () => {
  return (
    // CHANGE 1: removi mx-auto e max-w-screen-2xl para não limitar largura em telas grandes
    <div className="w-full space-y-6 px-4 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] text-white shadow-xl">
        <div className="p-8 sm:p-9 md:p-10">
          <p className="text-sm uppercase tracking-widest text-white/80">painel inteligente</p>
          <h1 className="text-3xl md:text-4xl font-bold mt-2 mb-4">Acompanhe pedidos e desempenho em tempo real</h1>
          <p className="text-white/80 max-w-2xl">
            Veja a fila de produção, entenda o volume de vendas e mantenha o cardápio sempre pronto para encantar seus clientes.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="ghost" className="bg-white/10 text-white hover:bg-white/20 border-white/20">
              Abrir loja agora
            </Button>
            <Button variant="secondary" className="bg-white text-[var(--accent)] hover:bg-white/90">
              Ver pedidos ao vivo
            </Button>
          </div>
        </div>
        <div className="absolute -right-8 -bottom-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" aria-hidden />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`${stat.accent} rounded-2xl p-4 shadow-lg border border-gray-100/60`}
          >
            <p className="text-sm text-gray-500/90 capitalize">
              {stat.label}
            </p>
            <p className="text-xl md:text-2xl lg:text-3xl font-bold mt-2">{stat.value}</p>
            <p className="text-sm text-gray-500/90 mt-1">{stat.helper}</p>
          </div>
        ))}
      </div>

      {/* CHANGE 2: reajustei grid para o "menu lateral" não ficar estreito e o conteúdo principal ganhar mais largura */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* CHANGE 3: col-span novo para combinar com lg:grid-cols-4 */}
        <div className="lg:col-span-3 bg-white rounded-3xl border border-gray-100 shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">Status das entregas</p>
              <h2 className="text-xl font-semibold text-gray-900">Fila em tempo real</h2>
            </div>
            <Button size="sm" variant="ghost" className="border border-gray-200 text-gray-700">
              Atualizar
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[{ title: 'Recebidos', value: 6 }, { title: 'Preparando', value: 4 }, { title: 'Prontos', value: 2 }].map((col) => (
              <div key={col.title} className="rounded-2xl bg-gray-50 p-4 border border-gray-100">
                <p className="text-sm text-gray-500">{col.title}</p>
                <p className="text-3xl font-bold text-gray-900">{col.value}</p>
                <div className="mt-2 h-2 rounded-full bg-gray-200">
                  <div className="h-2 rounded-full bg-[var(--accent)]" style={{ width: `${col.value * 12}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-3">
            {[1, 2, 3, 4].map((order) => (
              <div
                key={order}
                className="flex items-center justify-between rounded-2xl border border-gray-100 p-4 sm:p-5 bg-gray-50/50"
              >
                <div>
                  <p className="text-sm text-gray-500">Pedido #{3210 + order}</p>
                  <p className="text-base font-semibold text-gray-900">Combo família - mesa delivery</p>
                  <p className="text-sm text-gray-500">Há {order * 3} minutos</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-lg font-bold text-gray-900">R$ {(58 + order * 7).toFixed(2)}</p>
                  <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-700">
                    Em preparação
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CHANGE 4: garantindo que o menu lateral ocupe sua coluna inteira */}
        <div className="lg:col-span-1 space-y-4">
          {highlights.map((block) => (
            <div key={block.title} className="bg-white rounded-3xl border border-gray-100 shadow-lg p-5 sm:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{block.title}</h3>
                <Button size="sm" variant="ghost" className="text-[var(--accent)] border border-gray-200">
                  Ver todos
                </Button>
              </div>
              <div className="space-y-3">
                {block.items.map((item) => (
                  <div key={item.id} className="border border-gray-100 rounded-2xl p-3 hover:shadow-sm transition">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">{item.id}</p>
                        <p className="font-semibold text-gray-900">{item.customer}</p>
                        <p className="text-sm text-gray-500">{item.items}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">{item.eta}</p>
                        <span className="text-xs px-3 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)]">
                          {item.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
