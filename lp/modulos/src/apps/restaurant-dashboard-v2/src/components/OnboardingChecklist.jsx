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
  X,
  LayoutGrid,
} from 'lucide-react';
import { MdTableRestaurant } from 'react-icons/md';

const STORAGE_KEY_COLLAPSED = (tenantId) => `onboarding-checklist:${tenantId}:collapsed`;
const STORAGE_KEY_DISMISSED = (tenantId) => `onboarding-checklist:${tenantId}:dismissed`;
const STORAGE_KEY_CELEBRATED = (tenantId) => `onboarding-checklist:${tenantId}:celebrated`;

// Names seeded by the backend (InitialTenantDataService). Items matching these
// are treated as untouched defaults and don't count toward the "menu" step.
const SEED_ITEM_NAMES = new Set([
  'X-Bacon', 'X-Salada', 'Double Cheddar', 'Coca-Cola Lata',
  'Spaghetti Carbonara', 'Fettuccine Alfredo', 'Água com gás',
]);

const isSeedItem = (item) => SEED_ITEM_NAMES.has(String(item?.name || '').trim());

const PING_STYLE_ID = 'priatoo-attention-ping-styles';
const PING_CLASS = 'priatoo-attention-ping';
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
  const [celebrated, setCelebrated] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiTimeout = useRef(null);

  const tenantId = tenant?.id;

  useEffect(() => {
    if (!tenantId) return;
    try {
      setCollapsed(localStorage.getItem(STORAGE_KEY_COLLAPSED(tenantId)) === '1');
      setDismissed(localStorage.getItem(STORAGE_KEY_DISMISSED(tenantId)) === '1');
      setCelebrated(localStorage.getItem(STORAGE_KEY_CELEBRATED(tenantId)) === '1');
    } catch (_) {}
  }, [tenantId]);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try { localStorage.setItem(STORAGE_KEY_COLLAPSED(tenantId), next ? '1' : '0'); } catch (_) {}
      return next;
    });
  }, [tenantId]);

  const dismiss = useCallback(() => {
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
    const hasItems = itemList.length > 0;
    const seedCount = itemList.filter(isSeedItem).length;
    const hasOwnItem = itemList.some((it) => !isSeedItem(it));
    const onlySeeds = hasItems && !hasOwnItem;

    const hasWorkingHours = (() => {
      const wh = tenant?.working_hours;
      if (!wh) return false;
      if (typeof wh === 'string') return wh.trim().length > 0;
      if (typeof wh === 'object') return Object.keys(wh).length > 0;
      return false;
    })();

    const hasDelivery = (() => {
      const method = tenant?.delivery_method;
      const hasNeighborhoods = Array.isArray(neighborhoods) && neighborhoods.length > 0;
      return !!method && hasNeighborhoods;
    })();

    const hasTableManagement = canUseFeature('table_management');

    const isOpen = !!tenant?.is_open;

    const list = [
      {
        id: 'profile',
        title: 'Personalizar restaurante',
        description: 'Nome, foto e cor da marca',
        icon: Store,
        completed: hasValidName && hasPhoto && hasColor,
        route: `${basePrefix}/settings`,
        target: 'brand-identity',
      },
      {
        id: 'menu',
        title: 'Montar o cardápio',
        description: !hasItems
          ? 'Adicione categorias e o seu primeiro item'
          : onlySeeds
            ? `Apague os ${seedCount} exemplos e adicione os seus`
            : 'Categorias e pelo menos 1 item próprio',
        icon: UtensilsCrossed,
        completed: hasCategories && hasOwnItem,
        route: `${basePrefix}/menu`,
        target: 'menu-overview',
        query: onlySeeds ? { 'clean-seeds': '1' } : undefined,
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
        completed: hasDelivery,
        route: `${basePrefix}/settings`,
        target: 'delivery-settings',
      },
    ];

    if (hasTableManagement) {
      list.push({
        id: 'tables',
        title: 'Cadastrar mesas',
        description: 'Adicione ao menos uma mesa',
        icon: null,
        iconReact: MdTableRestaurant,
        completed: false,
        route: `${basePrefix}/mesas`,
        target: 'tables-header',
        fetchCheck: true,
      });
    }

    list.push({
      id: 'open',
      title: 'Abrir sua loja',
      description: 'Comece a receber pedidos!',
      icon: Sparkles,
      completed: isOpen,
      route: null,
    });

    return list;
  }, [tenant, menuCategories, menuItems, neighborhoods, canUseFeature, basePrefix]);

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
        return { ...s, completed: tableCount > 0 };
      }
      return s;
    });
  }, [steps, tableCount]);

  const completedCount = resolvedSteps.filter((s) => s.completed).length;
  const totalCount = resolvedSteps.length;
  const allDone = completedCount === totalCount;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  useEffect(() => {
    if (allDone && !celebrated) {
      setCelebrated(true);
      setShowConfetti(true);
      try { localStorage.setItem(STORAGE_KEY_CELEBRATED(tenantId), '1'); } catch (_) {}
      confettiTimeout.current = setTimeout(() => setShowConfetti(false), 3000);
    }
    return () => { if (confettiTimeout.current) clearTimeout(confettiTimeout.current); };
  }, [allDone, celebrated, tenantId]);

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

  if (dismissed || !tenantId) return null;

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
            {!allDone && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); dismiss(); }}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white/60 transition-colors"
                title="Dispensar"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            {collapsed ? (
              <ChevronUp className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            )}
          </div>
        </button>

        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%`, background: 'var(--accent)' }}
          />
        </div>

        {/* Steps - collapsible */}
        <div
          className="transition-all duration-300 ease-in-out overflow-hidden"
          style={{
            maxHeight: collapsed ? '0px' : `${resolvedSteps.length * 68 + 16}px`,
            opacity: collapsed ? 0 : 1,
          }}
        >
          <div className="px-3 py-2 space-y-1">
            {resolvedSteps.map((step) => {
              const IconComponent = step.icon || step.iconReact;
              return (
                <div
                  key={step.id}
                  onClick={() => goTo(step.route, step.target, step.query)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                    step.route
                      ? 'cursor-pointer hover:bg-gray-50'
                      : 'cursor-default'
                  } ${step.completed ? 'opacity-60' : ''}`}
                >
                  {/* Check circle */}
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                      step.completed
                        ? 'border-emerald-500 bg-emerald-500 scale-100'
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
                    <p className={`text-sm font-medium leading-tight ${
                      step.completed ? 'text-gray-500 line-through decoration-gray-300' : 'text-gray-800'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                      {step.description}
                    </p>
                  </div>

                  {/* Arrow */}
                  {step.route && !step.completed && (
                    <span className="text-gray-300 transition-colors text-sm group-hover:text-[var(--accent)]">
                      &rsaquo;
                    </span>
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
    const colors = [accent, '#34d399', '#fbbf24', accent, '#818cf8', '#f472b6', accent];
    return Array.from({ length: 24 }, (_, i) => ({
      id: i,
      color: colors[i % colors.length],
      x: Math.random() * 100,
      delay: Math.random() * 0.6,
      duration: 1.5 + Math.random() * 1.5,
      size: 4 + Math.random() * 4,
    }));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl z-50">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${p.x}%`,
            top: '-8px',
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(320px) rotate(720deg); opacity: 0; }
        }
        .animate-confetti-fall {
          animation-name: confetti-fall;
          animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
          animation-fill-mode: forwards;
        }
      `}</style>
    </div>
  );
};

export default OnboardingChecklist;
