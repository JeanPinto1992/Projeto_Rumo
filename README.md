# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Getting Started

Install dependencies and launch the development server:

```bash
npm install
npm run dev
```

This project includes a small themed component library under `src/styles`. The sample app demonstrates login, registration with email verification, and password recovery flows.

To connect to your own Supabase instance create a `.env` file containing the variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. After logging in the application fetches rows from the `profiles` table and displays them in a themed table.

## Production Build

Run `npm run build` to create a production bundle using Vite.

## Theming

All styled components rely on CSS variables defined in `src/styles/variables.css`. Adjust those values to customize colors and spacing while retaining dark mode support.
