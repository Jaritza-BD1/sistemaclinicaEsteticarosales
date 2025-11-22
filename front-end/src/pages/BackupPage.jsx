import React from 'react';
import { useAuth } from '../Components/context/AuthContext';
import BackupModule from '../Components/admin/BackupModule';
import { Box } from '@mui/material';
import { Navigate } from 'react-router-dom';

const BackupPage = () => {
  const { user, isAdmin } = useAuth();

  // Si no hay usuario logueado, redirigir al login
  if (!user) return <Navigate to="/login" replace />;

  // Si no es admin, mostrar not-found (o unauthorized)
  if (!isAdmin()) return <Navigate to="/not-found" replace />;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <BackupModule />
    </Box>
  );
};

export default BackupPage; 