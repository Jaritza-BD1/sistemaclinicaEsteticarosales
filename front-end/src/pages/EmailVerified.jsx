import React, { useEffect, useState } from 'react';
import api from '../services/api';

const EmailVerified = () => {
  const [status, setStatus] = useState('Verificando...');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (!token) {
      setStatus('Token inválido o faltante.');
      return;
    }
    api.post('/auth/verify-email', { token })
      .then(() => setStatus('¡Correo verificado! Espera la aprobación del administrador.'))
      .catch(() => setStatus('Error al verificar el correo. El enlace puede haber expirado o ya fue usado.'));
  }, []);

  return (
    <div style={{
      maxWidth: 400,
      margin: '60px auto',
      background: '#fff',
      borderRadius: 10,
      boxShadow: '0 2px 12px rgba(211,145,176,0.10)',
      padding: 32,
      textAlign: 'center',
      fontFamily: 'Inter, sans-serif',
    }}>
      <h2 style={{ color: '#BA6E8F', marginBottom: 18 }}>Verificación de Correo</h2>
      <p style={{ color: '#555', fontSize: 16 }}>{status}</p>
    </div>
  );
};

export default EmailVerified; 