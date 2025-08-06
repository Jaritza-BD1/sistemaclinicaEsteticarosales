import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAppointments } from '../../redux/appointments/appointmentsSlice';
import { Box, Typography, Paper, List, ListItem, ListItemText } from '@mui/material';

const CancelledAppointmentsList = () => {
  const dispatch = useDispatch();
  const appointments = useSelector(state => state.appointments.items);
  const status = useSelector(state => state.appointments.status);

  useEffect(() => {
    if (status === 'idle') dispatch(fetchAppointments());
  }, [dispatch, status]);

  const cancelled = appointments.filter(cita => cita.status === 'Cancelada');

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', my: 4 }}>
      <Paper sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3, boxShadow: 3 }}>
        <Typography variant="h5" sx={{ mb: 3, color: 'error.main', fontWeight: 700 }}>
          Citas Canceladas
        </Typography>
        {cancelled.length === 0 ? (
          <Typography color="text.secondary">No hay citas canceladas.</Typography>
        ) : (
          <List>
            {cancelled.map(cita => (
              <ListItem key={cita.id} divider>
                <ListItemText
                  primary={<>
                    <strong>{cita.title}</strong> | Paciente: {cita.paciente || 'N/A'}
                  </>}
                  secondary={<>
                    Fecha: {cita.start && cita.start.toLocaleDateString ? cita.start.toLocaleDateString() : 'N/A'} | Motivo: {cita.motivo || 'N/A'}
                  </>}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default CancelledAppointmentsList; 