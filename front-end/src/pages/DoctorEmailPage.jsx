import React from 'react';
import { Box, Typography } from '@mui/material';
import MaintenanceManager from '../Components/Maintenance/MaintenanceManager';

const DoctorEmailPage = () => {
  const columnLabels = { atr_id_correo_m: 'ID', atr_id_medico: 'Médico', atr_correo: 'Correo' };
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Sistema - Correos Médicos</Typography>
      <MaintenanceManager model="DoctorEmail" columnLabels={columnLabels} />
    </Box>
  );
};

export default DoctorEmailPage;
