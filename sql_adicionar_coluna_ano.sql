-- Adicionar coluna ano em todas as tabelas (se não existir)

-- Tabela administrativo
ALTER TABLE administrativo ADD COLUMN IF NOT EXISTS ano INTEGER DEFAULT 2025;

-- Tabela almoxarifado
ALTER TABLE almoxarifado ADD COLUMN IF NOT EXISTS ano INTEGER DEFAULT 2025;

-- Tabela faturamento
ALTER TABLE faturamento ADD COLUMN IF NOT EXISTS ano INTEGER DEFAULT 2025;

-- Tabela impostos
ALTER TABLE impostos ADD COLUMN IF NOT EXISTS ano INTEGER DEFAULT 2025;

-- Tabela logistica
ALTER TABLE logistica ADD COLUMN IF NOT EXISTS ano INTEGER DEFAULT 2025;

-- Tabela manutencao
ALTER TABLE manutencao ADD COLUMN IF NOT EXISTS ano INTEGER DEFAULT 2025;

-- Tabela rh_gastos_gerais
ALTER TABLE rh_gastos_gerais ADD COLUMN IF NOT EXISTS ano INTEGER DEFAULT 2025;

-- Tabela rh_custos_totais
ALTER TABLE rh_custos_totais ADD COLUMN IF NOT EXISTS ano INTEGER DEFAULT 2025;

-- Tabela rh_passivo_trabalhista
ALTER TABLE rh_passivo_trabalhista ADD COLUMN IF NOT EXISTS ano INTEGER DEFAULT 2025; 