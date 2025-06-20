-- Script SQL para inserir dados na tabela logística
-- Dados baseados na planilha fornecida

TRUNCATE TABLE logistica RESTART IDENTITY;

INSERT INTO logistica (
    categoria, 
    "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
    "Total_Anual", 
    ano
) VALUES 
-- COMBUSTÍVEL
('COMBUSTÍVEL', 6365.43, 11613.47, 7928.02, 7871.47, 6189.68, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 39968.07, 2024),

-- GÁS EMPILHADEIRA  
('GÁS EMPILHADEIRA', 5085.35, 3364.00, 2960.32, 3954.16, 3070.32, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 18434.15, 2024),

-- MANUTENÇÃO DE EMPILHADEIRAS
('MANUTENÇÃO DE EMPILHADEIRAS', 1824.76, 813.42, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 2638.18, 2024),

-- DESP COM VIAGEM
('DESP COM VIAGEM', 2407.46, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 2407.46, 2024),

-- FRETES TERCEIROS
('FRETES TERCEIROS', 45.00, 0.00, 1020.00, 1000.00, 1000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3065.00, 2024),

-- MANUTENÇÃO VEÍCULOS
('MANUTENÇÃO VEÍCULOS', 6089.40, 318.00, 3835.00, 6639.01, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 16881.41, 2024),

-- SEGUROS VEÍCULOS
('SEGUROS VEÍCULOS', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 2024),

-- MULTAS/IPVA/LICENCIAMENTO  
('MULTAS/IPVA/LICENCIAMENTO', 2613.60, 0.00, 264.21, 19464.64, 10260.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 32602.45, 2024);

-- Verificar inserção
SELECT 
    categoria,
    "Janeiro", "Fevereiro", "Marco", "Abril", "Maio",
    "Total_Anual"
FROM logistica 
ORDER BY categoria; 