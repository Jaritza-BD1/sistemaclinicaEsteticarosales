import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Send as SendIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  getAppointmentReminders,
  createAppointmentReminder,
  cancelAppointmentReminder
} from '../../services/appointmentService';

const REMINDER_MEDIOS = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'notificación app', label: 'Notificación App' }
];

const ESTADOS_RECORDATORIO = {
  PENDIENTE: { label: 'Pendiente', color: 'warning' },
  ENVIADO: { label: 'Enviado', color: 'info' },
  ENTREGADO: { label: 'Entregado', color: 'success' },
  REBOTADO: { label: 'Rebotado', color: 'error' },
  ERROR: { label: 'Error', color: 'error' },
  CANCELADO: { label: 'Cancelado', color: 'default' },
  REINTENTO: { label: 'Reintento', color: 'warning' }
};

const AppointmentReminders = ({ appointmentId }) => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [selectedMedio, setSelectedMedio] = useState('email');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const loadReminders = async () => {
    if (!appointmentId) return;

    setLoading(true);
    try {
      const response = await getAppointmentReminders(appointmentId);
      if (response.data.success) {
        setReminders(response.data.data || []);
      } else {
        setSnackbar({ open: true, message: 'Error al cargar recordatorios', severity: 'error' });
      }
    } catch (error) {
      console.error('Error loading reminders:', error);
      setSnackbar({ open: true, message: 'Error al cargar recordatorios', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReminders();
  }, [appointmentId]);

  const handleSendReminder = async () => {
    try {
      const response = await createAppointmentReminder(appointmentId, {
        medio: selectedMedio
      });

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'Recordatorio enviado correctamente',
          severity: 'success'
        });
        setSendDialogOpen(false);
        loadReminders(); // Recargar la lista
      } else {
        setSnackbar({
          open: true,
          message: response.data.message || 'Error al enviar recordatorio',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error sending reminder:', error);
      setSnackbar({
        open: true,
        message: 'Error al enviar recordatorio',
        severity: 'error'
      });
    }
  };

  const handleCancelReminder = async (reminderId) => {
    try {
      const response = await cancelAppointmentReminder(appointmentId, reminderId);

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'Recordatorio cancelado correctamente',
          severity: 'success'
        });
        loadReminders(); // Recargar la lista
      } else {
        setSnackbar({
          open: true,
          message: response.data.message || 'Error al cancelar recordatorio',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error canceling reminder:', error);
      setSnackbar({
        open: true,
        message: 'Error al cancelar recordatorio',
        severity: 'error'
      });
    }
  };

  const getLatestStatus = (reminder) => {
    if (!reminder.EstadosRecordatorio || reminder.EstadosRecordatorio.length === 0) {
      return { estado: 'PENDIENTE', contenido: 'Sin estados registrados' };
    }

    // Ordenar por fecha de creación descendente (más reciente primero)
    const sortedEstados = reminder.EstadosRecordatorio.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    return {
      estado: sortedEstados[0].atr_estado_recordatorio,
      contenido: sortedEstados[0].atr_contenido
    };
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es });
    } catch {
      return 'Fecha inválida';
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Recordatorios de la Cita</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadReminders}
            disabled={loading}
            size="small"
          >
            Actualizar
          </Button>
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            onClick={() => setSendDialogOpen(true)}
            size="small"
          >
            Enviar Recordatorio
          </Button>
        </Box>
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Fecha/Hora Envío</TableCell>
                  <TableCell>Medio</TableCell>
                  <TableCell>Último Estado</TableCell>
                  <TableCell>Detalles</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reminders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        No hay recordatorios para esta cita
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  reminders.map((reminder) => {
                    const latestStatus = getLatestStatus(reminder);
                    const estadoConfig = ESTADOS_RECORDATORIO[latestStatus.estado] || {
                      label: latestStatus.estado,
                      color: 'default'
                    };

                    return (
                      <TableRow key={reminder.atr_id_recordatorio}>
                        <TableCell>
                          {formatDateTime(reminder.atr_fecha_hora_envio)}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={reminder.atr_medio}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={estadoConfig.label}
                            size="small"
                            color={estadoConfig.color}
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip title={latestStatus.contenido}>
                            <Typography
                              variant="body2"
                              sx={{
                                maxWidth: 200,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {latestStatus.contenido}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          {latestStatus.estado !== 'CANCELADO' && (
                            <Tooltip title="Cancelar recordatorio">
                              <IconButton
                                size="small"
                                onClick={() => handleCancelReminder(reminder.atr_id_recordatorio)}
                                color="error"
                              >
                                <CancelIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Dialog para enviar recordatorio */}
      <Dialog open={sendDialogOpen} onClose={() => setSendDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Enviar Recordatorio</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Medio de envío</InputLabel>
            <Select
              value={selectedMedio}
              label="Medio de envío"
              onChange={(e) => setSelectedMedio(e.target.value)}
            >
              {REMINDER_MEDIOS.map((medio) => (
                <MenuItem key={medio.value} value={medio.value}>
                  {medio.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSendDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleSendReminder} variant="contained">
            Enviar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default AppointmentReminders;