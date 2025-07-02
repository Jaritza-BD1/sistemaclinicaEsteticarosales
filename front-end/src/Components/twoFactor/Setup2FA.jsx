import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../Service/api';

const Setup2FA = () => {
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    const setup2FA = async () => {
      try {
        const response = await api.get('/2fa/setup');
        setQrCode(response.data.qrCode);
        setSecret(response.data.secret);
      } catch (err) {
        setError('Error al configurar 2FA');
      }
    };
    
    if (currentUser && !currentUser.atr_2fa_enabled) {
      setup2FA();
    }
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/2fa/enable', { token });
      setSuccess('Autenticación en dos pasos habilitada');
      setBackupCodes(response.data.backupCodes);
    } catch (err) {
      setError('Código inválido');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow-md">
      <h2 className="text-2xl font-bold mb-6">Configurar 2FA</h2>
      
      {backupCodes.length > 0 ? (
        <div>
          <h3 className="text-xl font-semibold mb-4">Códigos de Respaldo</h3>
          <p className="mb-4 text-red-500">
            Guarda estos códigos en un lugar seguro. Cada uno solo se puede usar una vez.
          </p>
          
          <div className="grid grid-cols-2 gap-2 mb-6">
            {backupCodes.map((code, index) => (
              <div 
                key={index} 
                className="p-3 border rounded text-center font-mono bg-gray-50"
              >
                {code}
              </div>
            ))}
          </div>
          
          <button 
            onClick={() => setBackupCodes([])}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Continuar
          </button>
        </div>
      ) : (
        <>
          {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}
          {success && <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">{success}</div>}
          
          <div className="mb-6">
            <p className="mb-4">Escanee el código QR con Google Authenticator:</p>
            {qrCode && <img src={qrCode} alt="QR Code" className="mx-auto mb-4" />}
            
            <p className="text-center mb-4">O ingrese manualmente el código:</p>
            <div className="p-3 bg-gray-100 rounded text-center font-mono">
              {secret}
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">
                Código de verificación de 6 dígitos
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded text-center text-xl"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="000000"
                maxLength={6}
                required
              />
            </div>
            
            <button 
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
              Habilitar 2FA
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default Setup2FA;