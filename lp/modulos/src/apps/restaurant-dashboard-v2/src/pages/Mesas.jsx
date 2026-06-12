import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../../../shared/services/api';
import { useStorefront } from '../../../../shared/generalContext.jsx';
import { UpgradeCTA, UpgradeRequiredModal } from '../../../../shared/components/ui';
import MesaQrCard from '../components/MesaQrCard';

const formatCurrency = (n) =>
  (Number(n) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const formatElapsed = (openedAt) => {
  if (!openedAt) return '';
  const diff = Math.floor((Date.now() - new Date(openedAt).getTime()) / 1000);
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  if (h > 0) return `${h}h ${m}min`;
  return `${m}min`;
};

const POLLING_INTERVAL = 15000;

export default function Mesas() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tenant, canUseFeature, getEntitlementLimit } = useStorefront();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddTable, setShowAddTable] = useState(false);
  const [qrModalTable, setQrModalTable] = useState(null);
  const [printSheetOpen, setPrintSheetOpen] = useState(false);

  const slug = useMemo(() => {
    const m = /^\/([^/]+)\/dashboard(\/|$)/i.exec(location.pathname || '');
    return m ? m[1] : tenant?.slug || '';
  }, [location.pathname, tenant?.slug]);

  const basePrefix = slug ? `/${slug}/dashboard` : '/dashboard';

  const buildMesaUrl = useCallback(
    (tableId) => `${window.location.origin}/${slug}/mesa/${tableId}`,
    [slug]
  );

  const storeName = tenant?.name || 'Seu restaurante';

  const [newTableNumber, setNewTableNumber] = useState('');
  const [newTableCapacity, setNewTableCapacity] = useState('');
  const [savingTable, setSavingTable] = useState(false);
  const [error, setError] = useState('');
  const [upgradeModal, setUpgradeModal] = useState(null);

  const fetchTables = useCallback(async () => {
    try {
      const data = await api.get('/tables');
      setTables(data || []);
    } catch (e) {
      // silencioso no polling
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTables();
    const interval = setInterval(fetchTables, POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchTables]);

  const buildUpgradePayload = () => {
    const limit = getEntitlementLimit('max_tables');
    return {
      currentUsage: tables.length,
      limit: limit === -1 ? null : limit,
      currentPlan: tenant?.plan_code,
      suggestedPlan: 'MAX',
      featureLabel: 'mesas',
      message: null,
    };
  };

  const openUpgradeForTables = () => {
    setUpgradeModal(buildUpgradePayload());
  };

  const handleNewTableClick = () => {
    const limit = getEntitlementLimit('max_tables');
    const atLimit = limit !== -1 && tables.length >= limit;
    if (atLimit) {
      openUpgradeForTables();
      return;
    }
    setShowAddTable(true);
  };

  const handleUpgradeRedirect = () => {
    setUpgradeModal(null);
    navigate(`${basePrefix}/settings`);
  };

  const handleAddTable = async (e) => {
    e.preventDefault();
    if (!newTableNumber) return;
    setSavingTable(true);
    setError('');
    try {
      await api.post('/tables', {
        number: parseInt(newTableNumber, 10),
        capacity: newTableCapacity ? parseInt(newTableCapacity, 10) : null,
      });
      setNewTableNumber('');
      setNewTableCapacity('');
      setShowAddTable(false);
      await fetchTables();
    } catch (err) {
      const msg = String(err?.message || '');
      const is403 = /\bstatus:\s*403\b/i.test(msg);
      const isFeatureBlock = /feature_not_available/i.test(msg);
      if (is403 && isFeatureBlock) {
        setShowAddTable(false);
        openUpgradeForTables();
      } else {
        setError('Erro ao criar mesa. Verifique se o número já existe.');
      }
    } finally {
      setSavingTable(false);
    }
  };

  const handleDeleteTable = async (id) => {
    if (!window.confirm('Remover esta mesa?')) return;
    try {
      await api.delete(`/tables/${id}`);
      await fetchTables();
    } catch (e) {
      setError('Erro ao remover mesa');
    }
  };

  const freeCount = tables.filter((t) => t.status === 'FREE').length;
  const occupiedCount = tables.filter((t) => t.status === 'OCCUPIED').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-700 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 rounded-2xl" data-wizard="tables-header">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mesas</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {freeCount} livre{freeCount !== 1 ? 's' : ''} &middot; {occupiedCount} ocupada{occupiedCount !== 1 ? 's' : ''}
            {(() => {
              const limit = getEntitlementLimit('max_tables');
              if (limit === -1 || limit <= 0) return null;
              return (
                <span className="ml-2 text-gray-400">
                  &middot; {tables.length}/{limit} no plano
                </span>
              );
            })()}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {tables.length > 0 && (
            <button
              data-wizard="tables-print-qr"
              onClick={() => {
                setPrintSheetOpen(true);
                try {
                  if (tenant?.id) {
                    localStorage.setItem(`onboarding-checklist:${tenant.id}:qr-printed`, '1');
                    window.dispatchEvent(new Event('priatoo:onboarding-progress'));
                  }
                } catch (_) {}
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Imprimir QRs
            </button>
          )}
          <button
            data-wizard="tables-create"
            onClick={handleNewTableClick}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nova mesa
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
          <button className="ml-3 underline" onClick={() => setError('')}>Fechar</button>
        </div>
      )}

      {/* Table Grid */}
      {tables.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 rounded-2xl border-2 border-dashed border-gray-200 text-center space-y-3">
          <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 14h18M10 3v18M14 3v18" />
          </svg>
          <p className="text-gray-500 font-medium">Nenhuma mesa cadastrada</p>
          <p className="text-sm text-gray-400">Clique em "Nova mesa" para começar</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {tables
            .slice()
            .sort((a, b) => a.number - b.number)
            .map((table) => {
              const occupied = table.status === 'OCCUPIED';
              return (
                <div
                  key={table.id}
                  onClick={() => navigate(`${basePrefix}/mesas/${table.id}`)}
                  className={`relative rounded-2xl border-2 p-4 transition-all duration-200 select-none cursor-pointer ${
                    occupied
                      ? 'border-red-200 bg-red-50 hover:shadow-lg hover:border-red-300'
                      : 'border-green-200 bg-green-50 hover:shadow-md hover:border-green-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div
                      className={`w-3 h-3 rounded-full mt-0.5 ${
                        occupied ? 'bg-red-500' : 'bg-green-500'
                      }`}
                    />
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); setQrModalTable(table); }}
                        className="text-gray-400 hover:text-gray-900 transition-colors"
                        title="QR code da mesa"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 4h2m-2-4h2m2 0h2m-2 4h2m-2 2h2" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteTable(table.id); }}
                        className="text-gray-300 hover:text-red-500 transition-colors"
                        title="Remover mesa"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <p className="text-3xl font-bold text-gray-900 mt-2">{table.number}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {table.capacity ? `${table.capacity} lugares` : 'Mesa'}
                  </p>

                  {occupied && (
                    <div className="mt-3 space-y-1">
                      <p className="text-xs font-semibold text-red-700">
                        {formatCurrency(table.currentTabTotal)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {table.openTabs && table.openTabs.length > 1
                          ? `${table.openTabs.length} comandas · ${formatElapsed(table.openedAt)}`
                          : formatElapsed(table.openedAt)}
                      </p>
                    </div>
                  )}

                  {!occupied && (
                    <p className="mt-3 text-xs font-medium text-green-700">Disponível</p>
                  )}
                </div>
              );
            })}
        </div>
      )}

      {/* Add Table Modal */}
      {showAddTable && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setShowAddTable(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-gray-900">Nova mesa</h2>
            <form onSubmit={handleAddTable} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número da mesa *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newTableNumber}
                  onChange={(e) => setNewTableNumber(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="Ex: 1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacidade (opcional)</label>
                <input
                  type="number"
                  min="1"
                  value={newTableCapacity}
                  onChange={(e) => setNewTableCapacity(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="Ex: 4"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddTable(false)}
                  className="flex-1 rounded-2xl border border-gray-200 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingTable}
                  className="flex-1 rounded-2xl bg-gray-900 py-3 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-50"
                >
                  {savingTable ? 'Salvando...' : 'Criar mesa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Single-mesa QR modal */}
      {qrModalTable && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm no-print"
          onClick={() => setQrModalTable(null)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-5 max-h-[95vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">QR da Mesa {qrModalTable.number}</h2>
                <p className="text-sm text-gray-500 mt-0.5">Imprima e coloque na mesa.</p>
              </div>
              <button
                onClick={() => setQrModalTable(null)}
                className="text-gray-400 hover:text-gray-900"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4">
              <MesaQrCard
                url={buildMesaUrl(qrModalTable.id)}
                mesaNumber={qrModalTable.number}
                storeName={storeName}
                qrSize={200}
                compact
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setQrModalTable(null)}
                className="flex-1 rounded-2xl border border-gray-200 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => {
                  setPrintSheetOpen({ singleTableId: qrModalTable.id });
                  setQrModalTable(null);
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-gray-900 py-3 text-sm font-semibold text-white hover:bg-gray-700"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Imprimir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade required modal */}
      <UpgradeRequiredModal
        open={!!upgradeModal}
        onClose={() => setUpgradeModal(null)}
        onUpgrade={handleUpgradeRedirect}
        title="Limite de mesas atingido"
        currentUsage={upgradeModal?.currentUsage}
        limit={upgradeModal?.limit}
        currentPlan={upgradeModal?.currentPlan}
        suggestedPlan={upgradeModal?.suggestedPlan}
        featureLabel={upgradeModal?.featureLabel}
        message={upgradeModal?.message}
      />

      {/* Print sheet — fullscreen grid of QR cards */}
      {printSheetOpen && (
        <PrintSheet
          tables={
            printSheetOpen?.singleTableId
              ? tables.filter((t) => t.id === printSheetOpen.singleTableId)
              : tables.slice().sort((a, b) => a.number - b.number)
          }
          storeName={storeName}
          buildMesaUrl={buildMesaUrl}
          onClose={() => setPrintSheetOpen(false)}
        />
      )}

      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .mesa-qr-print-root, .mesa-qr-print-root * { visibility: visible !important; }
          .mesa-qr-print-root { position: absolute !important; inset: 0 !important; padding: 0 !important; background: white !important; overflow: visible !important; }
          .no-print, .no-print * { display: none !important; }
          @page { size: A4; margin: 12mm; }
        }
      `}</style>
    </div>
  );
}

function PrintSheet({ tables, storeName, buildMesaUrl, onClose }) {
  const single = tables.length === 1;

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto mesa-qr-print-root">
      <div className="no-print sticky top-0 z-10 flex items-center justify-between bg-white border-b border-gray-200 px-6 py-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            {single ? `QR da Mesa ${tables[0]?.number}` : `Imprimir QRs (${tables.length} mesas)`}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Revise abaixo e clique em <span className="font-semibold">Imprimir</span>.
            No diálogo, você também pode salvar como PDF.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Voltar
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimir
          </button>
        </div>
      </div>

      <div className="px-6 py-6">
        <div
          className={`grid gap-6 mx-auto ${
            single
              ? 'grid-cols-1 max-w-sm'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 max-w-4xl'
          }`}
        >
          {tables.map((table) => (
            <MesaQrCard
              key={table.id}
              url={buildMesaUrl(table.id)}
              mesaNumber={table.number}
              storeName={storeName}
              qrSize={single ? 260 : 200}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
