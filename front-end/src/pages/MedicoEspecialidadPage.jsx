import React from 'react';
import { Box, Typography } from '@mui/material';
import MaintenanceManager from '../Components/Maintenance/MaintenanceManager';

const MedicoEspecialidadPage = () => {
  const columnLabels = { atr_id_medico: 'Médico', atr_id_especialidad: 'Especialidad', atr_fecha_creacion: 'Fecha creación' };
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Sistema - Médicos / Especialidades</Typography>
      <MaintenanceManager model="MedicoEspecialidad" columnLabels={columnLabels} />
    </Box>
  );
};

export default MedicoEspecialidadPage;
