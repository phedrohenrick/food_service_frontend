import React from 'react';
import { Crown } from 'lucide-react';

const UpgradeCTA = ({ feature, plan = 'PRO', message, compact = false }) => {
  const defaultMessage = `Este recurso requer o plano ${plan}`;

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
        <Crown className="h-3 w-3" />
        {plan}
      </span>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50/50 p-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 mb-4">
        <Crown className="h-7 w-7 text-amber-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        Plano {plan}
      </h3>
      <p className="text-sm text-gray-500 mb-4 max-w-xs">
        {message || defaultMessage}
      </p>
      <a
        href="#plano"
        className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 hover:bg-amber-600 transition-colors"
      >
        <Crown className="h-4 w-4" />
        Fazer upgrade
      </a>
    </div>
  );
};

export default UpgradeCTA;
