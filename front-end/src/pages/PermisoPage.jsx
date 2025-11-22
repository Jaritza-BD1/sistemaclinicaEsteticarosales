import React from 'react';
import { Box, Typography } from '@mui/material';
import MaintenanceManager from '../Components/Maintenance/MaintenanceManager';

const PermisoPage = () => {
  const columnLabels = { atr_id_rol: 'Rol', atr_id_objeto: 'Objeto', atr_permiso_insercion: 'Insertar', atr_permiso_consultar: 'Consultar' };
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Catálogo - Permisos</Typography>
      <MaintenanceManager model="Permiso" columnLabels={columnLabels} />
    </Box>
  );
};

export default PermisoPage;
