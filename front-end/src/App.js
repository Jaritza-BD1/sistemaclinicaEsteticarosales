// src App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
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
import ForgotPasswordVerify from './Components/auth/ForgotPasswordVerify';
import ResetPassword from './Components/auth/ResetPassword';
import EmailVerified from './pages/EmailVerified';
import VerifyEmailCode from './pages/VerifyEmailCode';

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
import CleanupRunsPage from './pages/CleanupRunsPage';
import TrashPage from './pages/TrashPage';
import BackupPage from './pages/BackupPage';
import AdminErrores from './pages/AdminErrores';
import ConfiguracionParametros from './pages/ConfiguracionParametros';
import MantenimientoDynamicPage from './pages/MantenimientoDynamicPage';
import TipoMedicoPage from './pages/TipoMedicoPage';
import EspecialidadPage from './pages/EspecialidadPage';
import BackupCodePage from './pages/BackupCodePage';
import PasswordHistoryPage from './pages/PasswordHistoryPage';
import RecordatorioPage from './pages/RecordatorioPage';
import TokenModelPage from './pages/TokenModelPage';

// Rutas anidadas
import CitasRoutes from './routes/CitasRoutes';
import PacienteRoutes from './routes/PacienteRoutes';
import DoctorRoutes from './routes/DoctorRoutes';
import ExamenRoutes from './routes/ExamenRoutes';
import TratamientoRoutes from './routes/tratamientoRoutes';
import CajaRoutes from './routes/CajaRoutes';
import TestForm from './Components/common/TestForm';
import { Dialog, DialogTitle, DialogContent } from '@mui/material';

// Función para manejar errores globales
const handleGlobalError = (event) => {
  if (event.error && event.error.message && event.error.message.includes('431')) {
    console.warn('Error 431 detectado, limpiando tokens corruptos...');
    cleanCorruptedTokens();
    try {
      const attempts = Number(sessionStorage.getItem('__app_reload_attempts__') || 0);
      if (attempts >= 2) {
        console.warn('Máximo de recargas automáticas alcanzado en handleGlobalError. No se recargará.');
        return;
      }
      sessionStorage.setItem('__app_reload_attempts__', String(attempts + 1));
    } catch (e) {}
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }
};

function ModalSwitch() {
  const location = useLocation();
  const navigate = useNavigate();
  const background = location.state && location.state.background;

  return (
    <>
      <Routes location={background || location}>
        {/* Rutas definidas (copiadas) */}
        <Route path="/login" element={<AuthLayout><AuthForm /></AuthLayout>} />
        <Route path="/signup" element={<AuthLayout><SignUp /></AuthLayout>} />
        <Route path="/forgot-password" element={<AuthLayout><ForgotPassword /></AuthLayout>} />
        <Route path="/forgot-password/verify" element={<AuthLayout><ForgotPasswordVerify /></AuthLayout>} />
        <Route path="/reset-password" element={<AuthLayout><ResetPassword /></AuthLayout>} />
        <Route path="/email-verified" element={<AuthLayout><EmailVerified /></AuthLayout>} />
        <Route path="/verify-email" element={<AuthLayout><VerifyEmailCode /></AuthLayout>} />

        <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
        <Route path="/profile" element={<AppLayout><Profile /></AppLayout>} />
        <Route path="/perfil/editar" element={<AppLayout><ProfilePage /></AppLayout>} />
        <Route path="/change-password" element={<AppLayout><ChangePassword /></AppLayout>} />
        <Route path="/admin" element={<AppLayout><ProtectedRoute requiredRole={1}><AdminDashboard /></ProtectedRoute></AppLayout>} />

        <Route path="/citas/*" element={<AppLayout><CitasRoutes /></AppLayout>} />
        <Route path="/examenes/*" element={<AppLayout><ExamenRoutes /></AppLayout>} />
        <Route path="/pacientes/lista" element={<AppLayout><PatientDataGrid /></AppLayout>} />
        <Route path="/pacientes/*" element={<AppLayout><PacienteRoutes /></AppLayout>} />
        <Route path="/medicos/*" element={<AppLayout><DoctorRoutes /></AppLayout>} />
        <Route path="/tratamientos/*" element={<AppLayout><TratamientoRoutes /></AppLayout>} />

        <Route path="/farmacia" element={<AppLayout><PharmacyPage /></AppLayout>} />

        <Route path="/calendario" element={<AppLayout><CalendarProvider><Calendar /></CalendarProvider></AppLayout>} />

        <Route path="/bitacora" element={<AppLayout><ProtectedRoute requiredRole={1}><VerBitacoraPage /></ProtectedRoute></AppLayout>} />

        <Route path="/usuarios/lista" element={<AppLayout><ProtectedRoute requiredRole={1}><PendingUsers /></ProtectedRoute></AppLayout>} />
        <Route path="/usuarios/gestionar" element={<AppLayout><ProtectedRoute requiredRole={1}><UserManagement /></ProtectedRoute></AppLayout>} />

        <Route path="/admin/errores" element={<AppLayout><ProtectedRoute requiredRole={1}><AdminErrores /></ProtectedRoute></AppLayout>} />

        <Route path="/admin/permisos" element={<AppLayout><ProtectedRoute requiredRole={1}><RolandPermissionpage /></ProtectedRoute></AppLayout>} />

        <Route path="/admin/uploads/limpieza" element={<AppLayout><ProtectedRoute requiredRole={1}><CleanupRunsPage /></ProtectedRoute></AppLayout>} />
        <Route path="/admin/uploads/trash" element={<AppLayout><ProtectedRoute requiredRole={1}><TrashPage /></ProtectedRoute></AppLayout>} />

        <Route path="/admin/backup" element={<AppLayout><ProtectedRoute requiredRole={1}><BackupPage /></ProtectedRoute></AppLayout>} />
        <Route path="/admin/backup/crear" element={<AppLayout><ProtectedRoute requiredRole={1}><BackupPage /></ProtectedRoute></AppLayout>} />
        <Route path="/admin/backup/restaurar" element={<AppLayout><ProtectedRoute requiredRole={1}><BackupPage /></ProtectedRoute></AppLayout>} />

        <Route path="/configuracion/parametros" element={<AppLayout><ProtectedRoute requiredRole={1}><ConfiguracionParametros /></ProtectedRoute></AppLayout>} />

        <Route path="/mantenimiento/sistemas/BackupCode" element={<AppLayout><ProtectedRoute requiredRole={1}><BackupCodePage /></ProtectedRoute></AppLayout>} />
        <Route path="/mantenimiento/sistemas/PasswordHistory" element={<AppLayout><ProtectedRoute requiredRole={1}><PasswordHistoryPage /></ProtectedRoute></AppLayout>} />
        <Route path="/mantenimiento/sistemas/Recordatorio" element={<AppLayout><ProtectedRoute requiredRole={1}><RecordatorioPage /></ProtectedRoute></AppLayout>} />
        <Route path="/mantenimiento/sistemas/Token" element={<AppLayout><ProtectedRoute requiredRole={1}><TokenModelPage /></ProtectedRoute></AppLayout>} />
        <Route path="/mantenimiento/:category/:model" element={<AppLayout><ProtectedRoute requiredRole={1}><MantenimientoDynamicPage /></ProtectedRoute></AppLayout>} />

        <Route path="/mantenimiento/catalogos/TipoMedico" element={<AppLayout><ProtectedRoute requiredRole={1}><TipoMedicoPage /></ProtectedRoute></AppLayout>} />
        <Route path="/mantenimiento/catalogos/Especialidad" element={<AppLayout><ProtectedRoute requiredRole={1}><EspecialidadPage /></ProtectedRoute></AppLayout>} />

        <Route path="/auth-redirect" element={<AuthRedirectHandler />} />

        <Route path="/debug" element={<div style={{ padding: '20px' }}><h1>Debug Info</h1><pre id="debug-info"></pre></div>} />

        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/not-found" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/not-found" replace />} />

        <Route path="/test-form" element={<AppLayout><TestForm /></AppLayout>} />
        <Route path="/test-admin" element={<AppLayout><ProtectedRoute requiredRole={1}><AdminDashboard /></ProtectedRoute></AppLayout>} />
      </Routes>

      {/* Removed modal for /citas/agendar because the referenced page component was not present. */}
    </>
  );
}

// Agregar listener para errores globales
if (typeof window !== 'undefined') {
  window.addEventListener('error', handleGlobalError);
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.message && event.reason.message.includes('431')) {
      console.warn('Error 431 detectado en promise rejection, limpiando tokens corruptos...');
      cleanCorruptedTokens();
      try {
        const attempts = Number(sessionStorage.getItem('__app_reload_attempts__') || 0);
        if (attempts >= 2) {
          console.warn('Máximo de recargas automáticas alcanzado en unhandledrejection. No se recargará.');
          return;
        }
        sessionStorage.setItem('__app_reload_attempts__', String(attempts + 1));
      } catch (e) {}
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
            <Route path="/forgot-password/verify" element={<AuthLayout><ForgotPasswordVerify /></AuthLayout>} />
            <Route path="/reset-password" element={<AuthLayout><ResetPassword /></AuthLayout>} />
            <Route path="/email-verified" element={<AuthLayout><EmailVerified /></AuthLayout>} />
            <Route path="/verify-email" element={<AuthLayout><VerifyEmailCode /></AuthLayout>} />

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
            <Route path="/caja/*" element={<AppLayout><CajaRoutes /></AppLayout>} />
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

            {/* Errores (única ruta que muestra el formulario) */}
            <Route path="/admin/errores" element={
              <AppLayout>
                <ProtectedRoute requiredRole={1}>
                  <AdminErrores />
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
            <Route path="/admin/backup" element={
              <AppLayout>
                <ProtectedRoute requiredRole={1}>
                  <BackupPage />
                </ProtectedRoute>
              </AppLayout>
            } />
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

            {/* Configuración - Parámetros del Sistema */}
            <Route path="/configuracion/parametros" element={
              <AppLayout>
                <ProtectedRoute requiredRole={1}>
                  <ConfiguracionParametros />
                </ProtectedRoute>
              </AppLayout>
            } />

            {/* Rutas de Mantenimiento dinámicas */}
            {/* Rutas directas para modelos añadidos manualmente */}
            <Route path="/mantenimiento/sistemas/BackupCode" element={<AppLayout><ProtectedRoute requiredRole={1}><BackupCodePage /></ProtectedRoute></AppLayout>} />
            <Route path="/mantenimiento/sistemas/PasswordHistory" element={<AppLayout><ProtectedRoute requiredRole={1}><PasswordHistoryPage /></ProtectedRoute></AppLayout>} />
            <Route path="/mantenimiento/sistemas/Recordatorio" element={<AppLayout><ProtectedRoute requiredRole={1}><RecordatorioPage /></ProtectedRoute></AppLayout>} />
            <Route path="/mantenimiento/sistemas/Token" element={<AppLayout><ProtectedRoute requiredRole={1}><TokenModelPage /></ProtectedRoute></AppLayout>} />
            <Route path="/mantenimiento/:category/:model" element={
              <AppLayout>
                <ProtectedRoute requiredRole={1}>
                  <MantenimientoDynamicPage />
                </ProtectedRoute>
              </AppLayout>
            } />

            {/* Rutas directas para catálogos específicos (opcional) */}
            {/* Route removed for Parametro - access via Configuración -> Parámetros del Sistema */}
            <Route path="/mantenimiento/catalogos/TipoMedico" element={<AppLayout><ProtectedRoute requiredRole={1}><TipoMedicoPage /></ProtectedRoute></AppLayout>} />
            <Route path="/mantenimiento/catalogos/Especialidad" element={<AppLayout><ProtectedRoute requiredRole={1}><EspecialidadPage /></ProtectedRoute></AppLayout>} />
            
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