// src/pages/AdminDashboard.jsx
import React, { useState } from 'react';
import { useAuth } from '../Components/context/AuthContext';
import UserManagement   from '../Components/UserManager/UserManagement';
import PendingUser      from '../Components/admin/PendingUsers';
import BitacoraConsulta from '../Components/dashboard/BitacoraConsulta';
import LogManagement    from '../Components/LogManagement';
import SideBar          from '../Components/common/SideBar';
import TopAppBar        from '../Components/common/TopAppBar';

import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();

  // nivel1: 'users' | 'logs'
  const [section, setSection] = useState('users');
  // subtabs para usuarios y bitácora
  const [userTab, setUserTab] = useState('manage');      // 'manage' | 'pending'
  const [logTab, setLogTab] = useState('consult');       // 'consult' | 'manage'

  // al cambiar de sección reseteamos subtabs
  const showUsers = () => {
    setSection('users');
    setUserTab('manage');
  };
  const showLogs = () => {
    setSection('logs');
    setLogTab('consult');
  };

  return (
    <div className="admin-dashboard">
      {/* 1. Sidebar */}
      <div className="sidebar-wrapper">
        <SideBar />
      </div>

      {/* 2. Contenido */}
      <div className="content-wrapper">
        {/* 2a. Top bar */}
        <div className="topbar-wrapper">
          <TopAppBar
            userName={user?.name || user?.username}
            onLogout={logout}
          />
        </div>

        {/* 2b. Main content */}
        <div className="main-content container">
          <h1 className="mb-4">Panel de Administración</h1>
          <p className="mb-3">
            Bienvenido, <strong>{user?.name || user?.username}</strong>
            &nbsp;(Rol: <em>{user?.role}</em>)
          </p>

          {/* Nivel 1 */}
          <div className="view-switcher mb-3">
            <button
              onClick={showUsers}
              className={`btn me-2 ${
                section === 'users'
                  ? 'btn-primary'
                  : 'btn-outline-primary'
              }`}
            >
              Gestión de Usuarios
            </button>
            <button
              onClick={showLogs}
              className={`btn ${
                section === 'logs'
                  ? 'btn-primary'
                  : 'btn-outline-primary'
              }`}
            >
              Gestión de Bitácora
            </button>
          </div>

          {/* Nivel 2 */}
          {section === 'users' && (
            <div className="subview-switcher mb-4">
              <button
                onClick={() => setUserTab('manage')}
                className={`btn me-2 ${
                  userTab === 'manage'
                    ? 'btn-secondary'
                    : 'btn-outline-secondary'
                }`}
              >
                Gestión de Usuarios
              </button>
              <button
                onClick={() => setUserTab('pending')}
                className={`btn ${
                  userTab === 'pending'
                    ? 'btn-secondary'
                    : 'btn-outline-secondary'
                }`}
              >
                Usuarios Pendientes
              </button>
            </div>
          )}

          {section === 'logs' && (
            <div className="subview-switcher mb-4">
              <button
                onClick={() => setLogTab('consult')}
                className={`btn me-2 ${
                  logTab === 'consult'
                    ? 'btn-secondary'
                    : 'btn-outline-secondary'
                }`}
              >
                Consultar Bitácora
              </button>
              <button
                onClick={() => setLogTab('manage')}
                className={`btn ${
                  logTab === 'manage'
                    ? 'btn-secondary'
                    : 'btn-outline-secondary'
                }`}
              >
                Gestión de Bitácora
              </button>
            </div>
          )}

          {/* Contenido según pestaña */}
          {section === 'users' && userTab === 'manage' && <UserManagement />}
          {section === 'users' && userTab === 'pending' && <PendingUser />}

          {section === 'logs' && logTab === 'consult' && <BitacoraConsulta />}
          {section === 'logs' && logTab === 'manage' && <LogManagement />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;


