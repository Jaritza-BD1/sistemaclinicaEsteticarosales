// src/pages/AdminDashboard.jsx
import React, { useState } from 'react';
import { useAuth } from '../Components/context/AuthContext';
import UserManagement from '../Components/UserManager/UserManagement';
import LogManagement from '../Components/LogManagement';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [view, setView] = useState('users'); // 'users' o 'logs'

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Panel de Administración</h1>
        <button onClick={logout} className="btn btn-danger">
          Cerrar sesión
        </button>
      </div>

      <p>
        Bienvenido, {user?.name || user?.username} (Rol: {user?.role})
      </p>

      <div className="mb-3">
        <button
          onClick={() => setView('users')}
          className={`btn me-2 ${
            view === 'users' ? 'btn-primary' : 'btn-outline-primary'
          }`}
        >
          Gestión de Usuarios
        </button>
        <button
          onClick={() => setView('logs')}
          className={`btn ${
            view === 'logs' ? 'btn-primary' : 'btn-outline-primary'
          }`}
        >
          Gestión de Bitácora
        </button>
      </div>

      <div>
        {view === 'users' && <UserManagement />}
        {view === 'logs' && <LogManagement />}
      </div>
    </div>
  );
};

export default AdminDashboard;
