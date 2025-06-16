import React from 'react';
import { createRoot } from 'react-dom/client';
import TabbedAdminDashboard from './components/TabbedAdminDashboard';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <TabbedAdminDashboard />
  </React.StrictMode>
); 