/*
  # Sistema de Tutoriais Interativos

  1. Novas Tabelas
    - `tutorials`
      - `id` (uuid, chave primária)
      - `title` (text, título do tutorial)
      - `description` (text, descrição geral)
      - `hotel_id` (uuid, referência ao hotel)
      - `created_by` (text, criador)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `is_active` (boolean, se está ativo)

    - `tutorial_steps`
      - `id` (uuid, chave primária)
      - `tutorial_id` (uuid, referência ao tutorial)
      - `step_number` (integer, ordem do passo)
      - `title` (text, título do passo)
      - `content` (text, conteúdo/descrição)
      - `image_url` (text, URL da imagem opcional)
      - `question` (text, pergunta interativa opcional)
      - `created_at` (timestamp)

    - `tutorial_step_options`
      - `id` (uuid, chave primária)
      - `step_id` (uuid, referência ao passo)
      - `option_text` (text, texto da opção)
      - `next_step_id` (uuid, próximo passo baseado na resposta)
      - `order_index` (integer, ordem da opção)

  2. Segurança
    - Habilitar RLS em todas as tabelas
    - Políticas para permitir acesso baseado no hotel
*/

-- Criar tabela de tutoriais
CREATE TABLE IF NOT EXISTS tutorials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  hotel_id uuid NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  created_by text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

-- Criar tabela de passos do tutorial
CREATE TABLE IF NOT EXISTS tutorial_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tutorial_id uuid NOT NULL REFERENCES tutorials(id) ON DELETE CASCADE,
  step_number integer NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  image_url text,
  question text,
  created_at timestamptz DEFAULT now()
);

-- Criar tabela de opções dos passos (para ramificações)
CREATE TABLE IF NOT EXISTS tutorial_step_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id uuid NOT NULL REFERENCES tutorial_steps(id) ON DELETE CASCADE,
  option_text text NOT NULL,
  next_step_id uuid REFERENCES tutorial_steps(id),
  order_index integer NOT NULL DEFAULT 0
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_tutorials_hotel_id ON tutorials(hotel_id);
CREATE INDEX IF NOT EXISTS idx_tutorial_steps_tutorial_id ON tutorial_steps(tutorial_id);
CREATE INDEX IF NOT EXISTS idx_tutorial_step_options_step_id ON tutorial_step_options(step_id);

-- Habilitar RLS
ALTER TABLE tutorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutorial_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutorial_step_options ENABLE ROW LEVEL SECURITY;

-- Políticas para tutoriais
CREATE POLICY "Permitir leitura de tutoriais para todos"
  ON tutorials
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Permitir inserção de tutoriais para todos"
  ON tutorials
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Permitir atualização de tutoriais para todos"
  ON tutorials
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Permitir exclusão de tutoriais para todos"
  ON tutorials
  FOR DELETE
  TO public
  USING (true);

-- Políticas para passos dos tutoriais
CREATE POLICY "Permitir leitura de passos para todos"
  ON tutorial_steps
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Permitir inserção de passos para todos"
  ON tutorial_steps
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Permitir atualização de passos para todos"
  ON tutorial_steps
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Permitir exclusão de passos para todos"
  ON tutorial_steps
  FOR DELETE
  TO public
  USING (true);

-- Políticas para opções dos passos
CREATE POLICY "Permitir leitura de opções para todos"
  ON tutorial_step_options
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Permitir inserção de opções para todos"
  ON tutorial_step_options
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Permitir atualização de opções para todos"
  ON tutorial_step_options
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Permitir exclusão de opções para todos"
  ON tutorial_step_options
  FOR DELETE
  TO public
  USING (true);