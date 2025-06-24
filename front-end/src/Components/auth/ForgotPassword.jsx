import React, { useState } from 'react';
import '../../asset/Style/ForgotPassword.css';

export default function ForgotPassword() {
  const [smtpEmail, setSmtpEmail] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/auth/forgot-password`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ smtpEmail, smtpPass, email }),
        }
      );
      const data = await response.json();

      if (response.ok) {
        setStatus({
          type: 'success',
          message: data.message || 'Instrucciones enviadas a tu correo.',
        });
      } else {
        setStatus({
          type: 'error',
          message: data.message || 'No se pudieron enviar las instrucciones.',
        });
      }
    } catch {
      setStatus({ type: 'error', message: 'Error de red o del servidor.' });
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
        Ingresa tus credenciales SMTP y el correo a recuperar
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="email"
            placeholder="SMTP Email (Gmail)"
            value={smtpEmail}
            onChange={(e) => setSmtpEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="SMTP App Password"
            value={smtpPass}
            onChange={(e) => setSmtpPass(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="email"
            placeholder="Correo electrónico a recuperar"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
        <p>© 2023 Centro Médico Dra. Alejandra Rosales | Todos los derechos reservados</p>
      </div>
      {status && (<div className={`message ${status.type}`}>{status.message}</div>)}
    </div>
  );
}
