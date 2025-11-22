import React, { useState } from 'react';
import { Container, Box, Typography, Paper, Alert, Snackbar, useTheme, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../Components/context/AuthContext';
import CleanupRunsManagement from '../Components/admin/CleanupRunsManagement';
import './RolandPermissionpage.css';

const StyledTabs = styled('div')(({ theme }) => ({
  // placeholder to keep style imports consistent with RolandPermissionpage
}));

const CleanupRunsPage = () => {
  const { user } = useAuth();
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => setNotification(prev => ({ ...prev, open: false }));

  if (!user || user.atr_id_rol !== 1) {
    return (
      <div className="roles-permissions-page">
        <Container maxWidth="xl" sx={{ py: 3 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            No tienes permisos para acceder a esta sección. Solo los administradores pueden gestionarla.
          </Alert>
        </Container>
      </div>
    );
  }

  return (
    <div className="roles-permissions-page">
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box className="roles-permissions-header" sx={{ mb: 3 }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700, textAlign: isMobile ? 'center' : 'left', color: 'white' }}>
            Limpieza y Gestión de Uploads
          </Typography>
          <Typography variant="h6" sx={{ textAlign: isMobile ? 'center' : 'left', color: 'white', opacity: 0.9 }}>
            Revisa ejecuciones de limpieza, vista previa de archivos huérfanos y ejecuta limpiezas manuales.
          </Typography>
        </Box>

        <Paper elevation={2} className="tabs-container" sx={{ borderRadius: 2, overflow: 'hidden', mx: { xs: 0, sm: 0 } }}>
          <Box sx={{ p: { xs: 2, sm: 3 }, minHeight: '60vh' }}>
            <CleanupRunsManagement onNotification={showNotification} />
          </Box>
        </Paper>
      </Container>

      <Snackbar open={notification.open} autoHideDuration={6000} onClose={handleCloseNotification} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>{notification.message}</Alert>
      </Snackbar>
    </div>
  );
};

export default CleanupRunsPage;
