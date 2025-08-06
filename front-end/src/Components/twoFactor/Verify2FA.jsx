import React, { useState, useEffect } from 'react';
import api from '../../services/api';  // Ruta corregida

const Verify2FA = ({ userId, onSuccess, userEmail }) => {
  console.log('=== VERIFY2FA COMPONENT RENDERED ===');
  console.log('Verify2FA: Received props:', { userId, userEmail });
  console.log('Verify2FA: userId type:', typeof userId);
  console.log('Verify2FA: userId value:', userId);
  
  const [token, setToken] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [activeTab, setActiveTab] = useState('app');

  // Temporizador para reenvío de código
  useEffect(() => {
    let timer;
    if (resendDisabled && resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    } else if (resendTimer === 0) {
      setResendDisabled(false);
      setResendTimer(30);
    }
    return () => clearTimeout(timer);
  }, [resendDisabled, resendTimer]);



  const handleTokenSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    if (!userId) {
      setError('Error: ID de usuario no disponible');
      setIsLoading(false);
      return;
    }
    
    const payload = { userId: parseInt(userId), token };
    console.log('Verify2FA: Sending payload:', payload);
    
    try {
      const response = await api.post('/auth/2fa/verify-login', payload);
      onSuccess(response.data);
    } catch (err) {
      console.log('Verify2FA: Error response:', err.response?.data);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Código inválido. Por favor, inténtalo de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackupSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/2fa/verify-login', { 
        userId: parseInt(userId), 
        token: backupCode 
      });
      onSuccess(response.data);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Código de respaldo inválido. Por favor, verifica.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendDisabled(true);
    setError('');
    
    if (!userId) {
      setError('Error: ID de usuario no disponible');
      setResendDisabled(false);
      return;
    }
    
    const payload = { userId: parseInt(userId) };
    console.log('Verify2FA: Resending code with payload:', payload);
    
    try {
      await api.post('/auth/2fa/resend-code', payload);
    } catch (err) {
      console.log('Verify2FA: Resend code error:', err.response?.data);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Error al reenviar el código. Inténtalo de nuevo.');
      }
    }
  };

  const handleEmailCodeSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/2fa/verify-email-code', { 
        userId: parseInt(userId), 
        token 
      });
      onSuccess(response.data);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Código inválido. Por favor, inténtalo de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderTabButton = (tabKey, label, iconPath) => (
    <button
      className={''}
      style={{
        flex: 1,
        padding: '6px 0',
        fontSize: 13,
        fontWeight: 500,
        background: 'none',
        border: 'none',
        borderBottom: activeTab === tabKey ? '2px solid #D391B0' : '2px solid transparent',
        color: activeTab === tabKey ? '#D391B0' : '#BA6E8F',
        outline: 'none',
        cursor: 'pointer',
        transition: 'color 0.2s, border-bottom 0.2s',
        minWidth: 0
      }}
      onClick={() => setActiveTab(tabKey)}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <svg className="w-5 h-5 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ color: activeTab === tabKey ? '#D391B0' : '#BA6E8F', width: 18, height: 18, marginBottom: 2 }}>
          {iconPath}
        </svg>
        <span>{label}</span>
      </div>
    </button>
  );

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
      position: 'relative',
      minHeight: 420,
      width: '95vw',
      boxSizing: 'border-box',
    }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <div style={{ background: '#F7E3F0', borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="28" height="28" fill="none" stroke="#D391B0" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          </div>
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#BA6E8F', marginBottom: 6 }}>Verificación de Seguridad</h2>
        <p style={{ color: '#555', fontSize: 14 }}>Para proteger tu cuenta, necesitamos verificar tu identidad</p>
      </div>

      {/* Pestañas de método de verificación */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', marginBottom: 18 }}>
        {renderTabButton('app', 'Autenticador', <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />)}
        {renderTabButton('email', 'Correo', <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />)}
        {renderTabButton('backup', 'Respaldo', <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />)}
      </div>

      {/* Contenido de la pestaña activa */}
      {activeTab === 'app' && (
        <div style={{ animation: 'fadeIn 0.3s', marginBottom: 10 }}>
          <p style={{ color: '#333', marginBottom: 10, fontSize: 14 }}>Ingresa el código de 6 dígitos de tu aplicación de autenticación</p>
          <form onSubmit={handleTokenSubmit} style={{ marginBottom: 0 }}>
            <input
              type="text"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 7, fontSize: 18, textAlign: 'center', marginBottom: 12 }}
              value={token}
              onChange={e => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              maxLength={6}
              required
              autoFocus
            />
            <button type="submit" style={{ width: '100%', padding: '10px 0', borderRadius: 7, background: '#D391B0', color: '#fff', fontWeight: 600, fontSize: 15, border: 'none', cursor: 'pointer', marginBottom: 0 }} disabled={isLoading}>
              {isLoading ? 'Verificando...' : 'Verificar Identidad'}
            </button>
          </form>
        </div>
      )}
      {activeTab === 'email' && (
        <div style={{ animation: 'fadeIn 0.3s', marginBottom: 10 }}>
          <div style={{ background: '#F7E3F0', borderRadius: 7, padding: 10, marginBottom: 10 }}>
            <p style={{ color: '#D391B0', fontWeight: 500, margin: 0, fontSize: 13 }}>Código enviado a tu correo</p>
            <p style={{ color: '#BA6E8F', fontSize: 12, margin: 0 }}>{userEmail || 'usuario@ejemplo.com'}</p>
          </div>
          <p style={{ color: '#333', marginBottom: 10, fontSize: 14 }}>Ingresa el código de 6 dígitos que te enviamos por correo</p>
          <form onSubmit={handleEmailCodeSubmit} style={{ marginBottom: 0 }}>
            <input
              type="text"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 7, fontSize: 18, textAlign: 'center', marginBottom: 12 }}
              value={token}
              onChange={e => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              maxLength={6}
              required
              autoFocus
            />
            <div style={{ marginBottom: 10, textAlign: 'center' }}>
              <button type="button" onClick={handleResendCode} disabled={resendDisabled} style={{ background: 'none', border: 'none', color: resendDisabled ? '#bbb' : '#BA6E8F', fontWeight: 500, cursor: resendDisabled ? 'not-allowed' : 'pointer', fontSize: 13 }}>
                {resendDisabled ? `Reenviar código en ${resendTimer}s` : 'Reenviar código'}
              </button>
            </div>
            <button type="submit" style={{ width: '100%', padding: '10px 0', borderRadius: 7, background: '#D391B0', color: '#fff', fontWeight: 600, fontSize: 15, border: 'none', cursor: 'pointer', marginBottom: 0 }} disabled={isLoading}>
              {isLoading ? 'Verificando...' : 'Verificar Identidad'}
            </button>
          </form>
        </div>
      )}
      {activeTab === 'backup' && (
        <div style={{ animation: 'fadeIn 0.3s', marginBottom: 10 }}>
          <div style={{ background: '#FFFBEA', borderRadius: 7, padding: 10, marginBottom: 10 }}>
            <p style={{ color: '#BA6E8F', fontWeight: 500, margin: 0, fontSize: 13 }}>Usa un código de respaldo</p>
            <p style={{ color: '#BA6E8F', fontSize: 12, margin: 0 }}>Cada código solo se puede usar una vez</p>
          </div>
          <p style={{ color: '#333', marginBottom: 10, fontSize: 14 }}>Ingresa uno de tus códigos de respaldo de 8 caracteres</p>
          <form onSubmit={handleBackupSubmit} style={{ marginBottom: 0 }}>
            <input
              type="text"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 7, fontSize: 18, textAlign: 'center', marginBottom: 12 }}
              value={backupCode}
              onChange={e => setBackupCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8))}
              placeholder="A1B2C3D4"
              maxLength={8}
              required
              autoFocus
            />
            <button type="submit" style={{ width: '100%', padding: '10px 0', borderRadius: 7, background: '#BA6E8F', color: '#fff', fontWeight: 600, fontSize: 15, border: 'none', cursor: 'pointer', marginBottom: 0 }} disabled={isLoading}>
              {isLoading ? 'Verificando...' : 'Verificar con Código de Respaldo'}
            </button>
          </form>
        </div>
      )}
      {/* Mensajes de error */}
      {error && (
        <div style={{ marginTop: 12, padding: 10, background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 7, color: '#B91C1C', fontWeight: 500, textAlign: 'left', fontSize: 13 }}>
          <svg style={{ width: 18, height: 18, verticalAlign: 'middle', marginRight: 6 }} viewBox="0 0 24 24" fill="none" stroke="#B91C1C" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {typeof error === 'string' ? error : 'Error desconocido'}
        </div>
      )}
      {/* Ayuda */}
      <div style={{ marginTop: 24, paddingTop: 10, borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
        <p style={{ color: '#666', fontSize: 12 }}>
          ¿Problemas para verificar?{' '}
          <button 
            onClick={() => alert('Contactar a soporte técnico')}
            style={{ color: '#D391B0', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: 12 }}
          >
            Contactar a soporte
          </button>
        </p>
      </div>
    </div>
  );
};

export default Verify2FA;
