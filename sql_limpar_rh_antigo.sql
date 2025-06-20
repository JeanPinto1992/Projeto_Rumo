-- Script para limpar dados da tabela RH antiga (se existir)
-- Execute apenas se necessário para evitar conflitos

-- Limpar dados da tabela rh antiga
DELETE FROM rh WHERE 1=1;

-- Opcional: Comentar as linhas abaixo se quiser manter a estrutura da tabela
-- DROP TABLE IF EXISTS rh; 