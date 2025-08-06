import React, { useState } from 'react';
import { 
  Container, 
  Tabs, 
  Tab, 
  Box, 
  Typography, 
  Paper,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { styled } from '@mui/material/styles';
import BitacoraConsulta from '../Components/dashboard/BitacoraConsulta';
import LogManagement from '../Components/LogManagement';
import BitacoraEstadisticas from '../Components/dashboard/BitacoraEstadisticas';
import './VerBitacoraPage.css';

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
    id={`bitacora-tabpanel-${index}`}
    aria-labelledby={`bitacora-tab-${index}`}
    {...other}
  >
    {value === index && (
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        {children}
      </Box>
    )}
  </div>
);

const VerBitacoraPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const tabs = [
    {
      label: 'Consulta de Bitácora',
      component: <BitacoraConsulta showNavigation={false} />,
      icon: '🔍'
    },
    {
      label: 'Gestión de Bitácora',
      component: <LogManagement />,
      icon: '⚙️'
    },
    {
      label: 'Estadísticas',
      component: <BitacoraEstadisticas showNavigation={false} />,
      icon: '📊'
    }
  ];

  return (
    <div className="ver-bitacora-page">
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Header de la página */}
        <Box className="bitacora-header" sx={{ mb: 3 }}>
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
            Sistema de Bitácora
          </Typography>
          <Typography 
            variant="h6"
            sx={{ 
              textAlign: isMobile ? 'center' : 'left',
              color: 'white',
              opacity: 0.9
            }}
          >
            Consulta, gestión y análisis de registros del sistema
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
              value={tabValue}
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
                  id={`bitacora-tab-${index}`}
                  aria-controls={`bitacora-tabpanel-${index}`}
                />
              ))}
            </StyledTabs>
          </Box>

          {/* Contenido de las pestañas */}
          {tabs.map((tab, index) => (
            <TabPanel key={index} value={tabValue} index={index}>
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
            💡 <strong>Consejo:</strong> Utiliza los filtros para encontrar información específica y exporta los datos cuando sea necesario.
          </Typography>
        </Box>
      </Container>
    </div>
  );
};

export default VerBitacoraPage;
