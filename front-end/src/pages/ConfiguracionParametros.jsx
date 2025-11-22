import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../Components/context/AuthContext';
import MaintenanceManager from '../Components/Maintenance/MaintenanceManager';

const columnLabels = {
  atr_id_parametro: 'ID',
  atr_parametro: 'Parámetro',
  atr_valor: 'Valor',
  atr_id_usuario: 'Usuario',
  atr_creado_por: 'Creado por',
  atr_fecha_creacion: 'Fecha creación',
  atr_modificado_por: 'Modificado por',
  atr_fecha_modificacion: 'Fecha modificación',
};

const ConfiguracionParametros = () => {
  // Control de acceso: solo usuarios autenticados y administradores (atr_id_rol === 1)
  const { user, isAdmin, isLoading } = useAuth();

  // Mientras se cargan datos de auth, no renderizamos la página
  if (isLoading) return null;

  // Si no hay usuario logueado, redirigir al login
  if (!user) return <Navigate to="/login" replace />;

  // Si no es admin, redirigir a not-found o unauthorized
  if (!isAdmin()) return <Navigate to="/not-found" replace />;

  return <MaintenanceManager model="Parametro" columnLabels={columnLabels} />;
};

export default ConfiguracionParametros;
