import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../react-supabase-auth-template/src/theme.js';
import CssBaseline from '@mui/material/CssBaseline';
import TabbedAdminDashboard from './components/TabbedAdminDashboard.jsx';


const container = document.getElementById('root');
if (!container) throw new Error('Failed to find the root element');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <TabbedAdminDashboard />
    </ThemeProvider>
  </React.StrictMode>
); 