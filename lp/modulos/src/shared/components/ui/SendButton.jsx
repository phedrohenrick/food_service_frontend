import React, { useEffect } from 'react';

const STYLE_ID = 'send-button-pulse-keyframes';
const KEYFRAMES_CSS = `
@keyframes sendButtonPulse {
  0%   { box-shadow: 0 0 0 0 color-mix(in srgb, var(--accent) 70%, transparent); }
  70%  { box-shadow: 0 0 0 16px transparent; }
  100% { box-shadow: 0 0 0 0 transparent; }
}
`;

function ensureKeyframes() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = KEYFRAMES_CSS;
  document.head.appendChild(style);
}

export default function SendButton({
  onClick,
  disabled = false,
  loading = false,
  loadingLabel = 'Enviando...',
  className = '',
  children,
}) {
  useEffect(() => {
    ensureKeyframes();
  }, []);

  const isActive = !disabled && !loading;

  const baseStyle = {
    background: 'var(--accent)',
    color: 'var(--accent-contrast)',
  };
  const style = isActive
    ? { ...baseStyle, animation: 'sendButtonPulse 1.5s ease-out infinite' }
    : baseStyle;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      onMouseEnter={(e) => {
        if (isActive) e.currentTarget.style.background = 'var(--accent-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'var(--accent)';
      }}
      className={`relative w-full rounded-2xl font-bold transition-colors disabled:opacity-50 ${
        className || 'py-4 text-base'
      }`}
      style={style}
    >
      {loading ? loadingLabel : children}
    </button>
  );
}
