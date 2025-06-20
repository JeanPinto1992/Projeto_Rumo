-- SQL para inserir dados dos Impostos - Ano 2024
-- Execute este script para adicionar os dados de impostos de 2024
-- ESTRUTURA: categoria, ano, "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"

-- IMPOSTOS TOTAIS
INSERT INTO impostos (categoria, ano, "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro")
VALUES ('Impostos', 2024, 108850.26, 172348.02, 176007.70, 191718.59, 199735.34, 196849.82, 202592.63, 179637.01, 220350.76, 181228.12, 164101.16, 211794.93);

-- Verificar se os dados foram inseridos corretamente
SELECT 
    categoria,
    "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho", 
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
    ano
FROM impostos 
WHERE ano = 2024 
ORDER BY categoria;

-- Calcular totais e médias
SELECT 
    categoria,
    ("Janeiro" + "Fevereiro" + "Marco" + "Abril" + "Maio" + "Junho" + 
     "Julho" + "Agosto" + "Setembro" + "Outubro" + "Novembro" + "Dezembro") as Total_Anual,
    ROUND(("Janeiro" + "Fevereiro" + "Marco" + "Abril" + "Maio" + "Junho" + 
           "Julho" + "Agosto" + "Setembro" + "Outubro" + "Novembro" + "Dezembro") / 12, 2) as Media_Mensal
FROM impostos 
WHERE categoria = 'Impostos' AND ano = 2024;

-- Mostrar impostos como % do faturamento (considerando meta de R$ 1.000.000 por mês)
SELECT 
    'Impostos % Faturamento' as categoria,
    ROUND((108850.26 / 1000000.00) * 100, 2) as "Janeiro %",
    ROUND((172348.02 / 1000000.00) * 100, 2) as "Fevereiro %",
    ROUND((176007.70 / 1000000.00) * 100, 2) as "Marco %",
    ROUND((191718.59 / 1000000.00) * 100, 2) as "Abril %",
    ROUND((199735.34 / 1000000.00) * 100, 2) as "Maio %",
    ROUND((196849.82 / 1000000.00) * 100, 2) as "Junho %",
    ROUND((202592.63 / 1000000.00) * 100, 2) as "Julho %",
    ROUND((179637.01 / 1000000.00) * 100, 2) as "Agosto %",
    ROUND((220350.76 / 1000000.00) * 100, 2) as "Setembro %",
    ROUND((181228.12 / 1000000.00) * 100, 2) as "Outubro %",
    ROUND((164101.16 / 1000000.00) * 100, 2) as "Novembro %",
    ROUND((211794.93 / 1000000.00) * 100, 2) as "Dezembro %"; 