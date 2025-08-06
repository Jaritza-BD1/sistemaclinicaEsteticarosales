// src App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { AuthProvider, useAuth } from './Components/context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import theme from './theme'; // Importar el tema personalizado

// Importar función de limpieza de tokens
import { cleanCorruptedTokens } from './utils/auth';
import './utils/tokenCleanup'; // Importar utilidades de limpieza de tokens

// Importar error boundary y hook de interceptación
import GlobalErrorBoundary from './Components/common/GlobalErrorBoundary';
import { useScrollErrorInterceptor } from './hooks/useScrollErrorInterceptor';

// Importar los nuevos layouts
import AuthLayout from './layouts/AuthLayout';
import AppLayout from './layouts/AppLayout';

// Componentes de autenticación (sin layout)
import AuthForm from './Components/auth/AuthForm';
import SignUp from './Components/SignUp/SignUp';
import ForgotPassword from './Components/auth/ForgotPassword';
import ResetPassword from './Components/auth/ResetPassword';
import EmailVerified from './pages/EmailVerified';

// Páginas que irán dentro del layout protegido
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import ChangePassword from './Components/auth/change-password';
import ProfilePage from './pages/ProfilePage';
import Calendar from './Components/calendar/CalendarView';
import { CalendarProvider } from './Components/context/CalendarContext';
import PatientDataGrid from './Components/patients/PatientDataGrid';
import PharmacyPage from './pages/PharmacyPage';
import VerBitacoraPage from './pages/VerBitacoraPage';
import UserManagement from './Components/UserManager/UserManagement';
import PendingUsers from './Components/admin/PendingUsers';
import RolandPermissionpage from './pages/RolandPermissionpage';
import BackupPage from './pages/BackupPage';

// Rutas anidadas
import CitasRoutes from './routes/CitasRoutes';
import PacienteRoutes from './routes/PacienteRoutes';
import DoctorRoutes from './routes/DoctorRoutes';
import ExamenRoutes from './routes/ExamenRoutes';
import TratamientoRoutes from './routes/tratamientoRoutes';
import TestForm from './Components/common/TestForm';

// Función para manejar errores globales
const handleGlobalError = (event) => {
  if (event.error && event.error.message && event.error.message.includes('431')) {
    console.warn('Error 431 detectado, limpiando tokens corruptos...');
    cleanCorruptedTokens();
    // Recargar la página después de limpiar
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }
};

// Agregar listener para errores globales
if (typeof window !== 'undefined') {
  window.addEventListener('error', handleGlobalError);
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.message && event.reason.message.includes('431')) {
      console.warn('Error 431 detectado en promise rejection, limpiando tokens corruptos...');
      cleanCorruptedTokens();
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  });
}

// Componente para rutas protegidas con verificación de rol
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole !== null && (!user || user.atr_id_rol !== requiredRole)) {
    return <Navigate to="/not-found" replace />;
  }

  return children;
};

// Componente para redirigir según el estado de autenticación
const AuthRedirectHandler = () => {
  const { isAuthenticated, user } = useAuth();

  console.log('🔍 AuthRedirectHandler:', { isAuthenticated, user });

  if (isAuthenticated && user) {
    const targetPath = user.atr_id_rol === 1 ? '/admin' : '/dashboard';
    console.log('🔄 Redirigiendo a:', targetPath);
    return <Navigate to={targetPath} replace />;
  }

  console.log('🔄 Redirigiendo a login');
  return <Navigate to="/login" replace />;
};

// Componente principal de la aplicación con interceptación de errores
const AppContent = () => {
  // Usar el hook de interceptación de errores de scroll
  useScrollErrorInterceptor();

  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Rutas de autenticación */}
            <Route path="/login" element={<AuthLayout><AuthForm /></AuthLayout>} />
            <Route path="/signup" element={<AuthLayout><SignUp /></AuthLayout>} />
            <Route path="/forgot-password" element={<AuthLayout><ForgotPassword /></AuthLayout>} />
            <Route path="/reset-password" element={<AuthLayout><ResetPassword /></AuthLayout>} />
            <Route path="/email-verified" element={<AuthLayout><EmailVerified /></AuthLayout>} />

            {/* Rutas principales de la aplicación */}
            <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
            <Route path="/profile" element={<AppLayout><Profile /></AppLayout>} />
            <Route path="/perfil/editar" element={<AppLayout><ProfilePage /></AppLayout>} />
            <Route path="/change-password" element={<AppLayout><ChangePassword /></AppLayout>} />
            
            <Route path="/admin" element={
              <AppLayout>
                <ProtectedRoute requiredRole={1}>
                  <AdminDashboard />
                </ProtectedRoute>
              </AppLayout>
            } />
            
            <Route path="/citas/*" element={<AppLayout><CitasRoutes /></AppLayout>} />
            <Route path="/examenes/*" element={<AppLayout><ExamenRoutes /></AppLayout>} />
            <Route path="/pacientes/lista" element={<AppLayout><PatientDataGrid /></AppLayout>} />
            <Route path="/pacientes/*" element={<AppLayout><PacienteRoutes /></AppLayout>} />
            <Route path="/medicos/*" element={<AppLayout><DoctorRoutes /></AppLayout>} />
            <Route path="/tratamientos/*" element={<AppLayout><TratamientoRoutes /></AppLayout>} />
            
            <Route path="/farmacia" element={<AppLayout><PharmacyPage /></AppLayout>} />
            
            <Route path="/calendario" element={
              <AppLayout>
                <CalendarProvider>
                  <Calendar />
                </CalendarProvider>
              </AppLayout>
            } />
            
            {/* Rutas de Bitácora */}
            <Route path="/bitacora" element={
              <AppLayout>
                <ProtectedRoute requiredRole={1}>
                  <VerBitacoraPage />
                </ProtectedRoute>
              </AppLayout>
            } />

            {/* Rutas de Gestión de Usuarios */}
            <Route path="/usuarios/lista" element={
              <AppLayout>
                <ProtectedRoute requiredRole={1}>
                  <PendingUsers />
                </ProtectedRoute>
              </AppLayout>
            } />
            
            <Route path="/usuarios/gestionar" element={
              <AppLayout>
                <ProtectedRoute requiredRole={1}>
                  <UserManagement />
                </ProtectedRoute>
              </AppLayout>
            } />

            {/* Rutas de Roles y Permisos */}
            <Route path="/admin/permisos" element={
              <AppLayout>
                <ProtectedRoute requiredRole={1}>
                  <RolandPermissionpage />
                </ProtectedRoute>
              </AppLayout>
            } />

            {/* Rutas de Backup */}
            <Route path="/admin/backup/crear" element={
              <AppLayout>
                <ProtectedRoute requiredRole={1}>
                  <BackupPage />
                </ProtectedRoute>
              </AppLayout>
            } />
            
            <Route path="/admin/backup/restaurar" element={
              <AppLayout>
                <ProtectedRoute requiredRole={1}>
                  <BackupPage />
                </ProtectedRoute>
              </AppLayout>
            } />
            
            <Route path="/auth-redirect" element={<AuthRedirectHandler />} />

            {/* Ruta de debugging */}
            <Route path="/debug" element={
              <div style={{ padding: '20px' }}>
                <h1>Debug Info</h1>
                <pre id="debug-info"></pre>
                <script>
                  {`
                    const debugInfo = {
                      user: ${JSON.stringify(window.localStorage.getItem('user'))},
                      authToken: ${JSON.stringify(window.localStorage.getItem('authToken'))},
                      token: ${JSON.stringify(window.localStorage.getItem('token'))},
                      isAuthenticated: ${JSON.stringify(window.localStorage.getItem('isAuthenticated'))}
                    };
                    document.getElementById('debug-info').textContent = JSON.stringify(debugInfo, null, 2);
                  `}
                </script>
              </div>
            } />

            {/* Redirección por defecto */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Manejo de errores */}
            <Route path="/not-found" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/not-found" replace />} />

            {/* Ruta de prueba para verificar el tema */}
            <Route path="/test-form" element={<AppLayout><TestForm /></AppLayout>} />
            
            {/* Ruta de prueba para AdminDashboard */}
            <Route path="/test-admin" element={
              <AppLayout>
                <ProtectedRoute requiredRole={1}>
                  <AdminDashboard />
                </ProtectedRoute>
              </AppLayout>
            } />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default function App() {
  return (
    <GlobalErrorBoundary>
      <AppContent />
    </GlobalErrorBoundary>
  );
}