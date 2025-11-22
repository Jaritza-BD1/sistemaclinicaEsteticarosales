import React from 'react';
import { Box, Typography } from '@mui/material';
import MaintenanceManager from '../Components/Maintenance/MaintenanceManager';

const PasswordHistoryPage = () => {
  const columnLabels = { atr_id: 'ID', atr_id_usuario: 'Usuario', atr_hash: 'Hash', atr_fecha: 'Fecha' };
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Historial de Contraseñas</Typography>
      <MaintenanceManager model="PasswordHistory" columnLabels={columnLabels} />
    </Box>
  );
};

export default PasswordHistoryPage;
