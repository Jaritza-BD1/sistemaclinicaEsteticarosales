import { useEffect, useRef } from 'react';

// Hook para manejar scroll de manera segura
export const useSafeScroll = () => {
  const scrollRef = useRef(null);

  // Función para hacer scroll de manera segura
  const safeScrollTo = (element, options = {}) => {
    if (!element) return;
    
    try {
      // Verificar que el elemento existe y tiene las propiedades necesarias
      if (element && typeof element.scrollTo === 'function') {
        element.scrollTo(options);
      } else if (element && typeof element.scrollTop !== 'undefined') {
        // Fallback para elementos que no tienen scrollTo
        if (options.top !== undefined) {
          element.scrollTop = options.top;
        }
        if (options.left !== undefined) {
          element.scrollLeft = options.left;
        }
      }
    } catch (error) {
      console.warn('Error al hacer scroll:', error);
    }
  };

  // Función para hacer scroll al elemento
  const scrollToElement = (element, offset = 0) => {
    if (!element) return;
    
    try {
      const rect = element.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const targetPosition = rect.top + scrollTop - offset;
      
      safeScrollTo(document.documentElement, { top: targetPosition, behavior: 'smooth' });
    } catch (error) {
      console.warn('Error al hacer scroll al elemento:', error);
    }
  };

  // Función para hacer scroll al top
  const scrollToTop = () => {
    safeScrollTo(document.documentElement, { top: 0, behavior: 'smooth' });
  };

  // Función para verificar si un elemento es scrollable
  const isScrollable = (element) => {
    if (!element) return false;
    
    try {
      return element.scrollHeight > element.clientHeight || 
             element.scrollWidth > element.clientWidth;
    } catch (error) {
      return false;
    }
  };

  // Función para obtener la posición de scroll de manera segura
  const getScrollPosition = (element) => {
    if (!element) return { scrollTop: 0, scrollLeft: 0 };
    
    try {
      return {
        scrollTop: element.scrollTop || 0,
        scrollLeft: element.scrollLeft || 0
      };
    } catch (error) {
      console.warn('Error al obtener posición de scroll:', error);
      return { scrollTop: 0, scrollLeft: 0 };
    }
  };

  // Función para establecer la posición de scroll de manera segura
  const setScrollPosition = (element, { scrollTop, scrollLeft }) => {
    if (!element) return;
    
    try {
      if (scrollTop !== undefined) {
        element.scrollTop = scrollTop;
      }
      if (scrollLeft !== undefined) {
        element.scrollLeft = scrollLeft;
      }
    } catch (error) {
      console.warn('Error al establecer posición de scroll:', error);
    }
  };

  // Effect para manejar errores de scroll en Material-UI
  useEffect(() => {
    // Interceptar errores de scrollTop
    const originalScrollTop = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollTop');
    
    if (originalScrollTop) {
      Object.defineProperty(Element.prototype, 'scrollTop', {
        get() {
          try {
            return originalScrollTop.get.call(this);
          } catch (error) {
            console.warn('Error al acceder a scrollTop:', error);
            return 0;
          }
        },
        set(value) {
          try {
            originalScrollTop.set.call(this, value);
          } catch (error) {
            console.warn('Error al establecer scrollTop:', error);
          }
        }
      });
    }

    // Cleanup function
    return () => {
      if (originalScrollTop) {
        Object.defineProperty(Element.prototype, 'scrollTop', originalScrollTop);
      }
    };
  }, []);

  return {
    scrollRef,
    safeScrollTo,
    scrollToElement,
    scrollToTop,
    isScrollable,
    getScrollPosition,
    setScrollPosition
  };
}; 