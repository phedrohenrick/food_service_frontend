import React, { createContext, useContext, useMemo } from 'react';

const TenantContext = createContext(null);

const defaultTenant = {
  id: 'tenant-aurora',
  slug: 'aurora-burger',
  name: 'Aurora Burger & Co.',
  mainColor: '#EA1D2C',
  logoUrl: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=200&q=80',
  isOpen: true,
};

function getContrast(hex) {
  const normalized = (hex || '').replace('#', '');
  const full = normalized.length === 3
    ? normalized.split('').map((c) => c + c).join('')
    : normalized.padEnd(6, '0');
  const r = parseInt(full.substring(0, 2), 16) / 255;
  const g = parseInt(full.substring(2, 4), 16) / 255;
  const b = parseInt(full.substring(4, 6), 16) / 255;
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.6 ? '#0f172a' : '#ffffff';
}

export const TenantProvider = ({ tenant = defaultTenant, children }) => {
  const accent = tenant.mainColor || '#EA1D2C';
  const accentHover = accent.length === 7 ? `${accent}e6` : accent;
  const accentContrast = useMemo(() => getContrast(accent), [accent]);

  const value = useMemo(() => ({ tenant, accent, accentHover, accentContrast }), [tenant, accent, accentHover, accentContrast]);

  return (
    <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
  );
};

export const useTenant = () => useContext(TenantContext);