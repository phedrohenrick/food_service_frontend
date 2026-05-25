import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../../shared/services/api';

const formatElapsed = (openedAt) => {
  if (!openedAt) return '';
  const diff = Math.floor((Date.now() - new Date(openedAt).getTime()) / 1000);
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  if (h > 0) return `${h}h ${m}min`;
  return `${m}min`;
};

const formatCurrency = (n) =>
  (Number(n) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function GarcomMesas({ slug }) {
  const navigate = useNavigate();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.get('/tables');
        setTables((data || []).slice().sort((a, b) => a.number - b.number));
      } catch (e) {
        setError('Não foi possível carregar as mesas');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleTableClick = (table) => {
    navigate(`/${slug}/garcom/mesa/${table.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-700 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-lg mx-auto">
        <div className="mb-6 pt-4">
          <h1 className="text-2xl font-bold text-gray-900">Mesas</h1>
          <p className="text-sm text-gray-500 mt-1">Toque para abrir ou acessar uma comanda</p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {tables.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center space-y-2">
            <p className="text-gray-500 font-medium">Nenhuma mesa cadastrada</p>
            <p className="text-sm text-gray-400">Peça ao gerente para cadastrar as mesas</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {tables.map((table) => {
              const occupied = table.status === 'OCCUPIED';
              const tabCount = table.openTabs?.length || 0;
              return (
                <button
                  key={table.id}
                  onClick={() => handleTableClick(table)}
                  className={`relative rounded-2xl border-2 p-5 text-left transition-all duration-200 active:scale-95 ${
                    occupied
                      ? 'border-red-200 bg-red-50 active:bg-red-100'
                      : 'border-green-200 bg-green-50 active:bg-green-100'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${occupied ? 'bg-red-500' : 'bg-green-500'}`} />
                    <span className={`text-xs font-semibold uppercase tracking-wide ${occupied ? 'text-red-600' : 'text-green-700'}`}>
                      {occupied ? 'Ocupada' : 'Livre'}
                    </span>
                  </div>

                  <p className="text-4xl font-bold text-gray-900">{table.number}</p>
                  {table.capacity && (
                    <p className="text-xs text-gray-400 mt-0.5">{table.capacity} lugares</p>
                  )}

                  {occupied && table.currentTabTotal != null && (
                    <div className="mt-3 space-y-0.5">
                      <p className="text-sm font-bold text-red-700">{formatCurrency(table.currentTabTotal)}</p>
                      <p className="text-xs text-gray-500">
                        {tabCount > 1
                          ? `${tabCount} comandas · ${formatElapsed(table.openedAt)}`
                          : formatElapsed(table.openedAt)}
                      </p>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
