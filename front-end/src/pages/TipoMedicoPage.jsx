import React from 'react';
import { Box, Typography } from '@mui/material';
import MaintenanceManager from '../Components/Maintenance/MaintenanceManager';

const TipoMedicoPage = () => {
  const columnLabels = {
    atr_id_tipo_medico: 'ID',
    atr_nombre_tipo_medico: 'Nombre',
    atr_descripcion: 'Descripción',
    atr_creado_por: 'Creado por',
    atr_fecha_creacion: 'Fecha creación'
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Catálogo - Tipo de médico</Typography>
      <MaintenanceManager model="TipoMedico" columnLabels={columnLabels} />
    </Box>
  );
};

export default TipoMedicoPage;
