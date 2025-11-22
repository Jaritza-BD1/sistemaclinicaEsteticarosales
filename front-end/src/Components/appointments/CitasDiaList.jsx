import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  useMediaQuery,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  PlayArrow as PlayArrowIcon,
  Schedule as ScheduleIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  MedicalServices as MedicalIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getStatusLabel, getStatusColor } from '../../config/appointmentStatus';

const CitasDiaList = ({
  appointments = [],
  loading = false,
  onCheckIn,
  onStartConsultation,
  onReschedule,
  onCancel
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
          No hay citas programadas para hoy
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
                      <PersonIcon fontSize="small" />
                      {appointment.Doctor ? `Dr. ${appointment.Doctor.atr_nombre} ${appointment.Doctor.atr_apellido}` : 'Médico no asignado'}
                    </Typography>
                  </Box>
                  <Chip
                    label={getStatusLabel(appointment.atr_id_estado)}
                    color={getStatusColor(appointment.atr_id_estado)}
                    size="small"
                  />
                </Box>

                <Box mb={2}>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ScheduleIcon fontSize="small" />
                    {format(new Date(`${appointment.atr_fecha_cita} ${appointment.atr_hora_cita}`), 'HH:mm', { locale: es })} - {appointment.atr_duracion || 60} min
                  </Typography>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <MedicalIcon fontSize="small" />
                    {appointment.TipoCita ? appointment.TipoCita.atr_nombre_tipo_cita : 'Tipo no especificado'}
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {appointment.atr_motivo_cita}
                </Typography>

                <Box display="flex" gap={1} flexWrap="wrap">
                  {appointment.atr_id_estado === 1 || appointment.atr_id_estado === 2 ? (
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
                  ) : null}

                  {appointment.atr_id_estado === 1 || appointment.atr_id_estado === 2 ? (
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
                  ) : null}

                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ScheduleIcon />}
                    onClick={() => onReschedule(appointment.atr_id_cita)}
                    fullWidth
                  >
                    Reprogramar
                  </Button>

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
              <TableCell>Hora</TableCell>
              <TableCell>Paciente</TableCell>
              <TableCell>Médico</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Motivo</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appointments.map(appointment => (
              <TableRow key={appointment.atr_id_cita} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {format(new Date(`${appointment.atr_fecha_cita} ${appointment.atr_hora_cita}`), 'HH:mm', { locale: es })}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {appointment.atr_duracion || 60} min
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {appointment.Patient ? `${appointment.Patient.atr_nombre} ${appointment.Patient.atr_apellido}` : 'No especificado'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {appointment.Doctor ? `Dr. ${appointment.Doctor.atr_nombre} ${appointment.Doctor.atr_apellido}` : 'No asignado'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {appointment.TipoCita ? appointment.TipoCita.atr_nombre_tipo_cita : 'No especificado'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(appointment.atr_id_estado)}
                    color={getStatusColor(appointment.atr_id_estado)}
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
                  <Box display="flex" gap={1}>
                    {appointment.atr_id_estado === 1 || appointment.atr_id_estado === 2 ? (
                      <Tooltip title="Check-in">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => onCheckIn(appointment.atr_id_cita)}
                        >
                          <CheckCircleIcon />
                        </IconButton>
                      </Tooltip>
                    ) : null}

                    {appointment.atr_id_estado === 1 || appointment.atr_id_estado === 2 ? (
                      <Tooltip title="Iniciar Consulta">
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => onStartConsultation(appointment.atr_id_cita)}
                        >
                          <PlayArrowIcon />
                        </IconButton>
                      </Tooltip>
                    ) : null}

                    <Tooltip title="Reprogramar">
                      <IconButton
                        size="small"
                        onClick={() => onReschedule(appointment.atr_id_cita)}
                      >
                        <ScheduleIcon />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Cancelar">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onCancel(appointment.atr_id_cita)}
                      >
                        <CancelIcon />
                      </IconButton>
                    </Tooltip>
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

export default CitasDiaList;