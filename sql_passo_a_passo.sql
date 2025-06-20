-- PASSO A PASSO PARA IMPLEMENTAR SISTEMA DE ANOS
-- Execute estes comandos UM DE CADA VEZ na ordem listada

-- PASSO 1: Atualizar dados existentes para 2025
UPDATE administrativo SET ano = 2025 WHERE ano IS NULL OR ano = EXTRACT(year FROM CURRENT_DATE);

-- PASSO 2: Teste com apenas um registro - ÁGUA
INSERT INTO administrativo (categoria, ano, Janeiro, Fevereiro, Marco, Abril, Maio, Junho, Julho, Agosto, Setembro, Outubro, Novembro, Dezembro)
VALUES ('ÁGUA', 2024, 88.16, 88.16, 88.16, 90.43, 90.42, 88.16, 90.68, 124.70, 93.10, 260.03, 315.78, 382.67);

-- PASSO 3: Se funcionou, teste com AECC
INSERT INTO administrativo (categoria, ano, Janeiro, Fevereiro, Marco, Abril, Maio, Junho, Julho, Agosto, Setembro, Outubro, Novembro, Dezembro)
VALUES ('AECC', 2024, 0, 0, 0, 0, 0, 0, 0, 0, 0, 250.00, 250.00, 250.00);

-- PASSO 4: Inserir dados de 2024 - ALMOÇO BRINDES/EVENTOS CLIENTES
INSERT INTO administrativo (categoria, ano, Janeiro, Fevereiro, Marco, Abril, Maio, Junho, Julho, Agosto, Setembro, Outubro, Novembro, Dezembro)
VALUES ('ALMOÇO BRINDES/EVENTOS CLIENTES', 2024, 351.12, 0, 0, 0, 0, 0, 125.00, 0, 497.80, 1644.00, 0, 28000.00);

-- PASSO 5: Inserir dados de 2024 - AMBIENTAL
INSERT INTO administrativo (categoria, ano, Janeiro, Fevereiro, Marco, Abril, Maio, Junho, Julho, Agosto, Setembro, Outubro, Novembro, Dezembro)
VALUES ('AMBIENTAL', 2024, 3443.19, 3758.00, 5766.12, 3226.69, 8525.86, 1495.50, 5692.64, 3024.09, 2424.34, 3075.70, 11748.44, 6045.98);

-- Continue executando os próximos passos conforme necessário...
-- Se algum comando der erro, pare e me informe qual foi o erro

-- Teste estas primeiras inserções primeiro. Se funcionarem, execute o arquivo completo sql_dados_administrativo_2024.sql 