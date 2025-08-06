import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';
import './dashboard.css';

const DashboardHeader = ({ user, onLogout }) => {
  return (
    <Box
      component="header"
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        px: 3,
        py: 2,
        borderBottom: '1px solid #e0e0e0',
        mb: 2,
        gap: 2
      }}
    >
      <Box className="welcome-section">
        <Typography variant="h5" sx={{ mb: 0.5 }}>
          Bienvenido, {user?.name || user?.username || 'Usuario'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Panel de control - {new Date().toLocaleDateString()}
        </Typography>
      </Box>
      <Stack direction="row" spacing={2}>
        <Button variant="contained" size="small">
          Nuevo Paciente
        </Button>
        <Button variant="outlined" color="error" size="small" onClick={onLogout}>
          Cerrar sesión
        </Button>
      </Stack>
    </Box>
  );
};

const Dashboard = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setUser(storedUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div>
      <DashboardHeader user={user} onLogout={handleLogout} />

      {/* Aquí puedes seguir agregando el resto del contenido del dashboard */}
    </div>
  );
};

export default Dashboard;



