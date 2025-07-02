// src/Components/auth/AuthForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './AuthForm.css';
import '../../asset/Style/ForgotPassword.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AuthForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Estados principales
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [maxLoginAttempts, setMaxLoginAttempts] = useState(3);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
  // Estados para 2FA
  const [twoFARequired, setTwoFARequired] = useState(false);
  const [userIdFor2FA, setUserIdFor2FA] = useState(null);
  const [twoFAToken, setTwoFAToken] = useState('');
  const [twoFAError, setTwoFAError] = useState('');

  // Obtener parámetros del sistema
  useEffect(() => {
    const fetchParams = async () => {
      try {
        const response = await axios.get(`${API_URL}/params/ADMIN_INTENTOS_INVALIDOS`);
        setMaxLoginAttempts(parseInt(response.data.atr_valor) || 3);
      } catch (error) {
        console.error('Error obteniendo parámetros:', error);
      }
    };
    
    fetchParams();
  }, []);

  // Función para prevenir copiar/pegar
  const preventCopyPaste = (e) => {
    e.preventDefault();
    return false;
  };

  const handleChange = ({ target: { name, value } }) => {
    // Aplicar restricciones
    if (name === 'name') {
      value = value.replace(/\s/g, '').replace(/[^a-zA-Z0-9]/g, '').slice(0, 15);
    }
    
    if (name === 'username') {
      // FORZAR MAYÚSCULAS Y SOLO CARACTERES PERMITIDOS
      value = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 15);
    }
    
    if (name === 'email') {
      value = value.replace(/[^a-zA-Z0-9@._-]/g, '');
    }
    
    if (name === 'password') {
      // PERMITIR SOLO CARACTERES VÁLIDOS
      value = value.replace(/[^a-zA-Z0-9!@#$%^&*]/g, '');
    }
    
    if (name === 'confirmPassword') {
      value = value.replace(/[^a-zA-Z0-9!@#$%^&*]/g, '');
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error específico al modificar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    const { username, email, password, confirmPassword, name } = formData;

    if (!isLogin) {
      // Validación de nombre (solo letras y números)
      if (!name || !name.trim()) newErrors.name = 'Nombre requerido';
      else if (name.length < 2) newErrors.name = 'Mínimo 2 caracteres';
      else if (name.length > 15) newErrors.name = 'Máximo 15 caracteres';
      else if (!/^[a-zA-Z0-9]+$/.test(name)) 
        newErrors.name = 'Solo letras y números';
    }

    // Validación de usuario
    if (!username || !username.trim()) newErrors.username = 'Usuario requerido';
    else if (username.length < 4) newErrors.username = 'Mínimo 4 caracteres';
    else if (username.length > 15) newErrors.username = 'Máximo 15 caracteres';
    else if (!/^[A-Z0-9]+$/.test(username)) 
      newErrors.username = 'Solo mayúsculas y números';

    // Validación de email (solo registro)
    if (!isLogin) {
      if (!email || !email.trim()) newErrors.email = 'Email requerido';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        newErrors.email = 'Email no válido';
      else if (email.length > 50) newErrors.email = 'Máximo 50 caracteres';
    }

    // VALIDACIÓN DE CONTRASEÑA ALINEADA CON BACKEND
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    
    if (!password || !password.trim()) {
      newErrors.password = 'Contraseña requerida';
    } else if (/\s/.test(password)) {
      newErrors.password = 'No se permiten espacios';
    } else if (!passwordRegex.test(password)) {
      newErrors.password = 'Debe contener minúscula, mayúscula, número y carácter especial (!@#$%^&*)';
    } else if (password.length > 200) {
      newErrors.password = 'Máximo 200 caracteres';
    }

    // Validación de confirmación de contraseña
    if (!isLogin && password !== confirmPassword)
      newErrors.confirmPassword = 'Las contraseñas no coinciden';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setTwoFAError('');
    
    if (!validate()) return;
    
    if (isLogin && loginAttempts >= maxLoginAttempts) {
      setApiError(`Cuenta bloqueada. Contacte al administrador.`);
      setIsLocked(true);
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (isLogin) {
        // Lógica de LOGIN - CORREGIDO
        const payload = {
          username: formData.username,
          password: formData.password
        };

        const { data } = await axios.post(
          `${API_URL}/auth/login`, 
          payload,
          { headers: { 'Content-Type': 'application/json' } }
        );

        // Manejar primer ingreso
        if (data.firstLogin) {
          navigate('/change-password', { 
            state: { 
              firstLogin: true,
              resetToken: data.resetToken 
            } 
          });
          return;
        }

        // Manejar 2FA
        if (data.twoFARequired) {
          setTwoFARequired(true);
          setUserIdFor2FA(data.userId);
          return;
        }

        // Guardar datos de sesión
        localStorage.setItem('token', data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        
        // Actualizar contexto y redirigir
        login(data.token);
        navigate(data.user.atr_id_rol === 1 ? '/admin' : '/dashboard');
        
      } else {
        // Lógica de REGISTRO - CORREGIDO
        const payload = {
          username: formData.username,
          name: formData.name,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        };

        await axios.post(
          `${API_URL}/auth/register`, 
          payload,
          { headers: { 'Content-Type': 'application/json' } }
        );
        
        // Mostrar mensaje de éxito
        setRegistrationSuccess(true);
      }
    } catch (error) {
      handleAuthError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejar verificación de 2FA - CORREGIDO
  const handle2FAVerification = async () => {
    if (!twoFAToken) {
      setTwoFAError('Ingrese el código de verificación');
      return;
    }
    
    setIsSubmitting(true);
    setTwoFAError('');
    
    try {
      const response = await axios.post(
        `${API_URL}/auth/2fa/verify-login`,
        { 
          userId: userIdFor2FA, 
          token: twoFAToken 
        }
      );
      
      const data = response.data;
      
      // Guardar datos de sesión
      localStorage.setItem('token', data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      
      // Actualizar contexto y redirigir
      login(data.token);
      navigate(data.user.atr_id_rol === 1 ? '/admin' : '/dashboard');
      
    } catch (error) {
      console.error('Error en verificación 2FA:', error);
      
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400) {
          setTwoFAError(data.error || 'Código inválido');
        } else if (status === 401) {
          setTwoFAError('Código expirado o inválido');
        } else {
          setTwoFAError('Error en el servidor');
        }
      } else {
        setTwoFAError('Error de conexión');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAuthError = (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          // MANEJO DETALLADO DE ERRORES DE VALIDACIÓN
          if (data.errors && Array.isArray(data.errors)) {
            const fieldErrors = {};
            data.errors.forEach(err => {
              if (err.path) {
                fieldErrors[err.path] = err.msg;
              }
            });
            
            if (Object.keys(fieldErrors).length > 0) {
              setErrors(fieldErrors);
              setApiError('Corrige los errores en el formulario');
              break;
            }
          }
          setApiError(data.error || data.message || 'Datos inválidos');
          break;
          
        case 401:
          if (data.error === 'Verifica tu email primero') {
            setApiError('Verifica tu email primero');
          } else if (data.error === 'Cuenta pendiente de aprobación') {
            setApiError('Cuenta pendiente de aprobación');
          } else {
            const attemptsLeft = maxLoginAttempts - (loginAttempts + 1);
            setLoginAttempts(prev => prev + 1);
            setApiError(`Credenciales incorrectas. Intentos restantes: ${attemptsLeft}`);
          }
          break;
          
        case 403:
          setIsLocked(true);
          setApiError('Cuenta bloqueada. Contacte al administrador');
          break;
          
        case 409:
          setApiError('El usuario ya existe');
          break;
          
        case 429:
          setApiError('Demasiados intentos. Intente más tarde');
          break;
          
        default:
          setApiError(data?.error || data?.message || 'Error en el servidor');
      }
    } else {
      setApiError(error.message || 'Error de conexión');
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(prev => !prev);
    setFormData({ name: '', username: '', email: '', password: '', confirmPassword: '' });
    setErrors({});
    setApiError('');
    setIsLocked(false);
    setLoginAttempts(0);
    setRegistrationSuccess(false);
    setTwoFARequired(false);
    setTwoFAToken('');
    setTwoFAError('');
  };

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
            <p>Tu cuenta ha sido creada correctamente.</p>
            <p>Un administrador revisará tu solicitud y te notificará cuando puedas acceder.</p>
            <button 
              onClick={toggleAuthMode}
              className="auth-button"
            >
              Volver al Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (twoFARequired) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="clinic-header">
            <div className="clinic-logo">ER</div>
            <h1 className="clinic-name">Estética Rosales</h1>
            <p className="clinic-specialty">Medicina Estética Integral</p>
          </div>

          <div className="auth-form">
            <h2>Verificación en Dos Pasos</h2>
            <p>Ingresa el código de tu aplicación de autenticación</p>
            
            <div className="form-group">
              <input
                type="text"
                placeholder="Código de verificación"
                value={twoFAToken}
                onChange={(e) => setTwoFAToken(e.target.value)}
                maxLength={6}
                className={twoFAError ? 'error' : ''}
              />
              {twoFAError && <span className="error-message">{twoFAError}</span>}
            </div>

            <button 
              onClick={handle2FAVerification}
              disabled={isSubmitting}
              className="auth-button"
            >
              {isSubmitting ? 'Verificando...' : 'Verificar'}
            </button>

            <button 
              onClick={() => {
                setTwoFARequired(false);
                setTwoFAToken('');
                setTwoFAError('');
              }}
              className="auth-button secondary"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          
          {apiError && (
            <div className="error-message global-error">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="form-group">
                <input
                  type="text"
                  name="name"
                  placeholder="Nombre"
                  value={formData.name}
                  onChange={handleChange}
                  onCopy={preventCopyPaste}
                  onPaste={preventCopyPaste}
                  className={errors.name ? 'error' : ''}
                  disabled={isSubmitting}
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>
            )}

            <div className="form-group">
              <input
                type="text"
                name="username"
                placeholder="Usuario"
                value={formData.username}
                onChange={handleChange}
                onCopy={preventCopyPaste}
                onPaste={preventCopyPaste}
                className={errors.username ? 'error' : ''}
                disabled={isSubmitting}
              />
              {errors.username && <span className="error-message">{errors.username}</span>}
            </div>

            {!isLogin && (
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  onCopy={preventCopyPaste}
                  onPaste={preventCopyPaste}
                  className={errors.email ? 'error' : ''}
                  disabled={isSubmitting}
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>
            )}

            <div className="form-group">
              <input
                type="password"
                name="password"
                placeholder="Contraseña"
                value={formData.password}
                onChange={handleChange}
                onCopy={preventCopyPaste}
                onPaste={preventCopyPaste}
                className={errors.password ? 'error' : ''}
                disabled={isSubmitting}
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            {!isLogin && (
              <div className="form-group">
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirmar Contraseña"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onCopy={preventCopyPaste}
                  onPaste={preventCopyPaste}
                  className={errors.confirmPassword ? 'error' : ''}
                  disabled={isSubmitting}
                />
                {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isSubmitting || isLocked}
              className="auth-button"
            >
              {isSubmitting 
                ? (isLogin ? 'Iniciando...' : 'Registrando...') 
                : (isLogin ? 'Iniciar Sesión' : 'Registrarse')
              }
            </button>
          </form>

          <div className="auth-links">
            <button 
              onClick={toggleAuthMode}
              className="link-button"
              disabled={isSubmitting}
            >
              {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
            
            {isLogin && (
              <button 
                onClick={() => navigate('/forgot-password')}
                className="link-button"
                disabled={isSubmitting}
              >
                ¿Olvidaste tu contraseña?
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
