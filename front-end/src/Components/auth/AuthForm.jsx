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

const maxLoginAttempts = 3;

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
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);

  // Estados para 2FA en login
  const [twoFARequired, setTwoFARequired] = useState(false);
  const [userIdFor2FA, setUserIdFor2FA] = useState(null);
  const [userEmailFor2FA, setUserEmailFor2FA] = useState(''); // <-- NUEVO

  // Debug: Monitorear cambios en userIdFor2FA
  useEffect(() => {
    console.log('AuthForm: userIdFor2FA changed to:', userIdFor2FA);
  }, [userIdFor2FA]);

  // Mostrar/ocultar contraseña
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  // Estados para requisitos de contraseña
  const [pwdCriteria, setPwdCriteria] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
    symbol: false,
  });

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
    // Actualizar criterios de contraseña en tiempo real
    if (name === 'atr_contrasena') {
      setPwdCriteria({
        length: v.length >= 8,
        lowercase: /[a-z]/.test(v),
        uppercase: /[A-Z]/.test(v),
        number: /\d/.test(v),
        symbol: /[@$!%*?&]/.test(v),
      });
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
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!atr_contrasena) e.atr_contrasena = 'Contraseña requerida';
    else if (!pwdRe.test(atr_contrasena))
      e.atr_contrasena =
        'Minúscula, Mayúscula, Número y símbolo (@$!%*?&)';
    if (!isLogin && atr_contrasena !== confirmPassword)
      e.confirmPassword = 'Las contraseñas no coinciden';

    setErrors(e);
    return !Object.keys(e).length;
  };

  // Manejo del envío (login o registro)
  const handleSubmit = async e => {
    e.preventDefault();
    setApiError('');

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
          console.log('Frontend: 2FA required, received data:', data);
          console.log('Frontend: userId type:', typeof data.userId, 'value:', data.userId);
          setTwoFARequired(true);
          setUserIdFor2FA(data.userId);
          console.log('AuthForm: Set userIdFor2FA to:', data.userId);
          setUserEmailFor2FA(data.email || ''); // <-- GUARDAR EMAIL
          return;
        }

        // Validar que el token existe y es válido antes de proceder
        if (data.token && data.token.length <= 8192) {
          // Limpiar tokens anteriores antes de guardar el nuevo
          localStorage.removeItem('authToken');
          localStorage.removeItem('token');
          
          localStorage.setItem('token', data.token);
          api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
          login(data.token);
          
          // Agregar delay para asegurar que el contexto se actualice
          setTimeout(() => {
            const targetPath = data.user.atr_id_rol === 1 ? '/admin' : '/dashboard';
            console.log('🔄 Navegando a:', targetPath);
            navigate(targetPath);
          }, 100);
        } else {
          console.error('Token inválido recibido del servidor:', data.token);
          setApiError('Error: Token de autenticación inválido');
        }
      } else {
        // REGISTRO
        await api.post('/auth/register', {
          username: formData.atr_usuario, 
          name: formData.atr_nombre_usuario,
          email: formData.atr_correo_electronico,
          password: formData.atr_contrasena,
          confirmPassword: formData.confirmPassword,
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
  // Alternar entre login y registro
  const toggleAuthMode = () => {
    setIsLogin(v => !v);
    setErrors({});
    setApiError('');
    setIsLocked(false);
    setLoginAttempts(0);
    setRegistrationSuccess(false);
    setTwoFARequired(false);
    setUserEmailFor2FA(''); // <-- LIMPIAR EMAIL
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
    console.log('=== AUTHFORM RENDERING VERIFY2FA ===');
    console.log('AuthForm: Rendering Verify2FA with userId:', userIdFor2FA);
    console.log('AuthForm: userIdFor2FA type:', typeof userIdFor2FA);
    console.log('AuthForm: userEmailFor2FA:', userEmailFor2FA);
    return (
      <Verify2FA
        userId={userIdFor2FA}
        userEmail={userEmailFor2FA}
        onSuccess={async (data) => {
          // Validar que el token existe y es válido antes de proceder
          if (data.token && data.token.length <= 8192) {
            // Limpiar tokens anteriores antes de guardar el nuevo
            localStorage.removeItem('authToken');
            localStorage.removeItem('token');
            
            localStorage.setItem('token', data.token);
            login(data.token);
            navigate(data.user.atr_id_rol === 1 ? '/admin' : '/dashboard');
          } else {
            console.error('Token inválido recibido del servidor en 2FA:', data.token);
            setApiError('Error: Token de autenticación inválido');
            setTwoFARequired(false);
            setUserIdFor2FA(null);
          }
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
                className={errors.atr_contrasena ? 'error' : ''}
              />
              <span className="eye-icon" onClick={() => setShowPassword(v => !v)}>
                {showPassword ? <BsEyeSlash /> : <BsEye />}
              </span>
              {errors.atr_contrasena && (
                <span className="error-message">{errors.atr_contrasena}</span>
              )}
            </div>
            {/* Requisitos de contraseña visuales */}
            {!isLogin && (
              <ul className="password-criteria-list">
                <li className={pwdCriteria.length ? 'valid' : 'invalid'}>
                  Mínimo 8 caracteres
                </li>
                <li className={pwdCriteria.lowercase ? 'valid' : 'invalid'}>
                  Al menos una minúscula
                </li>
                <li className={pwdCriteria.uppercase ? 'valid' : 'invalid'}>
                  Al menos una mayúscula
                </li>
                <li className={pwdCriteria.number ? 'valid' : 'invalid'}>
                  Al menos un número
                </li>
                <li className={pwdCriteria.symbol ? 'valid' : 'invalid'}>
                  Al menos un símbolo (@$!%*?&)
                </li>
              </ul>
            )}

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

