import React from 'react';
import { Box, Typography } from '@mui/material';
import MaintenanceManager from '../Components/Maintenance/MaintenanceManager';

const BackupCodePage = () => {
  const columnLabels = { atr_id: 'ID', atr_codigo: 'Código', atr_usado: 'Usado' };
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Códigos de Backup</Typography>
      <MaintenanceManager model="BackupCode" columnLabels={columnLabels} />
    </Box>
  );
};

export default BackupCodePage;
