import React from 'react';
import { useParams } from 'react-router-dom';
import MaintenanceManager from '../Components/Maintenance/MaintenanceManager';
import { Box, Typography } from '@mui/material';

const MantenimientoDynamicPage = () => {
  const { category, model } = useParams();

  // category: 'sistemas' | 'catalogos' (según sidebar)
  // model: nombre del modelo (por ejemplo 'Parametro', 'Rol', ...)

  if (!model) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6">Seleccione un elemento de mantenimiento</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Mantenimiento - {category ? category.charAt(0).toUpperCase() + category.slice(1) : ''}
      </Typography>
      <MaintenanceManager model={model} />
    </Box>
  );
};

export default MantenimientoDynamicPage;
