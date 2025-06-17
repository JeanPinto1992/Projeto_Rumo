# Projeto Rumo

Este repositório contém um exemplo de integração com o Supabase e foi configurado para ser implantado na Vercel ou executado localmente.

## Variáveis de ambiente

Para que a aplicação funcione é necessário definir as credenciais do Supabase. Os nomes das variáveis mudam de acordo com o ambiente:

- **Local**: utilize `REACT_APP_SUPABASE_URL` e `REACT_APP_SUPABASE_ANON_KEY`.
- **Vercel**: utilize `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

As variáveis de ambiente podem ser definidas em um arquivo `.env.local` (para desenvolvimento) ou nas configurações do projeto na Vercel.

## Desenvolvimento local

```bash
npm install
npm start
```

## Deploy na Vercel

O arquivo `vercel.json` está configurado para build estático da pasta `react-supabase-auth-template`. Basta importar o repositório na Vercel e definir as variáveis listadas acima.
