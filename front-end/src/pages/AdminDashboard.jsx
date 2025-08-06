// src/pages/AdminDashboard.jsx
import React, { useState } from 'react';
import { useAuth } from '../Components/context/AuthContext';
import { 
  Box, 
  Typography, 
  Button, 
  ButtonGroup, 
  Container,
  Paper,
  Alert
} from '@mui/material';

const AdminDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [section, setSection] = useState('welcome');

  console.log('🔍 AdminDashboard render:', { user, isAuthenticated });

  // Componente de prueba simple
  const WelcomeSection = () => (
    <Box>
      <Typography variant="h5" gutterBottom>
        ¡Bienvenido al Panel de Administración!
      </Typography>
      <Alert severity="success" sx={{ mb: 2 }}>
        El login funcionó correctamente. El usuario está autenticado.
      </Alert>
      <Typography variant="body1">
        <strong>Usuario:</strong> {user?.atr_nombre_usuario || 'N/A'}<br/>
        <strong>Rol:</strong> {user?.atr_id_rol || 'N/A'}<br/>
        <strong>Estado:</strong> {user?.atr_estado_usuario || 'N/A'}
      </Typography>
    </Box>
  );

  const UsersSection = () => (
    <Box>
      <Typography variant="h5" gutterBottom>
        Gestión de Usuarios
      </Typography>
      <Alert severity="info">
        Esta sección estará disponible próximamente.
      </Alert>
    </Box>
  );

  const LogsSection = () => (
    <Box>
      <Typography variant="h5" gutterBottom>
        Gestión de Bitácora
      </Typography>
      <Alert severity="info">
        Esta sección estará disponible próximamente.
      </Alert>
    </Box>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Panel de Administración
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3 }}>
        Bienvenido, <strong>{user?.atr_nombre_usuario || 'Administrador'}</strong>
        &nbsp;(Rol: <em>{user?.atr_id_rol === 1 ? 'Administrador' : 'Usuario'}</em>)
      </Typography>

      {/* Nivel 1 */}
      <ButtonGroup variant="outlined" sx={{ mb: 3 }}>
        <Button 
          onClick={() => setSection('welcome')}
          variant={section === 'welcome' ? 'contained' : 'outlined'}
        >
          Inicio
        </Button>
        <Button 
          onClick={() => setSection('users')}
          variant={section === 'users' ? 'contained' : 'outlined'}
        >
          Gestión de Usuarios
        </Button>
        <Button 
          onClick={() => setSection('logs')}
          variant={section === 'logs' ? 'contained' : 'outlined'}
        >
          Gestión de Bitácora
        </Button>
      </ButtonGroup>

      {/* Contenido */}
      <Paper sx={{ p: 3 }}>
        {section === 'welcome' && <WelcomeSection />}
        {section === 'users' && <UsersSection />}
        {section === 'logs' && <LogsSection />}
      </Paper>
    </Container>
  );
};

export default AdminDashboard;


