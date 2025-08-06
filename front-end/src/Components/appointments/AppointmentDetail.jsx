// File: src/components/appointments/AppointmentDetail.jsx
import React from 'react';
import {useParams,useNavigate} from 'react-router-dom';
import {useSelector,useDispatch} from 'react-redux';
import { selectAppointmentById } from '../../redux/appointments/appointmentsSelectors';
import { confirmApp } from '../../redux/appointments/appointmentsSlice';
import { Box, Typography, Paper, Button, Stack } from '@mui/material';

export default function AppointmentDetail() {
  const {id} = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const appt = useSelector(state => selectAppointmentById(state,id));

  if(!appt) return <Typography sx={{ p: 4, textAlign: 'center' }}>Cargando...</Typography>;

  const handleConfirm = async()=>{ await dispatch(confirmApp(id)).unwrap(); navigate('/citas'); };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', my: 4 }}>
      <Paper sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3, boxShadow: 3 }}>
        <Typography variant="h5" sx={{ mb: 2, color: 'primary.main', fontWeight: 700 }}>
          Detalle de la Cita
        </Typography>
        <Stack spacing={1} sx={{ mb: 3 }}>
          <Typography variant="subtitle1"><strong>ID:</strong> {id}</Typography>
          <Typography variant="body1"><strong>Paciente:</strong> {appt.patientName || 'N/A'}</Typography>
          <Typography variant="body1"><strong>Médico:</strong> {appt.doctorName || 'N/A'}</Typography>
          <Typography variant="body1"><strong>Fecha:</strong> {appt.date || 'N/A'}</Typography>
          <Typography variant="body1"><strong>Hora:</strong> {appt.time || 'N/A'}</Typography>
          <Typography variant="body1"><strong>Tipo de Cita:</strong> {appt.type || 'N/A'}</Typography>
          <Typography variant="body1"><strong>Motivo:</strong> {appt.reason || 'N/A'}</Typography>
          <Typography variant="body1"><strong>Estado:</strong> {appt.status || 'N/A'}</Typography>
        </Stack>
        <Button
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          onClick={handleConfirm}
        >
          Confirmar
        </Button>
      </Paper>
    </Box>
  );
}
