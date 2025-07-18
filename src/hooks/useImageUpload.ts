import { useState } from 'react';
import { supabase } from '../lib/supabase';

export function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!file) return null;

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Tipo de arquivo não suportado. Use JPG, PNG, GIF ou WebP.');
    }

    // Validar tamanho (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('Arquivo muito grande. Tamanho máximo: 5MB.');
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `tutorials/${fileName}`;

      // Upload do arquivo
      const { data, error } = await supabase.storage
        .from('tutorial-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('tutorial-images')
        .getPublicUrl(filePath);

      setUploadProgress(100);
      return publicUrl;
    } catch (error) {
      console.error('Erro no upload:', error);
      throw error;
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const deleteImage = async (imageUrl: string): Promise<boolean> => {
    try {
      // Extrair o caminho do arquivo da URL
      const urlParts = imageUrl.split('/');
      const bucketIndex = urlParts.findIndex(part => part === 'tutorial-images');
      
      if (bucketIndex === -1) {
        return false; // Não é uma imagem do nosso bucket
      }

      const filePath = urlParts.slice(bucketIndex + 1).join('/');

      const { error } = await supabase.storage
        .from('tutorial-images')
        .remove([filePath]);

      if (error) {
        console.error('Erro ao deletar imagem:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao deletar imagem:', error);
      return false;
    }
  };

  return {
    uploadImage,
    deleteImage,
    isUploading,
    uploadProgress
  };
}