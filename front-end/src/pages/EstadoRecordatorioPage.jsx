import React from 'react';
import { Box, Typography } from '@mui/material';
import MaintenanceManager from '../Components/Maintenance/MaintenanceManager';

const EstadoRecordatorioPage = () => {
  const columnLabels = { atr_id_estado_recordatorio: 'ID', atr_estado: 'Estado' };
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Catálogo - Estados de Recordatorio</Typography>
      <MaintenanceManager model="EstadoRecordatorio" columnLabels={columnLabels} />
    </Box>
  );
};

export default EstadoRecordatorioPage;
