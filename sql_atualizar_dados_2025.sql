-- Atualizar todos os dados existentes para ano 2025

-- Tabela administrativo
UPDATE administrativo SET ano = 2025 WHERE ano IS NULL OR ano = EXTRACT(year FROM CURRENT_DATE);

-- Tabela almoxarifado 
UPDATE almoxarifado SET ano = 2025 WHERE ano IS NULL;

-- Tabela faturamento
UPDATE faturamento SET ano = 2025 WHERE ano IS NULL;

-- Tabela impostos
UPDATE impostos SET ano = 2025 WHERE ano IS NULL;

-- Tabela logistica
UPDATE logistica SET ano = 2025 WHERE ano IS NULL;

-- Tabela manutencao
UPDATE manutencao SET ano = 2025 WHERE ano IS NULL;

-- Tabela rh
UPDATE rh SET ano = 2025 WHERE ano IS NULL;

-- Tabela rh_gastos_gerais
UPDATE rh_gastos_gerais SET ano = 2025 WHERE ano IS NULL OR ano = EXTRACT(year FROM CURRENT_DATE);

-- Tabela rh_custos_totais
UPDATE rh_custos_totais SET ano = 2025 WHERE ano IS NULL OR ano = EXTRACT(year FROM CURRENT_DATE);

-- Tabela rh_passivo_trabalhista
UPDATE rh_passivo_trabalhista SET ano = 2025 WHERE ano IS NULL OR ano = EXTRACT(year FROM CURRENT_DATE); 