// src/components/SignUp/SignUp.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SignUp.css';

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: '',
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
    const { username, email, password, confirmPassword } = formData;

    // Validación de usuario (mayúsculas y sin espacios)
    if (!username.trim()) {
      newErrors.username = 'Usuario requerido';
    } else if (username !== username.toUpperCase()) {
      newErrors.username = 'Debe estar en MAYÚSCULAS';
    } else if (/\s/.test(username)) {
      newErrors.username = 'No se permiten espacios';
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
    } else if (!/(?=.*[A-Z])/.test(password)) {
      newErrors.password = 'Requiere mayúscula';
    } else if (!/(?=.*\d)/.test(password)) {
      newErrors.password = 'Requiere número';
    } else if (!/(?=.*[!@#$%^&*])/.test(password)) {
      newErrors.password = 'Requiere carácter especial';
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
            />
            {errors.username && <span className="error-text">{errors.username}</span>}
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
              placeholder="Mínimo 8 caracteres con mayúscula, número y símbolo"
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