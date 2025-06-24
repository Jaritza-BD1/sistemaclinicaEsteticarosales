// src/Components/SensitiveAction.jsx
import React from 'react';
import { useAuth } from './context/AuthContext';

const SensitiveAction = () => {
  const { verifyAuthentication } = useAuth();

  const handleSensitiveAction = async () => {
    // Verificación activa con el servidor
    const isStillAuthenticated = await verifyAuthentication();
    
    if (isStillAuthenticated) {
      // Ejecutar acción sensible
      console.log('Realizando acción crítica');
    } else {
      alert('Tu sesión ha expirado. Por favor vuelve a iniciar sesión.');
    }
  };

  return (
    <button onClick={handleSensitiveAction}>
      Realizar acción sensible
    </button>
  );
};

export default SensitiveAction;