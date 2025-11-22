import React from 'react';
import { Box, Typography } from '@mui/material';
import MaintenanceManager from '../Components/Maintenance/MaintenanceManager';

const TokenModelPage = () => {
  const columnLabels = { atr_id_token: 'ID', atr_id_usuario: 'Usuario', atr_token: 'Token', atr_expira: 'Expira' };
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Tokens</Typography>
      <MaintenanceManager model="Token" columnLabels={columnLabels} />
    </Box>
  );
};

export default TokenModelPage;
