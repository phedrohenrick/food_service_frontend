import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function MesaQrCard({
  url,
  mesaNumber,
  storeName,
  qrSize = 220,
  compact = false,
}) {
  const displayUrl = (() => {
    try {
      const u = new URL(url);
      return `${u.host}${u.pathname}`;
    } catch (_) {
      return url;
    }
  })();

  return (
    <div
      className={`mesa-qr-card flex flex-col items-center justify-between bg-white text-center ${
        compact ? 'gap-3 p-5' : 'gap-5 p-8'
      }`}
      style={{
        border: '2px dashed #d1d5db',
        borderRadius: 24,
        breakInside: 'avoid',
        pageBreakInside: 'avoid',
      }}
    >
      <div className="space-y-1">
        <p
          className={`font-bold tracking-tight text-gray-900 ${compact ? 'text-sm' : 'text-base'}`}
        >
          {storeName || 'Seu restaurante'}
        </p>
        <p
          className={`uppercase font-semibold tracking-widest ${
            compact ? 'text-[10px]' : 'text-xs'
          }`}
          style={{ color: '#EA1D2C' }}
        >
          Escaneie para pedir
        </p>
      </div>

      <div
        className="rounded-2xl bg-white p-3"
        style={{ border: '1px solid #f3f4f6' }}
      >
        <QRCodeSVG
          value={url}
          size={qrSize}
          level="M"
          includeMargin={false}
          bgColor="#ffffff"
          fgColor="#111827"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline justify-center gap-2">
          <span
            className={`uppercase tracking-widest font-semibold text-gray-500 ${
              compact ? 'text-[10px]' : 'text-xs'
            }`}
          >
            Mesa
          </span>
          <span
            className={`font-extrabold leading-none ${compact ? 'text-3xl' : 'text-5xl'}`}
            style={{ color: '#EA1D2C' }}
          >
            {String(mesaNumber).padStart(2, '0')}
          </span>
        </div>
        <p
          className={`text-gray-400 font-medium break-all ${
            compact ? 'text-[10px]' : 'text-xs'
          }`}
        >
          {displayUrl}
        </p>
      </div>
    </div>
  );
}
