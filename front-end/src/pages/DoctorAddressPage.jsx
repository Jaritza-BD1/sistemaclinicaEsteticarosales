import React from 'react';
import { Box, Typography } from '@mui/material';
import MaintenanceManager from '../Components/Maintenance/MaintenanceManager';

const DoctorAddressPage = () => {
  const columnLabels = { atr_id_direccion_m: 'ID', atr_id_medico: 'Médico', atr_direccion_completa: 'Dirección' };
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Sistema - Direcciones Médicos</Typography>
      <MaintenanceManager model="DoctorAddress" columnLabels={columnLabels} />
    </Box>
  );
};

export default DoctorAddressPage;
