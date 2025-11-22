import React from 'react';
import { Box, Typography } from '@mui/material';
import MaintenanceManager from '../Components/Maintenance/MaintenanceManager';

const ParametroPage = () => {
  const columnLabels = {
    atr_parametro: 'Parámetro',
    atr_valor: 'Valor',
    atr_creado_por: 'Creado por',
    atr_fecha_creacion: 'Fecha creación',
    atr_modificado_por: 'Modificado por',
    atr_fecha_modificacion: 'Fecha mod.'
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Catálogo - Parámetros</Typography>
      <MaintenanceManager model="Parametro" columnLabels={columnLabels} />
    </Box>
  );
};

export default ParametroPage;
