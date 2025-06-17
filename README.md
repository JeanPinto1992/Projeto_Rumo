# Projeto Rumo

Projeto Rumo é um dashboard em React que demonstra como integrar o Supabase para armazenamento de dados e como publicar o resultado na Vercel. O aplicativo possui abas para diferentes setores (Administrativo, Almoxarifado, Comercial, Manutenção, Logística, Impostos e RH) e cada aba exibe uma tabela editável com valores mensais.

## Estrutura do projeto

O código da aplicação React está em `react-supabase-auth-template/` e utiliza Material UI para a interface. Os principais componentes são:

- **TabbedAdminDashboard**: controla as abas do dashboard.
- **DashboardTable**: tabela editável que carrega e persiste dados no Supabase.
- **supabaseClient.js**: configura o acesso ao Supabase por meio das variáveis de ambiente.

A raiz do repositório contém apenas as dependências utilizadas e o arquivo `vercel.json` para deploy estático.

## Variáveis de ambiente

Defina as credenciais do Supabase conforme o ambiente de execução:

- **Desenvolvimento local**: `REACT_APP_SUPABASE_URL` e `REACT_APP_SUPABASE_ANON_KEY`
- **Deploy na Vercel**: `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Crie um arquivo `.env.local` na pasta `react-supabase-auth-template` com as variáveis de desenvolvimento ou configure-as na Vercel ao fazer o deploy.

## Como executar localmente

1. Acesse a pasta do template:
   ```bash
   cd react-supabase-auth-template
   ```
2. Instale as dependências e inicie o projeto:
   ```bash
   npm install
   npm start
   ```

A aplicação estará disponível em `http://localhost:3000`.

## Deploy na Vercel

O arquivo `vercel.json` já define a pasta de build estático (`react-supabase-auth-template/build`). Para publicar:

1. Importe o repositório na Vercel.
2. Defina as variáveis `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` nas configurações do projeto.
3. A Vercel irá executar o build e servir o conteúdo estático automaticamente.

## Licença

Este projeto é distribuído sem garantia de funcionamento para produção e pode ser utilizado como ponto de partida para estudos ou projetos internos.
