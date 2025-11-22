import React from 'react';
import { Box, TextField, Button, MenuItem, Typography } from '@mui/material';

export default function OrdenExamenQuickCreate({ onCancel, onCreate }) {
  // UI-only: sin lógica de envío, devuelve payload en onCreate cuando se necesita
  const [form, setForm] = React.useState({ atr_id_examen: '', atr_observacion: '' });

  const handleChange = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
      <Typography variant="subtitle1">Crear Orden de Examen (rápido)</Typography>
      <TextField select label="Examen" value={form.atr_id_examen} onChange={handleChange('atr_id_examen')}>
        <MenuItem value={1}>Hemograma</MenuItem>
        <MenuItem value={2}>Perfil Lipídico</MenuItem>
        <MenuItem value={3}>Glucemia</MenuItem>
      </TextField>
      <TextField label="Observación" multiline minRows={3} value={form.atr_observacion} onChange={handleChange('atr_observacion')} />

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={() => onCancel && onCancel()}>Cancelar</Button>
        <Button variant="contained" onClick={() => onCreate && onCreate(form)}>Crear</Button>
      </Box>
    </Box>
  );
}
