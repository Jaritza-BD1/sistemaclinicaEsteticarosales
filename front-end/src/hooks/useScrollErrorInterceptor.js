import { useEffect } from 'react';

// Hook para interceptar errores de scroll a nivel de DOM
export const useScrollErrorInterceptor = () => {
  useEffect(() => {
    // Interceptar errores de scrollTop antes de que lleguen a React
    const originalScrollTop = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollTop');
    const originalScrollLeft = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollLeft');
    
    if (originalScrollTop) {
      Object.defineProperty(Element.prototype, 'scrollTop', {
        get() {
          try {
            // Verificar que el elemento existe y es válido
            if (!this || this.nodeType !== 1) {
              return 0;
            }
            return originalScrollTop.get.call(this);
          } catch (error) {
            console.warn('Error al acceder a scrollTop:', error);
            return 0;
          }
        },
        set(value) {
          try {
            // Verificar que el elemento existe y es válido
            if (!this || this.nodeType !== 1) {
              return;
            }
            originalScrollTop.set.call(this, value);
          } catch (error) {
            console.warn('Error al establecer scrollTop:', error);
          }
        }
      });
    }

    if (originalScrollLeft) {
      Object.defineProperty(Element.prototype, 'scrollLeft', {
        get() {
          try {
            if (!this || this.nodeType !== 1) {
              return 0;
            }
            return originalScrollLeft.get.call(this);
          } catch (error) {
            console.warn('Error al acceder a scrollLeft:', error);
            return 0;
          }
        },
        set(value) {
          try {
            if (!this || this.nodeType !== 1) {
              return;
            }
            originalScrollLeft.set.call(this, value);
          } catch (error) {
            console.warn('Error al establecer scrollLeft:', error);
          }
        }
      });
    }

    // Interceptar errores de scrollTo
    const originalScrollTo = Element.prototype.scrollTo;
    if (originalScrollTo) {
      Element.prototype.scrollTo = function(...args) {
        try {
          if (!this || this.nodeType !== 1) {
            return;
          }
          return originalScrollTo.apply(this, args);
        } catch (error) {
          console.warn('Error al hacer scrollTo:', error);
        }
      };
    }

    // Interceptar errores de scrollIntoView
    const originalScrollIntoView = Element.prototype.scrollIntoView;
    if (originalScrollIntoView) {
      Element.prototype.scrollIntoView = function(...args) {
        try {
          if (!this || this.nodeType !== 1) {
            return;
          }
          return originalScrollIntoView.apply(this, args);
        } catch (error) {
          console.warn('Error al hacer scrollIntoView:', error);
        }
      };
    }

    // Interceptar errores de getBoundingClientRect
    const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
    if (originalGetBoundingClientRect) {
      Element.prototype.getBoundingClientRect = function() {
        try {
          if (!this || this.nodeType !== 1) {
            return {
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              width: 0,
              height: 0,
              x: 0,
              y: 0
            };
          }
          return originalGetBoundingClientRect.call(this);
        } catch (error) {
          console.warn('Error al obtener getBoundingClientRect:', error);
          return {
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            width: 0,
            height: 0,
            x: 0,
            y: 0
          };
        }
      };
    }

    // Interceptar errores globales de scroll
    const handleGlobalError = (event) => {
      if (event.error && event.error.message && 
          (event.error.message.includes('scrollTop') || 
           event.error.message.includes('scrollLeft') ||
           event.error.message.includes('Cannot read properties of null'))) {
        
        console.warn('Error de scroll interceptado globalmente:', event.error);
        event.preventDefault();
        
        // Intentar recuperación automática
        setTimeout(() => {
          try {
            // Limpiar scroll en elementos problemáticos
            const elements = document.querySelectorAll('*');
            elements.forEach(element => {
              if (element && typeof element.scrollTop !== 'undefined') {
                try {
                  element.scrollTop = 0;
                } catch (e) {
                  // Ignorar errores al limpiar
                }
              }
            });
          } catch (cleanupError) {
            console.warn('Error en limpieza automática:', cleanupError);
          }
        }, 100);
        
        return false;
      }
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason && event.reason.message && 
          (event.reason.message.includes('scrollTop') || 
           event.reason.message.includes('scrollLeft'))) {
        console.warn('Promise rejection de scroll interceptado:', event.reason);
        event.preventDefault();
      }
    });

    // Cleanup function
    return () => {
      // Restaurar propiedades originales
      if (originalScrollTop) {
        Object.defineProperty(Element.prototype, 'scrollTop', originalScrollTop);
      }
      if (originalScrollLeft) {
        Object.defineProperty(Element.prototype, 'scrollLeft', originalScrollLeft);
      }
      if (originalScrollTo) {
        Element.prototype.scrollTo = originalScrollTo;
      }
      if (originalScrollIntoView) {
        Element.prototype.scrollIntoView = originalScrollIntoView;
      }
      if (originalGetBoundingClientRect) {
        Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
      }
      
      window.removeEventListener('error', handleGlobalError);
    };
  }, []);
}; 