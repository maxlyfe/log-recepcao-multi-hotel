/*
  # Fix table relations

  1. Changes
    - Drop existing tables to ensure clean state
    - Recreate tables with proper foreign key relationship
    - Re-enable RLS and policies
  
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Drop existing tables
DROP TABLE IF EXISTS log_entries;
DROP TABLE IF EXISTS logs;

-- Criar tabela de logs
CREATE TABLE logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receptionist text NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  status text NOT NULL CHECK (status IN ('active', 'completed')),
  created_at timestamptz DEFAULT now()
);

-- Criar tabela de entradas de log com referência explícita
CREATE TABLE log_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  log_id uuid NOT NULL REFERENCES logs(id) ON DELETE CASCADE,
  text text NOT NULL,
  timestamp timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Criar índice para melhorar performance de junções
CREATE INDEX idx_log_entries_log_id ON log_entries(log_id);

-- Habilitar RLS
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_entries ENABLE ROW LEVEL SECURITY;

-- Políticas para logs
CREATE POLICY "Permitir leitura de logs para usuários autenticados"
  ON logs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Permitir inserção de logs para usuários autenticados"
  ON logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Permitir atualização de logs para usuários autenticados"
  ON logs
  FOR UPDATE
  TO authenticated
  USING (true);

-- Políticas para entradas de log
CREATE POLICY "Permitir leitura de entradas para usuários autenticados"
  ON log_entries
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Permitir inserção de entradas para usuários autenticados"
  ON log_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (true);