import React, { useEffect, useRef, useState } from 'react';
import api from '../../services/api';
import Button from './Button';

const DEFAULT_OUTPUT_BY_TARGET = {
  banner: { width: 1600, height: 800, label: '2:1' },
  tenant: { width: 1600, height: 900, label: '16:9' },
  'menu-item': { width: 1200, height: 1200, label: '1:1' },
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const R2ImageUpload = ({
  label = 'Imagem',
  value,
  onChange,
  target,
  disabled = false,
  previewClassName = 'h-40 w-full',
  className = '',
  outputWidth,
  outputHeight,
  cropLabel,
}) => {
  const inputRef = useRef(null);
  const viewportRef = useRef(null);
  const imageRef = useRef(null);
  const dragStartRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [cropUrl, setCropUrl] = useState('');
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const output = {
    ...(DEFAULT_OUTPUT_BY_TARGET[target] || DEFAULT_OUTPUT_BY_TARGET['menu-item']),
    ...(outputWidth && outputHeight ? { width: outputWidth, height: outputHeight } : {}),
  };
  const aspectRatio = `${output.width} / ${output.height}`;
  const aspectValue = output.width / output.height;
  const aspectText = cropLabel || output.label || `${output.width}:${output.height}`;

  useEffect(() => {
    return () => {
      if (cropUrl) URL.revokeObjectURL(cropUrl);
    };
  }, [cropUrl]);

  useEffect(() => {
    if (!cropUrl) return undefined;

    const updateViewportSize = () => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      const rect = viewport.getBoundingClientRect();
      setViewportSize({ width: rect.width, height: rect.height });
    };

    updateViewportSize();
    window.addEventListener('resize', updateViewportSize);
    const frame = window.requestAnimationFrame(updateViewportSize);

    return () => {
      window.removeEventListener('resize', updateViewportSize);
      window.cancelAnimationFrame(frame);
    };
  }, [cropUrl]);

  useEffect(() => {
    setOffset((current) => clampCurrentOffset(zoom, current));
    // clampCurrentOffset depends on viewport refs and is intentionally evaluated after layout updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewportSize.width, viewportSize.height, imageSize.width, imageSize.height, zoom]);

  const getViewportMetrics = (nextZoom = zoom, nextOffset = offset) => {
    if (!viewportSize.width || !viewportSize.height || !imageSize.width || !imageSize.height) return null;

    const rect = { width: viewportSize.width, height: viewportSize.height };
    const baseScale = Math.max(rect.width / imageSize.width, rect.height / imageSize.height);
    const renderedWidth = imageSize.width * baseScale * nextZoom;
    const renderedHeight = imageSize.height * baseScale * nextZoom;
    const maxX = Math.max(0, (renderedWidth - rect.width) / 2);
    const maxY = Math.max(0, (renderedHeight - rect.height) / 2);

    return {
      rect,
      baseScale,
      renderedWidth,
      renderedHeight,
      offset: {
        x: clamp(nextOffset.x, -maxX, maxX),
        y: clamp(nextOffset.y, -maxY, maxY),
      },
    };
  };

  const clampCurrentOffset = (nextZoom = zoom, nextOffset = offset) => {
    const metrics = getViewportMetrics(nextZoom, nextOffset);
    return metrics?.offset || { x: 0, y: 0 };
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setError('');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Use uma imagem JPG, PNG ou WEBP.');
      return;
    }

    if (cropUrl) URL.revokeObjectURL(cropUrl);
    const nextUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setSelectedFile(file);
      setCropUrl(nextUrl);
      setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
      setZoom(1);
      setOffset({ x: 0, y: 0 });
    };
    img.onerror = () => {
      URL.revokeObjectURL(nextUrl);
      setError('Não foi possível ler a imagem selecionada.');
    };
    img.src = nextUrl;
  };

  const closeCropper = () => {
    if (cropUrl) URL.revokeObjectURL(cropUrl);
    setSelectedFile(null);
    setCropUrl('');
    setImageSize({ width: 0, height: 0 });
    setViewportSize({ width: 0, height: 0 });
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setIsDragging(false);
  };

  const createCroppedFile = async () => {
    const metrics = getViewportMetrics();
    if (!metrics || !selectedFile || !imageRef.current) {
      throw new Error('Imagem inválida para recorte.');
    }

    const { rect, baseScale, renderedWidth, renderedHeight } = metrics;
    const currentOffset = metrics.offset;
    const scale = baseScale * zoom;
    const left = (rect.width - renderedWidth) / 2 + currentOffset.x;
    const top = (rect.height - renderedHeight) / 2 + currentOffset.y;
    const sx = clamp((0 - left) / scale, 0, imageSize.width);
    const sy = clamp((0 - top) / scale, 0, imageSize.height);
    const sw = clamp(rect.width / scale, 1, imageSize.width - sx);
    const sh = clamp(rect.height / scale, 1, imageSize.height - sy);

    const canvas = document.createElement('canvas');
    canvas.width = output.width;
    canvas.height = output.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imageRef.current, sx, sy, sw, sh, 0, 0, output.width, output.height);

    const blob = await new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/webp', 0.88);
    });

    if (!blob) {
      throw new Error('Não foi possível gerar a imagem recortada.');
    }

    const baseName = selectedFile.name.replace(/\.[^.]+$/, '') || 'imagem';
    return new File([blob], `${baseName}.webp`, { type: 'image/webp' });
  };

  const confirmCropAndUpload = async () => {
    setIsUploading(true);
    setError('');
    try {
      const croppedFile = await createCroppedFile();
      const uploaded = await api.uploadImage(croppedFile, target);
      onChange?.(uploaded.publicUrl, uploaded);
      closeCropper();
    } catch (err) {
      console.error('Image upload failed', err);
      setError('Não foi possível enviar a imagem. Use JPG, PNG ou WEBP dentro do tamanho permitido.');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePointerDown = (event) => {
    if (!cropUrl) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    dragStartRef.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      offset,
    };
    setIsDragging(true);
  };

  const handlePointerMove = (event) => {
    if (!isDragging || !dragStartRef.current) return;
    const dx = event.clientX - dragStartRef.current.pointerX;
    const dy = event.clientY - dragStartRef.current.pointerY;
    const nextOffset = {
      x: dragStartRef.current.offset.x + dx,
      y: dragStartRef.current.offset.y + dy,
    };
    setOffset(clampCurrentOffset(zoom, nextOffset));
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    dragStartRef.current = null;
  };

  const handleZoomChange = (event) => {
    const nextZoom = Number(event.target.value);
    setZoom(nextZoom);
    setOffset((current) => clampCurrentOffset(nextZoom, current));
  };

  const renderMetrics = getViewportMetrics();
  const renderedImageWidth = renderMetrics?.renderedWidth || viewportSize.width || '100%';
  const renderedImageHeight = renderMetrics?.renderedHeight || viewportSize.height || '100%';

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="flex flex-col gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={disabled || isUploading}
          onChange={handleFileChange}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
        />
        {isUploading && (
          <p className="text-xs text-slate-500">Enviando imagem...</p>
        )}
        {error && (
          <p className="text-xs text-red-600">{error}</p>
        )}
        {value && (
          <div className={`overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-inner ${previewClassName}`}>
            <img src={value} alt={label} className="h-full w-full object-cover" />
          </div>
        )}
      </div>

      {cropUrl && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-950/70 px-4 py-4 backdrop-blur-sm">
          <div className="mx-auto flex min-h-full max-w-3xl items-center justify-center">
          <div className="w-full max-h-[calc(100vh-2rem)] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-950">Enquadrar imagem</h3>
                <p className="mt-1 text-sm text-slate-800">
                  Ajuste o zoom e arraste a imagem para definir o que ficará visível. Formato {aspectText}.
                </p>
              </div>
              <button
                type="button"
                onClick={closeCropper}
                className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Fechar
              </button>
            </div>

            <div
              ref={viewportRef}
              className="relative mx-auto mt-4 w-full cursor-grab touch-none overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 active:cursor-grabbing"
              style={{
                aspectRatio,
                maxHeight: '52vh',
                maxWidth: `calc(52vh * ${aspectValue})`,
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              <img
                ref={imageRef}
                src={cropUrl}
                alt="Imagem selecionada"
                draggable={false}
                className="absolute left-1/2 top-1/2 max-w-none select-none"
                style={{
                  width: renderedImageWidth,
                  height: renderedImageHeight,
                  transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
                  transformOrigin: 'center',
                }}
              />
              <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/50" />
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                <span>Zoom</span>
                <span>{Math.round(zoom * 100)}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="3"
                step="0.01"
                value={zoom}
                onChange={handleZoomChange}
                className="w-full accent-[var(--accent)]"
              />
            </div>

            {error && (
              <p className="mt-3 text-sm text-red-600">{error}</p>
            )}

            <div className="mt-4 flex justify-end gap-3">
              <Button variant="ghost" className="border border-slate-200 text-slate-700" onClick={closeCropper}>
                Cancelar
              </Button>
              <Button onClick={confirmCropAndUpload} disabled={isUploading}>
                {isUploading ? 'Enviando...' : 'Usar imagem'}
              </Button>
            </div>
          </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default R2ImageUpload;
