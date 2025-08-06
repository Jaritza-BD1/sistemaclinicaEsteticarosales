import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  TextField,
  InputAdornment,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  useTheme,
  useMediaQuery,
  Fab,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  LocalPharmacy as PharmacyIcon,
  Inventory as InventoryIcon,
  AttachMoney as MoneyIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';
import ProductForm from './ProductForm';
import ProductList from './ProductList';

const PharmacyManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showProductForm, setShowProductForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [notification, setNotification] = useState(null);

  // Datos simulados para estadísticas
  const stats = {
    totalProducts: 156,
    lowStock: 12,
    outOfStock: 3,
    totalValue: 45250.75,
    monthlySales: 12500.50,
    topSelling: 'Paracetamol 500mg'
  };

  // Datos simulados para productos
  const mockProducts = [
    {
      id: 1,
      name: 'Paracetamol 500mg',
      code: 'PAR-500-001',
      category: 'Analgésicos',
      quantity: 45,
      price: 2.50,
      min_stock: 20,
      max_stock: 100,
      unit: 'Tabletas',
      supplier: 'Farmacia Central',
      status: 'active'
    },
    {
      id: 2,
      name: 'Ibuprofeno 400mg',
      code: 'IBU-400-001',
      category: 'Antiinflamatorios',
      quantity: 8,
      price: 3.20,
      min_stock: 15,
      max_stock: 80,
      unit: 'Tabletas',
      supplier: 'Distribuidora Médica',
      status: 'low_stock'
    },
    {
      id: 3,
      name: 'Amoxicilina 500mg',
      code: 'AMX-500-001',
      category: 'Antibióticos',
      quantity: 0,
      price: 8.75,
      min_stock: 10,
      max_stock: 50,
      unit: 'Cápsulas',
      supplier: 'Laboratorios Nacionales',
      status: 'out_of_stock'
    }
  ];

  useEffect(() => {
    setProducts(mockProducts);
  }, []);

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setShowProductForm(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowProductForm(true);
  };

  const handleDeleteProduct = (productId) => {
    setProducts(products.filter(p => p.id !== productId));
    setNotification({
      message: 'Producto eliminado exitosamente',
      type: 'success',
      open: true
    });
  };

  const handleSaveProduct = (productData) => {
    if (selectedProduct) {
      // Actualizar producto existente
      setProducts(products.map(p => 
        p.id === selectedProduct.id ? { ...p, ...productData } : p
      ));
      setNotification({
        message: 'Producto actualizado exitosamente',
        type: 'success',
        open: true
      });
    } else {
      // Agregar nuevo producto
      const newProduct = {
        ...productData,
        id: Date.now(),
        status: 'active'
      };
      setProducts([...products, newProduct]);
      setNotification({
        message: 'Producto agregado exitosamente',
        type: 'success',
        open: true
      });
    }
    setShowProductForm(false);
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'low_stock': return 'warning';
      case 'out_of_stock': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Disponible';
      case 'low_stock': return 'Stock Bajo';
      case 'out_of_stock': return 'Sin Stock';
      default: return 'Desconocido';
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || product.category === filterCategory;
    const matchesStatus = !filterStatus || product.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = [...new Set(products.map(p => p.category))];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ color: 'primary.main', mb: 1 }}>
          <PharmacyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Gestión de Farmacia
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Administra el inventario de medicamentos y productos farmacéuticos
        </Typography>
      </Box>

      {/* Estadísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            borderRadius: 2,
            background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
            border: '1px solid',
            borderColor: 'primary.200'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <InventoryIcon sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h6" sx={{ color: 'primary.main' }}>
                  Total Productos
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                {stats.totalProducts}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            borderRadius: 2,
            background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
            border: '1px solid',
            borderColor: 'primary.200'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <WarningIcon sx={{ color: 'warning.main', mr: 1 }} />
                <Typography variant="h6" sx={{ color: 'warning.main' }}>
                  Stock Bajo
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                {stats.lowStock}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            borderRadius: 2,
            background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
            border: '1px solid',
            borderColor: 'primary.200'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <MoneyIcon sx={{ color: 'success.main', mr: 1 }} />
                <Typography variant="h6" sx={{ color: 'success.main' }}>
                  Valor Total
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                L. {stats.totalValue.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            borderRadius: 2,
            background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
            border: '1px solid',
            borderColor: 'primary.200'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon sx={{ color: 'info.main', mr: 1 }} />
                <Typography variant="h6" sx={{ color: 'info.main' }}>
                  Ventas Mensuales
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                L. {stats.monthlySales.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filtros y Búsqueda */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: 'primary.300',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.main',
                  },
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Categoría</InputLabel>
              <Select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                label="Categoría"
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': {
                    '&:hover': {
                      borderColor: 'primary.300',
                    },
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                  },
                }}
              >
                <MenuItem value="">Todas las categorías</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                label="Estado"
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': {
                    '&:hover': {
                      borderColor: 'primary.300',
                    },
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                  },
                }}
              >
                <MenuItem value="">Todos los estados</MenuItem>
                <MenuItem value="active">Disponible</MenuItem>
                <MenuItem value="low_stock">Stock Bajo</MenuItem>
                <MenuItem value="out_of_stock">Sin Stock</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => {
                setSearchTerm('');
                setFilterCategory('');
                setFilterStatus('');
              }}
              sx={{
                borderColor: 'primary.300',
                color: 'primary.main',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'primary.50',
                },
              }}
            >
              Limpiar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabla de Productos */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
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
              {filteredProducts.map((product) => (
                <TableRow key={product.id} hover>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>
                      {product.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {product.unit}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {product.code}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={product.category} 
                      size="small" 
                      sx={{ backgroundColor: 'primary.100', color: 'primary.main' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {product.quantity}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      L. {product.price.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={getStatusText(product.status)}
                      color={getStatusColor(product.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Ver detalles">
                        <IconButton size="small" color="primary">
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleEditProduct(product)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteProduct(product.id)}
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

      {/* Botón Flotante */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={handleAddProduct}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          background: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
            transform: 'scale(1.1)',
          },
          boxShadow: '0 4px 14px 0 rgba(236, 72, 153, 0.25)',
        }}
      >
        <AddIcon />
      </Fab>

      {/* Modal de Formulario */}
      <ProductForm
        open={showProductForm}
        onClose={() => setShowProductForm(false)}
        product={selectedProduct}
        onSave={handleSaveProduct}
      />

      {/* Notificaciones */}
      <Snackbar
        open={notification?.open || false}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification?.type || 'info'}
          sx={{ borderRadius: 2 }}
        >
          {notification?.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default PharmacyManagement;
