# 🚨 Solução Completa para MCP do Supabase no Cursor (Windows)

## ❌ Problema Identificado
O Cursor está usando cache da configuração antiga, mesmo após alterações no arquivo `.cursor/mcp.json`.

## ✅ Solução Passo a Passo

### 1️⃣ **Feche COMPLETAMENTE o Cursor**
- Feche todas as janelas do Cursor
- Verifique no Gerenciador de Tarefas se não há processos do Cursor rodando

### 2️⃣ **Limpe o Cache do Cursor** 
Execute no PowerShell (como Administrador):
```powershell
# Pare todos os processos do Cursor
Get-Process -Name "*cursor*" -ErrorAction SilentlyContinue | Stop-Process -Force

# Limpe o cache MCP (substitua SEU_USUARIO pelo seu nome de usuário)
Remove-Item -Path "$env:APPDATA\Cursor\User\workspaceStorage" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$env:APPDATA\Cursor\logs" -Recurse -Force -ErrorAction SilentlyContinue
```

### 3️⃣ **Verificar se o MCP Server está instalado**
```powershell
# Verificar instalação
npm list -g @supabase/mcp-server-supabase

# Se não estiver, instalar
npm install -g @supabase/mcp-server-supabase@latest
```

### 4️⃣ **Configuração Final** 
O arquivo `.cursor/mcp.json` já foi atualizado com:
```json
{
  "mcpServers": {
    "supabase": {
      "command": "powershell.exe",
      "args": [
        "-NoProfile",
        "-Command",
        "$env:SUPABASE_ACCESS_TOKEN='sbp_c44608e46854c74e66db7fe1a2cdc3b2c448cf11'; & 'C:\\Users\\Jean\\AppData\\Roaming\\npm\\mcp-server-supabase.cmd' --read-only --project-ref=rdrtbcnxxdjljbxmmkcj"
      ]
    }
  }
}
```

### 5️⃣ **Reiniciar e Verificar**
1. **Abra o Cursor novamente**
2. Vá em **Settings → MCP**
3. Verifique se o servidor "supabase" está **VERDE** (Ativo)
4. Se ainda estiver vermelho, clique em **Restart** no servidor

### 6️⃣ **Teste no Chat**
Abra o chat do Cursor e teste:
```
"Conecte-se ao meu projeto Supabase e mostre as configurações"
"Liste as tabelas do meu banco de dados"
```

## 🔧 Solução Alternativa (Se não funcionar)

Se ainda houver problemas, use esta configuração mais robusta:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "cmd.exe",
      "args": [
        "/c",
        "set SUPABASE_ACCESS_TOKEN=sbp_c44608e46854c74e66db7fe1a2cdc3b2c448cf11 && C:\\Users\\Jean\\AppData\\Roaming\\npm\\mcp-server-supabase.cmd --read-only --project-ref=rdrtbcnxxdjljbxmmkcj"
      ]
    }
  }
}
```

## ⚠️ Troubleshooting

### Erro "No server info found"
- **Causa**: Cache do Cursor ou processo do MCP não iniciou
- **Solução**: Seguir passos 1 e 2 acima

### Erro "Cannot find module"
- **Causa**: Dependências do Deno corrompidas
- **Solução**: 
  ```powershell
  npm cache clean --force
  npm install -g @supabase/mcp-server-supabase@latest --force
  ```

### Server aparece vermelho
- **Causa**: Comando não encontrado ou variável de ambiente
- **Solução**: Usar configuração alternativa acima

## 📋 Checklist Final
- [ ] Cursor completamente fechado
- [ ] Cache limpo
- [ ] MCP Server instalado globalmente  
- [ ] Arquivo `.cursor/mcp.json` atualizado
- [ ] Cursor reiniciado
- [ ] Status MCP verde
- [ ] Teste no chat funcionando

---
**Se seguir todos os passos, o MCP deve funcionar perfeitamente!** 🎉 