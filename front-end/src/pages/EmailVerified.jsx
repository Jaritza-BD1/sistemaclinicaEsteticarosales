import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function EmailVerified() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const success = searchParams.get('success') === 'true';
  const error = searchParams.get('error');

  return (
    <div style={{ textAlign: 'center', marginTop: 60 }}>
      <h1>
        {success
          ? '¡Correo verificado exitosamente!'
          : 'Error al verificar el correo'}
      </h1>
      {error && <p style={{ color: 'red' }}>{decodeURIComponent(error)}</p>}
      <button onClick={() => navigate('/login')}>Ir al login</button>
    </div>
  );
} 