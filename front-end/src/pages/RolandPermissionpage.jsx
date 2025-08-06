import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Alert,
  Snackbar,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../Components/context/AuthContext';
import RolesManagement from '../Components/Role&Permission/RolesManagement';
import PermissionsManagement from '../Components/Role&Permission/PermissionsManagement';
import './RolandPermissionpage.css';

// Componente personalizado para las pestañas
const StyledTabs = styled(Tabs)(({ theme }) => ({
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.main,
    height: 3,
  },
  '& .MuiTab-root': {
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '1rem',
    minHeight: 48,
    color: theme.palette.text.secondary,
    '&.Mui-selected': {
      color: theme.palette.primary.main,
    },
    '&:hover': {
      color: theme.palette.primary.main,
      opacity: 1,
    },
  },
}));

// Componente personalizado para el contenido de las pestañas
const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`roles-permissions-tabpanel-${index}`}
    aria-labelledby={`roles-permissions-tab-${index}`}
    {...other}
  >
    {value === index && (
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        {children}
      </Box>
    )}
  </div>
);

const RolandPermissionpage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const tabs = [
    {
      label: 'Gestión de Roles',
      component: <RolesManagement onNotification={showNotification} />,
      icon: '👥'
    },
    {
      label: 'Gestión de Permisos',
      component: <PermissionsManagement onNotification={showNotification} />,
      icon: '🔐'
    }
  ];

  // Verificar si el usuario tiene permisos de administrador
  if (!user || user.atr_id_rol !== 1) {
    return (
      <div className="roles-permissions-page">
        <Container maxWidth="xl" sx={{ py: 3 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            No tienes permisos para acceder a esta sección. Solo los administradores pueden gestionar roles y permisos.
          </Alert>
        </Container>
      </div>
    );
  }

  return (
    <div className="roles-permissions-page">
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Header de la página */}
        <Box className="roles-permissions-header" sx={{ mb: 3 }}>
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 700,
              textAlign: isMobile ? 'center' : 'left',
              color: 'white'
            }}
          >
            Gestión de Roles y Permisos
          </Typography>
          <Typography 
            variant="h6"
            sx={{ 
              textAlign: isMobile ? 'center' : 'left',
              color: 'white',
              opacity: 0.9
            }}
          >
            Administra roles y permisos del sistema de manera eficiente
          </Typography>
        </Box>

        {/* Contenedor principal con pestañas */}
        <Paper 
          elevation={2} 
          className="tabs-container"
          sx={{ 
            borderRadius: 2,
            overflow: 'hidden',
            mx: { xs: 0, sm: 0 }
          }}
        >
          {/* Pestañas */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <StyledTabs
              value={activeTab}
              onChange={handleTabChange}
              variant={isMobile ? "scrollable" : "fullWidth"}
              scrollButtons={isMobile ? "auto" : false}
              allowScrollButtonsMobile
              sx={{
                '& .MuiTabs-scrollButtons': {
                  '&.Mui-disabled': { opacity: 0.3 },
                },
              }}
            >
              {tabs.map((tab, index) => (
                <Tab
                  key={index}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span className="tab-icon">{tab.icon}</span>
                      <span>{tab.label}</span>
                    </Box>
                  }
                  id={`roles-permissions-tab-${index}`}
                  aria-controls={`roles-permissions-tabpanel-${index}`}
                />
              ))}
            </StyledTabs>
          </Box>

          {/* Contenido de las pestañas */}
          {tabs.map((tab, index) => (
            <TabPanel key={index} value={activeTab} index={index}>
              <Box className="tab-content" sx={{ 
                minHeight: '60vh',
                display: 'flex',
                flexDirection: 'column'
              }}>
                {tab.component}
              </Box>
            </TabPanel>
          ))}
        </Paper>

        {/* Información adicional */}
        <Box className="info-box">
          <Typography variant="body1" align="center">
            💡 <strong>Consejo:</strong> Los roles definen los permisos de los usuarios. Asegúrate de asignar permisos apropiados para mantener la seguridad del sistema.
          </Typography>
        </Box>
      </Container>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default RolandPermissionpage;
