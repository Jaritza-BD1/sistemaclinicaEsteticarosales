import React from 'react';
import { Box, Typography } from '@mui/material';
import MaintenanceManager from '../Components/Maintenance/MaintenanceManager';

const PatientEmailPage = () => {
  const columnLabels = { atr_id_correo_p: 'ID', atr_id_paciente: 'Paciente', atr_correo: 'Correo' };
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Sistema - Correos Pacientes</Typography>
      <MaintenanceManager model="PatientEmail" columnLabels={columnLabels} />
    </Box>
  );
};

export default PatientEmailPage;
