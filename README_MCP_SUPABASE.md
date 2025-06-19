# 🚀 Configuração do Supabase MCP no Cursor

## ✅ Configuração Completa

O projeto foi configurado com o **Supabase MCP (Model Context Protocol)** seguindo a [documentação oficial](https://supabase.com/docs/guides/getting-started/mcp?queryGroups=os&os=windows#cursor).

### 📁 Arquivos Configurados

1. **`.cursor/mcp.json`** - Configuração do servidor MCP
2. **`src/lib/supabaseClient.js`** - Cliente Supabase configurado
3. **`src/LoginPage.jsx`** - Integração com autenticação do Supabase

### 🔧 Detalhes da Configuração (Corrigida)

```json
{
  "mcpServers": {
    "supabase": {
      "command": "node",
      "args": [
        "C:\\Users\\Jean\\AppData\\Roaming\\npm\\node_modules\\@supabase\\mcp-server-supabase\\dist\\transports\\stdio.js",
        "--read-only",
        "--project-ref=rdrtbcnxxdjljbxmmkcj"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "sbp_c44608e46854c74e66db7fe1a2cdc3b2c448cf11"
      }
    }
  }
}
```

### 🛠️ Problemas Resolvidos

1. **Erro de Dependência Deno**: O npx estava causando problemas com `@deno/shim-deno`
2. **Solução**: Instalação global + execução direta via Node.js
3. **Comando executado**: `npm install -g @supabase/mcp-server-supabase@latest`
4. **Cache limpo**: `npm cache clean --force`

### 🔍 Como Verificar se Está Funcionando

1. **Reinicie o Cursor** completamente
2. Vá para **Settings → MCP** no Cursor
3. Você deve ver o servidor "supabase" com status **verde (ativo)**
4. Se aparecer vermelho, verifique se o Node.js está instalado

### 🎯 Funcionalidades Disponíveis

Com o MCP configurado, você pode:

- **Consultar o banco de dados** diretamente pelo chat do Cursor
- **Criar tabelas** e esquemas
- **Executar queries SQL**
- **Gerenciar autenticação**
- **Aplicar migrações**
- **Buscar configurações do projeto**

### 💬 Exemplos de Uso no Chat do Cursor

```
"Mostre-me todas as tabelas do meu banco Supabase"
"Crie uma tabela de usuários com email e senha"
"Execute uma query para buscar todos os usuários"
"Aplique uma migração para adicionar campo created_at"
```

### 🛠️ Projeto Configurado

- **URL**: `https://rdrtbcnxxdjljbxmmkcj.supabase.co`
- **Project ID**: `rdrtbcnxxdjljbxmmkcj`
- **Modo**: Read-only (segurança)
- **Autenticação**: Integrada na LoginPage

### 🔒 Segurança

- Configurado em modo **read-only** por segurança
- Chaves de API não expostas no frontend
- Token de acesso pessoal configurado no MCP

### 📚 Recursos Adicionais

- [Documentação oficial do Supabase MCP](https://supabase.com/docs/guides/getting-started/mcp)
- [Lista completa de ferramentas MCP](https://github.com/supabase/mcp-server-supabase)

---

**Próximos passos**: Teste o MCP no chat do Cursor para interagir com seu banco de dados! 