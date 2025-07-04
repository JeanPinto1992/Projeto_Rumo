-- Script SQL para criar e popular a tabela RH_CUSTOS_TOTAIS
-- Baseado nos dados da planilha "CUSTOS TOTAIS MENSAIS COM OS COLABORADORES"

-- ===============================================
-- CRIAR TABELA RH_CUSTOS_TOTAIS
-- ===============================================

CREATE TABLE IF NOT EXISTS rh_custos_totais (
    id BIGINT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    categoria TEXT NOT NULL,
    "Janeiro" NUMERIC DEFAULT 0.00,
    "Fevereiro" NUMERIC DEFAULT 0.00,
    "Marco" NUMERIC DEFAULT 0.00,
    "Abril" NUMERIC DEFAULT 0.00,
    "Maio" NUMERIC DEFAULT 0.00,
    "Junho" NUMERIC DEFAULT 0.00,
    "Julho" NUMERIC DEFAULT 0.00,
    "Agosto" NUMERIC DEFAULT 0.00,
    "Setembro" NUMERIC DEFAULT 0.00,
    "Outubro" NUMERIC DEFAULT 0.00,
    "Novembro" NUMERIC DEFAULT 0.00,
    "Dezembro" NUMERIC DEFAULT 0.00,
    "Total_Anual" NUMERIC DEFAULT 0.00,
    ano INTEGER DEFAULT EXTRACT(year FROM CURRENT_DATE)
);

-- ===============================================
-- INSERIR DADOS EM RH_CUSTOS_TOTAIS
-- ===============================================

INSERT INTO rh_custos_totais (categoria, "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro", "Total_Anual", ano) VALUES
('GASTOS GERAIS', 147323.89, 156399.95, 134216.69, 165648.28, 147700.45, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 751289.27, 2024),
('FÉRIAS/REFLEXOS', 3847.83, 4228.39, 6439.22, 6372.56, 4349.22, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 25237.22, 2024),
('13º/REFLEXOS', 11543.50, 12685.17, 12740.53, 12510.17, 13047.67, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 62527.04, 2024),
('FGTS/REFLEXOS', 1231.31, 1353.08, 1507.95, 1510.62, 1391.75, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 6994.71, 2024),
('SALÁRIOS', 178884.75, 184209.42, 166413.58, 167613.58, 190133.13, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 887254.46, 2024);

-- ===============================================
-- VERIFICAR INSERÇÃO
-- ===============================================

-- Para verificar se os dados foram inseridos corretamente:
-- SELECT categoria, "Total_Anual" FROM rh_custos_totais ORDER BY "Total_Anual" DESC;

-- Para verificar os totais mensais:
-- SELECT 
--   'TOTAL MENSAL' as categoria,
--   SUM("Janeiro") as "Janeiro",
--   SUM("Fevereiro") as "Fevereiro", 
--   SUM("Marco") as "Marco",
--   SUM("Abril") as "Abril",
--   SUM("Maio") as "Maio",
--   SUM("Total_Anual") as "Total_Anual"
-- FROM rh_custos_totais; 

-- SQL para inserir dados de RH Custos Totais - Ano 2024
-- Execute este script para adicionar os dados de custos totais de RH de 2024
-- ESTRUTURA: categoria, ano, "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"

-- GASTOS GERAIS
INSERT INTO rh_custos_totais (categoria, ano, "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro")
VALUES ('GASTOS GERAIS', 2024, 125972.19, 136173.37, 132247.35, 147745.99, 143073.14, 119905.86, 162760.79, 154983.07, 140211.20, 154373.97, 146987.93, 147372.30);

-- FÉRIAS/REFLEXOS
INSERT INTO rh_custos_totais (categoria, ano, "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro")
VALUES ('FÉRIAS/REFLEXOS', 2024, 3067.48, 3176.09, 3170.54, 3488.87, 3206.79, 3846.62, 3568.01, 3623.84, 3834.95, 3629.82, 3681.49, 3881.17);

-- 13º/REFLEXOS
INSERT INTO rh_custos_totais (categoria, ano, "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro")
VALUES ('13º/REFLEXOS', 2024, 9202.44, 9528.27, 9511.61, 10451.61, 9620.36, 11539.85, 10704.02, 10871.52, 11504.85, 10889.46, 11044.46, 11643.50);

-- FGTS/REFLEXOS
INSERT INTO rh_custos_totais (categoria, ano, "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro")
VALUES ('FGTS/REFLEXOS', 2024, 907.37, 0, 0, 0, 0, 3072.03, 2826.08, 2843.94, 2911.50, 2404.69, 2421.22, 2578.13);

-- SALÁRIOS
INSERT INTO rh_custos_totais (categoria, ano, "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro")
VALUES ('SALÁRIOS', 2024, 136190.95, 140127.32, 141927.32, 151684.36, 157176.94, 180168.73, 170138.73, 172148.73, 179748.73, 172364.09, 174224.09, 180589.71);

-- Verificar se os dados foram inseridos corretamente
SELECT 
    categoria,
    "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho", 
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
    ano
FROM rh_custos_totais 
WHERE ano = 2024 
ORDER BY categoria;

-- Calcular totais por categoria
SELECT 
    categoria,
    ("Janeiro" + "Fevereiro" + "Marco" + "Abril" + "Maio" + "Junho" + 
     "Julho" + "Agosto" + "Setembro" + "Outubro" + "Novembro" + "Dezembro") as Total_Anual,
    ROUND(("Janeiro" + "Fevereiro" + "Marco" + "Abril" + "Maio" + "Junho" + 
           "Julho" + "Agosto" + "Setembro" + "Outubro" + "Novembro" + "Dezembro") / 12, 2) as Media_Mensal
FROM rh_custos_totais 
WHERE ano = 2024
ORDER BY Total_Anual DESC;

-- Calcular totais mensais (soma de todas as categorias por mês)
SELECT 
    'TOTAL RH CUSTOS' as categoria,
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
FROM rh_custos_totais 
WHERE ano = 2024;

-- Análise de evolução mensal
SELECT 
    'EVOLUÇÃO CUSTOS TOTAIS' as analise,
    "Janeiro" as Jan,
    "Fevereiro" as Fev,
    "Marco" as Mar,
    "Abril" as Abr,
    "Maio" as Mai,
    "Junho" as Jun,
    "Julho" as Jul,
    "Agosto" as Ago,
    "Setembro" as Set,
    "Outubro" as Out,
    "Novembro" as Nov,
    "Dezembro" as Dez
FROM (
    SELECT 
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
    FROM rh_custos_totais 
    WHERE ano = 2024
) totais; 