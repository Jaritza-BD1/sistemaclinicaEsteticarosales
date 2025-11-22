import React from 'react';
import { Box, Typography } from '@mui/material';
import MaintenanceManager from '../Components/Maintenance/MaintenanceManager';

const UserPage = () => {
  const columnLabels = { atr_id_usuario: 'ID', atr_usuario: 'Usuario', atr_nombre_usuario: 'Nombre', atr_correo_electronico: 'Email', atr_estado_usuario: 'Estado' };
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Sistema - Usuarios</Typography>
      <MaintenanceManager model="User" columnLabels={columnLabels} />
    </Box>
  );
};

export default UserPage;
