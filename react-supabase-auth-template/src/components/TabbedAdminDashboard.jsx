// src/components/TabbedAdminDashboard.jsx
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
import DashboardTable from './DashboardTable.jsx';
import { styled } from '@mui/material/styles';

const StyledTabs = styled(Tabs)(({ theme }) => ({
  backgroundColor: 'transparent',
  '& .MuiTabs-indicator': {
    display: 'none',
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  color: theme.palette.text.primary,
  backgroundColor: theme.palette.grey[200],
  borderTopLeftRadius: theme.shape.borderRadius,
  borderTopRightRadius: theme.shape.borderRadius,
  minWidth: 120,
  textTransform: 'none',
  marginRight: theme.spacing(1),
  opacity: 1,
  '&.Mui-selected': {
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.background.paper,
    borderBottomColor: theme.palette.background.paper,
    fontWeight: theme.typography.fontWeightBold,
    zIndex: 1,
  },
  border: `1px solid ${theme.palette.divider}`,
  borderBottom: 'none',
}));

const TabbedAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('ADMINISTRATIVO');
  const theme = useTheme();

  const tabs = useMemo(() => [
    'DASHBOARD',
    'ADMINISTRATIVO',
    'ALMOXARIFADO',
    'COMERCIAL',
    'MANUTENÇÃO',
    'LOGÍSTICA',
    'IMPOSTOS',
    'RH',
  ], []);

  const handleTabChange = (event, newValue) => {
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
          <Box sx={{ flexGrow: 1 }}>
            <DashboardTable tableName={activeTab.toLowerCase()} />
          </Box>
        );
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" sx={{ backgroundColor: theme.palette.common.white }} elevation={0}>
        <Toolbar sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: '100px',
          padding: '0 16px',
        }}>
          <img src="/logo-usifix.png" alt="Logo Usifix" style={{ height: '140px' }} />
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
            <StyledTabs
              value={activeTab}
              onChange={handleTabChange}
              aria-label="navigation tabs"
              centered
            >
              {tabs.map((tab) => (
                <StyledTab
                  key={tab}
                  value={tab}
                  label={tab}
                />
              ))}
            </StyledTabs>
          </Box>
        </Toolbar>
      </AppBar>

      <Container disableGutters maxWidth={false} sx={{ flexGrow: 1 }}>
        <Paper
          elevation={0}
          sx={{
            flexGrow: 1,
            width: '100%',
            backgroundColor: theme.palette.background.default,
            borderRadius: 0
          }}
        >
          {renderContent()}
        </Paper>
      </Container>
    </Box>
  );
}

export default TabbedAdminDashboard;