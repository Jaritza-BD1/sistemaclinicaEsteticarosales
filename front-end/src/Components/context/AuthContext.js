// front-end/src/Components/context/AuthContext.js
import React, { 
  createContext, 
  useContext, 
  useState, 
  useCallback, 
  useEffect,
  useMemo 
} from 'react';
import api from '../../services/api';
import { getAuthToken, setAuthToken, clearAuthToken, cleanCorruptedTokens } from '../../utils/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Limpiar tokens corruptos al inicio
  useEffect(() => {
    cleanCorruptedTokens();
  }, []);

  // Estado optimizado con carga de datos segura
  const [authState, setAuthState] = useState(() => {
    try {
      const token = getAuthToken();
      const firstLogin = localStorage.getItem('firstLogin') === 'true';
      
      return {
        user: null,
        token,
        firstLogin,
        isAuthenticated: false,
        isLoading: !!token
      };
    } catch (error) {
      console.error('Error inicializando AuthContext:', error);
      // Si hay error, limpiar todo y empezar limpio
      localStorage.clear();
      return {
        user: null,
        token: null,
        firstLogin: false,
        isAuthenticated: false,
        isLoading: false
      };
    }
  });

  // 1. Declarar logout PRIMERO - SOLUCIÓN CLAVE
  const logout = useCallback(() => {
    clearAuthToken();
    localStorage.removeItem('firstLogin');
    
    setAuthState({
      user: null,
      token: null,
      firstLogin: false,
      isAuthenticated: false,
      isLoading: false
    });
    
    window.location.href = '/login';
  }, []);

  // 2. Función de login optimizada (depende de logout)
  const login = useCallback((jwt, firstLogin = false) => {
    setAuthToken(jwt);
    localStorage.setItem('firstLogin', firstLogin);
    
    setAuthState({
      user: null,
      token: jwt,
      firstLogin,
      isAuthenticated: true,
      isLoading: true
    });
    
    if (firstLogin) {
      window.location.href = '/change-password';
    }
  }, []);

  // 3. Función para obtener datos del usuario (depende de logout)
  const fetchUserData = useCallback(async () => {
    if (!authState.token) return;
    
    try {
      // ✅ CORREGIDO: Usar /auth/profile en lugar de /auth/me
      const response = await api.get('/auth/profile');
      const userData = response.data;
      
      setAuthState(prev => ({
        ...prev,
        user: userData,
        isAuthenticated: true,
        isLoading: false
      }));
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      logout();
    }
  }, [authState.token, logout]);

  // 4. Verificar token y cargar datos del usuario
  useEffect(() => {
    const validateToken = async () => {
      if (authState.token && !authState.user) {
        try {
          await fetchUserData();
        } catch (error) {
          console.error('Token validation failed:', error);
          logout();
        }
      } else if (!authState.token) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };

    validateToken();
  }, [authState.token, authState.user, fetchUserData, logout]);

  // 5. Otras funciones
  const completeFirstLogin = useCallback(() => {
    localStorage.setItem('firstLogin', 'false');
    setAuthState(prev => ({
      ...prev,
      firstLogin: false
    }));
  }, []);

  const hasRole = useCallback((roleId) => {
    return authState.user?.atr_id_rol === roleId;
  }, [authState.user]);

  const isAdmin = useCallback(() => {
    return authState.user?.atr_id_rol === 1;
  }, [authState.user]);

  const updateUser = useCallback((userData) => {
    setAuthState(prev => ({
      ...prev,
      user: userData
    }));
  }, []);

  // 6. Valor del contexto optimizado
  const contextValue = useMemo(() => ({
    user: authState.user,
    token: authState.token,
    firstLogin: authState.firstLogin,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    login,
    logout,
    completeFirstLogin,
    hasRole,
    isAdmin,
    updateUser
  }), [
    authState.user,
    authState.token,
    authState.firstLogin,
    authState.isAuthenticated,
    authState.isLoading,
    login,
    logout,
    completeFirstLogin,
    hasRole,
    isAdmin,
    updateUser
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};