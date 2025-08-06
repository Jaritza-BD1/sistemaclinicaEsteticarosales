import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';

const NewRolModal = ({ open, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    atr_rol: '',
    atr_descripcion: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.atr_rol.trim()) {
      newErrors.atr_rol = 'El nombre del rol es obligatorio';
    } else if (formData.atr_rol.trim().length < 3) {
      newErrors.atr_rol = 'El nombre del rol debe tener al menos 3 caracteres';
    } else if (formData.atr_rol.trim().length > 30) {
      newErrors.atr_rol = 'El nombre del rol no puede exceder 30 caracteres';
    }

    if (!formData.atr_descripcion.trim()) {
      newErrors.atr_descripcion = 'La descripción es obligatoria';
    } else if (formData.atr_descripcion.trim().length > 100) {
      newErrors.atr_descripcion = 'La descripción no puede exceder 100 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSubmit({
        atr_rol: formData.atr_rol.trim().toUpperCase(),
        atr_descripcion: formData.atr_descripcion.trim()
      });

      // Limpiar formulario
      setFormData({
        atr_rol: '',
        atr_descripcion: ''
      });
      setErrors({});
    } catch (error) {
      console.error('Error in form submission:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        atr_rol: '',
        atr_descripcion: ''
      });
      setErrors({});
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Crear Nuevo Rol</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <TextField
            fullWidth
            label="Nombre del Rol"
            value={formData.atr_rol}
            onChange={handleChange('atr_rol')}
            error={!!errors.atr_rol}
            helperText={errors.atr_rol}
            margin="normal"
            required
            inputProps={{
              maxLength: 30
            }}
          />

          <TextField
            fullWidth
            label="Descripción"
            value={formData.atr_descripcion}
            onChange={handleChange('atr_descripcion')}
            error={!!errors.atr_descripcion}
            helperText={errors.atr_descripcion}
            margin="normal"
            required
            multiline
            rows={3}
            inputProps={{
              maxLength: 100
            }}
          />

          <Alert severity="info" sx={{ mt: 2 }}>
            El nombre del rol se convertirá automáticamente a mayúsculas.
          </Alert>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !formData.atr_rol.trim() || !formData.atr_descripcion.trim()}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Creando...' : 'Crear Rol'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewRolModal;
