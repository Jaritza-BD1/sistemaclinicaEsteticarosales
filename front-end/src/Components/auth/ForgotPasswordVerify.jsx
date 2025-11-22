import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';

export default function ForgotPasswordVerify() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!/^[0-9]{6}$/.test(code)) {
      setError('Ingresa un código de 6 dígitos válido');
      return;
    }
    if (!email) {
      setError('Email no proporcionado. Vuelve al formulario de recuperación.');
      return;
    }
    setLoading(true);
    try {
      const resp = await api.post('/auth/verify-reset-otp', { email, token: code });
      const resetToken = resp.resetToken || resp.data?.resetToken;
      if (!resetToken) {
        setError('No se obtuvo token de restablecimiento. Intenta de nuevo.');
        return;
      }
      // Redirigir a la página de cambio de contraseña con el token
      navigate(`/reset-password?token=${encodeURIComponent(resetToken)}`);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Error verificando el código');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    // Llamar de nuevo al endpoint forgot-password para reenviar el OTP
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
    } catch (err) {
      setError(err.response?.data?.error || 'Error reenviando el código');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '60px auto', background: '#fff', padding: 28, borderRadius: 10 }}>
      <h2 style={{ color: '#BA6E8F' }}>Verifica tu correo</h2>
      <p>Hemos enviado un código de 6 dígitos al correo <strong>{email}</strong>. Ingresa el código para continuar.</p>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0,6))}
          placeholder="123456"
          style={{ width: '100%', padding: '12px 14px', fontSize: 18, textAlign: 'center', borderRadius: 8, border: '1px solid #e5e7eb', marginBottom: 12 }}
          maxLength={6}
          required
        />

        <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px 0', background: '#D391B0', color: '#fff', border: 'none', borderRadius: 8 }}>
          {loading ? 'Verificando...' : 'Verificar código'}
        </button>
      </form>

      <div style={{ marginTop: 12 }}>
        <button onClick={handleResend} disabled={loading} style={{ background: 'transparent', border: 'none', color: '#6b21a8', cursor: 'pointer' }}>Reenviar código</button>
      </div>

      {error && <div style={{ color: '#b91c1c', marginTop: 12 }}>{error}</div>}
    </div>
  );
}
