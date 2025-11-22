import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  TextField,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import useAppointments from '../../hooks/useAppointments';
import { APPOINTMENT_STATUS } from '../../config/appointmentStatus';
import { getAppointmentTypes } from '../../services/appointmentService';

import { appointmentValidationSchema } from '../../utils/validationSchemas';

const AppointmentForm = ({ 
  initialData = {}, 
  onSuccess, 
  onError, 
  onSubmit: externalOnSubmit,
  submitButtonText = 'Agendar Cita',
  title = 'Agendar Nueva Cita',
  onCancel
}) => {
  const {
    patients,
    doctors,
    createAppointment: createApp,
    loading,
    error
  } = useAppointments();

  const [appointmentTypes, setAppointmentTypes] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    const loadTypes = async () => {
      try {
        const response = await getAppointmentTypes();
        setAppointmentTypes(response.data?.data || []);
      } catch (err) {
        console.error('Error loading appointment types:', err);
      }
    };
    loadTypes();
  }, []);

  const formik = useFormik({
    initialValues: {
      motivo: initialData.motivo || '',
      fecha: initialData.fecha ? new Date(initialData.fecha) : null,
      hora: initialData.hora || null,
      estado: initialData.estado || 'PROGRAMADA',
      pacienteId: initialData.pacienteId || '',
      medicoId: initialData.medicoId || '',
      tipoCitaId: initialData.tipoCitaId || '',
      duracion: initialData.duracion || 60,
    },
    validationSchema: appointmentValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payload = {
          ...values,
          fecha: values.fecha.toISOString().split('T')[0], // YYYY-MM-DD
          hora: values.hora ? `${String(values.hora.getHours()).padStart(2, '0')}:${String(values.hora.getMinutes()).padStart(2, '0')}` : '',
        };
        
        if (externalOnSubmit) {
          await externalOnSubmit(payload);
        } else {
          await createApp(payload);
          if (onSuccess) onSuccess();
        }
      } catch (err) {
        if (onError) onError(err);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const durationOptions = [
    { value: 30, label: '30 minutos' },
    { value: 45, label: '45 minutos' },
    { value: 60, label: '1 hora' },
    { value: 90, label: '1.5 horas' },
    { value: 120, label: '2 horas' },
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Box component="form" onSubmit={formik.handleSubmit} sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 2 }}>
          <Autocomplete
            options={patients}
            getOptionLabel={(option) => `${option.atr_nombre} ${option.atr_apellido} (ID: ${option.atr_id_paciente})`}
            value={selectedPatient}
            onChange={(event, newValue) => {
              setSelectedPatient(newValue);
              formik.setFieldValue('pacienteId', newValue ? newValue.atr_id_paciente : '');
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Paciente"
                required
                error={formik.touched.pacienteId && Boolean(formik.errors.pacienteId)}
                helperText={formik.touched.pacienteId && formik.errors.pacienteId}
              />
            )}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <FormControl fullWidth required error={formik.touched.medicoId && Boolean(formik.errors.medicoId)}>
            <InputLabel>Médico</InputLabel>
            <Select
              name="medicoId"
              value={formik.values.medicoId}
              onChange={(e) => {
                formik.handleChange(e);
                const doctor = doctors.find(d => d.atr_id_medico === e.target.value);
                setSelectedDoctor(doctor);
              }}
              onBlur={formik.handleBlur}
            >
              {doctors.map(d => (
                <MenuItem key={d.atr_id_medico} value={d.atr_id_medico}>
                  {d.atr_nombre} {d.atr_apellido} - {d.atr_especialidad}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ mb: 2 }}>
          <DatePicker
            label="Fecha de la Cita"
            value={formik.values.fecha}
            onChange={(newValue) => formik.setFieldValue('fecha', newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                required
                error={formik.touched.fecha && Boolean(formik.errors.fecha)}
                helperText={formik.touched.fecha && formik.errors.fecha}
              />
            )}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <TimePicker
            label="Hora de la Cita"
            value={formik.values.hora}
            onChange={(newValue) => formik.setFieldValue('hora', newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                required
                error={formik.touched.hora && Boolean(formik.errors.hora)}
                helperText={formik.touched.hora && formik.errors.hora}
              />
            )}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <FormControl fullWidth required error={formik.touched.tipoCitaId && Boolean(formik.errors.tipoCitaId)}>
            <InputLabel>Tipo de Cita</InputLabel>
            <Select
              name="tipoCitaId"
              value={formik.values.tipoCitaId}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              {appointmentTypes.map(type => (
                <MenuItem key={type.atr_id_tipo_cita} value={type.atr_id_tipo_cita}>
                  {type.atr_nombre_tipo_cita}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            name="motivo"
            label="Motivo de la Cita"
            multiline
            rows={3}
            value={formik.values.motivo}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            required
            error={formik.touched.motivo && Boolean(formik.errors.motivo)}
            helperText={formik.touched.motivo && formik.errors.motivo}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <FormControl fullWidth required error={formik.touched.duracion && Boolean(formik.errors.duracion)}>
            <InputLabel>Duración</InputLabel>
            <Select
              name="duracion"
              value={formik.values.duracion}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              {durationOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ mb: 2 }}>
          <FormControl fullWidth required error={formik.touched.estado && Boolean(formik.errors.estado)}>
            <InputLabel>Estado</InputLabel>
            <Select
              name="estado"
              value={formik.values.estado}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              {Object.keys(APPOINTMENT_STATUS).map(key => (
                <MenuItem key={key} value={key}>
                  {key.replace('_', ' ')}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          {onCancel && (
            <Button
              type="button"
              variant="outlined"
              onClick={onCancel}
              disabled={formik.isSubmitting || loading}
              sx={{ flex: 1 }}
            >
              Cancelar
            </Button>
          )}
          <Button
            type="submit"
            variant="contained"
            disabled={formik.isSubmitting || loading}
            sx={{ flex: 1 }}
          >
            {loading ? <CircularProgress size={24} /> : submitButtonText}
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default AppointmentForm;