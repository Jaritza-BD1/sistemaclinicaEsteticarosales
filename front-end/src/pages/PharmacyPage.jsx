// frontend/src/pages/PharmacyPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Button, 
  Box, 
  CircularProgress, 
  Alert,
  useTheme,
  useMediaQuery,
  Snackbar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchProducts, clearError } from '../redux/pharmacy/pharmacySlice';
import ProductList from '../Components/pharmacy/ProductList';
import ProductForm from '../Components/pharmacy/ProductForm';
import './PharmacyPage.css';

function PharmacyPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { items: products, status, error } = useSelector(state => state.pharmacy);
    const [openForm, setOpenForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [showSuccessNotification, setShowSuccessNotification] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // Cargar productos al montar el componente
    useEffect(() => {
        dispatch(fetchProducts());
    }, [dispatch]);

    // Limpiar errores cuando cambien
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                dispatch(clearError());
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error, dispatch]);

    // Manejadores para el formulario
    const handleOpenForm = (productToEdit = null) => {
        setEditingProduct(productToEdit);
        setOpenForm(true);
    };

    const handleCloseForm = () => {
        setOpenForm(false);
        setEditingProduct(null);
        dispatch(fetchProducts()); // Recarga la lista después de guardar/editar
        setShowSuccessNotification(true);
        setTimeout(() => {
            setShowSuccessNotification(false);
        }, 3000);
    };

    const handleDeleteProduct = async (productId) => {
        if (window.confirm('¿Está seguro de que desea eliminar este producto?')) {
            try {
                // La eliminación se maneja a través de Redux
                // El componente ProductList manejará la eliminación
            } catch (err) {
                console.error('Error deleting product:', err);
            }
        }
    };

    if (status === 'loading' && products.length === 0) {
        return (
            <div className="pharmacy-page">
                <Container maxWidth="xl" sx={{ py: 3 }}>
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                        <CircularProgress />
                    </Box>
                </Container>
            </div>
        );
    }

    return (
        <div className="pharmacy-page">
            <Container maxWidth="xl" sx={{ py: 3 }}>
                {/* Header de la página */}
                <Box className="pharmacy-header" sx={{ mb: 3 }}>
                    <Typography 
                        variant="h3" 
                        component="h1" 
                        gutterBottom
                        sx={{ 
                            fontWeight: 700,
                            textAlign: isMobile ? 'center' : 'left',
                            color: 'white'
                        }}
                    >
                        Gestión de Inventario (Farmacia)
                    </Typography>
                    <Typography 
                        variant="h6"
                        sx={{ 
                            textAlign: isMobile ? 'center' : 'left',
                            color: 'white',
                            opacity: 0.9
                        }}
                    >
                        Administra el inventario de productos farmacéuticos de manera eficiente
                    </Typography>
                </Box>

                {/* Contenedor principal */}
                <Box sx={{ mb: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h5" component="h2" sx={{ color: 'white' }}>
                            Productos ({products.length})
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => handleOpenForm()}
                            sx={{
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.2)'
                                }
                            }}
                        >
                            Agregar Producto
                        </Button>
                    </Box>

                    {/* Mostrar error si existe */}
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {/* Lista de productos */}
                    <ProductList 
                        products={products}
                        onEdit={handleOpenForm}
                        onDelete={handleDeleteProduct}
                        loading={status === 'loading'}
                    />
                </Box>

                {/* Formulario modal */}
                {openForm && (
                    <ProductForm
                        product={editingProduct}
                        onClose={handleCloseForm}
                        open={openForm}
                    />
                )}

                {/* Notificaciones */}
                <Snackbar
                    open={showSuccessNotification}
                    autoHideDuration={3000}
                    onClose={() => setShowSuccessNotification(false)}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                    <Alert severity="success" sx={{ width: '100%' }}>
                        {editingProduct ? 'Producto actualizado exitosamente' : 'Producto creado exitosamente'}
                    </Alert>
                </Snackbar>
            </Container>
        </div>
    );
}

export default PharmacyPage;