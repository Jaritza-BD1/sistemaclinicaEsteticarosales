import React from 'react';
import { Box, Typography } from '@mui/material';
import MaintenanceManager from '../Components/Maintenance/MaintenanceManager';

const PatientAddressPage = () => {
  const columnLabels = { atr_id_direccion_p: 'ID', atr_id_paciente: 'Paciente', atr_direccion_completa: 'Dirección' };
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Sistema - Direcciones Pacientes</Typography>
      <MaintenanceManager model="PatientAddress" columnLabels={columnLabels} />
    </Box>
  );
};

export default PatientAddressPage;
