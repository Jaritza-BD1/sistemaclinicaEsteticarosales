import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

class ScrollErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Verificar si el error está relacionado con scroll
    if (error && error.message && error.message.includes('scrollTop')) {
      return { hasError: true, error };
    }
    return { hasError: false, error: null };
  }

  componentDidCatch(error, errorInfo) {
    // Log del error para debugging
    console.warn('ScrollErrorBoundary capturó un error:', error);
    console.warn('Error info:', errorInfo);

    // Si es un error de scroll, intentar recuperarse
    if (error && error.message && error.message.includes('scrollTop')) {
      // Limpiar cualquier estado de scroll problemático
      try {
        const elements = document.querySelectorAll('[data-scroll-container]');
        elements.forEach(element => {
          if (element && element.scrollTop !== undefined) {
            element.scrollTop = 0;
          }
        });
      } catch (cleanupError) {
        console.warn('Error al limpiar scroll:', cleanupError);
      }
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    
    // Forzar un re-render limpio
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  handleReset = () => {
    // Limpiar localStorage y sessionStorage
    try {
      sessionStorage.clear();
      localStorage.removeItem('modalScrollPosition');
    } catch (error) {
      console.warn('Error al limpiar storage:', error);
    }
    
    this.handleRetry();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '200px',
            p: 3,
            textAlign: 'center',
            backgroundColor: '#FCE4EC',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'primary.200'
          }}
        >
          <Typography variant="h6" sx={{ color: 'error.main', mb: 2 }}>
            Error de Interfaz
          </Typography>
          
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            Se detectó un problema con la interfaz de usuario. Esto puede ser temporal.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button
              variant="outlined"
              onClick={this.handleRetry}
              startIcon={<RefreshIcon />}
              sx={{
                borderColor: 'primary.300',
                color: 'primary.main',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'primary.50',
                },
              }}
            >
              Reintentar
            </Button>
            
            <Button
              variant="contained"
              onClick={this.handleReset}
              sx={{
                backgroundColor: '#FCE4EC',
                color: '#212845',
                '&:hover': {
                  backgroundColor: '#F8BBD0',
                },
              }}
            >
              Reiniciar
            </Button>
          </Box>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1, maxWidth: '100%', overflow: 'auto' }}>
              <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                {this.state.error.toString()}
              </Typography>
            </Box>
          )}
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ScrollErrorBoundary; 