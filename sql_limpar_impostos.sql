-- Script SQL para deletar linha "Impostos" da tabela impostos
-- Use este script caso precise recriar ou corrigir a linha

-- Deletar linha "Impostos" existente
DELETE FROM impostos 
WHERE categoria = 'Impostos';

-- Verificar se foi deletada
SELECT COUNT(*) as total_impostos 
FROM impostos 
WHERE categoria = 'Impostos';

-- Mostrar todas as linhas restantes na tabela impostos
SELECT categoria, "Janeiro", "Total_Anual" 
FROM impostos 
ORDER BY categoria; 