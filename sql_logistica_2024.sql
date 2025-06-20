-- SQL para inserir dados da Logística - Ano 2024
-- Execute este script para adicionar os dados de logística de 2024
-- ESTRUTURA: categoria, ano, "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"

-- COMBUSTÍVEL
INSERT INTO logistica (categoria, ano, "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro")
VALUES ('COMBUSTÍVEL', 2024, 6943.10, 7337.44, 7630.82, 7401.95, 12544.45, 10783.87, 9108.36, 9380.26, 7989.92, 8363.88, 7563.81, 4251.05);

-- FRETES TERCEIROS
INSERT INTO logistica (categoria, ano, "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro")
VALUES ('FRETES TERCEIROS', 2024, 11483.15, 15726.64, 26438.88, 61512.22, 28256.77, 25121.60, 181.25, 1090.54, 835.31, 2514.94, 2509.62, 12000.00);

-- MANUTENÇÃO DE VEÍCULOS
INSERT INTO logistica (categoria, ano, "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro")
VALUES ('MANUTENÇÃO DE VEÍCULOS', 2024, 0, 0, 0, 0, 6430.37, 4609.24, 6722.48, 2525.96, 8627.45, 13216.27, 1333.00, 3180.00);

-- MULTAS /IPVA/LICENCIAMENTO
INSERT INTO logistica (categoria, ano, "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro")
VALUES ('MULTAS /IPVA/LICENCIAMENTO', 2024, 0, 0, 197.18, 0, 0, 0, 0, 1313.41, 0, 520.63, 197.18, 0);

-- Verificar se os dados foram inseridos corretamente
SELECT 
    categoria,
    "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho", 
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
    ano
FROM logistica 
WHERE ano = 2024 
ORDER BY categoria;

-- Calcular totais por categoria
SELECT 
    categoria,
    ("Janeiro" + "Fevereiro" + "Marco" + "Abril" + "Maio" + "Junho" + 
     "Julho" + "Agosto" + "Setembro" + "Outubro" + "Novembro" + "Dezembro") as Total_Anual,
    ROUND(("Janeiro" + "Fevereiro" + "Marco" + "Abril" + "Maio" + "Junho" + 
           "Julho" + "Agosto" + "Setembro" + "Outubro" + "Novembro" + "Dezembro") / 12, 2) as Media_Mensal
FROM logistica 
WHERE ano = 2024
ORDER BY Total_Anual DESC;

-- Calcular totais mensais (soma de todas as categorias por mês)
SELECT 
    'TOTAL LOGÍSTICA' as categoria,
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
FROM logistica 
WHERE ano = 2024;

-- Análise percentual por categoria
SELECT 
    categoria,
    ROUND((("Janeiro" + "Fevereiro" + "Marco" + "Abril" + "Maio" + "Junho" + 
            "Julho" + "Agosto" + "Setembro" + "Outubro" + "Novembro" + "Dezembro") / 
           (SELECT SUM("Janeiro" + "Fevereiro" + "Marco" + "Abril" + "Maio" + "Junho" + 
                       "Julho" + "Agosto" + "Setembro" + "Outubro" + "Novembro" + "Dezembro")
            FROM logistica WHERE ano = 2024)) * 100, 2) as "Percentual_Total"
FROM logistica 
WHERE ano = 2024
ORDER BY "Percentual_Total" DESC; 