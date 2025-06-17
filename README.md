# Projeto Rumo

Projeto Rumo é um dashboard em React que demonstra como integrar o Supabase para armazenamento de dados e como publicar o resultado na Vercel. O aplicativo possui abas para diferentes setores (Administrativo, Almoxarifado, Comercial, Manutenção, Logística, Impostos e RH) e cada aba exibe uma tabela editável com valores mensais.

## Estrutura do projeto

- **client/**: aplicação React responsável pela interface.
- **server/**: servidor Node/Express que serve os arquivos estáticos da build React.

Os principais componentes da aplicação são:

- **TabbedAdminDashboard**: controla as abas do dashboard.
- **DashboardTable**: tabela editável que carrega e persiste dados no Supabase.
- **supabaseClient.js**: configura o acesso ao Supabase por meio das variáveis de ambiente.

## Variáveis de ambiente

Defina as credenciais do Supabase conforme o ambiente de execução:

- **Desenvolvimento local**: `REACT_APP_SUPABASE_URL` e `REACT_APP_SUPABASE_ANON_KEY`
- **Deploy na Vercel**: `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Crie um arquivo `.env.local` na pasta `client` com as variáveis de desenvolvimento ou configure-as na Vercel ao fazer o deploy.

## Como executar localmente

1. Instale as dependências do servidor e do cliente:
   ```bash
   npm install
   npm install --prefix client
   ```
2. Inicie o servidor Express (que servirá o React em produção) ou apenas o cliente em modo de desenvolvimento:
   ```bash
   # Para desenvolvimento do React
   npm run client

   # Após gerar a build
   npm run build
   npm start
   ```

A aplicação estará disponível em `http://localhost:3000`.

## Deploy na Vercel

O arquivo `vercel.json` define a pasta de build estático (`client/build`). Para publicar:

1. Importe o repositório na Vercel.
2. Defina as variáveis `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` nas configurações do projeto.
3. A Vercel irá executar o build e servir o conteúdo estático automaticamente.

## Licença

Este projeto é distribuído sem garantia de funcionamento para produção e pode ser utilizado como ponto de partida para estudos ou projetos internos.
