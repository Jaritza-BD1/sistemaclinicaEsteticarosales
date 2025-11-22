import React from 'react';
import { Box, Typography } from '@mui/material';
import MaintenanceManager from '../Components/Maintenance/MaintenanceManager';

const DoctorPhonePage = () => {
  const columnLabels = { atr_id_telefono: 'ID', atr_id_medico: 'Médico', atr_telefono: 'Teléfono' };
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Sistema - Teléfonos Médicos</Typography>
      <MaintenanceManager model="DoctorPhone" columnLabels={columnLabels} />
    </Box>
  );
};

export default DoctorPhonePage;
