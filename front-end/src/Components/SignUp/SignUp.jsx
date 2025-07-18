// src/components/SignUp/SignUp.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SignUp.css';

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Validaciones
  const validate = () => {
    const newErrors = {};
    const { username, name, email, password, confirmPassword } = formData;

    // Validación de usuario (mayúsculas, números, 4-15 caracteres)
    if (!username.trim()) {
      newErrors.username = 'Usuario requerido';
    } else if (!/^[A-Z0-9]{4,15}$/.test(username)) {
      newErrors.username = '4-15 caracteres, solo MAYÚSCULAS y números';
    }

    // Validación de nombre
    if (!name.trim()) {
      newErrors.name = 'Nombre requerido';
    }

    // Validación de email
    if (!email) {
      newErrors.email = 'Email requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email no válido';
    }

    // Validación de contraseña robusta
    if (!password) {
      newErrors.password = 'Contraseña requerida';
    } else if (password.length < 8) {
      newErrors.password = 'Mínimo 8 caracteres';
    } else if (!/(?=.*[a-z])/.test(password)) {
      newErrors.password = 'Debe contener minúscula';
    } else if (!/(?=.*[A-Z])/.test(password)) {
      newErrors.password = 'Debe contener mayúscula';
    } else if (!/(?=.*\d)/.test(password)) {
      newErrors.password = 'Debe contener número';
    } else if (!/(?=.*[!@#$%^&*])/.test(password)) {
      newErrors.password = 'Debe contener carácter especial';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Cifrado de contraseña
 const hashPassword = async (password) => {
    // SOLO PARA DESARROLLO - En producción usar backend
    const mockHash = password.split('').reverse().join('') + btoa(password);
    return mockHash;
  };
  // Verificación de usuario existente
  const checkUserExists = async (username) => {
    try {
      const response = await axios.get(`/api/users?username=${username}`);
      return response.data.exists;
    } catch (error) {
      console.error('Error verificando usuario:', error);
      return true;
    }
  };

  // Manejo del submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      // Verificar si el usuario ya existe
      const userExists = await checkUserExists(formData.username);
      if (userExists) {
        setErrors({ ...errors, username: 'Usuario ya registrado' });
        return;
      }

      // Cifrar contraseña
      const hashedPassword = await hashPassword(formData.password);

      // Enviar datos al backend
      const response = await axios.post('/api/users', {
        username: formData.username,
        email: formData.email,
        password: hashedPassword,
        status: 'Nuevo' // Estado inicial requerido
      });

      if (response.status === 201) {
        navigate('/welcome'); // Redirigir después de registro exitoso
      }
    } catch (error) {
      setApiError('Error en el registro. Intente nuevamente.');
      console.error('Registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Validar en tiempo real solo el campo modificado
    setErrors(prevErrors => {
      const newErrors = { ...prevErrors };
      // Validar solo el campo cambiado
      switch (name) {
        case 'username':
          if (!value.trim()) {
            newErrors.username = 'Usuario requerido';
          } else if (!/^[A-Z0-9]{4,15}$/.test(value)) {
            newErrors.username = '4-15 caracteres, solo MAYÚSCULAS y números';
          } else {
            delete newErrors.username;
          }
          break;
        case 'name':
          if (!value.trim()) {
            newErrors.name = 'Nombre requerido';
          } else {
            delete newErrors.name;
          }
          break;
        case 'email':
          if (!value) {
            newErrors.email = 'Email requerido';
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            newErrors.email = 'Email no válido';
          } else {
            delete newErrors.email;
          }
          break;
        case 'password': {
          if (!value) {
            newErrors.password = 'Contraseña requerida';
          } else if (value.length < 8) {
            newErrors.password = 'Mínimo 8 caracteres';
          } else if (!/(?=.*[a-z])/.test(value)) {
            newErrors.password = 'Debe contener minúscula';
          } else if (!/(?=.*[A-Z])/.test(value)) {
            newErrors.password = 'Debe contener mayúscula';
          } else if (!/(?=.*\d)/.test(value)) {
            newErrors.password = 'Debe contener número';
          } else if (!/(?=.*[!@#$%^&*])/.test(value)) {
            newErrors.password = 'Debe contener carácter especial';
          } else if (formData.confirmPassword && value !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden';
          } else {
            delete newErrors.password;
            if (formData.confirmPassword) {
              if (value === formData.confirmPassword) {
                delete newErrors.confirmPassword;
              }
            }
          }
          break;
        }
        case 'confirmPassword':
          if (value !== formData.password) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden';
          } else {
            delete newErrors.confirmPassword;
          }
          break;
        default:
          break;
      }
      return newErrors;
    });
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="rose-header">
          <div className="rose-icon">🌹</div>
          <h2>Registro - Estética Rosales</h2>
        </div>

        {apiError && <div className="error-message">{apiError}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Usuario*</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={errors.username ? 'error' : ''}
              placeholder="EJEMPLO123"
              maxLength={15}
            />
            {errors.username && <span className="error-text">{errors.username}</span>}
          </div>

          <div className="form-group">
            <label>Nombre*</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'error' : ''}
              placeholder="Nombre completo"
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label>Email*</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              placeholder="ejemplo@dominio.com"
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>Contraseña*</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              placeholder="Mínimo 8 caracteres, mayúscula, minúscula, número y símbolo"
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label>Confirmar Contraseña*</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? 'error' : ''}
            />
            {errors.confirmPassword && (
              <span className="error-text">{errors.confirmPassword}</span>
            )}
          </div>

          <button
            type="submit"
            className="signup-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Registrando...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="login-link">
          ¿Ya tienes cuenta? <a href="/login">Inicia sesión</a>
        </p>
      </div>
    </div>
  );
};

export default SignUp;