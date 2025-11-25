import React, { useState } from 'react';
import { useFormik } from 'formik';
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';
import { DatePicker, TimePicker, DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import useAppointments from '../../hooks/useAppointments';

import { rescheduleValidationSchema } from '../../utils/validationSchemas';

const RescheduleAppointment = ({ appointment, onSuccess, onCancel }) => {
  const { rescheduleAppointment } = useAppointments();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formik = useFormik({
    initialValues: {
      nuevaFecha: null,
      nuevaHora: null,
      fechaHoraEnvio: null,
      motivo: ''
    },
    validationSchema: rescheduleValidationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError('');
      try {
        const payload = {
          nuevaFecha: format(values.nuevaFecha, 'yyyy-MM-dd'),
          nuevaHora: `${String(values.nuevaHora.getHours()).padStart(2, '0')}:${String(values.nuevaHora.getMinutes()).padStart(2, '0')}`,
          motivo: values.motivo
        };

        // Si el usuario indicó una fecha/hora de envío de recordatorio, añadir el objeto `recordatorio`
        if (values.fechaHoraEnvio) {
          payload.recordatorio = {
            fechaHoraEnvio: values.fechaHoraEnvio instanceof Date ? values.fechaHoraEnvio.toISOString() : values.fechaHoraEnvio
          };
        }

        await rescheduleAppointment(appointment.atr_id_cita, payload);
        if (onSuccess) onSuccess();
      } catch (err) {
        setError('Error al reprogramar la cita. Verifique que la nueva fecha y hora estén disponibles.');
      } finally {
        setLoading(false);
      }
    }
  });

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Box sx={{ p: 2 }}>
        {/* Current appointment info */}
        <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>
            Información de la Cita Actual
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Paciente</Typography>
              <Typography variant="body1">
                {appointment.Patient ? `${appointment.Patient.atr_nombre} ${appointment.Patient.atr_apellido}` : ''}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Médico</Typography>
              <Typography variant="body1">
                {appointment.Doctor ? `${appointment.Doctor.atr_nombre} ${appointment.Doctor.atr_apellido}` : ''}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">Fecha Actual</Typography>
              <Typography variant="body1">
                {format(new Date(appointment.atr_fecha_cita), 'dd/MM/yyyy')}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">Hora Actual</Typography>
              <Typography variant="body1">{appointment.atr_hora_cita}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">Motivo</Typography>
              <Typography variant="body1">{appointment.atr_motivo_cita}</Typography>
            </Grid>
          </Grid>
        </Box>

        {/* New date/time form */}
        <Typography variant="h6" gutterBottom>
          Nueva Fecha y Hora
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Nueva Fecha"
                value={formik.values.nuevaFecha}
                onChange={(value) => formik.setFieldValue('nuevaFecha', value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    error={formik.touched.nuevaFecha && Boolean(formik.errors.nuevaFecha)}
                    helperText={formik.touched.nuevaFecha && formik.errors.nuevaFecha}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TimePicker
                label="Nueva Hora"
                value={formik.values.nuevaHora}
                onChange={(value) => formik.setFieldValue('nuevaHora', value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    error={formik.touched.nuevaHora && Boolean(formik.errors.nuevaHora)}
                    helperText={formik.touched.nuevaHora && formik.errors.nuevaHora}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <DateTimePicker
                label="Fecha y hora envío recordatorio (opcional)"
                value={formik.values.fechaHoraEnvio}
                onChange={(value) => formik.setFieldValue('fechaHoraEnvio', value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    error={formik.touched.fechaHoraEnvio && Boolean(formik.errors.fechaHoraEnvio)}
                    helperText={formik.touched.fechaHoraEnvio && formik.errors.fechaHoraEnvio}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Motivo de la Reprogramación"
                name="motivo"
                value={formik.values.motivo}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.motivo && Boolean(formik.errors.motivo)}
                helperText={formik.touched.motivo && formik.errors.motivo}
                placeholder="Explique el motivo de la reprogramación..."
              />
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Reprogramando...' : 'Reprogramar Cita'}
            </Button>
          </Box>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default RescheduleAppointment;
