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
  // Estado inicial seguro
  const [authState, setAuthState] = useState(() => {
    try {
      const rawUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      const firstLogin = localStorage.getItem('firstLogin') === 'true';
      
      if (rawUser && rawUser !== 'undefined' && token && token !== 'undefined') {
        return {
          user: JSON.parse(rawUser),
          token,
          firstLogin,
          isAuthenticated: true,
          isLoading: false
        };
      }
    } catch (error) {
      console.error('Error parsing auth state:', error);
    }
    
    // Limpiar datos inválidos
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('firstLogin');
    
    return {
      user: null,
      token: null,
      firstLogin: false,
      isAuthenticated: false,
      isLoading: true
    };
  });

  // Configurar headers de axios
  useEffect(() => {
    if (authState.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${authState.token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [authState.token]);

  // Función de logout
  const logout = useCallback(() => {
    localStorage.removeItem('user');
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

  // Función para verificar token
  const verifyToken = useCallback(async () => {
    try {
      const response = await axios.get('/api/auth/verify-token');
      
      if (response.data.valid) {
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: true,
          isLoading: false
        }));
        return true;
      } else {
        logout();
        return false;
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      logout();
      return false;
    }
  }, [logout]);

  // Verificar token al cargar
  useEffect(() => {
    if (authState.token && authState.isLoading) {
      verifyToken();
    }
  }, [authState.token, authState.isLoading, verifyToken]);

  // Función de login
  const login = useCallback((userData, jwt, firstLogin = false) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', jwt);
    localStorage.setItem('firstLogin', firstLogin);
    
    setAuthState({
      user: userData,
      token: jwt,
      firstLogin,
      isAuthenticated: true,
      isLoading: false
    });
    
    if (firstLogin) {
      window.location.href = '/change-password';
    }
  }, []);

  // NUEVA FUNCIÓN: Verificación activa de autenticación
  const verifyAuthentication = useCallback(async () => {
    try {
      const response = await axios.get('/api/auth/verify-token');
      return response.data.valid;
    } catch (error) {
      console.error('Active verification failed:', error);
      return false;
    }
  }, []);

  // Resto de funciones...
  const completeFirstLogin = useCallback(() => {
    localStorage.setItem('firstLogin', 'false');
    setAuthState(prev => ({
      ...prev,
      firstLogin: false
    }));
  }, []);

  const hasRole = useCallback((roleId) => {
    return authState.user?.role === roleId;
  }, [authState.user]);

  const updateUser = useCallback((userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setAuthState(prev => ({
      ...prev,
      user: userData
    }));
  }, []);

  // Valor del contexto
  const contextValue = useMemo(() => ({
    user: authState.user,
    token: authState.token,
    isAuthenticated: authState.isAuthenticated, // BOOLEANO
    isLoading: authState.isLoading,
    firstLogin: authState.firstLogin,
    login,
    logout,
    completeFirstLogin,
    hasRole,
    updateUser,
    verifyAuthentication // FUNCIÓN ADICIONAL
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
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};
