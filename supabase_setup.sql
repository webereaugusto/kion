-- =====================================================
-- KION CLM - Supabase Database Setup
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- Criar tabela de contratos
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_number VARCHAR(50) NOT NULL UNIQUE,
  party_name VARCHAR(255) NOT NULL,
  value NUMERIC(15,2) NOT NULL DEFAULT 0,
  ncm VARCHAR(15) NOT NULL,
  origin_state VARCHAR(15) NOT NULL,
  destination_state VARCHAR(15) NOT NULL,
  operation_type VARCHAR(50) NOT NULL,
  expiry_date DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'Ativo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de histórico de alterações
CREATE TABLE IF NOT EXISTS contract_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  field VARCHAR(50) NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  changed_by VARCHAR(100) DEFAULT 'Sistema'
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_operation_type ON contracts(operation_type);
CREATE INDEX IF NOT EXISTS idx_contract_history_contract_id ON contract_history(contract_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_history ENABLE ROW LEVEL SECURITY;

-- Criar políticas permissivas para acesso anônimo (demo)
CREATE POLICY "Allow anonymous read contracts" ON contracts FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert contracts" ON contracts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update contracts" ON contracts FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete contracts" ON contracts FOR DELETE USING (true);

CREATE POLICY "Allow anonymous read history" ON contract_history FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert history" ON contract_history FOR INSERT WITH CHECK (true);

-- =====================================================
-- DADOS DE DEMONSTRAÇÃO
-- =====================================================

INSERT INTO contracts (contract_number, party_name, value, ncm, origin_state, destination_state, operation_type, expiry_date, status, created_at, updated_at) VALUES
('KSA-2024-001', 'Linde Material Handling LTDA', 1250000.00, '8427.20.10', 'SP', 'MG', 'Venda', '2025-12-31', 'Ativo', NOW() - INTERVAL '6 months', NOW()),
('KSA-2024-002', 'Dematic Brasil Soluções Logísticas', 450000.00, '8428.39.90', 'OUTSIDE_BR', 'SP', 'Importação', '2025-05-15', 'Vencendo', NOW() - INTERVAL '4 months', NOW()),
('KSA-2024-003', 'STILL do Brasil Ltda', 890000.00, '8427.10.19', 'SP', 'AM', 'Venda', '2025-08-20', 'Ativo', NOW() - INTERVAL '3 months', NOW()),
('KSA-2024-004', 'Baoli Empilhadeiras Brasil', 320000.00, '8427.20.90', 'PR', 'SC', 'Locação', '2025-10-30', 'Ativo', NOW() - INTERVAL '2 months', NOW()),
('KSA-2024-005', 'Logística Santos Ltda', 2100000.00, '8428.90.90', 'SP', 'OUTSIDE_BR', 'Exportação', '2025-11-15', 'Ativo', NOW() - INTERVAL '5 months', NOW()),
('KSA-2024-006', 'Toyota Industries Brasil', 1750000.00, '8427.10.11', 'SP', 'RJ', 'Venda', '2025-03-01', 'Vencendo', NOW() - INTERVAL '8 months', NOW()),
('KSA-2024-007', 'Hyster-Yale Brasil', 680000.00, '8427.20.10', 'RS', 'SP', 'Locação', '2025-09-30', 'Ativo', NOW() - INTERVAL '1 month', NOW()),
('KSA-2024-008', 'Crown Equipment do Brasil', 520000.00, '8427.10.19', 'MG', 'GO', 'Comodato', '2024-12-31', 'Encerrado', NOW() - INTERVAL '12 months', NOW()),
('KSA-2024-009', 'Jungheinrich do Brasil', 1450000.00, '8428.33.00', 'OUTSIDE_BR', 'PR', 'Importação', '2025-07-20', 'Ativo', NOW() - INTERVAL '2 months', NOW()),
('KSA-2024-010', 'Clark Material Handling', 380000.00, '8427.90.00', 'SP', 'BA', 'Venda', '2025-04-10', 'Vencendo', NOW() - INTERVAL '3 months', NOW());

-- Verificar dados inseridos
SELECT * FROM contracts ORDER BY created_at DESC;
