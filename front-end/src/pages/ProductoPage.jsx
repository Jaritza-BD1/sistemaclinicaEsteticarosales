import React from 'react';
import { Box, Typography } from '@mui/material';
import MaintenanceManager from '../Components/Maintenance/MaintenanceManager';

const ProductoPage = () => {
  const columnLabels = { atr_nombre_producto: 'Nombre', atr_precio_venta_unitario: 'Precio', atr_stock_actual: 'Stock' };
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Catálogo - Productos</Typography>
      <MaintenanceManager model="Producto" columnLabels={columnLabels} />
    </Box>
  );
};

export default ProductoPage;
