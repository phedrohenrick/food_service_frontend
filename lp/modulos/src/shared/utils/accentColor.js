const DEFAULT_ACCENT = '#EA1D2C';

const normalizeHex = (input) => {
  const s = String(input || '').trim();
  if (!s) return DEFAULT_ACCENT;
  const maybeHash = s.startsWith('#')
    ? s
    : /^[0-9a-fA-F]{3,8}$/.test(s)
    ? `#${s}`
    : s;
  if (/^#([0-9a-fA-F]{3})$/.test(maybeHash)) {
    const m = maybeHash.slice(1);
    return `#${m.split('').map((c) => c + c).join('')}`;
  }
  if (/^#([0-9a-fA-F]{6})$/.test(maybeHash)) return maybeHash;
  if (/^#([0-9a-fA-F]{8})$/.test(maybeHash)) return `#${maybeHash.slice(1, 7)}`;
  return DEFAULT_ACCENT;
};

const getContrast = (hex) => {
  const normalized = (hex || '').replace('#', '');
  const full = normalized.length === 3
    ? normalized.split('').map((c) => c + c).join('')
    : normalized.padEnd(6, '0');
  const r = parseInt(full.substring(0, 2), 16) / 255;
  const g = parseInt(full.substring(2, 4), 16) / 255;
  const b = parseInt(full.substring(4, 6), 16) / 255;
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.6 ? '#0f172a' : '#ffffff';
};

export function resolveAccent(mainColor) {
  const accent = normalizeHex(mainColor);
  const accentHover = accent.length === 7 ? `${accent}e6` : accent;
  const accentContrast = getContrast(accent);
  return { accent, accentHover, accentContrast };
}

export function accentCssVars(mainColor) {
  const { accent, accentHover, accentContrast } = resolveAccent(mainColor);
  return {
    '--accent': accent,
    '--accent-hover': accentHover,
    '--accent-contrast': accentContrast,
  };
}
