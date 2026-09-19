// Helpers do telefone do cliente (BR): detecção de "faltando", máscara e validação.
// O backend cria usuário novo com o placeholder "0000000000" (coluna NOT NULL),
// então esse valor também conta como "sem telefone".
const PLACEHOLDER = '0000000000';

export function digitsOnly(value) {
  return String(value || '').replace(/\D/g, '');
}

// Considera faltando: vazio, placeholder, ou menos de 10 dígitos.
export function isPhoneMissing(phone) {
  const d = digitsOnly(phone);
  return !d || d === PLACEHOLDER || d.length < 10;
}

// Válido: 10 (fixo) ou 11 (celular) dígitos com DDD.
export function isValidPhone(value) {
  const d = digitsOnly(value);
  return d.length === 10 || d.length === 11;
}

// Máscara enquanto digita: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX.
export function formatPhoneBR(value) {
  const d = digitsOnly(value).slice(0, 11);
  if (d.length === 0) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}
