-- SQL para inserir dados do Faturamento - Ano 2024
-- Execute este script para adicionar os dados de faturamento de 2024
-- ESTRUTURA: categoria, ano, "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"

-- META DE FATURAMENTO (R$ 1.000.000,00 por mês)
INSERT INTO faturamento (categoria, ano, "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro")
VALUES ('Meta', 2024, 1000000.00, 1000000.00, 1000000.00, 1000000.00, 1000000.00, 1000000.00, 1000000.00, 1000000.00, 1000000.00, 1000000.00, 1000000.00, 1000000.00);

-- FATURAMENTO REALIZADO
INSERT INTO faturamento (categoria, ano, "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro")
VALUES ('Faturamento', 2024, 660566.19, 1055407.34, 1077818.10, 1174026.87, 1223119.04, 1205449.00, 1240616.25, 1100042.91, 1349361.67, 1109786.39, 1004906.06, 1296968.37);

-- Verificar se os dados foram inseridos corretamente
SELECT 
    categoria,
    "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho", 
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
    ano
FROM faturamento 
WHERE ano = 2024 
ORDER BY categoria;

-- Verificar % de atingimento da meta por mês
SELECT 
    'Atingimento %' as categoria,
    ROUND(("Janeiro" / 1000000.00) * 100, 2) as "Janeiro",
    ROUND(("Fevereiro" / 1000000.00) * 100, 2) as "Fevereiro", 
    ROUND(("Marco" / 1000000.00) * 100, 2) as "Marco",
    ROUND(("Abril" / 1000000.00) * 100, 2) as "Abril",
    ROUND(("Maio" / 1000000.00) * 100, 2) as "Maio",
    ROUND(("Junho" / 1000000.00) * 100, 2) as "Junho",
    ROUND(("Julho" / 1000000.00) * 100, 2) as "Julho",
    ROUND(("Agosto" / 1000000.00) * 100, 2) as "Agosto",
    ROUND(("Setembro" / 1000000.00) * 100, 2) as "Setembro",
    ROUND(("Outubro" / 1000000.00) * 100, 2) as "Outubro",
    ROUND(("Novembro" / 1000000.00) * 100, 2) as "Novembro",
    ROUND(("Dezembro" / 1000000.00) * 100, 2) as "Dezembro"
FROM faturamento 
WHERE categoria = 'Faturamento' AND ano = 2024; 