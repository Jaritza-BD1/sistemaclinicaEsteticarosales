// src/Components/auth/AuthForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsEye, BsEyeSlash } from 'react-icons/bs';
import api from '../../services/api';
import { useAuth } from '../context/AuthContext';
import './AuthForm.css';
import '../../asset/Style/ForgotPassword.css';
import Setup2FA from '../twoFactor/Setup2FA';
import Verify2FA from '../twoFactor/Verify2FA'; // <-- NUEVO

const AuthForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Estados principales
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    atr_nombre_usuario: '',
    atr_usuario: '',
    atr_correo_electronico: '',
    atr_contrasena: '',
    confirmPassword: '',
    atr_2fa_enabled: false,
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [maxLoginAttempts, setMaxLoginAttempts] = useState(3);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);

  // Estados para 2FA en login
  const [twoFARequired, setTwoFARequired] = useState(false);
  const [userIdFor2FA, setUserIdFor2FA] = useState(null);
  const [userEmailFor2FA, setUserEmailFor2FA] = useState(''); // <-- NUEVO
  const [twoFAToken, setTwoFAToken] = useState('');
  const [twoFAError, setTwoFAError] = useState('');

  // Mostrar/ocultar contraseña
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Carga del parámetro ADMIN_INTENTOS_INVALIDOS
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/params/ADMIN_INTENTOS_INVALIDOS');
        setMaxLoginAttempts(parseInt(res.data.value, 10) || 3);
      } catch (err) {
        console.error('Error al cargar parámetros:', err);
      }
    })();
  }, []);

  // Prevención de copiar/pegar en campos sensibles
  const preventCopyPaste = e => {
    e.preventDefault();
    return false;
  };

  // Manejo de cambios en inputs
  const handleChange = ({ target: { name, value, type, checked } }) => {
    let v = type === 'checkbox' ? checked : value;
    // Normalizaciones por campo
    if (name === 'atr_nombre_usuario') {
      v = v.replace(/\s/g, '').slice(0, 100);
    }
    if (name === 'atr_usuario') {
      v = v.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 50);
    }
    if (name === 'atr_correo_electronico') {
      v = v.slice(0, 100);
    }
    if (name === 'atr_contrasena' || name === 'confirmPassword') {
      v = v.replace(/\s/g, '').slice(0, 255);
    }

    setFormData(f => ({ ...f, [name]: v }));
    if (errors[name]) setErrors(e => ({ ...e, [name]: null }));
  };

  // Validaciones
  const validate = () => {
    const e = {};
    const {
      atr_nombre_usuario,
      atr_usuario,
      atr_correo_electronico,
      atr_contrasena,
      confirmPassword,
    } = formData;

    if (!isLogin) {
      if (!atr_nombre_usuario) e.atr_nombre_usuario = 'Nombre requerido';
      else if (atr_nombre_usuario.length < 2)
        e.atr_nombre_usuario = 'Mínimo 2 caracteres';
    }

    if (!atr_usuario) e.atr_usuario = 'Usuario requerido';
    else if (atr_usuario.length < 4)
      e.atr_usuario = 'Mínimo 4 caracteres';

    if (!isLogin) {
      if (!atr_correo_electronico)
        e.atr_correo_electronico = 'Correo requerido';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(atr_correo_electronico))
        e.atr_correo_electronico = 'Correo inválido';
    }

    // Contraseña: al menos 8 con mayúscula, minúscula, número y símbolo
    const pwdRe =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!atr_contrasena) e.atr_contrasena = 'Contraseña requerida';
    else if (!pwdRe.test(atr_contrasena))
      e.atr_contrasena =
        'Minúscula, Mayúscula, Número y símbolo (!@#$%^&*)';
    if (!isLogin && atr_contrasena !== confirmPassword)
      e.confirmPassword = 'Las contraseñas no coinciden';

    setErrors(e);
    return !Object.keys(e).length;
  };

  // Manejo del envío (login o registro)
  const handleSubmit = async e => {
    e.preventDefault();
    setApiError('');
    setTwoFAError('');

    if (!validate()) return;

    if (isLogin && loginAttempts >= maxLoginAttempts) {
      setApiError('Usuario bloqueado. Contactar administrador.');
      setIsLocked(true);
      return;
    }

    setIsSubmitting(true);
    try {
      if (isLogin) {
        // LOGIN
        const { data } = await api.post('/auth/login', {
          username: formData.atr_usuario,
          password: formData.atr_contrasena,
        });

        if (data.firstLogin) {
          navigate('/change-password', {
            state: { firstLogin: true, resetToken: data.resetToken },
          });
          return;
        }
        if (data.twoFARequired) {
          setTwoFARequired(true);
          setUserIdFor2FA(data.userId);
          setUserEmailFor2FA(data.email || ''); // <-- GUARDAR EMAIL
          return;
        }

        localStorage.setItem('token', data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        login(data.token);
        navigate(data.user.atr_id_rol === 1 ? '/admin' : '/dashboard');
      } else {
        // REGISTRO
        await api.post('/auth/register', {
          username: formData.atr_usuario, 
          name: formData.atr_nombre_usuario,
          email: formData.atr_correo_electronico,
          password: formData.atr_contrasena,
        });
        setRegistrationSuccess(true); // Mostrar mensaje de éxito
        // setShow2FASetup(true); // <-- ELIMINADO: ya no se muestra el setup de 2FA tras registro
      }
    } catch (err) {
      // Manejo de errores HTTP
      if (err.response) {
        const { status, data } = err.response;
        if (status === 401) {
          setLoginAttempts(attempts => attempts + 1);
          setApiError(
            `Credenciales incorrectas. Restan ${
              maxLoginAttempts - (loginAttempts + 1)
            } intentos`
          );
        } else if (status === 403) {
          setIsLocked(true);
          setApiError('Usuario bloqueado.');
        } else if (status === 409) {
          setApiError('El usuario ya existe.');
        } else {
          setApiError(data.message || 'Error en el servidor');
        }
      } else {
        setApiError('Error de conexión');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Verificación 2FA
  const handle2FAVerify = async () => {
    if (!twoFAToken) {
      setTwoFAError('Código requerido');
      return;
    }
    setIsSubmitting(true);
    try {
      const { data } = await api.post('/auth/2fa/verify-login', {
        userId: userIdFor2FA,
        token: twoFAToken,
      });
      localStorage.setItem('token', data.token);
      login(data.token);
      navigate(data.user.atr_id_rol === 1 ? '/admin' : '/dashboard');
    } catch {
      setTwoFAError('Código inválido o expirado');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Alternar entre login y registro
  const toggleAuthMode = () => {
    setIsLogin(v => !v);
    setErrors({});
    setApiError('');
    setIsLocked(false);
    setLoginAttempts(0);
    setRegistrationSuccess(false);
    setTwoFARequired(false);
    setTwoFAToken('');
    setTwoFAError('');
    setShowPassword(false);
    setShowConfirm(false);
  };

  // Vistas intermedias: éxito registro o 2FA
  if (registrationSuccess) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="clinic-header">
            <div className="clinic-logo">ER</div>
            <h1 className="clinic-name">Estética Rosales</h1>
            <p className="clinic-specialty">Medicina Estética Integral</p>
          </div>
          <div className="success-message">
            <h2>¡Registro Exitoso!</h2>
            <p>Por favor, verifica tu correo electrónico y espera a que un administrador apruebe tu cuenta antes de poder acceder al sistema.</p>
            <button onClick={toggleAuthMode} className="auth-button">
              Volver al Login
            </button>
          </div>
          <div className="footer">
            © 2023 Centro Médico Dra. Alejandra Rosales | Todos los derechos reservados
          </div>
        </div>
        <div className="wave" />
      </div>
    );
  }

  if (twoFARequired) {
    return (
      <Verify2FA
        userId={userIdFor2FA}
        userEmail={userEmailFor2FA}
        onSuccess={async (data) => {
          localStorage.setItem('token', data.token);
          login(data.token);
          navigate(data.user.atr_id_rol === 1 ? '/admin' : '/dashboard');
        }}
      />
    );
  }

  // Renderizado condicional para el flujo de registro + 2FA obligatorio
  if (show2FASetup) {
    return <Setup2FA onSuccess={() => setShow2FASetup(false)} />;
  }

  // Vista principal login/registro
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="clinic-header">
          <div className="clinic-logo">ER</div>
          <h1 className="clinic-name">Estética Rosales</h1>
          <p className="clinic-specialty">Medicina Estética Integral</p>
        </div>
        <div className="auth-form">
          <h2>{isLogin ? 'Iniciar Sesión' : 'Registro'}</h2>

          {apiError && <div className="error-message global-error">{apiError}</div>}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="form-group">
                <input
                  name="atr_nombre_usuario"
                  type="text"
                  placeholder="Nombre"
                  value={formData.atr_nombre_usuario}
                  onChange={handleChange}
                  onCopy={preventCopyPaste}
                  onPaste={preventCopyPaste}
                  className={errors.atr_nombre_usuario ? 'error' : ''}
                />
                {errors.atr_nombre_usuario && (
                  <span className="error-message">{errors.atr_nombre_usuario}</span>
                )}
              </div>
            )}

            <div className="form-group">
              <input
                name="atr_usuario"
                type="text"
                placeholder="Usuario"
                value={formData.atr_usuario}
                onChange={handleChange}
                onCopy={preventCopyPaste}
                onPaste={preventCopyPaste}
                className={errors.atr_usuario ? 'error' : ''}
              />
              {errors.atr_usuario && (
                <span className="error-message">{errors.atr_usuario}</span>
              )}
            </div>

            {!isLogin && (
              <div className="form-group">
                <input
                  name="atr_correo_electronico"
                  type="email"
                  placeholder="Correo Electrónico"
                  value={formData.atr_correo_electronico}
                  onChange={handleChange}
                  className={errors.atr_correo_electronico ? 'error' : ''}
                />
                {errors.atr_correo_electronico && (
                  <span className="error-message">
                    {errors.atr_correo_electronico}
                  </span>
                )}
              </div>
            )}

            <div className="form-group">
              <input
                name="atr_contrasena"
                type={showPassword ? 'text' : 'password'}
                placeholder="Contraseña"
                value={formData.atr_contrasena}
                onChange={handleChange}
              />
              <span className="eye-icon" onClick={() => setShowPassword(v => !v)}>
                {showPassword ? <BsEyeSlash /> : <BsEye />}
              </span>
              {errors.atr_contrasena && (
                <span className="error-message">{errors.atr_contrasena}</span>
              )}
            </div>

            {!isLogin && (
              <div className="form-group">
                <input
                  name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Confirmar Contraseña"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <span className="eye-icon" onClick={() => setShowConfirm(v => !v)}>
                  {showConfirm ? <BsEyeSlash /> : <BsEye />}
                </span>
                {errors.confirmPassword && (
                  <span className="error-message">{errors.confirmPassword}</span>
                )}
              </div>
            )}

            {!isLogin && (
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    name="atr_2fa_enabled"
                    type="checkbox"
                    checked={formData.atr_2fa_enabled}
                    onChange={handleChange}
                  />
                  Habilitar 2FA
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || isLocked}
              className="auth-button"
            >
              {isSubmitting
                ? isLogin
                  ? 'Iniciando...'
                  : 'Registrando...'
                : isLogin
                ? 'Iniciar Sesión'
                : 'Registrarse'}
            </button>
          </form>
        </div>

        <div className="auth-links">
          <button onClick={toggleAuthMode} className="link-button">
            {isLogin
              ? '¿No tienes cuenta? Regístrate'
              : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
          {isLogin && (
            <button
              onClick={() => navigate('/forgot-password')}
              className="link-button"
            >
              ¿Olvidaste tu contraseña?
            </button>
          )}
        </div>

        <div className="footer">
          © 2023 Centro Médico Dra. Alejandra Rosales | Todos los derechos reservados
        </div>
      </div>
      <div className="wave" />
    </div>
  );
};

export default AuthForm;

