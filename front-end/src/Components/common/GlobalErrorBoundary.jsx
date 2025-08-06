import React from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      isScrollError: false
    };
  }

  static getDerivedStateFromError(error) {
    // Verificar si es un error de scroll
    const isScrollError = error && error.message && 
      (error.message.includes('scrollTop') || 
       error.message.includes('scrollLeft') ||
       error.message.includes('Cannot read properties of null'));
    
    return { 
      hasError: true, 
      error,
      isScrollError
    };
  }

  componentDidCatch(error, errorInfo) {
    console.warn('GlobalErrorBoundary capturó un error:', error);
    console.warn('Error info:', errorInfo);

    this.setState({ errorInfo });

    // Si es un error de scroll, intentar recuperarse automáticamente
    if (this.state.isScrollError) {
      this.handleScrollErrorRecovery();
    }
  }

  handleScrollErrorRecovery = () => {
    console.log('🔄 Intentando recuperación automática de error de scroll...');
    
    // Limpiar cualquier estado problemático
    try {
      // Forzar un re-render limpio
      this.setState({ hasError: false, error: null, errorInfo: null, isScrollError: false });
      
      // Limpiar scroll en todos los elementos
      const elements = document.querySelectorAll('*');
      elements.forEach(element => {
        if (element && typeof element.scrollTop !== 'undefined') {
          try {
            element.scrollTop = 0;
          } catch (e) {
            // Ignorar errores al limpiar scroll
          }
        }
      });
      
      // Recargar después de un breve delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (recoveryError) {
      console.warn('Error en recuperación automática:', recoveryError);
      // Si la recuperación falla, mostrar la interfaz de error
    }
  };

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, isScrollError: false });
    window.location.reload();
  };

  handleReset = () => {
    // Limpiar localStorage y sessionStorage
    try {
      sessionStorage.clear();
      localStorage.removeItem('modalScrollPosition');
      localStorage.removeItem('authToken');
      localStorage.removeItem('token');
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
            minHeight: '100vh',
            p: 4,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
          }}
        >
          <Alert severity="error" sx={{ mb: 3, maxWidth: 600 }}>
            <Typography variant="h5" sx={{ mb: 2, color: 'error.main' }}>
              Error de Interfaz Detectado
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 2 }}>
              {this.state.isScrollError 
                ? 'Se detectó un problema con la interfaz de usuario. Esto puede ser temporal.'
                : 'Ocurrió un error inesperado en la aplicación.'
              }
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center', mt: 2 }}>
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
                  background: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                  },
                }}
              >
                Reiniciar Aplicación
              </Button>
            </Box>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1, maxWidth: '100%', overflow: 'auto' }}>
                <Typography variant="caption" sx={{ fontFamily: 'monospace', display: 'block', mb: 1 }}>
                  <strong>Error:</strong> {this.state.error.toString()}
                </Typography>
                {this.state.errorInfo && (
                  <Typography variant="caption" sx={{ fontFamily: 'monospace', display: 'block' }}>
                    <strong>Stack:</strong> {this.state.errorInfo.componentStack}
                  </Typography>
                )}
              </Box>
            )}
          </Alert>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary; 