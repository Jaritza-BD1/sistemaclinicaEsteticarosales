// File: src/components/appointments/ViewAppointments.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAppointments } from '../../redux/appointments/appointmentsSlice';
import { selectAllAppointments } from '../../redux/appointments/appointmentsSelectors';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';

/**
 * ViewAppointments
 * Props:
 * - open: boolean — whether modal is open
 * - onClose: function — called to close the modal
 * - appointment: object (optional) — if provided, shows details for a single appointment
 * - fetchAll: boolean (optional) — if true, fetch and show list of appointments
 */
export default function ViewAppointments({ open = false, onClose = () => {}, appointment = null, fetchAll = false }) {
  const dispatch = useDispatch();
  const apps = useSelector(selectAllAppointments) || [];

  useEffect(() => {
    if (fetchAll) {
      dispatch(fetchAppointments());
    }
  }, [dispatch, fetchAll]);

  return (
    <Dialog open={!!open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{appointment ? 'Detalle de Cita' : 'Listado de Citas'}</DialogTitle>
      <DialogContent dividers>
        {appointment ? (
          <Box>
            <Typography><strong>Paciente:</strong> {appointment.paciente?.nombreCompleto || appointment.Patient?.atr_nombre || appointment.paciente?.atr_nombre || '-'}</Typography>
            <Typography><strong>Médico:</strong> {appointment.medico?.nombreCompleto || appointment.doctor?.atr_nombre || appointment.atr_nombre_medico || '-'}</Typography>
            <Typography><strong>Fecha:</strong> {appointment.atr_fecha_cita ? new Date(appointment.atr_fecha_cita).toLocaleString() : (appointment.fecha || '-')}</Typography>
            <Typography><strong>Hora:</strong> {appointment.atr_hora_cita || appointment.hora || '-'}</Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2">Motivo</Typography>
              <Typography>{appointment.atr_motivo_cita || appointment.motivo || appointment.reason || '-'}</Typography>
            </Box>
          </Box>
        ) : (
          <Box component="div">
            {apps.length === 0 ? (
              <Typography color="text.secondary">No hay citas disponibles</Typography>
            ) : (
              <Box component="ul" sx={{ pl: 2 }}>
                {apps.map(a => (
                  <li key={a.atr_id_cita || a.id}>
                    {a.atr_fecha_cita ? `${new Date(a.atr_fecha_cita).toLocaleString()}` : a.fecha} — {a.paciente?.nombreCompleto || a.Patient?.atr_nombre || a.paciente?.atr_nombre || 'Paciente no especificado'}
                  </li>
                ))}
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}