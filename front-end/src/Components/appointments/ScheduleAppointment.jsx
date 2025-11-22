import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
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
  CircularProgress,
  Grid,
  Paper
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import useAppointments from '../../hooks/useAppointments';
import { quickAppointmentValidationSchema } from '../../utils/validationSchemas';
import { getAppointmentTypes } from '../../services/appointmentService';

const ScheduleAppointment = ({
  onSuccess,
  defaultPatientId,
  defaultDoctorId,
  title = "Agendar Cita Rápida"
}) => {
  const {
    patients,
    doctors,
    createAppointment,
    loading
  } = useAppointments();

  const [appointmentTypes, setAppointmentTypes] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [error, setError] = useState('');

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

  // Set default values when props change
  useEffect(() => {
    if (defaultPatientId && patients.length > 0) {
      const patient = patients.find(p => p.atr_id_paciente === defaultPatientId);
      if (patient) {
        setSelectedPatient(patient);
        formik.setFieldValue('pacienteId', defaultPatientId);
      }
    }
  }, [defaultPatientId, patients]);

  useEffect(() => {
    if (defaultDoctorId && doctors.length > 0) {
      const doctor = doctors.find(d => d.atr_id_medico === defaultDoctorId);
      if (doctor) {
        setSelectedDoctor(doctor);
        formik.setFieldValue('medicoId', defaultDoctorId);
      }
    }
  }, [defaultDoctorId, doctors]);

  const formik = useFormik({
    initialValues: {
      pacienteId: defaultPatientId || '',
      medicoId: defaultDoctorId || '',
      fecha: null,
      hora: null,
      tipoCitaId: '',
      motivo: '',
      duracion: 60,
      estado: 'PROGRAMADA'
    },
    validationSchema: quickAppointmentValidationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        setError('');
        const payload = {
          ...values,
          fecha: values.fecha.toISOString().split('T')[0], // YYYY-MM-DD
          hora: values.hora ? `${String(values.hora.getHours()).padStart(2, '0')}:${String(values.hora.getMinutes()).padStart(2, '0')}` : '',
        };

        const result = await createAppointment(payload);

        // Reset form
        resetForm();
        setSelectedPatient(null);
        setSelectedDoctor(null);

        // Call success callback with created appointment
        if (onSuccess) {
          onSuccess(result);
        }
      } catch (err) {
        const errorMessage = err?.response?.data?.message ||
                           err?.message ||
                           'Error al agendar la cita';
        setError(errorMessage);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const durationOptions = [
    { value: 30, label: '30 min' },
    { value: 45, label: '45 min' },
    { value: 60, label: '1 hora' },
    { value: 90, label: '1.5 horas' },
    { value: 120, label: '2 horas' },
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={formik.handleSubmit}>
          <Grid container spacing={2}>
            {/* Patient Selection */}
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={patients}
                getOptionLabel={(option) =>
                  `${option.atr_nombre} ${option.atr_apellido} (ID: ${option.atr_id_paciente})`
                }
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
                    size="small"
                  />
                )}
              />
            </Grid>

            {/* Doctor Selection */}
            <Grid item xs={12} md={6}>
              <FormControl
                fullWidth
                required
                error={formik.touched.medicoId && Boolean(formik.errors.medicoId)}
                size="small"
              >
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
                  label="Médico"
                >
                  {doctors.map(d => (
                    <MenuItem key={d.atr_id_medico} value={d.atr_id_medico}>
                      {d.atr_nombre} {d.atr_apellido}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Date and Time */}
            <Grid item xs={12} md={4}>
              <DatePicker
                label="Fecha"
                value={formik.values.fecha}
                onChange={(newValue) => formik.setFieldValue('fecha', newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    required
                    error={formik.touched.fecha && Boolean(formik.errors.fecha)}
                    helperText={formik.touched.fecha && formik.errors.fecha}
                    size="small"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TimePicker
                label="Hora"
                value={formik.values.hora}
                onChange={(newValue) => formik.setFieldValue('hora', newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    required
                    error={formik.touched.hora && Boolean(formik.errors.hora)}
                    helperText={formik.touched.hora && formik.errors.hora}
                    size="small"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl
                fullWidth
                required
                error={formik.touched.duracion && Boolean(formik.errors.duracion)}
                size="small"
              >
                <InputLabel>Duración</InputLabel>
                <Select
                  name="duracion"
                  value={formik.values.duracion}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Duración"
                >
                  {durationOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Appointment Type */}
            <Grid item xs={12} md={6}>
              <FormControl
                fullWidth
                required
                error={formik.touched.tipoCitaId && Boolean(formik.errors.tipoCitaId)}
                size="small"
              >
                <InputLabel>Tipo de Cita</InputLabel>
                <Select
                  name="tipoCitaId"
                  value={formik.values.tipoCitaId}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Tipo de Cita"
                >
                  {appointmentTypes.map(type => (
                    <MenuItem key={type.atr_id_tipo_cita} value={type.atr_id_tipo_cita}>
                      {type.atr_nombre_tipo_cita}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Reason */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="motivo"
                label="Motivo"
                multiline
                rows={2}
                value={formik.values.motivo}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                required
                error={formik.touched.motivo && Boolean(formik.errors.motivo)}
                helperText={formik.touched.motivo && formik.errors.motivo}
                size="small"
              />
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={formik.isSubmitting || loading}
                sx={{ mt: 1 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Agendar Cita'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </LocalizationProvider>
  );
};

export default ScheduleAppointment;
