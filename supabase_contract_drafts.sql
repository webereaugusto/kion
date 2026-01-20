-- =====================================================
-- KION CLM - Contract Drafts (Gerador de Contratos)
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- Criar tabela de rascunhos de contratos
CREATE TABLE IF NOT EXISTS contract_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  contract_type VARCHAR(50) NOT NULL, -- Venda, Locação, Manutenção, Automação, Comodato
  equipment_category VARCHAR(100), -- Empilhadeiras, Transpaleteiras, AGVs, Sistemas Dematic
  brand VARCHAR(50), -- Linde, STILL, Baoli, Dematic
  
  -- Dados do Cliente
  client_name VARCHAR(255) NOT NULL,
  client_cnpj VARCHAR(20),
  client_address TEXT,
  client_contact_name VARCHAR(255),
  client_contact_email VARCHAR(255),
  client_contact_phone VARCHAR(30),
  
  -- Detalhes do Contrato
  equipment_description TEXT,
  equipment_quantity INT DEFAULT 1,
  value NUMERIC(15,2) NOT NULL DEFAULT 0,
  payment_terms TEXT,
  duration_months INT,
  start_date DATE,
  warranty_months INT DEFAULT 12,
  
  -- Cláusulas e IA
  clauses JSONB DEFAULT '[]'::jsonb,
  ai_suggestions JSONB DEFAULT '[]'::jsonb,
  custom_terms TEXT,
  
  -- Workflow
  status VARCHAR(30) NOT NULL DEFAULT 'Rascunho', -- Rascunho, Aguardando Aprovação, Aprovado, Rejeitado
  share_token UUID DEFAULT gen_random_uuid(),
  approved_by JSONB DEFAULT '[]'::jsonb,
  rejection_reason TEXT,
  
  -- Metadados
  created_by VARCHAR(255) DEFAULT 'Sistema',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_contract_drafts_status ON contract_drafts(status);
CREATE INDEX IF NOT EXISTS idx_contract_drafts_contract_type ON contract_drafts(contract_type);
CREATE INDEX IF NOT EXISTS idx_contract_drafts_share_token ON contract_drafts(share_token);
CREATE INDEX IF NOT EXISTS idx_contract_drafts_created_at ON contract_drafts(created_at DESC);

-- Habilitar RLS (Row Level Security)
ALTER TABLE contract_drafts ENABLE ROW LEVEL SECURITY;

-- Criar políticas permissivas para acesso anônimo (demo)
CREATE POLICY "Allow anonymous read drafts" ON contract_drafts FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert drafts" ON contract_drafts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update drafts" ON contract_drafts FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete drafts" ON contract_drafts FOR DELETE USING (true);

-- =====================================================
-- DADOS DE DEMONSTRAÇÃO
-- =====================================================

INSERT INTO contract_drafts (
  title, contract_type, equipment_category, brand,
  client_name, client_cnpj, client_address, client_contact_name, client_contact_email,
  equipment_description, equipment_quantity, value, payment_terms, duration_months, start_date, warranty_months,
  clauses, status, created_by
) VALUES 
(
  'Locação de Empilhadeiras Linde E20 - Magazine Luiza',
  'Locação',
  'Empilhadeiras Elétricas',
  'Linde',
  'Magazine Luiza S.A.',
  '47.960.950/0001-21',
  'Rua Voluntários da Franca, 1465 - Franca/SP - CEP 14400-000',
  'Carlos Eduardo Silva',
  'carlos.silva@magazineluiza.com.br',
  'Empilhadeira Elétrica Linde E20, capacidade 2.000kg, torre triplex 4.800mm, garfos de 1.150mm, bateria 48V/620Ah com carregador HF incluso. Equipamento com sistema de gestão de frota Linde connect.',
  5,
  45000.00,
  'Pagamento mensal via boleto bancário, vencimento todo dia 15. Reajuste anual pelo IGPM.',
  36,
  '2025-02-01',
  12,
  '[
    {"number": 1, "title": "Objeto", "content": "O presente contrato tem por objeto a locação de 5 (cinco) empilhadeiras elétricas marca Linde, modelo E20, conforme especificações técnicas em anexo."},
    {"number": 2, "title": "Prazo", "content": "O prazo de locação é de 36 (trinta e seis) meses, iniciando-se em 01/02/2025 e terminando em 31/01/2028, podendo ser prorrogado mediante acordo entre as partes."},
    {"number": 3, "title": "Valor e Pagamento", "content": "O valor mensal da locação é de R$ 45.000,00 (quarenta e cinco mil reais), totalizando R$ 9.000,00 por equipamento/mês. O pagamento deverá ser efetuado até o dia 15 de cada mês."},
    {"number": 4, "title": "Manutenção", "content": "A LOCADORA será responsável pela manutenção preventiva e corretiva dos equipamentos durante todo o período de locação, incluindo reposição de peças de desgaste natural."},
    {"number": 5, "title": "Seguro", "content": "Os equipamentos serão segurados pela LOCADORA contra danos materiais, incêndio e roubo. Danos causados por mau uso serão de responsabilidade da LOCATÁRIA."},
    {"number": 6, "title": "Treinamento", "content": "A LOCADORA fornecerá treinamento inicial para até 10 operadores, com certificação conforme NR-11."}
  ]'::jsonb,
  'Aguardando Aprovação',
  'Jurídico KION'
),
(
  'Projeto de Automação Dematic - Centro de Distribuição Amazon',
  'Automação',
  'Sistemas Dematic',
  'Dematic',
  'Amazon Servicos de Varejo do Brasil Ltda.',
  '15.436.940/0001-03',
  'Av. Presidente Juscelino Kubitschek, 2041 - São Paulo/SP - CEP 04543-011',
  'Rodrigo Mendes',
  'rmendes@amazon.com',
  'Sistema completo de automação para centro de distribuição incluindo: 120 metros de esteira transportadora Dematic, 4 sorters automáticos de alta velocidade (300 pacotes/min), sistema de controle WCS integrado com WMS, 8 estações de picking automatizadas com Put-to-Light.',
  1,
  8500000.00,
  'Pagamento conforme cronograma de entregas: 30% na assinatura, 40% na entrega dos equipamentos, 20% no comissionamento, 10% após aceite final.',
  18,
  '2025-03-01',
  24,
  '[
    {"number": 1, "title": "Objeto", "content": "Fornecimento, instalação e comissionamento de sistema de automação logística Dematic para o Centro de Distribuição da CONTRATANTE localizado em Cajamar/SP."},
    {"number": 2, "title": "Escopo Técnico", "content": "O escopo inclui: projeto executivo, fornecimento de todos os equipamentos e componentes, instalação mecânica e elétrica, integração com sistemas existentes, testes e comissionamento, treinamento operacional."},
    {"number": 3, "title": "Cronograma", "content": "Prazo total de 18 meses: Fase 1 - Projeto (3 meses), Fase 2 - Fabricação (6 meses), Fase 3 - Instalação (6 meses), Fase 4 - Comissionamento (3 meses)."},
    {"number": 4, "title": "Valor e Condições", "content": "Valor total de R$ 8.500.000,00 com pagamentos atrelados às entregas conforme cronograma físico-financeiro em anexo."},
    {"number": 5, "title": "Garantia e Suporte", "content": "Garantia de 24 meses após aceite final. Suporte técnico 24x7 durante a garantia. Contrato de manutenção opcional após período de garantia."},
    {"number": 6, "title": "Penalidades", "content": "Multa de 0,5% por dia de atraso sobre o valor da fase em questão, limitada a 10%. A CONTRATANTE poderá rescindir o contrato se o atraso ultrapassar 60 dias."},
    {"number": 7, "title": "Propriedade Intelectual", "content": "Todo software customizado desenvolvido especificamente para este projeto será de propriedade da CONTRATANTE. Software padrão Dematic permanece propriedade da CONTRATADA."}
  ]'::jsonb,
  'Aprovado',
  'Engenharia KION'
),
(
  'Contrato de Manutenção Full Service - Frota STILL',
  'Manutenção',
  'Empilhadeiras e Transpaleteiras',
  'STILL',
  'Ambev S.A.',
  '07.526.557/0001-00',
  'Rua Dr. Renato Paes de Barros, 1017 - São Paulo/SP - CEP 04530-001',
  'Fernanda Oliveira',
  'fernanda.oliveira@ambev.com.br',
  'Contrato de manutenção Full Service para frota de 45 equipamentos STILL: 20 empilhadeiras RX20, 15 empilhadeiras RX60, 10 transpaleteiras EXU-S. Inclui manutenção preventiva, corretiva, peças de reposição e gerenciamento de frota.',
  45,
  32000.00,
  'Pagamento mensal fixo via boleto, vencimento dia 10. Valor inclui todas as manutenções e peças. Reajuste anual pelo IPCA.',
  48,
  '2025-01-15',
  0,
  '[
    {"number": 1, "title": "Objeto", "content": "Prestação de serviços de manutenção Full Service para a frota de 45 equipamentos STILL da CONTRATANTE, conforme relação em anexo."},
    {"number": 2, "title": "Serviços Inclusos", "content": "Manutenção preventiva conforme plano de manutenção do fabricante, manutenção corretiva ilimitada, fornecimento de todas as peças de reposição, atendimento emergencial em até 4 horas, relatórios mensais de performance."},
    {"number": 3, "title": "Disponibilidade", "content": "A CONTRATADA garante disponibilidade mínima de 95% da frota. Equipamentos parados por mais de 48 horas terão desconto proporcional no valor mensal."},
    {"number": 4, "title": "Valor", "content": "Valor mensal fixo de R$ 32.000,00 (aproximadamente R$ 711/equipamento/mês), incluindo todos os serviços e peças descritos."},
    {"number": 5, "title": "Exclusões", "content": "Não estão inclusos: danos causados por acidentes ou mau uso, modificações não autorizadas, pneus e acessórios de desgaste rápido quando por uso impróprio."},
    {"number": 6, "title": "Vigência", "content": "Contrato de 48 meses com possibilidade de rescisão após 24 meses mediante aviso prévio de 90 dias."},
    {"number": 7, "title": "SLA", "content": "Tempo de resposta para chamados: Urgente (equipamento parado) - 4 horas, Normal - 24 horas, Programado - conforme agendamento."}
  ]'::jsonb,
  'Rascunho',
  'Comercial KION'
);

-- Verificar dados inseridos
SELECT id, title, contract_type, brand, client_name, status, value FROM contract_drafts ORDER BY created_at DESC;
