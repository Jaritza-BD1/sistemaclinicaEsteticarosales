// src App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './Components/context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';

import AuthForm from './Components/auth/AuthForm';
import SignUp from './Components/SignUp/SignUp';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import ChangePassword from './Components/auth/change-password';
import ForgotPassword from './Components/auth/ForgotPassword';
import ResetPassword from './Components/auth/ResetPassword';
import EmailVerification from './Components/twoFactor/Verify2FA';
import CitasRoutes from './routes/CitasRoutes';
import EmailVerified from './pages/EmailVerified';


// Componente para rutas protegidas
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.atr_id_rol !== requiredRole) {
    return <Navigate to="/not-found" replace />;
  }

  return children;
};

// Componente para redirigir según el estado de autenticación
const AuthRedirectHandler = () => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated()) {
    return <Navigate to={user.atr_id_rol === 1 ? '/admin' : '/dashboard'} replace />;
  }

  return <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<AuthForm />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Rutas protegidas */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />

          <Route path="/admin/*" element={
            <ProtectedRoute requiredRole={1}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* Nueva ruta para recuperación de contraseña */}
          <Route path="/forgot-password" element={<ForgotPassword />} />


          {/*Nueva ruta para reset de contraseña */}
          <Route path="/reset-password" element={<ResetPassword />} />  


          {/*Nueva ruta para cambio de contraseña */}
          <Route path="/change-password" element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          } />


          <Route path="/verify-email" element={
              <EmailVerification />
          } />

          <Route path="/email-verified" element={<EmailVerified />} />

          <Route path="/citas/*" element={
            <ProtectedRoute>
              <CitasRoutes />
            </ProtectedRoute>
          } />


          {/* Redirección por defecto para rutas autenticadas */}
          <Route path="/auth-redirect" element={<AuthRedirectHandler />} />
          
          
          {/* Manejo de errores */}
          <Route path="/not-found" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/not-found" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}



