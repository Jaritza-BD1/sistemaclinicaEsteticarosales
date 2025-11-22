import React from 'react';
import { Box, Typography } from '@mui/material';
import MaintenanceManager from '../Components/Maintenance/MaintenanceManager';

const TipoCitaPage = () => {
  const columnLabels = { atr_id_tipo_cita: 'ID', atr_nombre_tipo_cita: 'Tipo de cita' };
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Catálogo - Tipos de Cita</Typography>
      <MaintenanceManager model="TipoCita" columnLabels={columnLabels} />
    </Box>
  );
};

export default TipoCitaPage;
