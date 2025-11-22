import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  Grid
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const ConsultationHeader = ({ appointment, consultation }) => {
  const navigate = useNavigate();

  const getStatusColor = (status) => {
    switch (status) {
      case 'PROGRAMADA': return 'primary';
      case 'CONFIRMADA': return 'info';
      case 'EN_CONSULTA': return 'warning';
      case 'PENDIENTE_PAGO': return 'secondary';
      case 'FINALIZADA': return 'success';
      case 'CANCELADA': return 'error';
      default: return 'default';
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">
            Consulta Médica - Cita #{appointment?.atr_id_cita}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/citas')}
          >
            Volver a Citas
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Datos de la Cita</Typography>
            <Typography><strong>Fecha y Hora:</strong> {appointment?.atr_fecha_hora}</Typography>
            <Typography><strong>Motivo:</strong> {appointment?.atr_motivo}</Typography>
            <Typography><strong>Estado:</strong>
              <Chip
                label={appointment?.EstadoCita?.atr_nombre_estado || 'Desconocido'}
                color={getStatusColor(appointment?.EstadoCita?.atr_nombre_estado)}
                size="small"
                sx={{ ml: 1 }}
              />
            </Typography>
            <Typography><strong>Observaciones:</strong> {appointment?.atr_observaciones}</Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Datos del Médico</Typography>
            <Typography><strong>Nombre:</strong> {appointment?.Doctor?.atr_nombre} {appointment?.Doctor?.atr_apellido}</Typography>
            <Typography><strong>Especialidad:</strong> {appointment?.Doctor?.especialidades?.[0]?.atr_nombre_especialidad}</Typography>
          </Grid>
        </Grid>

        {consultation && (
          <Box mt={2}>
            <Typography variant="h6" gutterBottom>Estado de la Consulta</Typography>
            <Typography><strong>Fecha de Consulta:</strong> {consultation.atr_fecha_consulta}</Typography>
            <Typography><strong>Última Actualización:</strong> {consultation.atr_fecha_actualizacion}</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ConsultationHeader;