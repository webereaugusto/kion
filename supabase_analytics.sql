-- =====================================================
-- KION CLM - Analytics (Page Visits Tracking)
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- Criar tabela de visitas
CREATE TABLE IF NOT EXISTS page_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path VARCHAR(500) NOT NULL,
  page_title VARCHAR(255),
  visitor_ip VARCHAR(50),
  visitor_country VARCHAR(100),
  visitor_city VARCHAR(100),
  visitor_region VARCHAR(100),
  user_agent TEXT,
  referrer VARCHAR(500),
  session_id UUID NOT NULL,
  device_type VARCHAR(20), -- desktop, mobile, tablet
  browser VARCHAR(50),
  os VARCHAR(50),
  visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance nas queries de analytics
CREATE INDEX IF NOT EXISTS idx_page_visits_visited_at ON page_visits(visited_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_visits_page_path ON page_visits(page_path);
CREATE INDEX IF NOT EXISTS idx_page_visits_session_id ON page_visits(session_id);
CREATE INDEX IF NOT EXISTS idx_page_visits_country ON page_visits(visitor_country);

-- Habilitar RLS (Row Level Security)
ALTER TABLE page_visits ENABLE ROW LEVEL SECURITY;

-- Criar políticas permissivas para acesso anônimo
CREATE POLICY "Allow anonymous insert visits" ON page_visits FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous read visits" ON page_visits FOR SELECT USING (true);

-- =====================================================
-- VIEWS PARA ANALYTICS (Facilitam as consultas)
-- =====================================================

-- View: Visitas por dia
CREATE OR REPLACE VIEW visits_by_day AS
SELECT 
  DATE(visited_at) as visit_date,
  COUNT(*) as total_visits,
  COUNT(DISTINCT session_id) as unique_visitors
FROM page_visits
WHERE visited_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(visited_at)
ORDER BY visit_date DESC;

-- View: Páginas mais visitadas
CREATE OR REPLACE VIEW top_pages AS
SELECT 
  page_path,
  page_title,
  COUNT(*) as visits,
  COUNT(DISTINCT session_id) as unique_visitors
FROM page_visits
WHERE visited_at >= NOW() - INTERVAL '30 days'
GROUP BY page_path, page_title
ORDER BY visits DESC
LIMIT 20;

-- View: Origem geográfica
CREATE OR REPLACE VIEW visits_by_country AS
SELECT 
  COALESCE(visitor_country, 'Desconhecido') as country,
  COALESCE(visitor_city, 'Desconhecido') as city,
  COUNT(*) as visits,
  COUNT(DISTINCT session_id) as unique_visitors
FROM page_visits
WHERE visited_at >= NOW() - INTERVAL '30 days'
GROUP BY visitor_country, visitor_city
ORDER BY visits DESC
LIMIT 50;

-- View: Dispositivos
CREATE OR REPLACE VIEW visits_by_device AS
SELECT 
  COALESCE(device_type, 'unknown') as device,
  COALESCE(browser, 'unknown') as browser,
  COUNT(*) as visits
FROM page_visits
WHERE visited_at >= NOW() - INTERVAL '30 days'
GROUP BY device_type, browser
ORDER BY visits DESC;

-- =====================================================
-- FUNÇÃO PARA LIMPAR DADOS ANTIGOS (opcional)
-- =====================================================

CREATE OR REPLACE FUNCTION cleanup_old_visits()
RETURNS void AS $$
BEGIN
  DELETE FROM page_visits WHERE visited_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Verificar se a tabela foi criada
SELECT 'Tabela page_visits criada com sucesso!' as status;
