// Frontend/src/components/ForgotPassword.jsx
import React, { useState } from 'react';
import '../../asset/Style/ForgotPassword.css';
import api from '../../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validacion: Max longitud de acuerdo al campo en BD
    if (email.length > 50) {
      return setStatus({
        type: 'error',
        message: 'El correo no puede superar los 50 caracteres.'
      });
    }
    // Validación: no permitir espacios en blanco
      if (/\s/.test(email)) {
        return setStatus({
          type: 'error',
          message: 'El correo no puede contener espacios en blanco.'
      });  
    }
    setStatus(null);
    setLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', { 
        email: email.trim() 
      });
      
      setStatus({ 
        type: 'success', 
        message: response.data.message || 'Instrucciones enviadas a tu correo' 
      });
    } catch (error) {
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          'Error de red o del servidor.';
      setStatus({ type: 'error', message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="header">
        <h1>AR</h1>
        <h2>DRA. ALEJANDRA ROSALES</h2>
        <p>MEDICINA ESTÉTICA Y ANTIENVEJECIMIENTO</p>
      </div>

      <div className="instructions">
        Ingresa tu correo electrónico asociado a la cuenta
      </div>

      <form onSubmit={handleSubmit}>
        <div
          className="form-group"
          data-tooltip="El correo que usas para iniciar sesión"
        >
          <label htmlFor="email" className="form-label">
            Correo a recuperar
          </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onBlur={e => setEmail(e.target.value.trim())}
          maxLength={50}
          required
        />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Enviando...' : 'ENVIAR INSTRUCCIONES'}
        </button>
      </form>

      <div className="password-help">
        <a href="/login">Volver al inicio de sesión</a>
      </div>

      <div className="footer">
        <p>
          © 2025 Centro Médico Dra. Alejandra Rosales | Todos los derechos
          reservados
        </p>
      </div>

      {status && (
        <div className={`message ${status.type}`}>{status.message}</div>
      )}
    </div>
  );
}
