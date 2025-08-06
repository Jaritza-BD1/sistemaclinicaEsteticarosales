import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const Setup2FA = ({ onSuccess }) => {
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [step, setStep] = useState('setup'); // 'setup' | 'done'

  useEffect(() => {
    const setup2FA = async () => {
      try {
        const response = await api.get('/auth/2fa/setup'); // <-- CORREGIDO
        setQrCode(response.data.qrCode);
        setSecret(response.data.secret);
        setBackupCodes(response.data.backupCodes || []);
      } catch (err) {
        setError('Error al configurar 2FA');
      }
    };
    setup2FA();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/auth/2fa/verify', { token });
      setSuccess('Autenticación en dos pasos habilitada. Espera la aprobación de un administrador.');
      setStep('done');
      if (onSuccess) onSuccess();
    } catch (err) {
      setError('Código inválido');
    }
  };

  if (step === 'done') {
    return (
      <div style={{
        maxWidth: 340,
        margin: '40px auto',
        background: '#fff',
        borderRadius: 10,
        boxShadow: '0 2px 12px rgba(211,145,176,0.10)',
        padding: 18,
        textAlign: 'center',
        fontFamily: 'Inter, sans-serif',
        minHeight: 320,
        width: '95vw',
        boxSizing: 'border-box',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <div style={{ background: '#F7E3F0', borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="28" height="28" fill="none" stroke="#D391B0" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          </div>
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#BA6E8F', marginBottom: 6 }}>2FA Activado</h2>
        <div style={{ marginBottom: 12, padding: 10, background: '#E6F9ED', color: '#1B7F4C', borderRadius: 7, fontWeight: 500, fontSize: 14 }}>{success}</div>
        <p style={{ marginBottom: 0, color: '#555', fontSize: 14 }}>Tu cuenta ha sido verificada con 2FA. Ahora espera la aprobación de un administrador para poder acceder al sistema.</p>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: 340,
      margin: '40px auto',
      background: '#fff',
      borderRadius: 10,
      boxShadow: '0 2px 12px rgba(211,145,176,0.10)',
      padding: 18,
      textAlign: 'center',
      fontFamily: 'Inter, sans-serif',
      minHeight: 420,
      width: '95vw',
      boxSizing: 'border-box',
    }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
        <div style={{ background: '#F7E3F0', borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="28" height="28" fill="none" stroke="#D391B0" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
        </div>
      </div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#BA6E8F', marginBottom: 6 }}>Configurar 2FA</h2>
      {error && <div style={{ marginBottom: 10, padding: 10, background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 7, color: '#B91C1C', fontWeight: 500, fontSize: 13 }}>{typeof error === 'string' ? error : 'Error desconocido'}</div>}
      <div style={{ marginBottom: 18 }}>
        <p style={{ marginBottom: 8, color: '#333', fontSize: 14 }}>Escanea el código QR con Google Authenticator:</p>
        {qrCode && <img src={qrCode} alt="QR Code" style={{ display: 'block', margin: '0 auto 10px', width: 120, height: 120 }} />}
        <p style={{ textAlign: 'center', marginBottom: 8, color: '#555', fontSize: 13 }}>O ingresa manualmente el código:</p>
        <div style={{ padding: 8, background: '#F7E3F0', borderRadius: 7, textAlign: 'center', fontFamily: 'monospace', color: '#BA6E8F', fontWeight: 600, fontSize: 15 }}>{secret}</div>
      </div>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 10 }}>
          <label style={{ display: 'block', color: '#BA6E8F', marginBottom: 4, fontWeight: 500, fontSize: 13 }}>Código de verificación de 6 dígitos</label>
          <input
            type="text"
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 7, fontSize: 18, textAlign: 'center', marginBottom: 0 }}
            value={token}
            onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            maxLength={6}
            required
          />
        </div>
        <button
          type="submit"
          style={{ width: '100%', background: '#D391B0', color: '#fff', padding: '10px 0', borderRadius: 7, fontWeight: 600, fontSize: 15, border: 'none', cursor: 'pointer', marginBottom: 0 }}
        >
          Verificar y Activar 2FA
        </button>
      </form>
      {backupCodes.length > 0 && (
        <div style={{ marginTop: 18 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#BA6E8F', marginBottom: 8 }}>Códigos de Respaldo</h3>
          <p style={{ marginBottom: 8, color: '#D391B0', fontSize: 13 }}>Guarda estos códigos en un lugar seguro. Cada uno solo se puede usar una vez.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 0 }}>
            {backupCodes.map((code, index) => (
              <div key={index} style={{ padding: 8, border: '1px solid #F7E3F0', borderRadius: 7, textAlign: 'center', fontFamily: 'monospace', background: '#F7E3F0', color: '#BA6E8F', fontWeight: 600, fontSize: 14 }}>{code}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Setup2FA;