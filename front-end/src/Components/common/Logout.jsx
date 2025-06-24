import React, { useEffect, useState } from 'react';
import DashboardHeader from './DashboardHeader';

const Dashboard = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setUser(storedUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login'; // o usa useNavigate si estás con React Router
  };

  return (
    <div>
      <DashboardHeader user={user} onLogout={handleLogout} />
      {/* Otros componentes del dashboard aquí */}
    </div>
  );
};

export default Dashboard;
