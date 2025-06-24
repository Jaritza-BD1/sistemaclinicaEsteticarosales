// src/components/DashboardAdmin.jsx
import React, { useEffect, useState } from 'react';
import DashboardHeader from './DashboardHeader';
import UserManagement from '../UserManager/UserManagement';
import LogManagement from './LogManagement';

const DashboardAdmin = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('user'));
    setUser(stored);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  if (!user) return null; // o un spinner si lo prefieres
  if (user.role !== 'admin') {
    return (
      <div className="text-center p-5">
        <h3>No autorizado</h3>
        <p>Solo los administradores pueden ver este panel.</p>
      </div>
    );
  }

  return (
    <>
      <DashboardHeader user={user} onLogout={handleLogout} />

      <div className="container mt-4">
        <h4 className="mb-3">Gestión de Usuarios</h4>
        <UserManagement />

        <hr className="my-5" />

        <h4 className="mb-3">Gestión de Bitácora</h4>
        <LogManagement />
      </div>
    </>
  );
};

export default DashboardAdmin;
