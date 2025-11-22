import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Grid,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import useAppointments from '../hooks/useAppointments';
import { APPOINTMENT_STATUS, getStatusLabel } from '../config/appointmentStatus';
import RescheduleAppointment from '../Components/appointments/RescheduleAppointment';

const CitasCalendarioPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { loadCalendar } = useAppointments();

  const [calendarEvents, setCalendarEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);

  // Load calendar data when component mounts
  useEffect(() => {
    loadInitialCalendarData();
  }, []);

  const loadInitialCalendarData = async () => {
    try {
      // Load current month data
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const events = await loadCalendar(start.toISOString().split('T')[0], end.toISOString().split('T')[0]);
      setCalendarEvents(events || []);
    } catch (error) {
      console.error('Error loading calendar data:', error);
      setCalendarEvents([]);
    }
  };

  const handleDatesSet = async (dateInfo) => {
    try {
      const start = dateInfo.startStr;
      const end = dateInfo.endStr;
      const events = await loadCalendar(start, end);
      setCalendarEvents(events || []);
    } catch (error) {
      console.error('Error loading calendar range:', error);
      setCalendarEvents([]);
    }
  };

  const handleEventClick = (clickInfo) => {
    const appointment = clickInfo.event.extendedProps.appointment;
    setSelectedEvent(appointment);
  };

  const handleRescheduleClick = () => {
    setRescheduleOpen(true);
  };

  const handleRescheduleSuccess = () => {
    setRescheduleOpen(false);
    setSelectedEvent(null);
    // Reload calendar data
    loadInitialCalendarData();
  };

  const calendarHeaderToolbar = {
    left: 'prev,next today',
    center: 'title',
    right: isMobile ? 'dayGridMonth' : 'dayGridMonth,timeGridWeek,timeGridDay'
  };

  return (
    <Container sx={{ py: 3 }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <Typography variant="h5" gutterBottom>
              Calendario de Citas
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Vista mensual de todas las citas programadas. Haz clic en una cita para ver detalles.
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} container justifyContent="flex-end">
            <Button 
              variant="outlined" 
              onClick={() => navigate('/citas')} 
              size="small"
            >
              Ver Lista
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Box sx={{ height: isMobile ? '60vh' : '80vh' }}>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={calendarHeaderToolbar}
            initialView={isMobile ? 'dayGridMonth' : 'timeGridWeek'}
            events={calendarEvents}
            datesSet={handleDatesSet}
            eventClick={handleEventClick}
            locale="es"
            height="100%"
            dayMaxEvents={isMobile ? 2 : 4}
            moreLinkClick="popover"
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              meridiem: false
            }}
            slotLabelFormat={{
              hour: '2-digit',
              minute: '2-digit',
              meridiem: false
            }}
            nowIndicator={true}
            scrollTime="08:00:00"
          />
        </Box>
      </Paper>

      {/* Event Details Dialog */}
      <Dialog
        open={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Detalles de la Cita
        </DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <Box sx={{ pt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Paciente
                  </Typography>
                  <Typography variant="body1">
                    {selectedEvent.patient?.atr_nombre} {selectedEvent.patient?.atr_apellido}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Médico
                  </Typography>
                  <Typography variant="body1">
                    {selectedEvent.doctor?.atr_nombre} {selectedEvent.doctor?.atr_apellido}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Fecha y Hora
                  </Typography>
                  <Typography variant="body1">
                    {format(new Date(selectedEvent.atr_fecha_cita || selectedEvent.start), 'dd/MM/yyyy HH:mm', { locale: es })}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Estado
                  </Typography>
                  <Chip
                    label={getStatusLabel(selectedEvent.atr_id_estado || selectedEvent.status)}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Tipo de Cita
                  </Typography>
                  <Typography variant="body1">
                    {selectedEvent.TipoCita?.atr_nombre_tipo_cita || selectedEvent.typeName}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Duración
                  </Typography>
                  <Typography variant="body1">
                    {selectedEvent.atr_duracion || selectedEvent.duration || 60} minutos
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Motivo
                  </Typography>
                  <Typography variant="body1">
                    {selectedEvent.atr_motivo_cita || selectedEvent.motivo || selectedEvent.title}
                  </Typography>
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => setSelectedEvent(null)}
                >
                  Cerrar
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleRescheduleClick}
                >
                  Reprogramar
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog
        open={rescheduleOpen}
        onClose={() => setRescheduleOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Reprogramar Cita</DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <RescheduleAppointment
              appointment={selectedEvent}
              onSuccess={handleRescheduleSuccess}
              onCancel={() => setRescheduleOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default CitasCalendarioPage;