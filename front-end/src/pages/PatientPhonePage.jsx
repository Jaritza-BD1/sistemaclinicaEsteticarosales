import React from 'react';
import { Box, Typography } from '@mui/material';
import MaintenanceManager from '../Components/Maintenance/MaintenanceManager';

const PatientPhonePage = () => {
  const columnLabels = { atr_id_telefono: 'ID', atr_id_paciente: 'Paciente', atr_telefono: 'Teléfono' };
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Sistema - Teléfonos Pacientes</Typography>
      <MaintenanceManager model="PatientPhone" columnLabels={columnLabels} />
    </Box>
  );
};

export default PatientPhonePage;
