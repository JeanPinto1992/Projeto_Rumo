// src/components/TabbedAdminDashboard.tsx
import React, { useState, useMemo } from 'react';
import { 
  Box, 
  Tabs, 
  Tab, 
  AppBar, 
  Toolbar, 
  Typography, 
  Container,
  Paper,
  useTheme
} from '@mui/material';
import DashboardTable from './DashboardTable';
import { styled } from '@mui/material/styles';

type TabType = 'DASHBOARD' | 'ADMINISTRATIVO' | 'ALMOXARIFADO' | 'COMERCIAL' | 'MANUTENÇÃO' | 'LOGÍSTICA' | 'IMPOSTOS' | 'RH';

const StyledTabs = styled(Tabs)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.secondary.main,
    height: 3,
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  color: theme.palette.common.white,
  '&.Mui-selected': {
    color: theme.palette.secondary.main,
  },
}));

function TabbedAdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('ADMINISTRATIVO');
  const theme = useTheme();

  const tabs: TabType[] = useMemo(() => [
    'DASHBOARD',
    'ADMINISTRATIVO',
    'ALMOXARIFADO',
    'COMERCIAL',
    'MANUTENÇÃO',
    'LOGÍSTICA',
    'IMPOSTOS',
    'RH',
  ], []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: TabType) => {
    setActiveTab(newValue);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'DASHBOARD':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              Dashboard
            </Typography>
            <Typography variant="body1">
              Conteúdo do Dashboard virá aqui.
            </Typography>
          </Box>
        );
      default:
        return (
          <Box sx={{ p: 3 }}>
            <DashboardTable tableName={activeTab.toLowerCase()} />
          </Box>
        );
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" color="primary" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Projeto Rumo
          </Typography>
        </Toolbar>
        <StyledTabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="navigation tabs"
        >
          {tabs.map((tab) => (
            <StyledTab
              key={tab}
              value={tab}
              label={tab}
            />
          ))}
        </StyledTabs>
      </AppBar>

      <Container maxWidth="xl" sx={{ flexGrow: 1, py: 3 }}>
        <Paper 
          elevation={0}
          sx={{ 
            p: 2,
            backgroundColor: theme.palette.background.default,
            borderRadius: 2
          }}
        >
          {renderContent()}
        </Paper>
      </Container>
    </Box>
  );
}

export default TabbedAdminDashboard;