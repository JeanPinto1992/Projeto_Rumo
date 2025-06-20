-- Script para verificar e garantir estrutura consistente das tabelas

-- Verificar se a coluna 'ano' existe em todas as tabelas
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN (
    'administrativo', 'almoxarifado', 'faturamento', 'impostos', 
    'logistica', 'manutencao', 'rh_gastos_gerais', 'rh_custos_totais', 'rh_passivo_trabalhista'
) 
AND column_name = 'ano'
ORDER BY table_name;

-- Verificar contagem de registros por ano em cada tabela
SELECT 'administrativo' as tabela, ano, COUNT(*) as registros FROM administrativo GROUP BY ano
UNION ALL
SELECT 'almoxarifado' as tabela, ano, COUNT(*) as registros FROM almoxarifado GROUP BY ano
UNION ALL
SELECT 'faturamento' as tabela, ano, COUNT(*) as registros FROM faturamento GROUP BY ano
UNION ALL
SELECT 'impostos' as tabela, ano, COUNT(*) as registros FROM impostos GROUP BY ano
UNION ALL
SELECT 'logistica' as tabela, ano, COUNT(*) as registros FROM logistica GROUP BY ano
UNION ALL
SELECT 'manutencao' as tabela, ano, COUNT(*) as registros FROM manutencao GROUP BY ano
UNION ALL
SELECT 'rh_gastos_gerais' as tabela, ano, COUNT(*) as registros FROM rh_gastos_gerais GROUP BY ano
UNION ALL
SELECT 'rh_custos_totais' as tabela, ano, COUNT(*) as registros FROM rh_custos_totais GROUP BY ano
UNION ALL
SELECT 'rh_passivo_trabalhista' as tabela, ano, COUNT(*) as registros FROM rh_passivo_trabalhista GROUP BY ano
ORDER BY tabela, ano; 