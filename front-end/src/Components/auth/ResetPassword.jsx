// src/Components/auth/ResetPassword.jsx
import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { BsEye, BsEyeSlash } from 'react-icons/bs';
import api from '../../services/api';
import './ResetPassword.css';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate        = useNavigate();
  const token           = searchParams.get('token');

  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew]                 = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [error, setError]                     = useState('');
  const [success, setSuccess]                 = useState('');

  const preventCopyPaste = e => e.preventDefault();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('Token inválido o faltante.');
      return;
    }
    if (/\s/.test(newPassword)) {
      setError('La contraseña no puede contener espacios.');
      return;
    }
    // Línea 26: permitir 8 o más caracteres
    if (newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    // Línea 29: regex sincronizado con backend (sólo verifica mayúscula, minúscula, número y símbolo)
    // Línea 29: CORREGIR el regex para que coincida exactamente con el backend
    const pwdRe = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!pwdRe.test(newPassword)) {
      setError('La contraseña debe incluir mayúscula, minúscula, número y símbolo (!@#$%^&*).');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      await api.post('/auth/reset-password', {
        token,
        newPassword,
        confirmPassword
      });
      setSuccess('Contraseña restablecida con éxito. Redirigiendo...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al restablecer la contraseña.');
    }
  };

  if (!token) {
    return (
      <div className="reset-page">
        <p className="error-message">Token inválido o faltante.</p>
      </div>
    );
  }

  return (
    <div className="reset-page">
      <form className="reset-form" onSubmit={handleSubmit} autoComplete="off">
        <h2>Restablecer Contraseña</h2>

        {error   && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="form-group">
          <input
            type={showNew ? 'text' : 'password'}
            name="newPassword"
            placeholder="Nueva contraseña"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            onCopy={preventCopyPaste}
            onPaste={preventCopyPaste}
            minLength={8}              // cambio de maxLength a minLength
            required
          />
          <span
            className="eye-icon"
            onClick={() => setShowNew(v => !v)}
          >
            {showNew ? <BsEyeSlash /> : <BsEye />}
          </span>
        </div>

        <div className="form-group">
          <input
            type={showConfirm ? 'text' : 'password'}
            name="confirmPassword"
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            onCopy={preventCopyPaste}
            onPaste={preventCopyPaste}
            minLength={8}              // cambio de maxLength a minLength
            required
          />
          <span
            className="eye-icon"
            onClick={() => setShowConfirm(v => !v)}
          >
            {showConfirm ? <BsEyeSlash /> : <BsEye />}
          </span>
        </div>

        <button type="submit" className="reset-button">
          Restablecer
        </button>
      </form>
    </div>
  );
}

