// src/components/ProtectedRoute.jsx
import { AuthProvider,useAuth } from './Components/context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import LoadingSpinner from './common/LoadingSpinner';

export const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};