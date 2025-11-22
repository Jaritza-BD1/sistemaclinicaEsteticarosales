// src/components/ProtectedRoute.jsx
import { useAuth } from '../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import LoadingSpinner from './common/LoadingSpinner';

export const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles.length > 0) {
    const userRoles = [];
    if (user?.role !== undefined) userRoles.push(user.role);
    if (user?.atr_id_rol !== undefined) userRoles.push(user.atr_id_rol);
    // If none of the user role representations match the required roles, block access
    const allowed = roles.some(r => userRoles.includes(r));
    if (!allowed) return <Navigate to="/unauthorized" replace />;
  }

  return children;
};