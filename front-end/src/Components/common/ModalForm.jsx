import React, { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  useTheme,
  useMediaQuery,
  Button
} from '@mui/material';
import {
  Close as CloseIcon
} from '@mui/icons-material';
import { useSafeScroll } from '../../hooks/useSafeScroll';

const ModalForm = ({ 
  open, 
  onClose, 
  title, 
  children, 
  maxWidth = "sm",
  fullWidth = true,
  showActions = false,
  actions = null,
  showCloseButton = true,
  closeButtonText = "Cerrar",
  saveButtonText = "Guardar",
  onSave = null,
  loading = false,
  disableSave = false
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dialogRef = useRef(null);
  const contentRef = useRef(null);
  const { safeScrollTo, getScrollPosition, setScrollPosition } = useSafeScroll();
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Manejar scroll seguro cuando el modal se abre
  useEffect(() => {
    if (open && contentRef.current) {
      // Deshabilitar transiciones temporalmente para evitar errores
      setIsTransitioning(true);
      
      // Esperar un poco para que el DOM se renderice completamente
      const timer = setTimeout(() => {
        try {
          // Hacer scroll al top del contenido de manera segura
          safeScrollTo(contentRef.current, { top: 0, behavior: 'auto' });
        } catch (error) {
          console.warn('Error al hacer scroll en modal:', error);
        } finally {
          setIsTransitioning(false);
        }
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [open, safeScrollTo]);

  // Interceptar errores de scroll en el modal
  useEffect(() => {
    if (!open) return;

    const handleScrollError = (event) => {
      if (event.error && event.error.message && 
          (event.error.message.includes('scrollTop') || 
           event.error.message.includes('scrollLeft') ||
           event.error.message.includes('Cannot read properties of null'))) {
        event.preventDefault();
        console.warn('Error de scroll interceptado en modal');
        
        // Intentar recuperación automática
        setTimeout(() => {
          try {
            if (contentRef.current) {
              contentRef.current.scrollTop = 0;
            }
          } catch (cleanupError) {
            console.warn('Error en limpieza de scroll del modal:', cleanupError);
          }
        }, 100);
        
        return false;
      }
    };

    window.addEventListener('error', handleScrollError);
    
    return () => {
      window.removeEventListener('error', handleScrollError);
    };
  }, [open]);

  const handleClose = () => {
    if (!loading) {
      // Guardar posición de scroll antes de cerrar
      if (contentRef.current) {
        try {
          const position = getScrollPosition(contentRef.current);
          sessionStorage.setItem('modalScrollPosition', JSON.stringify(position));
        } catch (error) {
          console.warn('Error al guardar posición de scroll:', error);
        }
      }
      onClose();
    }
  };

  const handleSave = () => {
    if (onSave && !loading && !disableSave) {
      onSave();
    }
  };

  // Restaurar posición de scroll cuando el modal se abre
  useEffect(() => {
    if (open && contentRef.current) {
      const savedPosition = sessionStorage.getItem('modalScrollPosition');
      if (savedPosition) {
        try {
          const position = JSON.parse(savedPosition);
          setTimeout(() => {
            setScrollPosition(contentRef.current, position);
          }, 200);
        } catch (error) {
          console.warn('Error al restaurar posición de scroll:', error);
        }
      }
    }
  }, [open, setScrollPosition]);

  return (
    <Dialog
      ref={dialogRef}
      open={open}
      onClose={handleClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      fullScreen={isMobile}
      // Deshabilitar transiciones si hay problemas
      TransitionProps={{
        onEnter: (node) => {
          try {
            // Asegurar que el nodo esté listo antes de cualquier operación de scroll
            if (node && node.scrollTop !== undefined) {
              node.scrollTop = 0;
            }
          } catch (error) {
            console.warn('Error en transición del modal:', error);
          }
        },
        // Deshabilitar transiciones si hay problemas de scroll
        timeout: isTransitioning ? 0 : undefined
      }}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 3,
          backgroundColor: 'background.paper',
          color: 'accent.main',
          border: '1px solid',
          borderColor: 'brand.paleL2',
          minHeight: isMobile ? '100vh' : 'auto',
          maxHeight: isMobile ? '100vh' : '90vh',
          overflow: 'hidden',
          // Prevenir errores de scroll
          '& .MuiDialogContent-root': {
            overflowY: 'auto',
            overflowX: 'hidden',
            // Estilos de scrollbar personalizados
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'brand.pale',
              borderRadius: '4px',
              '&:hover': {
                background: 'brand.paleDark',
              },
            },
          }
        }
      }}
    >
      <DialogTitle sx={{ 
        color: 'accent.main', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        pb: 1,
        borderBottom: '1px solid',
        borderColor: 'brand.paleL2',
        backgroundColor: 'background.paper'
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        {showCloseButton && (
          <IconButton 
            onClick={handleClose}
            disabled={loading}
            sx={{ 
              color: 'primary.main',
              '&:hover': {
                backgroundColor: 'primary.50',
                transform: 'scale(1.1)',
              },
              transition: 'all 0.2s ease-in-out',
              '&:disabled': {
                opacity: 0.5,
                transform: 'none'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>

      <DialogContent 
        ref={contentRef}
        dividers 
        sx={{ 
          p: 3,
          overflowY: 'auto',
          overflowX: 'hidden',
          // Estilos de scrollbar personalizados
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'brand.pale',
            borderRadius: '4px',
            '&:hover': {
              background: 'brand.paleDark',
            },
          },
          // Prevenir errores de scroll
          '& *': {
            scrollBehavior: 'auto'
          }
        }}
      >
        {children}
      </DialogContent>

      {(showActions || actions) && (
        <DialogActions sx={{ 
          p: 3, 
          pt: 1,
          borderTop: '1px solid',
          borderColor: 'brand.paleL2',
          backgroundColor: 'background.paper',
          color: 'accent.main',
          flexWrap: 'wrap',
          gap: 1
        }}>
          {actions ? (
            actions
          ) : (
            <>
              <Button
                onClick={handleClose}
                variant="outlined"
                disabled={loading}
                sx={{
                  borderColor: 'primary.300',
                  color: 'primary.main',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'primary.50',
                  },
                  '&:disabled': {
                    opacity: 0.5
                  }
                }}
              >
                {closeButtonText}
              </Button>
              
              {onSave && (
                <Button
                  onClick={handleSave}
                  variant="contained"
                  disabled={loading || disableSave}
                  sx={{
                    backgroundColor: 'brand.pale',
                    color: 'accent.main',
                    '&:hover': {
                      backgroundColor: 'brand.paleDark',
                      transform: 'translateY(-1px)',
                    },
                    boxShadow: '0 4px 14px 0 rgba(33,40,69,0.06)',
                    '&:disabled': {
                      opacity: 0.5,
                      transform: 'none'
                    }
                  }}
                >
                  {loading ? 'Guardando...' : saveButtonText}
                </Button>
              )}
            </>
          )}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default ModalForm; 