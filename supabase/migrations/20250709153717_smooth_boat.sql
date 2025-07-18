/*
  # Criar bucket de storage para imagens dos tutoriais

  1. Novo Bucket
    - `tutorial-images` para armazenar imagens dos tutoriais
    
  2. Políticas de Storage
    - Permitir upload de imagens para usuários autenticados
    - Permitir leitura pública das imagens
    - Restringir tipos de arquivo a imagens
*/

-- Criar bucket para imagens dos tutoriais
INSERT INTO storage.buckets (id, name, public)
VALUES ('tutorial-images', 'tutorial-images', true)
ON CONFLICT (id) DO NOTHING;

-- Política para permitir upload de imagens
CREATE POLICY "Permitir upload de imagens para todos"
ON storage.objects FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'tutorial-images' AND
  (storage.extension(name) = 'jpg' OR 
   storage.extension(name) = 'jpeg' OR 
   storage.extension(name) = 'png' OR 
   storage.extension(name) = 'gif' OR 
   storage.extension(name) = 'webp')
);

-- Política para permitir leitura pública das imagens
CREATE POLICY "Permitir leitura pública de imagens"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'tutorial-images');

-- Política para permitir atualização de imagens
CREATE POLICY "Permitir atualização de imagens para todos"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'tutorial-images');

-- Política para permitir exclusão de imagens
CREATE POLICY "Permitir exclusão de imagens para todos"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'tutorial-images');