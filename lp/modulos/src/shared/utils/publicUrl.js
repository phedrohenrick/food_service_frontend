// Domínio público da loja (vitrine/cardápio que o cliente acessa).
// QR codes e links compartilháveis devem apontar SEMPRE para cá, nunca para o
// host onde o painel está aberto (ex.: localhost:3000 em dev). Mesmo padrão de
// api.js/keycloak.js: env var com fallback de produção.
export const PUBLIC_BASE_URL =
  process.env.REACT_APP_PUBLIC_BASE_URL || 'https://priatoo.com.br';

// Monta uma URL pública da loja a partir de um caminho (ex.: "/pizzaria/app").
export const buildStoreUrl = (path = '') => {
  const clean = String(path || '');
  if (!clean) return PUBLIC_BASE_URL;
  return `${PUBLIC_BASE_URL}${clean.startsWith('/') ? '' : '/'}${clean}`;
};
