import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme
} from '@mui/material';
import {
  Save as SaveIcon,
  Person as PersonIcon
} from '@mui/icons-material';

const TestForm = () => {
  const theme = useTheme();

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    genero: ''
  });

  const [notification, setNotification] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setNotification({ message: 'Formulario enviado exitosamente!', type: 'success', open: true });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ color: 'primary.main', mb: 1 }}>
          <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Formulario de Prueba
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Prueba del sistema de colores rosa pastel
        </Typography>
      </Box>

      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          borderRadius: 3,
          background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
          border: '1px solid',
          borderColor: 'primary.200'
        }}
      >
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
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
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Apellido"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                required
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
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
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
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Teléfono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
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
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Género</InputLabel>
                <Select
                  name="genero"
                  value={formData.genero}
                  onChange={handleChange}
                  label="Género"
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
                  <MenuItem value="masculino">Masculino</MenuItem>
                  <MenuItem value="femenino">Femenino</MenuItem>
                  <MenuItem value="otro">Otro</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              endIcon={<SaveIcon />}
              sx={{
                background: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                  transform: 'translateY(-1px)',
                },
                boxShadow: '0 4px 14px 0 rgba(236, 72, 153, 0.25)',
              }}
            >
              Guardar
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => setFormData({ nombre: '', apellido: '', email: '', telefono: '', genero: '' })}
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
          </Box>
        </form>
      </Paper>

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

export default TestForm; 