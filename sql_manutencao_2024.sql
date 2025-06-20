-- SQL para inserir dados da Manutenção - Ano 2024
-- Execute este script para adicionar os dados de manutenção de 2024
-- ESTRUTURA: categoria, ano, "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"

-- MANUTENÇÃO DE MÁQ E EQUIP
INSERT INTO manutencao (categoria, ano, "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro")
VALUES ('MANUTENÇÃO DE MÁQ E EQUIP', 2024, 5424.27, 13483.06, 6921.89, 11737.58, 26020.54, 14720.56, 13581.60, 29626.79, 32347.64, 23450.20, 11048.33, 15505.38);

-- MANUTENÇÃO PREDIAL
INSERT INTO manutencao (categoria, ano, "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro")
VALUES ('MANUTENÇÃO PREDIAL', 2024, 3956.99, 19236.34, 46221.77, 14002.36, 13505.71, 27051.74, 27393.88, 22257.86, 37942.50, 20261.92, 13178.13, 9394.79);

-- Verificar se os dados foram inseridos corretamente
SELECT 
    categoria,
    "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho", 
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
    ano
FROM manutencao 
WHERE ano = 2024 
ORDER BY categoria;

-- Calcular totais por categoria
SELECT 
    categoria,
    ("Janeiro" + "Fevereiro" + "Marco" + "Abril" + "Maio" + "Junho" + 
     "Julho" + "Agosto" + "Setembro" + "Outubro" + "Novembro" + "Dezembro") as Total_Anual,
    ROUND(("Janeiro" + "Fevereiro" + "Marco" + "Abril" + "Maio" + "Junho" + 
           "Julho" + "Agosto" + "Setembro" + "Outubro" + "Novembro" + "Dezembro") / 12, 2) as Media_Mensal
FROM manutencao 
WHERE ano = 2024
ORDER BY Total_Anual DESC;

-- Calcular totais mensais (soma de todas as categorias por mês)
SELECT 
    'TOTAL MANUTENÇÃO' as categoria,
    SUM("Janeiro") as "Janeiro",
    SUM("Fevereiro") as "Fevereiro", 
    SUM("Marco") as "Marco",
    SUM("Abril") as "Abril",
    SUM("Maio") as "Maio",
    SUM("Junho") as "Junho",
    SUM("Julho") as "Julho",
    SUM("Agosto") as "Agosto",
    SUM("Setembro") as "Setembro",
    SUM("Outubro") as "Outubro",
    SUM("Novembro") as "Novembro",
    SUM("Dezembro") as "Dezembro"
FROM manutencao 
WHERE ano = 2024;

-- Análise percentual por categoria
SELECT 
    categoria,
    ROUND((("Janeiro" + "Fevereiro" + "Marco" + "Abril" + "Maio" + "Junho" + 
            "Julho" + "Agosto" + "Setembro" + "Outubro" + "Novembro" + "Dezembro") / 
           (SELECT SUM("Janeiro" + "Fevereiro" + "Marco" + "Abril" + "Maio" + "Junho" + 
                       "Julho" + "Agosto" + "Setembro" + "Outubro" + "Novembro" + "Dezembro")
            FROM manutencao WHERE ano = 2024)) * 100, 2) as "Percentual_Total"
FROM manutencao 
WHERE ano = 2024
ORDER BY "Percentual_Total" DESC;

-- Identificar meses com maiores gastos
SELECT 
    'MAIORES GASTOS MENSAIS' as categoria,
    CASE 
        WHEN SUM("Janeiro") = (SELECT MAX(total_mes) FROM (
            SELECT SUM("Janeiro") as total_mes FROM manutencao WHERE ano = 2024 UNION ALL
            SELECT SUM("Fevereiro") FROM manutencao WHERE ano = 2024 UNION ALL
            SELECT SUM("Marco") FROM manutencao WHERE ano = 2024 UNION ALL
            SELECT SUM("Abril") FROM manutencao WHERE ano = 2024 UNION ALL
            SELECT SUM("Maio") FROM manutencao WHERE ano = 2024 UNION ALL
            SELECT SUM("Junho") FROM manutencao WHERE ano = 2024 UNION ALL
            SELECT SUM("Julho") FROM manutencao WHERE ano = 2024 UNION ALL
            SELECT SUM("Agosto") FROM manutencao WHERE ano = 2024 UNION ALL
            SELECT SUM("Setembro") FROM manutencao WHERE ano = 2024 UNION ALL
            SELECT SUM("Outubro") FROM manutencao WHERE ano = 2024 UNION ALL
            SELECT SUM("Novembro") FROM manutencao WHERE ano = 2024 UNION ALL
            SELECT SUM("Dezembro") FROM manutencao WHERE ano = 2024
        ) as subq) THEN 'Janeiro é o maior'
        ELSE 'Janeiro não é o maior'
    END as "Análise"
FROM manutencao 
WHERE ano = 2024; 