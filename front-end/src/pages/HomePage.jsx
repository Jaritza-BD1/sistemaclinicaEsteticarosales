import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css'; // Archivo de estilos (crear uno nuevo)
import { Box, Typography, Button, Container, Stack } from '@mui/material';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FFF0F5, #FADADD)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header con logo y nombre */}
      <Box component="header" sx={{ p: { xs: 2, sm: 4 }, bgcolor: 'white', boxShadow: 1 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="h3" sx={{ color: '#D4A5A5' }}>🌹</Typography>
          <Typography variant="h4" sx={{ color: '#D4A5A5', fontWeight: 300, letterSpacing: 1.5 }}>
            Estética Rosales
          </Typography>
        </Stack>
      </Box>

      {/* Contenido principal */}
      <Container maxWidth="sm" sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', py: 6 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" sx={{ color: '#D4A5A5', mb: 2, fontWeight: 500 }}>
            Sistema Clinica Estetica Rosales
          </Typography>
          <Typography variant="h6" sx={{ color: '#888', mb: 4 }}>
            Belleza Natural en Tonos Pastel
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="large"
          sx={{
            bgcolor: '#C8A2C8',
            color: 'white',
            borderRadius: 8,
            px: 5,
            py: 1.5,
            fontSize: '1.1rem',
            boxShadow: 2,
            '&:hover': { bgcolor: '#D4A5A5' }
          }}
          onClick={() => navigate('/login')}
        >
          Iniciar Sesión
        </Button>
      </Container>

      {/* Footer */}
      <Box component="footer" sx={{ p: 2, textAlign: 'center', color: '#D4A5A5', fontSize: '0.9rem', bgcolor: 'transparent' }}>
        © {new Date().getFullYear()} Estética Rosales - Todos los derechos reservados
      </Box>
    </Box>
  );
};

export default HomePage;