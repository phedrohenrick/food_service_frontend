import React, { useEffect, useState } from 'react';

const ImageUpload = ({
  label = 'Imagem',
  value,
  onChange,
  required = false,
  disabled = false,
  className = '',
  accept = 'image/*',
}) => {
  const [preview, setPreview] = useState(value || '');

  useEffect(() => {
    setPreview(value || '');
  }, [value]);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    onChange?.(objectUrl);
  };

  const clearImage = () => {
    setPreview('');
    onChange?.('');
  };

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="flex items-center gap-3">
        <input
          type="file"
          accept={accept}
          onChange={handleFile}
          disabled={disabled}
          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent border-gray-300 bg-white"
        />
        {preview && (
          <button
            type="button"
            onClick={clearImage}
            className="text-sm px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            Remover
          </button>
        )}
      </div>
      {preview && (
        <div className="mt-3 border border-gray-200 rounded-lg p-2 bg-white">
          <img
            src={preview}
            alt="Pré-visualização"
            className="w-full h-32 object-cover rounded"
          />
        </div>
      )}
    </div>
  );
};

export default ImageUpload;

