-- SCRIPT FINAL CORRETO para inserir linha "Impostos"
-- Estrutura correta da tabela impostos (sem Media_Anual e anotacoes)

INSERT INTO impostos (
    categoria, 
    "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
    "Total_Anual", 
    ano
) VALUES (
    'Impostos',
    148569.34,  -- Janeiro: 909.793,88 × 16,33%
    134953.12,  -- Fevereiro: 826.200,31 × 16,33%
    211428.00,  -- Março: 1.293.825,47 × 16,33%
    144343.47,  -- Abril: 883.596,88 × 16,33%
    185152.27,  -- Maio: 1.133.794,20 × 16,33%
    0.00,       -- Junho
    0.00,       -- Julho
    0.00,       -- Agosto
    0.00,       -- Setembro
    0.00,       -- Outubro
    0.00,       -- Novembro
    0.00,       -- Dezembro
    824446.20,  -- Total Anual
    2024
);

-- Verificar inserção
SELECT * FROM impostos WHERE categoria = 'Impostos'; 