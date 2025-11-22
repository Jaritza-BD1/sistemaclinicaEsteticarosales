import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Button,
  Chip,
  CircularProgress,
  useMediaQuery,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  PlayArrow as PlayArrowIcon,
  Schedule as ScheduleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getStatusLabel, getStatusColor, getStatusNameById } from '../../config/appointmentStatus';

const AppointmentList = ({
  appointments,
  loading,
  onCheckIn,
  onStartConsultation,
  onReschedule,
  onCancel,
}) => {
  const isXs = useMediaQuery(theme => theme.breakpoints.down('sm'));

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!appointments || appointments.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No hay citas disponibles
        </Typography>
      </Paper>
    );
  }

  // Vista móvil con cards
  if (isXs) {
    return (
      <Grid container spacing={2}>
        {appointments.map(appointment => (
          <Grid item xs={12} key={appointment.atr_id_cita}>
            <Card variant="outlined">
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box>
                    <Typography variant="h6" component="div">
                      {appointment.Patient ? `${appointment.Patient.atr_nombre} ${appointment.Patient.atr_apellido}` : 'Paciente no especificado'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      Médico: {appointment.Doctor ? `Dr. ${appointment.Doctor.atr_nombre} ${appointment.Doctor.atr_apellido}` : 'No asignado'}
                    </Typography>
                  </Box>
                  <Chip
                    label={getStatusLabel(getStatusNameById(appointment.atr_id_estado))}
                    color={getStatusColor(getStatusNameById(appointment.atr_id_estado))}
                    size="small"
                  />
                </Box>

                <Box mb={2}>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ScheduleIcon fontSize="small" />
                    {format(new Date(`${appointment.atr_fecha_cita} ${appointment.atr_hora_cita}`), 'dd/MM/yyyy HH:mm', { locale: es })}
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {appointment.atr_motivo_cita}
                </Typography>

                <Box display="flex" gap={1} flexWrap="wrap">
                  {(appointment.atr_id_estado === 1 || appointment.atr_id_estado === 2) && onCheckIn && (
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      startIcon={<CheckCircleIcon />}
                      onClick={() => onCheckIn(appointment.atr_id_cita)}
                      fullWidth
                    >
                      Check-in
                    </Button>
                  )}

                  {(appointment.atr_id_estado === 1 || appointment.atr_id_estado === 2) && onStartConsultation && (
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      startIcon={<PlayArrowIcon />}
                      onClick={() => onStartConsultation(appointment.atr_id_cita)}
                      fullWidth
                    >
                      Iniciar Consulta
                    </Button>
                  )}

                  {onReschedule && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<ScheduleIcon />}
                      onClick={() => onReschedule(appointment.atr_id_cita)}
                      fullWidth
                    >
                      Reprogramar
                    </Button>
                  )}

                  {onCancel && (
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<CancelIcon />}
                      onClick={() => onCancel(appointment.atr_id_cita)}
                      fullWidth
                    >
                      Cancelar
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  // Vista desktop con tabla
  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Paciente</TableCell>
              <TableCell>Médico</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Hora</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Motivo</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appointments.map(appointment => (
              <TableRow key={appointment.atr_id_cita} hover>
                <TableCell>
                  {appointment.Patient ? `${appointment.Patient.atr_nombre} ${appointment.Patient.atr_apellido}` : 'No especificado'}
                </TableCell>
                <TableCell>
                  {appointment.Doctor ? `Dr. ${appointment.Doctor.atr_nombre} ${appointment.Doctor.atr_apellido}` : 'No asignado'}
                </TableCell>
                <TableCell>
                  {format(new Date(appointment.atr_fecha_cita), 'dd/MM/yyyy', { locale: es })}
                </TableCell>
                <TableCell>{appointment.atr_hora_cita}</TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(getStatusNameById(appointment.atr_id_estado))}
                    color={getStatusColor(getStatusNameById(appointment.atr_id_estado))}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{
                    maxWidth: 200,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {appointment.atr_motivo_cita}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    {(appointment.atr_id_estado === 1 || appointment.atr_id_estado === 2) && onCheckIn && (
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => onCheckIn(appointment.atr_id_cita)}
                      >
                        Check-in
                      </Button>
                    )}

                    {(appointment.atr_id_estado === 1 || appointment.atr_id_estado === 2) && onStartConsultation && (
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        startIcon={<PlayArrowIcon />}
                        onClick={() => onStartConsultation(appointment.atr_id_cita)}
                      >
                        Iniciar Consulta
                      </Button>
                    )}

                    {onReschedule && (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<ScheduleIcon />}
                        onClick={() => onReschedule(appointment.atr_id_cita)}
                      >
                        Reprogramar
                      </Button>
                    )}

                    {onCancel && (
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<CancelIcon />}
                        onClick={() => onCancel(appointment.atr_id_cita)}
                      >
                        Cancelar
                      </Button>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default AppointmentList;