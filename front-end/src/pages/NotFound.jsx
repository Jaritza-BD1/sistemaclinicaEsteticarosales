// src/pages/NotFound.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>404 - Página no encontrada</h1>
      <button 
        onClick={() => navigate('/')}
        style={{ padding: '10px 20px', cursor: 'pointer' }}
      >
        Volver al inicio
      </button>
    </div>
  );
};

export default NotFound;