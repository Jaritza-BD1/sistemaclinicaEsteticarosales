// frontend/src/components/pharmacy/ProductForm.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  LocalPharmacy as PharmacyIcon,
  Inventory as InventoryIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { createProduct, updateProduct, clearError } from '../../redux/pharmacy/pharmacySlice';
import BaseForm from '../common/BaseForm';
import { FormTextField, FormDateField, FormSelectField } from '../common/FormFields';
import { productSchema } from '../../services/validationSchemas';

function ProductForm({ product = null, onClose, open = false }) {
  const dispatch = useDispatch();
  const { status, error } = useSelector(state => state.pharmacy);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Datos para selectores
  const categories = [
    { value: 'Analgésicos', label: 'Analgésicos' },
    { value: 'Antiinflamatorios', label: 'Antiinflamatorios' },
    { value: 'Antibióticos', label: 'Antibióticos' },
    { value: 'Antihistamínicos', label: 'Antihistamínicos' },
    { value: 'Antieméticos', label: 'Antieméticos' },
    { value: 'Antipiréticos', label: 'Antipiréticos' },
    { value: 'Antitusivos', label: 'Antitusivos' },
    { value: 'Expectorantes', label: 'Expectorantes' },
    { value: 'Laxantes', label: 'Laxantes' },
    { value: 'Antiespasmódicos', label: 'Antiespasmódicos' },
    { value: 'Vitaminas', label: 'Vitaminas' },
    { value: 'Suplementos', label: 'Suplementos' },
    { value: 'Material Médico', label: 'Material Médico' },
    { value: 'Higiene Personal', label: 'Higiene Personal' },
    { value: 'Otro', label: 'Otro' }
  ];

  const units = [
    { value: 'Tabletas', label: 'Tabletas' },
    { value: 'Cápsulas', label: 'Cápsulas' },
    { value: 'Jarabe', label: 'Jarabe' },
    { value: 'Inyección', label: 'Inyección' },
    { value: 'Ungüento', label: 'Ungüento' },
    { value: 'Crema', label: 'Crema' },
    { value: 'Gotas', label: 'Gotas' },
    { value: 'Supositorios', label: 'Supositorios' },
    { value: 'Parches', label: 'Parches' },
    { value: 'Inhaladores', label: 'Inhaladores' },
    { value: 'Otro', label: 'Otro' }
  ];

  const suppliers = [
    { value: 'Farmacia Central', label: 'Farmacia Central' },
    { value: 'Distribuidora Médica', label: 'Distribuidora Médica' },
    { value: 'Laboratorios Nacionales', label: 'Laboratorios Nacionales' },
    { value: 'Importadora Farmacéutica', label: 'Importadora Farmacéutica' },
    { value: 'Droguería San José', label: 'Droguería San José' },
    { value: 'Otro', label: 'Otro' }
  ];

  // Limpiar errores cuando cambien
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // Mostrar notificación de éxito cuando se complete la operación
  useEffect(() => {
    if (status === 'succeeded' && !error) {
      setShowSuccessNotification(true);
      setTimeout(() => {
        setShowSuccessNotification(false);
        onClose();
      }, 2000);
    }
  }, [status, error, onClose]);

  const handleSubmit = async (data) => {
    try {
      if (product) {
        // Actualizar producto existente
        await dispatch(updateProduct({ id: product.id, productData: data })).unwrap();
      } else {
        // Crear nuevo producto
        await dispatch(createProduct(data)).unwrap();
      }
      return { success: true, message: product ? 'Producto actualizado exitosamente' : 'Producto registrado exitosamente' };
    } catch (error) {
      console.error('Error al guardar producto:', error);
      throw error;
    }
  };

  const handleClose = () => {
    if (status !== 'loading') {
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <PharmacyIcon color="primary" />
          <Typography variant="h6">
            {product ? "Editar Producto" : "Registrar Producto"}
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Container maxWidth="lg" sx={{ py: 2 }}>
          <BaseForm
            title={product ? "Editar Producto" : "Registrar Producto"}
            subtitle="Información completa del producto farmacéutico"
            validationSchema={productSchema}
            formType="product"
            onSubmit={handleSubmit}
            requiredPermissions={['write:products']}
            maxWidth="lg"
            initialData={product}
            disabled={status === 'loading'}
          >
            <Grid container spacing={3}>
              {/* Información Básica */}
              <Grid item xs={12}>
                <Card sx={{ 
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
                  border: '1px solid',
                  borderColor: 'primary.200'
                }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <InventoryIcon color="primary" />
                      <Typography variant="h6" color="primary">
                        Información Básica
                      </Typography>
                    </Box>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <FormTextField
                          name="nombre"
                          label="Nombre del Producto"
                          required
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormTextField
                          name="codigoBarra"
                          label="Código de Barras"
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormTextField
                          name="descripcion"
                          label="Descripción"
                          multiline
                          rows={3}
                          fullWidth
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Categorización */}
              <Grid item xs={12}>
                <Card sx={{ 
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                  border: '1px solid',
                  borderColor: 'info.200'
                }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <PharmacyIcon color="info" />
                      <Typography variant="h6" color="info.main">
                        Categorización
                      </Typography>
                    </Box>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <FormSelectField
                          name="categoria"
                          label="Categoría"
                          options={categories}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <FormSelectField
                          name="unidadMedida"
                          label="Unidad de Medida"
                          options={units}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <FormSelectField
                          name="proveedor"
                          label="Proveedor"
                          options={suppliers}
                          fullWidth
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Información de Stock y Precio */}
              <Grid item xs={12}>
                <Card sx={{ 
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                  border: '1px solid',
                  borderColor: 'success.200'
                }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <MoneyIcon color="success" />
                      <Typography variant="h6" color="success.main">
                        Stock y Precio
                      </Typography>
                    </Box>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={3}>
                        <FormTextField
                          name="precio"
                          label="Precio Unitario"
                          type="number"
                          required
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <FormTextField
                          name="stock"
                          label="Stock Actual"
                          type="number"
                          required
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <FormTextField
                          name="stockMinimo"
                          label="Stock Mínimo"
                          type="number"
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <FormTextField
                          name="stockMaximo"
                          label="Stock Máximo"
                          type="number"
                          fullWidth
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </BaseForm>
        </Container>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={status === 'loading'}>
          Cancelar
        </Button>
        <Button 
          type="submit" 
          variant="contained" 
          disabled={status === 'loading'}
          startIcon={status === 'loading' ? <CircularProgress size={20} /> : <CheckIcon />}
        >
          {status === 'loading' ? 'Guardando...' : (product ? 'Actualizar' : 'Guardar')}
        </Button>
      </DialogActions>

      {/* Notificaciones */}
      <Snackbar
        open={showSuccessNotification}
        autoHideDuration={3000}
        onClose={() => setShowSuccessNotification(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          {product ? 'Producto actualizado exitosamente' : 'Producto creado exitosamente'}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={5000}
        onClose={() => dispatch(clearError())}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}

export default ProductForm;