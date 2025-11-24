import React, { createContext, useContext, useMemo } from 'react';

const TenantContext = createContext(null);

const defaultTenant = {
  id: 'tenant-aurora',
  slug: 'aurora-burger',
  name: 'Aurora Burger & Co.',
  mainColor: '#e95510ff',
  logoUrl: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=200&q=80',
  isOpen: true,
};



export const TenantProvider = ({ tenant = defaultTenant, children }) => {
  const accent = tenant.mainColor || '#e95510ff';
  const accentHover = accent.length === 7 ? `${accent}e6` : accent;
  const accentContrast = useMemo(() => getContrast(accent), [accent]);

  const value = useMemo(() => ({ tenant, accent, accentHover, accentContrast }), [tenant, accent, accentHover, accentContrast]);

  return (
    <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
  );
};

export const useTenant = () => useContext(TenantContext);