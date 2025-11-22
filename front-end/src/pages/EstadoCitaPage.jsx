import React from 'react';
import { Box, Typography } from '@mui/material';
import MaintenanceManager from '../Components/Maintenance/MaintenanceManager';

const EstadoCitaPage = () => {
  const columnLabels = { atr_id_estado_cita: 'ID', atr_estado: 'Estado' };
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Catálogo - Estados de Cita</Typography>
      <MaintenanceManager model="EstadoCita" columnLabels={columnLabels} />
    </Box>
  );
};

export default EstadoCitaPage;
