import React from 'react';
import { Box, Typography } from '@mui/material';
import MaintenanceManager from '../Components/Maintenance/MaintenanceManager';

const EspecialidadPage = () => {
  const columnLabels = {
    atr_id_especialidad: 'ID',
    atr_especialidad: 'Especialidad',
    atr_descripcion: 'Descripción',
    atr_creado_por: 'Creado por',
    atr_fecha_creacion: 'Fecha creación'
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Catálogo - Especialidades</Typography>
      <MaintenanceManager model="Especialidad" columnLabels={columnLabels} />
    </Box>
  );
};

export default EspecialidadPage;
