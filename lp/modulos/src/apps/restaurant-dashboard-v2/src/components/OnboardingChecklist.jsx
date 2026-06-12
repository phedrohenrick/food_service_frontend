import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStorefront } from '../../../../shared/generalContext.jsx';
import {
  ChevronDown,
  ChevronUp,
  Check,
  UtensilsCrossed,
  Clock,
  Truck,
  Store,
  Sparkles,
  LayoutGrid,
} from 'lucide-react';
import { MdTableRestaurant } from 'react-icons/md';

const STORAGE_KEY_COLLAPSED = (tenantId) => `onboarding-checklist:${tenantId}:collapsed`;
const STORAGE_KEY_DISMISSED = (tenantId) => `onboarding-checklist:${tenantId}:dismissed`;
const STORAGE_KEY_EXPANDED = (tenantId) => `onboarding-checklist:${tenantId}:expanded`;
const STORAGE_KEY_QR_PRINTED = (tenantId) => `onboarding-checklist:${tenantId}:qr-printed`;

// Names seeded by the backend (InitialTenantDataService). Items matching these
// are treated as untouched defaults and don't count toward the "menu" step.
const SEED_ITEM_NAMES = new Set([
  'X-Bacon', 'X-Salada', 'Double Cheddar', 'Coca-Cola Lata',
  'Spaghetti Carbonara', 'Fettuccine Alfredo', 'Água com gás',
]);

const isSeedItem = (item) => SEED_ITEM_NAMES.has(String(item?.name || '').trim());

const PING_STYLE_ID = 'priatoo-attention-ping-styles';
const PING_CLASS = 'priatoo-attention-ping';
const PROGRESS_PULSE_CLASS = 'priatoo-progress-pulse';
const ensurePingStyles = () => {
  if (typeof document === 'undefined') return;
  if (document.getElementById(PING_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = PING_STYLE_ID;
  style.textContent = `
    @keyframes priatoo-attention-ping {
      0%   { box-shadow: 0 0 0 0 color-mix(in srgb, var(--accent) 65%, transparent), 0 0 0 0 color-mix(in srgb, var(--accent) 35%, transparent); }
      60%  { box-shadow: 0 0 0 14px color-mix(in srgb, var(--accent) 0%, transparent), 0 0 0 28px color-mix(in srgb, var(--accent) 0%, transparent); }
      100% { box-shadow: 0 0 0 0 transparent, 0 0 0 0 transparent; }
    }
    .${PING_CLASS} {
      animation: priatoo-attention-ping 1.4s cubic-bezier(0.4, 0, 0.6, 1) 3;
      position: relative;
      z-index: 5;
    }
    @keyframes priatoo-progress-glow {
      0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--accent) 0%, transparent); }
      50%      { box-shadow: 0 0 10px 1px color-mix(in srgb, var(--accent) 55%, transparent); }
    }
    @keyframes priatoo-progress-shimmer {
      0%   { transform: translateX(-110%); }
      100% { transform: translateX(110%); }
    }
    .${PROGRESS_PULSE_CLASS} {
      position: relative;
      overflow: hidden;
      animation: priatoo-progress-glow 2.2s ease-in-out infinite;
    }
    .${PROGRESS_PULSE_CLASS}::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(
        90deg,
        transparent 0%,
        color-mix(in srgb, white 70%, transparent) 50%,
        transparent 100%
      );
      animation: priatoo-progress-shimmer 1.8s linear infinite;
      pointer-events: none;
    }
    @media (prefers-reduced-motion: reduce) {
      .${PROGRESS_PULSE_CLASS} { animation: none; }
      .${PROGRESS_PULSE_CLASS}::after { animation: none; opacity: 0; }
    }
  `;
  document.head.appendChild(style);
};

const OnboardingChecklist = () => {
  const {
    tenant,
    menuCategories,
    menuItems,
    neighborhoods,
    canUseFeature,
  } = useStorefront();

  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState({});
  const [qrPrinted, setQrPrinted] = useState(false);
  const confettiTimeout = useRef(null);

  const tenantId = tenant?.id;

  useEffect(() => {
    if (!tenantId) return;
    try {
      setCollapsed(localStorage.getItem(STORAGE_KEY_COLLAPSED(tenantId)) === '1');
      setDismissed(localStorage.getItem(STORAGE_KEY_DISMISSED(tenantId)) === '1');
      setQrPrinted(localStorage.getItem(STORAGE_KEY_QR_PRINTED(tenantId)) === '1');
      const rawExpanded = localStorage.getItem(STORAGE_KEY_EXPANDED(tenantId));
      if (rawExpanded) {
        try { setExpandedSteps(JSON.parse(rawExpanded) || {}); } catch (_) {}
      }
    } catch (_) {}
  }, [tenantId]);

  // Listen for cross-component progress events (e.g. Mesas page clicked "Imprimir QRs")
  useEffect(() => {
    if (!tenantId) return undefined;
    const handler = () => {
      try {
        setQrPrinted(localStorage.getItem(STORAGE_KEY_QR_PRINTED(tenantId)) === '1');
      } catch (_) {}
    };
    window.addEventListener('priatoo:onboarding-progress', handler);
    return () => window.removeEventListener('priatoo:onboarding-progress', handler);
  }, [tenantId]);

  // Force the checklist to be visible whenever the guided tour ends or is skipped,
  // so the user always lands on the checklist after a tour interaction.
  useEffect(() => {
    if (!tenantId) return undefined;
    const handler = () => {
      setDismissed(false);
      setCollapsed(false);
      try {
        localStorage.removeItem(STORAGE_KEY_DISMISSED(tenantId));
        localStorage.setItem(STORAGE_KEY_COLLAPSED(tenantId), '0');
      } catch (_) {}
    };
    window.addEventListener('priatoo:onboarding-checklist:show', handler);
    return () => window.removeEventListener('priatoo:onboarding-checklist:show', handler);
  }, [tenantId]);

  const toggleStepExpanded = useCallback((stepId) => {
    setExpandedSteps((prev) => {
      const next = { ...prev, [stepId]: !prev[stepId] };
      try { localStorage.setItem(STORAGE_KEY_EXPANDED(tenantId), JSON.stringify(next)); } catch (_) {}
      return next;
    });
  }, [tenantId]);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try { localStorage.setItem(STORAGE_KEY_COLLAPSED(tenantId), next ? '1' : '0'); } catch (_) {}
      return next;
    });
  }, [tenantId]);

  const dismiss = useCallback(() => {
    // Celebratory confetti even after the auto-trigger already fired once.
    setShowConfetti(true);
    if (confettiTimeout.current) clearTimeout(confettiTimeout.current);
    confettiTimeout.current = setTimeout(() => setShowConfetti(false), 6000);
    setDismissed(true);
    try { localStorage.setItem(STORAGE_KEY_DISMISSED(tenantId), '1'); } catch (_) {}
  }, [tenantId]);

  const basePrefix = useMemo(() => {
    const m = /^\/([^/]+)\/dashboard(\/|$)/i.exec(location.pathname || '');
    if (m && m[1]) return `/${m[1]}/dashboard`;
    return '/dashboard';
  }, [location.pathname]);

  const steps = useMemo(() => {
    const hasValidName = (() => {
      const name = String(tenant?.name || '').trim();
      return name.length > 0 && name.toLowerCase() !== 'minha loja';
    })();
    const hasPhoto = !!tenant?.photo_url;
    const hasColor = !!tenant?.main_color && tenant.main_color !== 'rgb(153, 153, 153)';

    const hasCategories = Array.isArray(menuCategories) && menuCategories.length > 0;
    const itemList = Array.isArray(menuItems) ? menuItems : [];
    const seedCount = itemList.filter(isSeedItem).length;
    const hasOwnItem = itemList.some((it) => !isSeedItem(it));

    const hasWorkingHours = (() => {
      const wh = tenant?.working_hours;
      if (!wh) return false;
      if (typeof wh === 'string') return wh.trim().length > 0;
      if (typeof wh === 'object') return Object.keys(wh).length > 0;
      return false;
    })();

    const hasDeliveryMethod = !!tenant?.delivery_method;
    const hasNeighborhoods = Array.isArray(neighborhoods) && neighborhoods.length > 0;

    const hasTableManagement = canUseFeature('table_management');

    const isOpen = !!tenant?.is_open;

    const profileSubs = [
      {
        id: 'profile-name',
        title: 'Definir nome do restaurante',
        description: 'Troque o nome padrão pelo da sua marca',
        completed: hasValidName,
        route: `${basePrefix}/settings`,
        target: 'brand-identity',
      },
      {
        id: 'profile-photo',
        title: 'Adicionar foto da loja',
        description: 'Logo ou foto que aparece no app do cliente',
        completed: hasPhoto,
        route: `${basePrefix}/settings`,
        target: 'brand-identity',
      },
      {
        id: 'profile-color',
        title: 'Escolher cor da marca',
        description: 'Personaliza botões e destaques visuais',
        completed: hasColor,
        route: `${basePrefix}/settings`,
        target: 'brand-identity',
      },
    ];

    const menuSubs = [
      {
        id: 'menu-clean-seeds',
        title: 'Apagar itens de exemplo',
        description: `${seedCount} ${seedCount === 1 ? 'item' : 'itens'} demo no cardápio`,
        completed: seedCount === 0,
        visible: seedCount > 0,
        route: `${basePrefix}/menu`,
        target: 'menu-overview',
        query: { 'clean-seeds': '1' },
      },
      {
        id: 'menu-categories',
        title: 'Criar uma categoria',
        description: 'Organize seu cardápio em seções',
        completed: hasCategories,
        route: `${basePrefix}/menu`,
        target: 'menu-categories',
      },
      {
        id: 'menu-add-item',
        title: 'Adicionar seu primeiro item',
        description: 'Cadastre um prato real do seu menu',
        completed: hasOwnItem,
        route: `${basePrefix}/menu`,
        target: 'menu-add-item',
      },
    ];

    const deliverySubs = [
      {
        id: 'delivery-method',
        title: 'Escolher método de entrega',
        description: 'Você entrega, retira no balcão ou ambos',
        completed: hasDeliveryMethod,
        route: `${basePrefix}/settings`,
        target: 'delivery-settings',
      },
      {
        id: 'delivery-neighborhoods',
        title: 'Cadastrar bairros e taxas',
        description: 'Defina onde entrega e quanto cobra',
        completed: hasNeighborhoods,
        route: `${basePrefix}/settings`,
        target: 'delivery-settings',
      },
    ];

    const visibleSubsOf = (subs) => subs.filter((s) => s.visible !== false);
    const allSubsDone = (subs) => visibleSubsOf(subs).every((s) => s.completed);

    const list = [
      {
        id: 'profile',
        title: 'Personalizar restaurante',
        description: 'Nome, foto e cor da marca',
        icon: Store,
        completed: allSubsDone(profileSubs),
        route: `${basePrefix}/settings`,
        target: 'brand-identity',
        subSteps: profileSubs,
      },
      {
        id: 'menu',
        title: 'Montar o cardápio',
        description: 'Categorias e seus próprios itens',
        icon: UtensilsCrossed,
        completed: allSubsDone(menuSubs),
        route: `${basePrefix}/menu`,
        target: 'menu-overview',
        subSteps: menuSubs,
      },
      {
        id: 'hours',
        title: 'Definir horários',
        description: 'Configure quando a loja opera',
        icon: Clock,
        completed: hasWorkingHours,
        route: `${basePrefix}/settings`,
        target: 'working-hours',
      },
      {
        id: 'delivery',
        title: 'Configurar entrega',
        description: 'Método, bairros e taxas',
        icon: Truck,
        completed: allSubsDone(deliverySubs),
        route: `${basePrefix}/settings`,
        target: 'delivery-settings',
        subSteps: deliverySubs,
      },
    ];

    if (hasTableManagement) {
      const tableSubs = [
        {
          id: 'tables-create',
          title: 'Cadastrar primeira mesa',
          description: 'Adicione ao menos uma mesa do salão',
          completed: false, // filled later via tableCount
          route: `${basePrefix}/mesas`,
          target: 'tables-create',
        },
        {
          id: 'tables-qr',
          title: 'Gerar QR codes das mesas',
          description: 'Imprima os QRs pra colar nas mesas',
          completed: qrPrinted,
          route: `${basePrefix}/mesas`,
          target: 'tables-print-qr',
        },
      ];
      list.push({
        id: 'tables',
        title: 'Cadastrar mesas',
        description: 'Cadastro e impressão dos QR codes',
        icon: null,
        iconReact: MdTableRestaurant,
        completed: false, // overridden later via tableCount + qrPrinted
        route: `${basePrefix}/mesas`,
        target: 'tables-header',
        fetchCheck: true,
        subSteps: tableSubs,
      });
    }

    list.push({
      id: 'open',
      title: 'Abrir sua loja',
      description: hasTableManagement
        ? 'Concluído após imprimir os QRs das mesas'
        : 'Comece a receber pedidos!',
      icon: Sparkles,
      completed: hasTableManagement ? qrPrinted : isOpen,
      route: null,
    });

    return list;
  }, [tenant, menuCategories, menuItems, neighborhoods, canUseFeature, basePrefix, qrPrinted]);

  const [tableCount, setTableCount] = useState(null);
  useEffect(() => {
    const tableStep = steps.find((s) => s.id === 'tables');
    if (!tableStep) return;
    import('../../../../shared/services/api').then((mod) => {
      const api = mod.default;
      api.get('/tables').then((data) => {
        setTableCount(Array.isArray(data) ? data.length : 0);
      }).catch(() => setTableCount(0));
    });
  }, [steps.length]);

  const resolvedSteps = useMemo(() => {
    return steps.map((s) => {
      if (s.id === 'tables' && tableCount !== null) {
        const hasTables = tableCount > 0;
        const updatedSubs = Array.isArray(s.subSteps)
          ? s.subSteps.map((sub) =>
              sub.id === 'tables-create' ? { ...sub, completed: hasTables } : sub
            )
          : s.subSteps;
        const allTableSubsDone = Array.isArray(updatedSubs)
          ? updatedSubs.filter((x) => x.visible !== false).every((x) => x.completed)
          : hasTables;
        return { ...s, subSteps: updatedSubs, completed: allTableSubsDone };
      }
      return s;
    });
  }, [steps, tableCount]);

  const completedCount = resolvedSteps.filter((s) => s.completed).length;
  const totalCount = resolvedSteps.length;
  const allDone = completedCount === totalCount;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const expandedHeight = useMemo(() => {
    const PARENT_ROW = 64;
    const SUB_ROW = 40;
    const GROUP_PADDING = 8;
    const FOOTER_HEIGHT = allDone ? 64 : 0;
    const rows = resolvedSteps.reduce((acc, step) => {
      if (!Array.isArray(step.subSteps)) {
        return acc + PARENT_ROW;
      }
      const visibleSubs = step.subSteps.filter((s) => s.visible !== false).length;
      const isExpanded = !!expandedSteps[step.id];
      const subsHeight = isExpanded && visibleSubs > 0
        ? visibleSubs * SUB_ROW + GROUP_PADDING
        : 0;
      return acc + PARENT_ROW + subsHeight;
    }, 0);
    return rows + 24 + FOOTER_HEIGHT;
  }, [resolvedSteps, allDone, expandedSteps]);

  // Confetti is intentionally only triggered by the "Entendido, dispensar"
  // button (see `dismiss`) — not when allDone first becomes true. Keep the
  // timeout cleanup in case `dismiss` schedules one and the component unmounts.
  useEffect(() => {
    return () => { if (confettiTimeout.current) clearTimeout(confettiTimeout.current); };
  }, []);

  useEffect(() => {
    ensurePingStyles();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const target = params.get('highlight');
    if (!target) return;

    const timeoutId = setTimeout(() => {
      const el = document.querySelector(`[data-wizard="${target}"]`);
      if (el) {
        el.classList.add(PING_CLASS);
        try { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (_) {}
        setTimeout(() => el.classList.remove(PING_CLASS), 4500);
      }
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete('highlight');
        window.history.replaceState({}, '', url.toString());
      } catch (_) {}
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [location.pathname, location.search]);

  if (!tenantId) return null;

  // When the user dismisses the checklist, keep the confetti running until its
  // timeout finishes so the celebration plays out even with the card gone.
  if (dismissed) {
    return showConfetti ? <ConfettiBurst /> : null;
  }

  const goTo = (route, target, extraQuery) => {
    if (!route) return;
    const params = new URLSearchParams();
    if (target) params.set('highlight', target);
    if (extraQuery && typeof extraQuery === 'object') {
      Object.entries(extraQuery).forEach(([k, v]) => params.set(k, String(v)));
    }
    const qs = params.toString();
    if (!qs) return navigate(route);
    const sep = route.includes('?') ? '&' : '?';
    navigate(`${route}${sep}${qs}`);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 w-80 font-sans select-none">
      {showConfetti && <ConfettiBurst />}

      <div
        className="rounded-2xl bg-white border border-gray-200/80 overflow-hidden transition-all duration-300"
        style={{ boxShadow: '0 24px 56px -12px rgba(0,0,0,0.45), 0 12px 24px -6px rgba(0,0,0,0.28), 0 4px 10px -2px rgba(0,0,0,0.15)' }}
      >
        {/* Header */}
        <button
          type="button"
          onClick={toggleCollapsed}
          className="w-full flex items-center justify-between px-5 py-4 transition-colors"
          style={{ background: 'color-mix(in srgb, var(--accent) 8%, white)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'color-mix(in srgb, var(--accent) 14%, white)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'color-mix(in srgb, var(--accent) 8%, white)'; }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl shadow-md"
              style={{ background: 'var(--accent)', boxShadow: '0 4px 12px -2px color-mix(in srgb, var(--accent) 40%, transparent)' }}
            >
              <LayoutGrid className="h-4 w-4" style={{ color: 'var(--accent-contrast)' }} />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-900">Primeiros passos</p>
              <p className="text-xs text-gray-900">
                {allDone ? 'Tudo pronto!' : `${completedCount} de ${totalCount} completos`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {collapsed ? (
              <ChevronUp className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            )}
          </div>
        </button>

        {/* Progress bar */}
        <div className="h-1 bg-gray-100 overflow-hidden">
          <div
            className={`h-full transition-all duration-700 ease-out ${
              !allDone && progress > 0 ? PROGRESS_PULSE_CLASS : ''
            }`}
            style={{ width: `${progress}%`, background: 'var(--accent)' }}
          />
        </div>

        {/* Steps - collapsible */}
        <div
          className="transition-all duration-300 ease-in-out overflow-hidden"
          style={{
            maxHeight: collapsed ? '0px' : `${expandedHeight}px`,
            opacity: collapsed ? 0 : 1,
          }}
        >
          <div className="px-3 py-2 space-y-1">
            {resolvedSteps.map((step) => {
              const IconComponent = step.icon || step.iconReact;
              const visibleSubs = Array.isArray(step.subSteps)
                ? step.subSteps.filter((s) => s.visible !== false)
                : [];
              const hasSubs = visibleSubs.length > 0;
              const isExpanded = hasSubs && !!expandedSteps[step.id];
              const handleParentClick = () => {
                if (hasSubs) {
                  toggleStepExpanded(step.id);
                } else if (step.route) {
                  goTo(step.route, step.target, step.query);
                }
              };
              return (
                <div key={step.id}>
                  <div
                    onClick={handleParentClick}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                      step.route || hasSubs
                        ? 'cursor-pointer hover:bg-gray-50'
                        : 'cursor-default'
                    }`}
                  >
                    {/* Check circle */}
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                        step.completed
                          ? 'border-emerald-400 bg-gradient-to-br from-emerald-400 to-green-500 scale-100 shadow-[0_2px_10px_rgba(16,185,129,0.55)]'
                          : 'border-gray-300 bg-white'
                      }`}
                      style={!step.completed ? { '--hover-border': 'var(--accent)' } : undefined}
                    >
                      {step.completed ? (
                        <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                      ) : (
                        <IconComponent className="h-3 w-3 text-gray-400 transition-colors" style={{ color: undefined }} />
                      )}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium leading-tight text-gray-800 ${
                        step.completed ? 'line-through decoration-gray-500' : ''
                      }`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        {hasSubs
                          ? `${visibleSubs.filter((s) => s.completed).length} de ${visibleSubs.length} subpassos`
                          : step.description}
                      </p>
                    </div>

                    {/* Trailing affordance: chevron when has subs, arrow when leaf */}
                    {hasSubs ? (
                      <ChevronDown
                        className="h-4 w-4 text-gray-400 transition-transform duration-200 group-hover:text-[var(--accent)]"
                        style={{ transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)' }}
                      />
                    ) : step.route && !step.completed ? (
                      <span className="text-gray-300 transition-colors text-sm group-hover:text-[var(--accent)]">
                        &rsaquo;
                      </span>
                    ) : null}
                  </div>

                  {/* Sub-steps */}
                  {isExpanded && (
                    <div className="ml-6 mt-0.5 mb-1 pl-3 border-l-2 border-gray-200 space-y-0.5">
                      {visibleSubs.map((sub) => (
                        <div
                          key={sub.id}
                          onClick={() => goTo(sub.route, sub.target, sub.query)}
                          className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-all duration-200 group/sub ${
                            sub.route
                              ? 'cursor-pointer hover:bg-gray-50'
                              : 'cursor-default'
                          }`}
                        >
                          <div
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-all duration-500 ${
                              sub.completed
                                ? 'border-emerald-400 bg-gradient-to-br from-emerald-400 to-green-500 shadow-[0_1px_4px_rgba(16,185,129,0.5)]'
                                : 'border-gray-300 bg-white'
                            }`}
                          >
                            {sub.completed && (
                              <Check className="h-2 w-2 text-white" strokeWidth={4} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-[12px] font-medium leading-tight text-gray-700 ${
                              sub.completed ? 'line-through decoration-gray-500' : ''
                            }`}>
                              {sub.title}
                            </p>
                            {sub.description && !sub.completed && (
                              <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                                {sub.description}
                              </p>
                            )}
                          </div>
                          {sub.route && !sub.completed && (
                            <span className="text-gray-300 transition-colors text-xs group-hover/sub:text-[var(--accent)]">
                              &rsaquo;
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer when all done */}
          {allDone && (
            <div className="px-5 pb-4">
              <button
                type="button"
                onClick={dismiss}
                className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold shadow-md transition-all hover:opacity-90"
                style={{
                  background: 'var(--accent)',
                  color: 'var(--accent-contrast)',
                  boxShadow: '0 4px 12px -2px color-mix(in srgb, var(--accent) 40%, transparent)',
                }}
              >
                Entendido, dispensar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ConfettiBurst = () => {
  const particles = useMemo(() => {
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#EA1D2C';
    const colors = [accent, '#34d399', '#fbbf24', accent, '#818cf8', '#f472b6', '#22c55e', accent, '#ef4444'];
    return Array.from({ length: 90 }, (_, i) => ({
      id: i,
      color: colors[i % colors.length],
      x: Math.random() * 100,
      delay: Math.random() * 1.4,
      duration: 2.8 + Math.random() * 2.6,
      size: 6 + Math.random() * 8,
      drift: (Math.random() - 0.5) * 240,
      spin: 540 + Math.random() * 540,
      shape: Math.random(),
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[1000]">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute priatoo-confetti-piece"
          style={{
            left: `${p.x}%`,
            top: '-16px',
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            borderRadius: p.shape > 0.5 ? '50%' : '2px',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            '--drift-x': `${p.drift}px`,
            '--spin': `${p.spin}deg`,
          }}
        />
      ))}
      <style>{`
        @keyframes priatoo-confetti-fall {
          0% { transform: translate3d(0, 0, 0) rotate(0deg); opacity: 1; }
          100% { transform: translate3d(var(--drift-x, 0px), 110vh, 0) rotate(var(--spin, 720deg)); opacity: 0; }
        }
        .priatoo-confetti-piece {
          animation-name: priatoo-confetti-fall;
          animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
          animation-fill-mode: forwards;
          will-change: transform, opacity;
        }
      `}</style>
    </div>
  );
};

export default OnboardingChecklist;
