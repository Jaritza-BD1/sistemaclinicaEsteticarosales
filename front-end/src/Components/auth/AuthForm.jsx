// src/Components/auth/AuthForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './AuthForm.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const AuthForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

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

  // Obtener parámetros del sistema (intentos máximos)
  useEffect(() => {
    const fetchParams = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/params/ADMIN_INTENTOS_INVALIDOS`);
        setMaxLoginAttempts(parseInt(response.data.value) || 3);
      } catch (error) {
        console.error('Error obteniendo parámetros:', error);
      }
    };
    
    fetchParams();
  }, []);

  const validate = () => {
    const newErrors = {};
    const { username, email, password, confirmPassword } = formData;

    // Validación de usuario
    if (!username.trim()) newErrors.username = 'Usuario requerido';
    else if (/\s/.test(username)) newErrors.username = 'No se permiten espacios';
    else if (username.length < 4) newErrors.username = 'Mínimo 4 caracteres';
    else if (username !== username.toUpperCase()) 
      newErrors.username = 'Debe estar en MAYÚSCULAS';

    // Validación de email (solo para registro)
    if (!isLogin) {
      if (!email) newErrors.email = 'Email requerido';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        newErrors.email = 'Email no válido';
    }

    // Validación de contraseña
    if (!password) newErrors.password = 'Contraseña requerida';
    else if (/\s/.test(password)) newErrors.password = 'No se permiten espacios';
    else if (!isLogin && password.length < 8) 
      newErrors.password = 'Mínimo 8 caracteres';
    else if (!isLogin && !/(?=.*[a-z])/.test(password))
      newErrors.password = 'Debe contener minúscula';
    else if (!isLogin && !/(?=.*[A-Z])/.test(password))
      newErrors.password = 'Debe contener mayúscula';
    else if (!isLogin && !/(?=.*\d)/.test(password))
      newErrors.password = 'Debe contener número';
    else if (!isLogin && !/(?=.*[!@#$%^&*])/.test(password))
      newErrors.password = 'Debe contener carácter especial';

    // Validación de confirmación de contraseña
    if (!isLogin && password !== confirmPassword)
      newErrors.confirmPassword = 'Las contraseñas no coinciden';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    
    if (!validate()) return;
    
    if (isLogin && loginAttempts >= maxLoginAttempts) {
      setApiError(`Cuenta bloqueada. Contacte al administrador.`);
      setIsLocked(true);
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (isLogin) {
        // Lógica de LOGIN
        const payload = {
          username: formData.username.toUpperCase(),
          password: formData.password
        };

        const { data } = await axios.post(
          `${API_URL}/api/auth/login`, 
          payload,
          { headers: { 'Content-Type': 'application/json' } }
        );

        // Manejar primer ingreso (cambio obligatorio de contraseña)
        if (data.firstLogin) {
          navigate('/change-password', { state: { firstLogin: true } });
          return;
        }

        // Guardar datos de sesión
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        
        // Actualizar contexto y redirigir
        login(data.user, data.token);
        navigate(data.user.atr_id_rol === 1 ? '/admin' : '/dashboard');
        
      } else {
        // Lógica de REGISTRO
        const payload = {
          username: formData.username.toUpperCase(),
          email: formData.email,
          password: formData.password,
          nombre: formData.name // Usamos el username como nombre por defecto
        };

        await axios.post(
          `${API_URL}/api/auth/register`, 
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

  const handleAuthError = (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          setApiError(data.message || 'Datos inválidos');
          break;
          
        case 401:
          if (data.message === 'Email not verified') {
            setApiError('Verifica tu email primero');
          } else if (data.message === 'Account pending approval') {
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
          setApiError(data?.error || 'Error en el servidor');
      }
    } else {
      setApiError(error.message || 'Error de conexión');
    }
  };

  const handleChange = ({ target: { name, value } }) => {
    // Convertir username a mayúsculas en tiempo real
    if (name === 'username') {
      value = value.toUpperCase();
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error específico al modificar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(prev => !prev);
    setFormData({ username: '', email: '', password: '', confirmPassword: '' });
    setErrors({});
    setApiError('');
    setIsLocked(false);
    setLoginAttempts(0);
    setRegistrationSuccess(false);
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
            <p>Se ha enviado un correo de verificación a <strong>{formData.email}</strong>.</p>
            <p>Por favor verifica tu cuenta para continuar con el proceso.</p>
            <p>Después de la verificación, tu cuenta quedará pendiente de aprobación por un administrador.</p>
            
            <button 
              className="auth-button" 
              onClick={toggleAuthMode}
            >
              VOLVER A INICIAR SESIÓN
            </button>
          </div>

          <div className="auth-footer">
            <p>© {new Date().getFullYear()} Clínica Estética Rosales</p>
            <p>Todos los derechos reservados</p>
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

        {apiError && (
          <div className={`error-message ${isLocked ? 'error-locked' : ''}`}>
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label>Correo Electrónico</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
                placeholder="ejemplo@dominio.com"
                disabled={isSubmitting || isLocked}
              />
              {errors.email && (
                <span className="error-text">{errors.email}</span>
              )}
            </div>
          )}

          <div className="form-group">
            <label>Usuario</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={errors.username ? 'error' : ''}
              placeholder={isLogin ? 'Tu usuario' : 'EJEMPLO123'}
              disabled={isSubmitting || isLocked}
              autoComplete="username"
              autoCapitalize="characters"
            />
            {errors.username && (
              <span className="error-text">{errors.username}</span>
            )}
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              placeholder={isLogin ? 'Tu contraseña' : 'Mínimo 8 caracteres'}
              disabled={isSubmitting || isLocked}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
            />
            {errors.password && (
              <span className="error-text">{errors.password}</span>
            )}
            
            {!isLogin && (
              <div className="password-requirements">
                <p>La contraseña debe contener:</p>
                <ul>
                  <li className={formData.password.length >= 8 ? 'valid' : ''}>
                    Mínimo 8 caracteres
                  </li>
                  <li className={/(?=.*[a-z])/.test(formData.password) ? 'valid' : ''}>
                    1 minúscula
                  </li>
                  <li className={/(?=.*[A-Z])/.test(formData.password) ? 'valid' : ''}>
                    1 mayúscula
                  </li>
                  <li className={/(?=.*\d)/.test(formData.password) ? 'valid' : ''}>
                    1 número
                  </li>
                  <li className={/(?=.*[!@#$%^&*])/.test(formData.password) ? 'valid' : ''}>
                    1 carácter especial
                  </li>
                  <li className={!/\s/.test(formData.password) ? 'valid' : 'invalid'}>
                    Sin espacios
                  </li>
                </ul>
              </div>
            )}
          </div>

          {!isLogin && (
            <div className="form-group">
              <label>Confirmar Contraseña</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? 'error' : ''}
                placeholder="Repite tu contraseña"
                disabled={isSubmitting}
              />
              {errors.confirmPassword && (
                <span className="error-text">
                  {errors.confirmPassword}
                </span>
              )}
            </div>
          )}

          <button
            type="submit"
            className="auth-button"
            disabled={isSubmitting || isLocked}
          >
            {isSubmitting
              ? isLogin
                ? 'Iniciando sesión...' 
                : 'Creando cuenta...'
              : isLogin
              ? 'INICIAR SESIÓN' 
              : 'REGISTRARSE'}
          </button>

          <div className="auth-toggle">
            <p>
              {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
              <button
                type="button"
                className="toggle-button"
                onClick={toggleAuthMode}
                disabled={isSubmitting}
              >
                {isLogin ? 'Regístrate aquí' : 'Inicia sesión aquí'}
              </button>
            </p>
          </div>

          {isLogin && (
            <div className="forgot-password">
              <button
                type="button"
                className="forgot-button"
                onClick={() => navigate('/forgot-password')}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          )}
        </form>

        <div className="auth-footer">
          <p>© {new Date().getFullYear()} Clínica Estética Rosales</p>
          <p>Todos los derechos reservados</p>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;




