// frontend/src/components/pharmacy/ProductList.jsx
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  IconButton,
  Chip,
  Tooltip,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { deleteProduct } from '../../redux/pharmacy/pharmacySlice';

function ProductList({ products, onEdit, onView, loading = false }) {
  const dispatch = useDispatch();
  const { status, error } = useSelector(state => state.pharmacy);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDelete = async (productId) => {
    if (window.confirm('¿Está seguro de que desea eliminar este producto?')) {
      try {
        await dispatch(deleteProduct(productId)).unwrap();
      } catch (error) {
        console.error('Error al eliminar producto:', error);
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (!products || products.length === 0) {
    return (
      <Box sx={{ 
        mt: 4, 
        textAlign: 'center',
        p: 4,
        borderRadius: 2,
        background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
        border: '1px solid',
        borderColor: 'primary.200'
      }}>
        <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
          No hay productos en el inventario
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Agrega productos para comenzar a gestionar el inventario
        </Typography>
      </Box>
    );
  }

  const getStatusColor = (quantity, minStock) => {
    if (quantity === 0) return 'error';
    if (quantity <= minStock) return 'warning';
    return 'success';
  };

  const getStatusText = (quantity, minStock) => {
    if (quantity === 0) return 'Sin Stock';
    if (quantity <= minStock) return 'Stock Bajo';
    return 'Disponible';
  };

  const getStatusIcon = (quantity, minStock) => {
    if (quantity === 0) return <CancelIcon />;
    if (quantity <= minStock) return <WarningIcon />;
    return <CheckIcon />;
  };

  return (
    <>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ 
        borderRadius: 2, 
        overflow: 'hidden',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        border: '1px solid',
        borderColor: 'primary.200'
      }}>
        <TableContainer>
          <Table sx={{ minWidth: isMobile ? 300 : 650 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'primary.50' }}>
                <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  Producto
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  Código
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  Categoría
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  Stock
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  Precio
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  Estado
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.atr_id_producto} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {product.atr_nombre_producto}
                      </Typography>
                      {product.atr_descripcion && (
                        <Typography variant="caption" color="text.secondary">
                          {product.atr_descripcion}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {product.atr_codigo_barra || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={product.atr_categoria || 'Sin categoría'} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2">
                        {product.atr_stock_actual}
                      </Typography>
                      {product.atr_unidad_medida && (
                        <Typography variant="caption" color="text.secondary">
                          {product.atr_unidad_medida}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      ${product.atr_precio_venta_unitario?.toFixed(2) || '0.00'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(product.atr_stock_actual, product.atr_stock_minimo)}
                      label={getStatusText(product.atr_stock_actual, product.atr_stock_minimo)}
                      color={getStatusColor(product.atr_stock_actual, product.atr_stock_minimo)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      {onView && (
                        <Tooltip title="Ver detalles">
                          <IconButton
                            size="small"
                            onClick={() => onView(product)}
                            sx={{ color: 'info.main' }}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          onClick={() => onEdit(product)}
                          sx={{ color: 'primary.main' }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Eliminar">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(product.atr_id_producto)}
                          disabled={status === 'loading'}
                          sx={{ color: 'error.main' }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </>
  );
}

export default ProductList;