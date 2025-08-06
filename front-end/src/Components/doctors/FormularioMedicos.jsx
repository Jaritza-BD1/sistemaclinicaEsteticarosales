import React, { useState } from 'react';

const FormularioMedicos = () => {
  // Estados para los campos del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    fecha_nacimiento: '',
    identidad: '',
    genero: ''
  });

  // Estados para errores
  const [errors, setErrors] = useState({});

  // Manejar cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Validación en tiempo real
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};
    const hoy = new Date();
    
    // Validar nombre
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    } else if (formData.nombre.length < 2) {
      newErrors.nombre = 'Debe tener al menos 2 caracteres';
    }
    
    // Validar apellido
    if (!formData.apellido.trim()) {
      newErrors.apellido = 'El apellido es requerido';
    } else if (formData.apellido.length < 2) {
      newErrors.apellido = 'Debe tener al menos 2 caracteres';
    }
    
    // Validar fecha de nacimiento
    if (!formData.fecha_nacimiento) {
      newErrors.fecha_nacimiento = 'La fecha de nacimiento es requerida';
    } else {
      const fechaNac = new Date(formData.fecha_nacimiento);
      
      if (fechaNac >= hoy) {
        newErrors.fecha_nacimiento = 'La fecha no puede ser futura';
      } else {
        // Calcular edad
        const edadMilisegundos = hoy - fechaNac;
        const edadAnios = edadMilisegundos / (1000 * 60 * 60 * 24 * 365.25);
        if (edadAnios < 23) {
          newErrors.fecha_nacimiento = 'La edad mínima es 23 años';
        }
      }
    }
    
    // Validar identidad
    if (!formData.identidad.trim()) {
      newErrors.identidad = 'La identidad es requerida';
    } else {
      const cleanIdentidad = formData.identidad.replace(/\D/g, '');
      if (cleanIdentidad.length !== 13) {
        newErrors.identidad = 'Debe tener 13 dígitos';
      }
    }
    
    // Validar género
    if (!formData.genero) {
      newErrors.genero = 'Seleccione un género';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      console.log('Datos válidos:', formData);
      // Aquí iría la lógica para enviar los datos a tu API
      alert('Médico registrado correctamente!');
    } else {
      console.log('Errores en el formulario');
    }
  };

  // Estilos con tema rosa
  const containerStyle = {
    backgroundColor: '#FFF0F5', // Rosa pálido
    padding: '25px',
    borderRadius: '15px',
    boxShadow: '0 4px 15px rgba(255, 105, 180, 0.2)',
    maxWidth: '550px',
    margin: '30px auto',
    fontFamily: 'Arial, sans-serif'
  };

  const headerStyle = {
    color: '#FF69B4', // Rosa intenso
    textAlign: 'center',
    marginBottom: '25px',
    fontSize: '1.8rem'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    color: '#FF69B4',
    fontWeight: '500'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 15px',
    margin: '8px 0',
    border: '1px solid #FFC0CB',
    borderRadius: '8px',
    fontSize: '16px',
    backgroundColor: '#FFF',
    boxSizing: 'border-box',
    transition: 'border-color 0.3s'
  };

  const selectStyle = {
    ...inputStyle,
    appearance: 'none',
    background: `#FFF url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23FF69B4' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E") no-repeat right 15px center`
  };

  const buttonStyle = {
    backgroundColor: '#FF69B4',
    color: 'white',
    padding: '14px 20px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    marginTop: '15px',
    width: '100%',
    fontWeight: '600',
    transition: 'all 0.3s ease'
  };

  const errorStyle = {
    color: '#FF1493',
    fontSize: '14px',
    marginTop: '5px'
  };

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>Mantenimiento de Médicos</h2>
      
      <form onSubmit={handleSubmit}>
        {/* Campo Nombre */}
        <div>
          <label style={labelStyle}>Nombre:</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            style={inputStyle}
            placeholder="Ingrese el nombre"
          />
          {errors.nombre && <div style={errorStyle}>{errors.nombre}</div>}
        </div>

        {/* Campo Apellido */}
        <div>
          <label style={labelStyle}>Apellido:</label>
          <input
            type="text"
            name="apellido"
            value={formData.apellido}
            onChange={handleChange}
            style={inputStyle}
            placeholder="Ingrese el apellido"
          />
          {errors.apellido && <div style={errorStyle}>{errors.apellido}</div>}
        </div>

        {/* Campo Fecha de Nacimiento */}
        <div>
          <label style={labelStyle}>Fecha de Nacimiento:</label>
          <input
            type="date"
            name="fecha_nacimiento"
            value={formData.fecha_nacimiento}
            onChange={handleChange}
            style={inputStyle}
          />
          {errors.fecha_nacimiento && <div style={errorStyle}>{errors.fecha_nacimiento}</div>}
        </div>

        {/* Campo Identidad */}
        <div>
          <label style={labelStyle}>Identidad:</label>
          <input
            type="text"
            name="identidad"
            value={formData.identidad}
            onChange={handleChange}
            style={inputStyle}
            placeholder="0000-0000-00000"
          />
          {errors.identidad && <div style={errorStyle}>{errors.identidad}</div>}
        </div>

        {/* Campo Género */}
        <div>
          <label style={labelStyle}>Género:</label>
          <select
            name="genero"
            value={formData.genero}
            onChange={handleChange}
            style={selectStyle}
          >
            <option value="">Seleccione un género...</option>
            <option value="masculino">Masculino</option>
            <option value="femenino">Femenino</option>
            <option value="otro">Otro</option>
            <option value="prefiero_no_decir">Prefiero no decir</option>
          </select>
          {errors.genero && <div style={errorStyle}>{errors.genero}</div>}
        </div>

        {/* Botón de Envío */}
        <button 
          type="submit" 
          style={buttonStyle}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#FF1493'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#FF69B4'}
          onMouseDown={(e) => e.target.style.transform = 'scale(0.98)'}
          onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
        >
          Registrar Médico
        </button>
      </form>
    </div>
  );
};

export default FormularioMedicos;