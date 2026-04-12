import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import DashboardLayout from './src/components/layout/DashboardLayout';
import FirstAccessWizard from './src/components/FirstAccessWizard';
import { Dashboard } from './src/pages';
import Orders from './src/pages/Orders';
import Menu from './src/pages/Menu';
import Settings from './src/pages/Settings';
import { initKeycloak, getKeycloak } from '../../shared/auth/keycloak';
import api from '../../shared/services/api';
import { useStorefront } from '../../shared/generalContext.jsx';

const RestaurantDashboard = () => {
  const { tenant } = useStorefront();
  const [ready, setReady] = useState(false);
  const [authDenied, setAuthDenied] = useState(false);
  const [wizardReady, setWizardReady] = useState(false);
  const [wizardActive, setWizardActive] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const initGuard = useRef(false);
  const location = useLocation();
  const navigate = useNavigate();

  const basePrefix = useMemo(() => {
    const path = location.pathname || '';
    const match = path.match(/^\/([^/]+)\/dashboard(\/|$)/i);
    const slug = match?.[1] || tenant?.slug || null;
    return slug ? `/${slug}/dashboard` : '/dashboard';
  }, [location.pathname, tenant?.slug]);

  const wizardStoragePrefix = useMemo(() => {
    const tenantKey = tenant?.id || tenant?.slug;
    return tenantKey ? `restaurant-dashboard:first-access:${tenantKey}` : '';
  }, [tenant?.id, tenant?.slug]);

  const wizardSteps = useMemo(() => ([
    {
      route: `${basePrefix}/settings`,
      title: 'Vamos dar os primeiros passos',
      description: 'No primeiro acesso, este assistente conduz você no seu sistema pelos pontos essenciais para colocar a loja no ar com identidade, delivery e cardápio organizados.',
      note: 'Você irá avançar passo a passo.',
    },
    {
      route: `${basePrefix}/settings`,
      targetSelector: '[data-wizard=\"store-name\"]',
      title: 'Defina o nome da loja',
      description: 'Atualize o nome comercial. Lembrando que esses dados são os que vão aparecer no painel e no app do cliente. Use exatamente como quer apresentar o restaurante.',
    },
    {
      route: `${basePrefix}/settings`,
      targetSelector: '[data-wizard=\"store-slug\"]',
      title: 'Escolha o slug da loja',
      description: 'O slug vira parte do endereço da sua loja. Estará na URL de acesso. Sem espaços ou caracteres especiais. Prefira algo curto, legível e próximo da marca para facilitar compartilhamento.',
    },
    {
      route: `${basePrefix}/settings`,
      targetSelector: '[data-wizard=\"store-document\"]',
      title: 'Preencha CPF ou CNPJ',
      description: 'Esse campo é obrigatório para fechar o cadastro base da operação e evitar ajustes manuais depois.',
    },
        {
      route: `${basePrefix}/settings`,
      targetSelector: '[data-wizard=\"store-save\"]',
      title: 'Salve as alterações',
      description: 'Não esqueça de salvar para garantir que todos os dados sejam registrados.',
    },
    {
      route: `${basePrefix}/settings`,
      targetSelector: '[data-wizard=\"brand-identity\"]',
      title: 'Monte sua identidade visual',
      description: 'Aqui você ajusta foto da loja e cor principal do seu site. Esses elementos aparecem no dashboard e ajudam o app do cliente a ficar com a cara do seu restaurante.',
    },
    {
      route: `${basePrefix}/settings`,
      targetSelector: '[data-wizard=\"delivery-settings\"]',
      title: 'Configure o delivery',
      description: 'Defina método de entrega, taxa de serviço, meios de pagamento, horários e áreas atendidas. Essa parte impacta diretamente a experiência do pedido.',
      note: 'Se você entrega por bairros, cadastre cada região e o respectivo valor antes de começar a operar.',
    },
   {
      route: `${basePrefix}/menu`,
      targetSelector: '[data-wizard=\"menu-start\"]',
      title: 'Agora vamos para o cardápio',
      description: 'Nesta tela você organiza categorias, itens e banners.',
      note: 'O fluxo que deve ser seguido é cadastrar categorias, depois produtos e por fim os destaques visuais.',
    },
    {
      route: `${basePrefix}/menu`,
      targetSelector: '[data-wizard=\"menu-categories\"]',
      title: 'Organize as categorias',
      description: 'Separe o cardápio por grupos como hambúrgueres, combos, bebidas ou sobremesas. Isso melhora a navegação do cliente e a operação da equipe.',
    },
        {
      route: `${basePrefix}/menu`,
      targetSelector: '[data-wizard=\"menu-overview\"]',
      title: 'Adicione itens ao cardápio',
      description: 'Nesta tela você adiciona itens ao cardápio. Cada item pode ter foto, descrição, preço e grupos de opções. Adicione grupo de opções para variações como tamanhos, adicionais ou combos.',
      note: 'Dica: Sempre revise o produto como se fosse o cliente comprando para garantir que tudo esteja correto.'
    },
    {
      route: `${basePrefix}/menu`,
      targetSelector: '[data-wizard=\"menu-add-item\"]',
      title: 'Cadastre os produtos',
      description: 'Use este botão para criar itens com foto, descrição, preço e grupos de opções. Sempre revise o produto como se fosse o cliente comprando.',
    },
    {
      route: `${basePrefix}/menu`,
      targetSelector: '[data-wizard=\"menu-banners\"]',
      title: 'Destaque produtos com banners',
      description: 'Os banners ajudam a promover lançamentos e produtos estratégicos. Você pode vinculá-los a um item específico para levar o cliente direto ao produto.',
    },
  ]), [basePrefix]);
  useEffect(() => {
    if (initGuard.current) {
      setReady(true);
      return;
    }
    initGuard.current = true;
    initKeycloak(() => setReady(true));
  }, []);
  useEffect(() => {
    const path = location.pathname || '';
    const m = path.match(/^\/([^/]+)\/dashboard(\/|$)/i);
    const slug = m && m[1] ? m[1] : null;
    if (slug) {
      try { localStorage.setItem('tenantSlug', slug); } catch (_) {}
    }
  }, [location.pathname, location.search]);
  useEffect(() => {
    if (!ready) return;
    const path = location.pathname || '';
    const m = path.match(/^\/([^/]+)\/dashboard(\/|$)/i);
    const slug = m && m[1] ? m[1] : null;
    if (slug) {
      try { localStorage.setItem('authTenantSlug', slug); } catch (_) {}
    }
    (async () => {
      try {
        await api.get('/tenant-auth/tenant-access');
        setAuthDenied(false);
      } catch (e) {
        setAuthDenied(true);
      }
    })();
  }, [ready, location.pathname]);

  useEffect(() => {
    if (!ready || !tenant?.id || !wizardStoragePrefix) return;

    let completed = false;
    let normalizedStep = 0;
    try {
      completed = localStorage.getItem(`${wizardStoragePrefix}:completed`) === '1';
      const storedStep = Number(localStorage.getItem(`${wizardStoragePrefix}:step`) || 0);
      normalizedStep = Number.isFinite(storedStep)
        ? Math.min(Math.max(storedStep, 0), wizardSteps.length - 1)
        : 0;
    } catch (_) {}

    setWizardStep(normalizedStep);
    setWizardActive(!completed);
    setWizardReady(true);
  }, [ready, tenant?.id, wizardStoragePrefix, wizardSteps.length]);

  useEffect(() => {
    if (!wizardReady || !wizardActive) return;
    const currentStep = wizardSteps[wizardStep];
    if (!currentStep?.route) return;
    if (location.pathname !== currentStep.route) {
      navigate(currentStep.route, { replace: true });
    }
  }, [wizardReady, wizardActive, wizardStep, wizardSteps, location.pathname, navigate]);

  useEffect(() => {
    if (!wizardReady || !wizardStoragePrefix) return;
    try {
      localStorage.setItem(`${wizardStoragePrefix}:step`, String(wizardStep));
    } catch (_) {}
  }, [wizardReady, wizardStoragePrefix, wizardStep]);

  const handleWizardNext = () => {
    setWizardStep((prev) => Math.min(prev + 1, wizardSteps.length - 1));
  };

  const handleWizardPrev = () => {
    setWizardStep((prev) => Math.max(prev - 1, 0));
  };

  const handleWizardFinish = () => {
    if (wizardStoragePrefix) {
      try {
        localStorage.setItem(`${wizardStoragePrefix}:completed`, '1');
        localStorage.removeItem(`${wizardStoragePrefix}:step`);
      } catch (_) {}
    }
    setWizardActive(false);
  };

  const restartWizard = () => {
    if (!ready) return;
    if (wizardStoragePrefix) {
      try {
        localStorage.removeItem(`${wizardStoragePrefix}:completed`);
        localStorage.removeItem(`${wizardStoragePrefix}:step`);
      } catch (_) {}
    }
    setWizardStep(0);
    setWizardActive(true);
    setWizardReady(true);
    navigate(`${basePrefix}/settings`, { replace: true });
  };

  useEffect(() => {
    const handler = () => restartWizard();
    window.addEventListener('restaurant-dashboard:wizard-restart', handler);
    return () => window.removeEventListener('restaurant-dashboard:wizard-restart', handler);
  }, [ready, wizardStoragePrefix, basePrefix]);
  if (!ready) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          src="/assets/images/lp/loading.mp4"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 flex min-h-screen items-center justify-center">
          <div className="max-w-md rounded-2xl bg-white/90 p-6 shadow text-center space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">Carregando</h2>
            <p className="text-sm text-gray-600">Preparando seu painel…</p>
          </div>
        </div>
      </div>
    );
  }
  if (authDenied) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          src="/assets/images/lp/loading.mp4"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 flex min-h-screen items-center justify-center">
          <div className="max-w-md rounded-2xl bg-white/90 p-6 shadow text-center space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">Acesso negado a esta loja</h2>
            <p className="text-sm text-gray-600">Você não tem permissão para acessar este painel. Entre com uma conta autorizada para este tenant.</p>
            <button
              className="inline-flex items-center justify-center rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
              onClick={() => getKeycloak().login({ prompt: 'login', redirectUri: window.location.href })}
            >Trocar de conta</button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <DashboardLayout onHelp={restartWizard}>
      <FirstAccessWizard
        active={wizardReady && wizardActive}
        step={wizardSteps[wizardStep]}
        stepIndex={wizardStep}
        totalSteps={wizardSteps.length}
        onNext={handleWizardNext}
        onPrev={handleWizardPrev}
        onFinish={handleWizardFinish}
      />
      <Routes>
        <Route index element={wizardReady && wizardActive ? <Navigate to="settings" replace /> : <Dashboard />} />
        <Route path="orders" element={<Orders />} />
        <Route path="menu" element={<Menu />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="." replace />} />
      </Routes>
    </DashboardLayout>
  );
};

export default RestaurantDashboard;
