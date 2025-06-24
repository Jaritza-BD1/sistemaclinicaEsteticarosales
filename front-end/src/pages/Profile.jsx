import React from 'react';
import { useAuth } from '../Components/context/AuthContext';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1>Mi Perfil</h1>
      <p>Nombre: {user?.name}</p>
      <p>Email: {user?.email}</p>
      {/* Agrega más campos según necesites */}
    </div>
  );
};

export default Profile;