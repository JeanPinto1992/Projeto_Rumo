-- SQL para inserir dados do Faturamento - Ano 2025
-- Execute este script para adicionar os dados de faturamento de 2025

-- Deletar dados existentes de 2025 se houver
DELETE FROM faturamento WHERE ano = 2025;

-- META DE FATURAMENTO (R$ 1.200.000,00 por mês)
INSERT INTO faturamento (categoria, ano, "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro")
VALUES ('Meta', 2025, 1200000.00, 1200000.00, 1200000.00, 1200000.00, 1200000.00, 1200000.00, 1200000.00, 1200000.00, 1200000.00, 1200000.00, 1200000.00, 1200000.00);

-- FATURAMENTO REALIZADO (apenas primeiros meses de 2025)
INSERT INTO faturamento (categoria, ano, "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro")
VALUES ('Faturamento', 2025, 756789.32, 892156.45, 1023678.90, 0, 0, 0, 0, 0, 0, 0, 0, 0);

-- Verificar se os dados foram inseridos corretamente
SELECT
    categoria,
    "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
    ano
FROM faturamento
WHERE ano = 2025
ORDER BY categoria; 