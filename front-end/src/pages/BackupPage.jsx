import React from 'react';
import { useAuth } from '../Components/context/AuthContext';
import BackupModule from '../Components/admin/BackupModule';
import { Box } from '@mui/material';
import { Navigate } from 'react-router-dom';

const BackupPage = () => {
  const { user } = useAuth();

  // Verificar si el usuario es administrador
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <BackupModule />
    </Box>
  );
};

export default BackupPage; 