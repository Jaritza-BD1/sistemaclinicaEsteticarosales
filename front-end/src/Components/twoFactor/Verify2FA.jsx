import React, { useState, useEffect } from 'react';
import api from '../../services/api';  // Ruta corregida

const Verify2FA = ({ userId, onSuccess, userEmail }) => {
  const [token, setToken] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [activeTab, setActiveTab] = useState('app');
  const [showAnimation, setShowAnimation] = useState(true);

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

  // Animación de entrada
  useEffect(() => {
    const timer = setTimeout(() => setShowAnimation(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleTokenSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/2fa/verify-login', { userId, token });
      onSuccess(response.data);
    } catch (err) {
      setError('Código inválido. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackupSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/2fa/verify-login', { userId, token: backupCode });
      onSuccess(response.data);
    } catch (err) {
      setError('Código de respaldo inválido. Por favor, verifica.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendDisabled(true);
    setError('');
    try {
      await api.post('/auth/2fa/resend-code', { userId });
    } catch (err) {
      setError('Error al reenviar el código. Inténtalo de nuevo.');
    }
  };

  const handleEmailCodeSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/2fa/verify-email-code', { userId, token });
      onSuccess(response.data);
    } catch (err) {
      setError('Código inválido. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderTabButton = (tabKey, label, iconPath) => (
    <button
      className={`py-3 px-4 font-medium text-sm flex-1 transition-all ${
        activeTab === tabKey 
          ? 'text-blue-600 border-b-2 border-blue-600' 
          : 'text-gray-500 hover:text-gray-700'
      }`}
      onClick={() => setActiveTab(tabKey)}
    >
      <div className="flex flex-col items-center">
        <svg className="w-5 h-5 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          {iconPath}
        </svg>
        <span>{label}</span>
      </div>
    </button>
  );

  return (
    <div className={`max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden p-6 transition-all duration-300 ${
      showAnimation ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
    }`}>
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          <div className="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Verificación de Seguridad</h2>
        <p className="text-gray-600 mt-2">
          Para proteger tu cuenta, necesitamos verificar tu identidad
        </p>
      </div>

      {/* Pestañas de método de verificación */}
      <div className="flex border-b border-gray-200 mb-6">
        {renderTabButton(
          'app', 
          'Autenticador',
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        )}
        
        {renderTabButton(
          'email', 
          'Correo',
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        )}
        
        {renderTabButton(
          'backup', 
          'Respaldo',
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        )}
      </div>

      {/* Contenido de la pestaña activa */}
      {activeTab === 'app' && (
        <div className="animate-fadeIn">
          <div className="mb-4">
            <p className="text-gray-700 mb-2">Ingresa el código de 6 dígitos de tu aplicación de autenticación</p>
            <form onSubmit={handleTokenSubmit}>
              <div className="relative">
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-xl tracking-widest"
                  value={token}
                  onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  maxLength={6}
                  required
                  autoFocus
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              
              <button 
                type="submit"
                className={`w-full mt-6 py-3 px-4 rounded-lg font-medium flex items-center justify-center transition-all ${
                  isLoading 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                }`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></span>
                    Verificando...
                  </>
                ) : (
                  'Verificar Identidad'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'email' && (
        <div className="animate-fadeIn">
          <div className="mb-4">
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-blue-800 font-medium">Código enviado a tu correo</p>
                  <p className="text-blue-700 text-sm mt-1">{userEmail || 'usuario@ejemplo.com'}</p>
                </div>
              </div>
            </div>
            
            <p className="text-gray-700 mb-2">Ingresa el código de 6 dígitos que te enviamos por correo</p>
            <form onSubmit={handleEmailCodeSubmit}>
              <div className="relative">
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-xl tracking-widest"
                  value={token}
                  onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  maxLength={6}
                  required
                  autoFocus
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendDisabled}
                  className={`text-sm font-medium transition-all ${
                    resendDisabled ? 'text-gray-400' : 'text-blue-600 hover:text-blue-800'
                  }`}
                >
                  {resendDisabled ? `Reenviar código en ${resendTimer}s` : 'Reenviar código'}
                </button>
              </div>
              
              <button 
                type="submit"
                className={`w-full mt-4 py-3 px-4 rounded-lg font-medium flex items-center justify-center transition-all ${
                  isLoading 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                }`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></span>
                    Verificando...
                  </>
                ) : (
                  'Verificar Identidad'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'backup' && (
        <div className="animate-fadeIn">
          <div className="mb-4">
            <div className="bg-yellow-50 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-yellow-500 mt-0.5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="text-yellow-800 font-medium">Usa un código de respaldo</p>
                  <p className="text-yellow-700 text-sm mt-1">
                    Cada código solo se puede usar una vez
                  </p>
                </div>
              </div>
            </div>
            
            <p className="text-gray-700 mb-2">Ingresa uno de tus códigos de respaldo de 8 caracteres</p>
            <form onSubmit={handleBackupSubmit}>
              <div className="relative">
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-xl tracking-widest"
                  value={backupCode}
                  onChange={(e) => setBackupCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8))}
                  placeholder="A1B2C3D4"
                  maxLength={8}
                  required
                  autoFocus
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
              </div>
              
              <button 
                type="submit"
                className={`w-full mt-6 py-3 px-4 rounded-lg font-medium flex items-center justify-center transition-all ${
                  isLoading 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                }`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></span>
                    Verificando...
                  </>
                ) : (
                  'Verificar con Código de Respaldo'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mensajes de error */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start animate-shake">
          <svg className="w-5 h-5 text-red-500 mt-0.5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Ayuda */}
      <div className="mt-6 pt-4 border-t border-gray-200 text-center">
        <p className="text-gray-600 text-sm">
          ¿Problemas para verificar?{' '}
          <button 
            onClick={() => alert("Contactar a soporte técnico")}
            className="text-blue-600 hover:underline focus:outline-none transition-all"
          >
            Contactar a soporte
          </button>
        </p>
      </div>
      
      {/* Añadir estilos CSS en el componente */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-5px); }
          40%, 80% { transform: translateX(5px); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Verify2FA;
