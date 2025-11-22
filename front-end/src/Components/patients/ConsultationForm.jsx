import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControlLabel, Checkbox, MenuItem, Box, Alert } from '@mui/material';
import { useDispatch } from 'react-redux';
import { createConsultation } from '../../redux/consultations/consultationsSlice';

export default function ConsultationForm({ open, onClose, patientId, onSuccess }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({ atr_fecha_consulta: '', atr_notas_clinicas: '', atr_seguimiento: false, atr_sig_visit_dia: '', atr_estado_seguimiento: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e) => {
    const value = e?.target?.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      const payload = {
        atr_fecha_consulta: form.atr_fecha_consulta || new Date().toISOString(),
        atr_notas_clinicas: form.atr_notas_clinicas,
        atr_seguimiento: form.atr_seguimiento ? 1 : 0,
        atr_sig_visit_dia: form.atr_sig_visit_dia || null,
        atr_estado_seguimiento: form.atr_estado_seguimiento || null
      };
      await dispatch(createConsultation({ patientId: parseInt(patientId), payload })).unwrap();
      setLoading(false);
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      setLoading(false);
      setError(err?.message || 'Error al crear la consulta');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Nueva Consulta</DialogTitle>
      <DialogContent>
        {error && <Box sx={{ mb: 2 }}><Alert severity="error">{error}</Alert></Box>}
        <TextField
          label="Fecha de consulta"
          type="date"
          fullWidth
          value={form.atr_fecha_consulta}
          onChange={handleChange('atr_fecha_consulta')}
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 2 }}
        />

        <TextField
          label="Notas clínicas"
          fullWidth
          multiline
          minRows={3}
          value={form.atr_notas_clinicas}
          onChange={handleChange('atr_notas_clinicas')}
          sx={{ mb: 2 }}
        />

        <FormControlLabel
          control={<Checkbox checked={form.atr_seguimiento} onChange={handleChange('atr_seguimiento')} />}
          label="Requiere seguimiento"
        />

        <TextField
          label="Días para siguiente visita"
          type="number"
          fullWidth
          value={form.atr_sig_visit_dia}
          onChange={handleChange('atr_sig_visit_dia')}
          sx={{ mt: 2 }}
        />

        <TextField
          select
          label="Estado de seguimiento"
          fullWidth
          value={form.atr_estado_seguimiento}
          onChange={handleChange('atr_estado_seguimiento')}
          sx={{ mt: 2 }}
        >
          <MenuItem value="PENDIENTE">PENDIENTE</MenuItem>
          <MenuItem value="ENVIADO">ENVIADO</MenuItem>
          <MenuItem value="COMPLETADO">COMPLETADO</MenuItem>
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</Button>
      </DialogActions>
    </Dialog>
  );
}
