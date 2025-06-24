import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import './dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setUser(storedUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div>
      <header className="dashboard-header d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
        <div className="welcome-section">
          <h2 className="mb-1">
            Bienvenido, {user?.name || user?.username || 'Usuario'}
          </h2>
          <small className="text-muted">
            Panel de control - {new Date().toLocaleDateString()}
          </small>
        </div>

        <div className="button-group d-flex gap-2 align-items-center">
          <Button variant="primary" size="sm">
            Nuevo Paciente
          </Button>
          <Button variant="outline-danger" size="sm" onClick={handleLogout}>
            Cerrar sesión
          </Button>
        </div>
      </header>

      {/* Aquí puedes seguir agregando el resto del contenido del dashboard */}
    </div>
  );
};

export default Dashboard;



