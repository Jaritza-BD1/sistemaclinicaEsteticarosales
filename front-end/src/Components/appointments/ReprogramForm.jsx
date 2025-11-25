import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Stack, FormControl, InputLabel, Select, MenuItem, Checkbox, FormControlLabel } from '@mui/material';
import { APPOINTMENT_STATUS, getStatusLabel } from '../../config/appointmentStatus';

/**
 * ReprogramForm
 * Props:
 * - initialDate, initialTime, initialReason
 * - onSubmit({ nuevaFecha, nuevaHora, motivo }) -> Promise
 * - onCancel()
 * - submitting (optional boolean)
 */
const ReprogramForm = ({ initialDate = '', initialTime = '', initialReason = '', initialStatus = '', onSubmit, onCancel, submitting = false }) => {
  const [date, setDate] = useState(initialDate || '');
  const [time, setTime] = useState(initialTime || '');
  const [reason, setReason] = useState(initialReason || '');
  const [status, setStatus] = useState(initialStatus || '');
  // Reminder fields
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderDateTime, setReminderDateTime] = useState(''); // ISO-like local datetime input value
  const [reminderMedio, setReminderMedio] = useState('email');
  const [reminderContenido, setReminderContenido] = useState('');
  const [reminderEstado, setReminderEstado] = useState('PENDIENTE');
  const [errors, setErrors] = useState({ date: '', time: '' });

  useEffect(() => {
    setDate(initialDate || '');
    setTime(initialTime || '');
    setReason(initialReason || '');
    setStatus(initialStatus || '');
    // reset reminder fields when initial values change
    setReminderEnabled(false);
    setReminderDateTime('');
    setReminderMedio('email');
    setReminderContenido('');
    setReminderEstado('PENDIENTE');
  }, [initialDate, initialTime, initialReason, initialStatus]);

  const validate = () => {
    const e = { date: '', time: '' };
    if (!date) e.date = 'La fecha es requerida';
    if (!time) e.time = 'La hora es requerida';
    setErrors(e);
    return !e.date && !e.time;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (typeof onSubmit === 'function') {
      const payload = { nuevaFecha: date, nuevaHora: time, motivo: reason, estado: status };
      if (reminderEnabled) {
        // convert local datetime (YYYY-MM-DDTHH:MM) to ISO string
        const fechaHoraEnvio = reminderDateTime ? new Date(reminderDateTime).toISOString() : null;
        payload.recordatorio = {
          medio: reminderMedio,
          fechaHoraEnvio,
          contenido: reminderContenido,
          estado: reminderEstado
        };
      }
      await onSubmit(payload);
    }
  };

  return (
    <Box>
      <Stack spacing={2}>
        <TextField
          label="Nueva Fecha"
          type="date"
          fullWidth
          value={date}
          onChange={(e) => setDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          error={!!errors.date}
          helperText={errors.date}
        />

        <TextField
          label="Nueva Hora"
          type="time"
          fullWidth
          value={time}
          onChange={(e) => setTime(e.target.value)}
          InputLabelProps={{ shrink: true }}
          error={!!errors.time}
          helperText={errors.time}
        />

        <TextField
          label="Motivo (opcional)"
          fullWidth
          multiline
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <FormControl fullWidth size="small">
          <InputLabel id="reprogram-estado-label">Estado</InputLabel>
          <Select
            labelId="reprogram-estado-label"
            label="Estado"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <MenuItem value=""><em>Sin Cambiar</em></MenuItem>
            <MenuItem value={APPOINTMENT_STATUS.PROGRAMADA}>{getStatusLabel(APPOINTMENT_STATUS.PROGRAMADA)}</MenuItem>
            <MenuItem value={APPOINTMENT_STATUS.CONFIRMADA}>{getStatusLabel(APPOINTMENT_STATUS.CONFIRMADA)}</MenuItem>
            <MenuItem value={APPOINTMENT_STATUS.EN_CONSULTA}>{getStatusLabel(APPOINTMENT_STATUS.EN_CONSULTA)}</MenuItem>
            <MenuItem value={APPOINTMENT_STATUS.PENDIENTE_PAGO}>{getStatusLabel(APPOINTMENT_STATUS.PENDIENTE_PAGO)}</MenuItem>
            <MenuItem value={APPOINTMENT_STATUS.FINALIZADA}>{getStatusLabel(APPOINTMENT_STATUS.FINALIZADA)}</MenuItem>
            <MenuItem value={APPOINTMENT_STATUS.CANCELADA}>{getStatusLabel(APPOINTMENT_STATUS.CANCELADA)}</MenuItem>
            <MenuItem value={APPOINTMENT_STATUS.NO_ASISTIO}>{getStatusLabel(APPOINTMENT_STATUS.NO_ASISTIO)}</MenuItem>
          </Select>
        </FormControl>

        {/* Recordatorio opcional */}
        <Box>
          <FormControlLabel
            control={<Checkbox checked={reminderEnabled} onChange={(e) => setReminderEnabled(e.target.checked)} />}
            label="Ajustar recordatorio"
          />

          {reminderEnabled && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Fecha y hora recordatorio"
                type="datetime-local"
                fullWidth
                value={reminderDateTime}
                onChange={(e) => setReminderDateTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />

              <FormControl fullWidth size="small">
                <InputLabel id="reminder-medio-label">Medio</InputLabel>
                <Select
                  labelId="reminder-medio-label"
                  label="Medio"
                  value={reminderMedio}
                  onChange={(e) => setReminderMedio(e.target.value)}
                >
                  <MenuItem value="email">Email</MenuItem>
                  <MenuItem value="sms">SMS</MenuItem>
                  <MenuItem value="notificación app">Notificación App</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Contenido del recordatorio (opcional)"
                fullWidth
                multiline
                rows={2}
                value={reminderContenido}
                onChange={(e) => setReminderContenido(e.target.value)}
              />

              <FormControl fullWidth size="small">
                <InputLabel id="reminder-estado-label">Estado inicial</InputLabel>
                <Select
                  labelId="reminder-estado-label"
                  label="Estado inicial"
                  value={reminderEstado}
                  onChange={(e) => setReminderEstado(e.target.value)}
                >
                  <MenuItem value="PENDIENTE">Pendiente</MenuItem>
                  <MenuItem value="ENVIADO">Enviado</MenuItem>
                  <MenuItem value="ENTREGADO">Entregado</MenuItem>
                  <MenuItem value="CANCELADO">Cancelado</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          )}
        </Box>

        <Box display="flex" gap={2} justifyContent="flex-end">
          <Button onClick={onCancel} disabled={submitting}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={submitting || !date || !time}>{submitting ? 'Guardando...' : 'Guardar'}</Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default ReprogramForm;
