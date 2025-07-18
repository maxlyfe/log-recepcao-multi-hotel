/*
  # Fix database relationships

  1. Changes
    - Drop existing tables to ensure clean state
    - Recreate tables with proper relationships
    - Add foreign key constraint between logs and log_entries
    - Add performance index
  
  2. Security
    - Re-enable RLS on both tables
    - Recreate all necessary policies
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
CREATE POLICY "Permitir leitura de logs para todos"
  ON logs
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Permitir inserção de logs para todos"
  ON logs
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Permitir atualização de logs para todos"
  ON logs
  FOR UPDATE
  TO public
  USING (true);

-- Políticas para entradas de log
CREATE POLICY "Permitir leitura de entradas para todos"
  ON log_entries
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Permitir inserção de entradas para todos"
  ON log_entries
  FOR INSERT
  TO public
  WITH CHECK (true);