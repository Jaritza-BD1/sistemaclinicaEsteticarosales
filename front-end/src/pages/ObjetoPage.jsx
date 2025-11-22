import React from 'react';
import { Box, Typography } from '@mui/material';
import MaintenanceManager from '../Components/Maintenance/MaintenanceManager';

const ObjetoPage = () => {
  const columnLabels = { atr_objeto: 'Objeto', atr_descripcion: 'Descripción', atr_tipo_objeto: 'Tipo' };
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Catálogo - Objetos</Typography>
      <MaintenanceManager model="Objeto" columnLabels={columnLabels} />
    </Box>
  );
};

export default ObjetoPage;
