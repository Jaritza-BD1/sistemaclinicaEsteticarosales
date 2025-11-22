import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate, useLocation } from 'react-router-dom';

const VerifyEmailCode = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const prefilledEmail = location.state?.email || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!/^[0-9]{6}$/.test(code)) {
      setError('Ingresa un código de 6 dígitos válido');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/auth/verify-email', { token: code });
      setSuccess(response.data?.message || 'Correo verificado correctamente. Espera la aprobación del administrador.');
      setTimeout(() => {
        navigate('/login');
      }, 1800);
    } catch (err) {
      setError(err.response?.data?.error || 'Error verificando el código. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setSuccess('');
    const email = prefilledEmail;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Email inválido. Vuelve al registro e ingresa tu correo correctamente.');
      return;
    }
    setResendLoading(true);
    try {
      const resp = await api.post('/auth/resend-verification', { email });
      setSuccess(resp?.message || 'Se ha reenviado el código a tu correo.');
    } catch (err) {
      setError(err?.message || err?.error || 'Error reenviando el código. Intenta más tarde.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: 420,
      margin: '60px auto',
      background: '#fff',
      borderRadius: 10,
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      padding: 28,
      textAlign: 'center'
    }}>
      <h2 style={{ color: '#BA6E8F', marginBottom: 14 }}>Verifica tu correo</h2>
      <p style={{ color: '#555', marginBottom: 18 }}>Ingresa el código de 6 dígitos que te enviamos por email.</p>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0,6))}
          placeholder="123456"
          style={{
            width: '100%',
            padding: '12px 14px',
            fontSize: 18,
            textAlign: 'center',
            borderRadius: 8,
            border: '1px solid #e5e7eb',
            marginBottom: 12
          }}
          maxLength={6}
          required
        />

        <button type="submit" disabled={loading} style={{
          width: '100%',
          padding: '10px 0',
          background: '#D391B0',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          fontWeight: 600,
          cursor: 'pointer'
        }}>
          {loading ? 'Verificando...' : 'Verificar código'}
        </button>
      </form>

      <div style={{ marginTop: 12 }}>
        <div style={{ marginBottom: 8, color: '#555' }}>¿No recibiste el código?</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleResend}
            disabled={resendLoading}
            style={{
              flex: 1,
              padding: '8px 10px',
              background: '#f3f4f6',
              color: '#111827',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              cursor: 'pointer'
            }}
          >
            {resendLoading ? 'Reenviando...' : 'Reenviar código'}
          </button>
          <input
            type="email"
            value={prefilledEmail}
            readOnly
            placeholder="correo@ejemplo.com"
            style={{
              flex: 2,
              padding: '8px 10px',
              borderRadius: 8,
              border: '1px solid #e5e7eb',
              background: prefilledEmail ? '#f9fafb' : '#fff'
            }}
          />
        </div>
      </div>

      {error && <div style={{ marginTop: 12, color: '#b91c1c' }}>{error}</div>}
      {success && <div style={{ marginTop: 12, color: '#1b7f4c' }}>{success}</div>}
    </div>
  );
};

export default VerifyEmailCode;
