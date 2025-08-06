// src/Components/auth/ChangePassword.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BsEye, BsEyeSlash } from 'react-icons/bs';
import { useAuth } from '../context/AuthContext';
import api from '../../services/api';
import './ChangePassword.css';

export default function ChangePassword() {
  
  const { user, completeFirstLogin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Estados de formulario
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ¿Primer ingreso?
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  useEffect(() => {
    if (location.state?.firstLogin || user?.atr_primer_ingreso) {
      setIsFirstLogin(true);
    }
  }, [location, user]);

  // Mostrar / ocultar cada campo
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Manejo de inputs
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value.replace(/\s/g, '') }));
    setErrors(errs => ({ ...errs, [name]: null }));
    setApiError('');
  };

  // Validaciones
  const validate = () => {
    const errs = {};
    const { currentPassword, newPassword, confirmPassword } = formData;

    if (!isFirstLogin && !currentPassword) {
      errs.currentPassword = 'Contraseña actual requerida';
    }
    if (!newPassword) {
      errs.newPassword = 'Nueva contraseña requerida';
    } else {
      if (newPassword.length < 8) errs.newPassword = 'Mínimo 8 caracteres';
      if (!/[a-z]/.test(newPassword))
        errs.newPassword = 'Debe contener minúscula';
      if (!/[A-Z]/.test(newPassword))
        errs.newPassword = 'Debe contener mayúscula';
      if (!/\d/.test(newPassword)) errs.newPassword = 'Debe contener número';
      if (!/[!@#$%^&*]/.test(newPassword))
        errs.newPassword = 'Debe contener carácter especial';
    }
    if (!confirmPassword) {
      errs.confirmPassword = 'Confirma tu nueva contraseña';
    } else if (newPassword !== confirmPassword) {
      errs.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Grabar historial de contraseñas (tabla tbl_ms_hist_contrasena)
  const recordPasswordHistory = async password => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    await api.post('/hist-contrasena', {
      atr_usuario: user.atr_usuario,        // id del usuario
      atr_contrasena: password,             // contraseña cifrada o en texto
      atr_creado_por: user.atr_usuario,     // mismo usuario que crea
      atr_fecha_creacion: today,            // fecha actual
      // atr_modificado_por / atr_fecha_modificacion
      // pueden omitirse en primer registro
    });
  };

  // Envío del formulario
  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    setApiError('');
    try {
      const payload = {
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
        ...(isFirstLogin
          ? {}
          : { currentPassword: formData.currentPassword }),
      };
      const res = await api.post('/auth/change-password', payload);
      if (res.status === 200) {
        // 1) registrar en tbl_ms_hist_contrasena
        await recordPasswordHistory(formData.newPassword);

        // 2) mostrar éxito y redirigir
        setSuccessMessage('Contraseña actualizada con éxito');
        if (isFirstLogin) {
          completeFirstLogin();
          setTimeout(() => navigate('/dashboard'), 2000);
        } else {
          setTimeout(() => {
            logout();
            navigate('/login');
          }, 2000);
        }
      }
    } catch (err) {
      // Manejar diferentes tipos de error
      let errorMessage = 'Error desconocido';
      
      if (err && typeof err === 'object') {
        if (err.response) {
          const { status, data } = err.response;
          if (status === 401) {
            errorMessage = 'Contraseña actual incorrecta';
          } else if (status === 400) {
            errorMessage = data.error || 'Datos inválidos';
          } else {
            errorMessage = 'Error en el servidor. Intenta de nuevo.';
          }
        } else if (err.message) {
          errorMessage = err.message;
        } else if (err.error) {
          errorMessage = err.error;
        } else if (err.toString) {
          errorMessage = err.toString();
        }
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      setApiError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">

        {/* Header */}
        <div className="clinic-header">
          <div className="clinic-logo">ER</div>
          <h1 className="clinic-name">Estética Rosales</h1>
          <p className="clinic-specialty">Medicina Estética Integral</p>
        </div>

        {/* Form */}
        <div className="auth-form">
          <h3>
            {isFirstLogin ? 'Configura tu contraseña' : 'Cambiar contraseña'}
          </h3>
          <p className="form-description">
            {isFirstLogin
              ? 'Por seguridad, establece tu nueva contraseña.'
              : 'Introduce tu contraseña actual y luego la nueva.'}
          </p>

          {successMessage && (
            <div className="alert alert-success">{successMessage}</div>
          )}
          {apiError && (
            <div className="alert alert-danger">
              {typeof apiError === 'string' ? apiError : 'Error desconocido'}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {!isFirstLogin && (
              <div className="form-group">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  name="currentPassword"
                  placeholder="Contraseña actual"
                  value={formData.currentPassword}
                  onChange={handleChange}
                />
                <span
                  className="eye-icon"
                  onClick={() => setShowCurrent(v => !v)}
                >
                  {showCurrent ? <BsEyeSlash /> : <BsEye />}
                </span>
                {errors.currentPassword && (
                  <span className="error-message">
                    {errors.currentPassword}
                  </span>
                )}
              </div>
            )}

            <div className="form-group">
              <input
                type={showNew ? 'text' : 'password'}
                name="newPassword"
                placeholder="Nueva contraseña"
                value={formData.newPassword}
                onChange={handleChange}
              />
              <span
                className="eye-icon"
                onClick={() => setShowNew(v => !v)}
              >
                {showNew ? <BsEyeSlash /> : <BsEye />}
              </span>
              {errors.newPassword && (
                <span className="error-message">{errors.newPassword}</span>
              )}
            </div>

            <div className="form-group">
              <input
                type={showConfirm ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Confirmar contraseña"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              <span
                className="eye-icon"
                onClick={() => setShowConfirm(v => !v)}
              >
                {showConfirm ? <BsEyeSlash /> : <BsEye />}
              </span>
              {errors.confirmPassword && (
                <span className="error-message">
                  {errors.confirmPassword}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="auth-button"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Actualizando...'
                : 'Actualizar Contraseña'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="footer">
          © {new Date().getFullYear()} Centro Médico Dra. Alejandra Rosales | Todos
          los derechos reservados
        </div>
      </div>

      {/* Onda decorativa */}
      <div className="wave" />
    </div>
  );
}
