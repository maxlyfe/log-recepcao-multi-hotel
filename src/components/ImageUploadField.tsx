import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Link, Loader2 } from 'lucide-react';
import { useImageUpload } from '../hooks/useImageUpload';

interface ImageUploadFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}

export default function ImageUploadField({ 
  value, 
  onChange, 
  label = "Imagem",
  placeholder = "URL da imagem ou faça upload"
}: ImageUploadFieldProps) {
  const [uploadMode, setUploadMode] = useState<'url' | 'upload'>('url');
  const [previewUrl, setPreviewUrl] = useState(value);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadImage, isUploading, uploadProgress } = useImageUpload();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const uploadedUrl = await uploadImage(file);
      if (uploadedUrl) {
        onChange(uploadedUrl);
        setPreviewUrl(uploadedUrl);
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao fazer upload da imagem');
    }

    // Limpar o input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUrlChange = (url: string) => {
    onChange(url);
    setPreviewUrl(url);
  };

  const clearImage = () => {
    onChange('');
    setPreviewUrl('');
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium">
        <ImageIcon className="h-4 w-4 inline mr-1" />
        {label}
      </label>

      {/* Mode Toggle */}
      <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
        <button
          type="button"
          onClick={() => setUploadMode('url')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            uploadMode === 'url'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <Link className="h-4 w-4 inline mr-2" />
          URL
        </button>
        <button
          type="button"
          onClick={() => setUploadMode('upload')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            uploadMode === 'upload'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <Upload className="h-4 w-4 inline mr-2" />
          Upload
        </button>
      </div>

      {/* URL Input */}
      {uploadMode === 'url' && (
        <div className="relative">
          <input
            type="url"
            value={value}
            onChange={(e) => handleUrlChange(e.target.value)}
            className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder={placeholder}
          />
          {value && (
            <button
              type="button"
              onClick={clearImage}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* File Upload */}
      {uploadMode === 'upload' && (
        <div className="space-y-3">
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isUploading
                ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />
            
            {isUploading ? (
              <div className="space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto" />
                <div className="space-y-2">
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    Fazendo upload...
                  </p>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-blue-600 dark:text-blue-400">
                      Clique para fazer upload
                    </span>{' '}
                    ou arraste uma imagem
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    PNG, JPG, GIF, WebP até 5MB
                  </p>
                </div>
              </div>
            )}
          </div>

          {value && !isUploading && (
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                  <ImageIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-sm text-green-700 dark:text-green-300">
                  Imagem carregada com sucesso
                </span>
              </div>
              <button
                type="button"
                onClick={clearImage}
                className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Image Preview */}
      {previewUrl && !isUploading && (
        <div className="relative">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full max-w-xs h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
            onError={() => setPreviewUrl('')}
          />
          <button
            type="button"
            onClick={clearImage}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}