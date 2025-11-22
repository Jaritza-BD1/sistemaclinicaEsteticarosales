import React from 'react';
import { Box, Typography } from '@mui/material';
import MaintenanceManager from '../Components/Maintenance/MaintenanceManager';

const RolPage = () => {
  const columnLabels = { atr_rol: 'Rol', atr_descripcion: 'Descripción', atr_fecha_creacion: 'Fecha creación' };
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Catálogo - Roles</Typography>
      <MaintenanceManager model="Rol" columnLabels={columnLabels} />
    </Box>
  );
};

export default RolPage;
