/*
  # Criar tabela de logs do hotel

  1. Nova Tabela
    - `logs`
      - `id` (uuid, chave primária)
      - `receptionist` (texto, nome do recepcionista)
      - `start_time` (timestamp com timezone)
      - `end_time` (timestamp com timezone, opcional)
      - `status` (texto, 'active' ou 'completed')
      - `created_at` (timestamp com timezone)

    - `log_entries`
      - `id` (uuid, chave primária)
      - `log_id` (uuid, chave estrangeira para logs)
      - `text` (texto, conteúdo da entrada)
      - `timestamp` (timestamp com timezone)
      - `created_at` (timestamp com timezone)

  2. Segurança
    - Habilitar RLS em ambas as tabelas
    - Políticas para permitir leitura/escrita para usuários autenticados
*/

-- Criar tabela de logs
CREATE TABLE IF NOT EXISTS logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receptionist text NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  status text NOT NULL CHECK (status IN ('active', 'completed')),
  created_at timestamptz DEFAULT now()
);

-- Criar tabela de entradas de log
CREATE TABLE IF NOT EXISTS log_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  log_id uuid REFERENCES logs(id) ON DELETE CASCADE,
  text text NOT NULL,
  timestamp timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

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