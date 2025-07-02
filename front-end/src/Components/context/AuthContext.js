// src/Components/context/AuthContext.js
import React, { 
  createContext, 
  useContext, 
  useState, 
  useCallback, 
  useEffect,
  useMemo 
} from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Estado optimizado con carga de datos segura
  const [authState, setAuthState] = useState(() => {
    const token = localStorage.getItem('token');
    const firstLogin = localStorage.getItem('firstLogin') === 'true';
    
    return {
      user: null,
      token,
      firstLogin,
      isAuthenticated: false,
      isLoading: !!token
    };
  });

  // 1. Declarar logout PRIMERO - SOLUCIÓN CLAVE
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('firstLogin');
    
    delete axios.defaults.headers.common['Authorization'];
    
    setAuthState({
      user: null,
      token: null,
      firstLogin: false,
      isAuthenticated: false,
      isLoading: false
    });
    
    window.location.href = '/login';
  }, []);

  // Configurar headers de axios
  useEffect(() => {
    if (authState.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${authState.token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [authState.token]);

  // 2. Función de login optimizada (depende de logout)
  const login = useCallback((jwt, firstLogin = false) => {
    localStorage.setItem('token', jwt);
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
      const response = await axios.get('/api/auth/me');
      const userData = response.data;
      
      setAuthState(prev => ({
        ...prev,
        user: userData,
        isAuthenticated: true,
        isLoading: false
      }));
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      logout(); // Ahora logout está definido
    }
  }, [authState.token, logout]); // Dependencia correcta

  // 4. Verificar token y cargar datos del usuario
  useEffect(() => {
    const validateToken = async () => {
      if (authState.token && !authState.user) {
        try {
          await fetchUserData();
        } catch (error) {
          console.error('Token validation failed:', error);
          logout(); // Ahora logout está definido
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

  const updateUser = useCallback((userData) => {
    setAuthState(prev => ({
      ...prev,
      user: userData
    }));
  }, []);

  // Verificación activa de autenticación
  const verifyAuthentication = useCallback(async () => {
    if (!authState.token) return false;
    
    try {
      const response = await axios.get('/api/auth/verify-token');
      return response.data.valid;
    } catch (error) {
      console.error('Active verification failed:', error);
      return false;
    }
  }, [authState.token]);

  // Valor del contexto
  const contextValue = useMemo(() => ({
    user: authState.user,
    token: authState.token,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    firstLogin: authState.firstLogin,
    login,
    logout,
    completeFirstLogin,
    hasRole,
    updateUser,
    verifyAuthentication
  }), [
    authState.user,
    authState.token,
    authState.isAuthenticated,
    authState.isLoading,
    authState.firstLogin,
    login,
    logout,
    completeFirstLogin,
    hasRole,
    updateUser,
    verifyAuthentication
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {!authState.isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};