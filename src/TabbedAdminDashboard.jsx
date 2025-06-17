import { useState } from 'react';
import { Card, Title } from './styles';

const tabs = [
  'DASHBOARD',
  'ADMINISTRATIVO',
  'ALMOXARIFADO',
  'COMERCIAL',
  'MANUTENÇÃO',
  'LOGÍSTICA',
  'IMPOSTOS',
  'RH',
];

export default function TabbedAdminDashboard() {
  const [active, setActive] = useState('ADMINISTRATIVO');

  function renderContent() {
    if (active === 'DASHBOARD') {
      return <p>Conteúdo do Dashboard virá aqui.</p>;
    }
    return <p>Tabela para {active.toLowerCase()}</p>;
  }

  return (
    <div className="tabbed-dashboard">
      <Title>Admin Dashboard</Title>
      <div className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`tab ${active === tab ? 'tab-active' : ''}`}
            onClick={() => setActive(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      <Card>{renderContent()}</Card>
    </div>
  );
}
