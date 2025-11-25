import React, { useState, useEffect } from 'react';
import {
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
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ViewAppointments from './ViewAppointments';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logoSvg from '../../logo.svg';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import ReprogramForm from './ReprogramForm';
import {
  CheckCircle as CheckCircleIcon,
  PlayArrow as PlayArrowIcon,
  Schedule as ScheduleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNotifications } from '../../context/NotificationsContext';
import { deleteAppointment, checkInAppointment, updateAppointmentStatus } from '../../services/appointmentService';
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
  onEdit, // optional: open edit page
  onView, // optional: notify parent when user requests to view an appointment
  onDelete, // optional: parent callback to refresh list after deletion
  onRefresh, // optional: parent callback to refresh list after state changes
  canPerformAction, // optional: function(appointment, action) => boolean to enable/disable actions
  showGenerateButton = true
}) => {
  const [viewAppointment, setViewAppointment] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [reprogramOpen, setReprogramOpen] = useState(false);
  const [reprogramTarget, setReprogramTarget] = useState(null);
  const [localAppointments, setLocalAppointments] = useState(appointments || []);
  const isXs = useMediaQuery(theme => theme.breakpoints.down('sm'));
  const { notify } = useNotifications();

  useEffect(() => {
    setLocalAppointments(appointments || []);
  }, [appointments]);

  const handleViewClick = (appointment) => {
    // Open modal with appointment details. If parent prefers control, still call onView.
    setViewAppointment(appointment);
    setViewModalOpen(true);
    if (onView) {
      try { onView(appointment); } catch (e) { console.error('onView handler error', e); }
    }
  };

  const handleDelete = (appointment) => {
    const id = getAppointmentId(appointment);
    if (!id) {
      notify({ message: 'ID de cita inválido', severity: 'error' });
      return;
    }

    notify({
      message: '¿Desea eliminar esta cita? Esta acción no podrá deshacerse.',
      severity: 'warning',
      onConfirm: async () => {
        try {
          await deleteAppointment(id);
          // Update local UI optimistically
          setLocalAppointments(prev => prev.filter(a => getAppointmentId(a) !== id));
          if (typeof onDelete === 'function') onDelete(id);
          notify({ message: 'Cita eliminada correctamente', severity: 'success' });
        } catch (err) {
          console.error('Error eliminando cita', err);
          notify({ message: 'Error al eliminar la cita', severity: 'error' });
        }
      }
    });
  };

  const internalCheckIn = async (appointment) => {
    const id = getAppointmentId(appointment);
    if (!id) return notify({ message: 'ID de cita inválido', severity: 'error' });
    try {
      await checkInAppointment(id);
      // optimistic update: set EstadoCita to CONFIRMADA/EN_CONSULTA depending on response
      setLocalAppointments(prev => prev.map(a => (getAppointmentId(a) === id ? ({ ...a, EstadoCita: { ...(a.EstadoCita || {}), atr_nombre_estado: 'CONFIRMADA' } }) : a)));
      if (typeof onRefresh === 'function') await onRefresh(id);
      notify({ message: 'Check-in registrado', severity: 'success' });
    } catch (err) {
      console.error('Error en check-in', err);
      notify({ message: err?.response?.data?.error || 'Error al registrar check-in', severity: 'error' });
    }
  };

  const internalStartConsultation = async (appointment) => {
    const id = getAppointmentId(appointment);
    if (!id) return notify({ message: 'ID de cita inválido', severity: 'error' });
    try {
      // Use updateAppointmentStatus to move to EN_CONSULTA (backend validates transition)
      await updateAppointmentStatus(id, 'EN_CONSULTA');
      setLocalAppointments(prev => prev.map(a => (getAppointmentId(a) === id ? ({ ...a, EstadoCita: { ...(a.EstadoCita || {}), atr_nombre_estado: 'EN_CONSULTA' } }) : a)));
      if (typeof onRefresh === 'function') await onRefresh(id);
      notify({ message: 'Consulta iniciada', severity: 'success' });
      // if parent passed a navigation handler, call it
      if (typeof onStartConsultation === 'function') {
        try { onStartConsultation(id); } catch (e) { /* ignore */ }
      }
    } catch (err) {
      console.error('Error iniciando consulta', err);
      notify({ message: err?.response?.data?.error || 'Error al iniciar consulta', severity: 'error' });
    }
  };

  const handleGenerateReport = async () => {
    try {
      const svgText = await fetch(logoSvg).then(r => r.text());
      const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();
      img.src = url;

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const desiredHeight = 72;
          const scale = desiredHeight / img.height;
          canvas.width = img.width * scale;
          canvas.height = desiredHeight;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const imgData = canvas.toDataURL('image/png');
          URL.revokeObjectURL(url);

          const doc = new jsPDF({ unit: 'pt', format: 'a4' });
          const margin = 40;
          const headerHeight = 48;
          const pageWidth = doc.internal.pageSize.getWidth();

          const drawClinicHeader = () => {
            doc.setFillColor(186, 110, 143);
            doc.rect(0, 0, pageWidth, headerHeight, 'F');
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(255, 255, 255);
            doc.text('Clínica Estética Rosales', margin, headerHeight - 14);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(0, 0, 0);
          };

          drawClinicHeader();

          const imgProps = doc.getImageProperties(imgData);
          const imgWidth = 72;
          const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
          const logoY = headerHeight + 6;
          doc.addImage(imgData, 'PNG', margin, logoY, imgWidth, imgHeight);

          doc.setFontSize(16);
          doc.setFont(undefined, 'bold');
          doc.text('Listado de Citas', margin + imgWidth + 12, logoY + 18);
          doc.setFontSize(10);
          doc.setFont(undefined, 'normal');
          doc.text(`Generado: ${new Date().toLocaleString()}`, margin + imgWidth + 12, logoY + 36);

          const startY = logoY + imgHeight + 12;
          const rows = (localAppointments || []).map(a => {
            return [
              getPatientName(a) || '-',
              getDoctorName(a) || '-',
              (() => { const d = getStartDate(a); return d ? format(d, 'dd/MM/yyyy', { locale: es }) : (getFecha(a) || '-'); })(),
              getHora(a) || '-',
              getStatusName(a) || '-',
              a.atr_motivo_cita || a.motivo || a.reason || '-'
            ];
          });

          doc.autoTable({
            startY,
            head: [['Paciente','Médico','Fecha','Hora','Estado','Motivo']],
            body: rows,
            styles: { fontSize: 10 },
            didDrawPage: () => drawClinicHeader()
          });

          const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : startY + 80;
          doc.setFontSize(9);
          doc.text('Documento generado desde la aplicación.', margin, finalY);
          doc.save(`citas_${Date.now()}.pdf`);
        } catch (err) {
          console.error('Error creando PDF de citas', err);
        }
      };

      img.onerror = (e) => { console.error('Error cargando logo para PDF', e); };
    } catch (err) {
      console.error('Error generando reporte', err);
    }
  };

  // Helpers to normalize appointment shapes from different backends/versions
  const getAppointmentId = (a) => a?.atr_id_cita ?? a?.id ?? a?.atr_id ?? a?.appointmentId ?? null;
  const getPatientName = (a) => {
    if (!a) return 'Paciente no especificado';
    if (a.Patient) return `${a.Patient.atr_nombre || a.Patient.nombre || ''} ${a.Patient.atr_apellido || ''}`.trim();
    if (a.patient) return `${a.patient.atr_nombre || a.patient.nombre || ''} ${a.patient.atr_apellido || a.patient.apellido || ''}`.trim();
    if (a.atr_nombre || a.atr_nombre_paciente) return `${a.atr_nombre || a.atr_nombre_paciente} ${a.atr_apellido || a.atr_apellido_paciente || ''}`.trim();
    return 'Paciente no especificado';
  };
  const getDoctorName = (a) => {
    if (!a) return 'No asignado';
    if (a.Doctor) return `Dr. ${a.Doctor.atr_nombre || a.Doctor.nombre || ''} ${a.Doctor.atr_apellido || a.Doctor.apellido || ''}`.trim();
    if (a.doctor) return `Dr. ${a.doctor.atr_nombre || a.doctor.nombre || ''} ${a.doctor.atr_apellido || a.doctor.apellido || ''}`.trim();
    if (a.atr_nombre_medico || a.atr_nombre) return `Dr. ${a.atr_nombre_medico || a.atr_nombre} ${a.atr_apellido_medico || a.atr_apellido || ''}`.trim();
    return 'No asignado';
  };

  const getStatusId = (a) => {
    // Common variants
    return a?.atr_id_estado ?? a?.estadoId ?? a?.statusId ?? a?.estado ?? a?.status ?? null;
  };

  const getStatusName = (a) => {
    if (!a) return null;
    if (a.EstadoCita?.atr_nombre_estado) return a.EstadoCita.atr_nombre_estado;
    if (a.estadoName) return a.estadoName;
    if (a.statusName) return a.statusName;
    // fallback via id -> name mapping helper if available
    const id = getStatusId(a);
    if (id) return getStatusNameById(id);
    return null;
  };

  const getFecha = (a) => a?.atr_fecha_cita ?? a?.fecha ?? a?.date ?? null;
  const getHora = (a) => a?.atr_hora_cita ?? a?.hora ?? a?.time ?? null;

  // Support calendar-formatted items where `start` is a Date
  const getStartDate = (a) => {
    if (!a) return null;
    if (a.start) return (typeof a.start === 'string') ? new Date(a.start) : a.start;
    // If we have date + time strings
    const fecha = getFecha(a);
    const hora = getHora(a);
    if (fecha && hora) return new Date(`${fecha} ${hora}`);
    if (fecha) return new Date(fecha);
    return null;
  };

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
          <Grid item xs={12} key={getAppointmentId(appointment) || Math.random()}>
            <Card variant="outlined">
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box>
                    <Typography variant="h6" component="div">
                      {getPatientName(appointment)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      Médico: {getDoctorName(appointment)}
                    </Typography>
                  </Box>
                  <Chip
                    label={getStatusLabel(getStatusName(appointment) || getStatusNameById(getStatusId(appointment)))}
                    color={getStatusColor(getStatusName(appointment) || getStatusNameById(getStatusId(appointment)))}
                    size="small"
                  />
                </Box>

                <Box mb={2}>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ScheduleIcon fontSize="small" />
                    {format(getStartDate(appointment), 'dd/MM/yyyy HH:mm', { locale: es })}
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {appointment.atr_motivo_cita ?? appointment.motivo ?? appointment.reason ?? ''}
                </Typography>

                <Box display="flex" gap={1} flexWrap="wrap">
                  {((getStatusId(appointment) === 1 || getStatusId(appointment) === 2) || ['PROGRAMADA','CONFIRMADA'].includes(String(getStatusName(appointment)).toUpperCase())) && onCheckIn && (
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      startIcon={<CheckCircleIcon />}
                      onClick={() => onCheckIn(getAppointmentId(appointment))}
                      fullWidth
                    >
                      Check-in
                    </Button>
                  )}

                  {((getStatusId(appointment) === 1 || getStatusId(appointment) === 2) || ['PROGRAMADA','CONFIRMADA'].includes(String(getStatusName(appointment)).toUpperCase())) && onStartConsultation && (
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      startIcon={<PlayArrowIcon />}
                      onClick={() => onStartConsultation(getAppointmentId(appointment))}
                      fullWidth
                    >
                      Iniciar Consulta
                    </Button>
                  )}

                  {(onEdit || onReschedule) && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<ScheduleIcon />}
                      onClick={() => {
                        // open the local reprogram modal and pass appointment
                        setReprogramTarget(appointment);
                        setReprogramOpen(true);
                      }}
                      fullWidth
                    >
                      Reprogramar
                    </Button>
                  )}

                  {onEdit && (
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => onEdit(getAppointmentId(appointment))}
                    >
                      Editar
                    </Button>
                  )}

                  {onCancel && (
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<CancelIcon />}
                      onClick={() => onCancel(getAppointmentId(appointment))}
                      fullWidth
                    >
                      Cancelar
                    </Button>
                  )}
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDelete(appointment)}
                    fullWidth
                  >
                    Eliminar
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
      {showGenerateButton && (
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button variant="outlined" onClick={handleGenerateReport}>Generar Reporte</Button>
        </Box>
      )}
      {/* Reprogram modal (uses ReprogramForm) */}
      <Dialog open={reprogramOpen} onClose={()=>{setReprogramOpen(false); setReprogramTarget(null);}} fullWidth maxWidth="sm">
        <DialogTitle>Reprogramar cita</DialogTitle>
        <DialogContent>
          {reprogramTarget && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2">Paciente: {getPatientName(reprogramTarget)}</Typography>
              <Typography variant="body2">Médico: {getDoctorName(reprogramTarget)}</Typography>
            </Box>
          )}
          <ReprogramForm
            initialDate={reprogramTarget ? (reprogramTarget.atr_fecha_cita || '') : ''}
            initialTime={reprogramTarget ? (reprogramTarget.atr_hora_cita || '') : ''}
            initialReason={reprogramTarget ? (reprogramTarget.atr_motivo_cita || reprogramTarget.motivo || '') : ''}
            initialStatus={reprogramTarget ? (reprogramTarget.atr_id_estado || reprogramTarget.status || '') : ''}
            onCancel={() => { setReprogramOpen(false); setReprogramTarget(null); }}
            onSubmit={async (payload) => {
              // payload: { nuevaFecha, nuevaHora, motivo, estado }
              const id = getAppointmentId(reprogramTarget);
              // Aplicar actualización optimista en la UI: reflejar nuevo estado/fecha/hora
              setLocalAppointments(prev => prev.map(a => {
                try {
                  if (getAppointmentId(a) === id) {
                    const updated = {
                      ...a,
                      atr_fecha_cita: payload.nuevaFecha ?? a.atr_fecha_cita,
                      atr_hora_cita: payload.nuevaHora ?? a.atr_hora_cita,
                      atr_motivo_cita: payload.motivo ?? a.atr_motivo_cita,
                      atr_id_estado: payload.estado ?? a.atr_id_estado
                    };
                    // actualizar nombre de Estado si existe mapeo
                    if (payload.estado) {
                      const name = getStatusNameById(payload.estado);
                      if (name) {
                        updated.EstadoCita = { ...(a.EstadoCita || {}), atr_nombre_estado: name };
                      }
                    }
                    return updated;
                  }
                } catch (e) {
                  // si algo falla, devolver el item original
                  return a;
                }
                return a;
              }));

              if (onReschedule) {
                await onReschedule(id, payload);
              }
              setReprogramOpen(false);
              setReprogramTarget(null);
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>{setReprogramOpen(false); setReprogramTarget(null);}}>Cerrar</Button>
        </DialogActions>
      </Dialog>
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
            {localAppointments.map(appointment => (
              <TableRow key={getAppointmentId(appointment) || Math.random()} hover>
                <TableCell>
                  {getPatientName(appointment)}
                </TableCell>
                <TableCell>
                  {getDoctorName(appointment)}
                </TableCell>
                <TableCell>
                  {(() => {
                    const d = getStartDate(appointment);
                    return d ? format(d, 'dd/MM/yyyy', { locale: es }) : '';
                  })()}
                </TableCell>
                <TableCell>{(() => { const d = getStartDate(appointment); return d ? format(d, 'HH:mm', { locale: es }) : (getHora(appointment) || ''); })()}</TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(getStatusName(appointment) || getStatusNameById(getStatusId(appointment)))}
                    color={getStatusColor(getStatusName(appointment) || getStatusNameById(getStatusId(appointment)))}
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
                    {appointment.atr_motivo_cita ?? appointment.motivo ?? appointment.reason ?? ''}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={1} flexWrap="wrap">
                      {((getStatusId(appointment) === 1 || getStatusId(appointment) === 2) || ['PROGRAMADA','CONFIRMADA'].includes(String(getStatusName(appointment)).toUpperCase())) && (
                        <Tooltip title="Check-in" arrow>
                          <span>
                            <IconButton
                              color="primary"
                              size="small"
                              onClick={() => (onCheckIn ? onCheckIn(getAppointmentId(appointment)) : internalCheckIn(appointment))}
                              aria-label={`check-in-${getAppointmentId(appointment)}`}
                              disabled={canPerformAction ? !canPerformAction(appointment, 'checkin') : false}
                            >
                              <CheckCircleIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                      )}

                      {((getStatusId(appointment) === 1 || getStatusId(appointment) === 2) || ['PROGRAMADA','CONFIRMADA'].includes(String(getStatusName(appointment)).toUpperCase())) && (
                        <Tooltip title="Iniciar consulta" arrow>
                          <span>
                            <IconButton
                              color="success"
                              size="small"
                              onClick={() => (onStartConsultation ? onStartConsultation(getAppointmentId(appointment)) : internalStartConsultation(appointment))}
                              aria-label={`start-consultation-${getAppointmentId(appointment)}`}
                              disabled={canPerformAction ? !canPerformAction(appointment, 'start_consultation') : false}
                            >
                              <PlayArrowIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                      )}

                      {(onEdit || onReschedule) && (
                        <Tooltip title="Reprogramar" arrow>
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => { setReprogramTarget(appointment); setReprogramOpen(true); }}
                              aria-label={`reschedule-${getAppointmentId(appointment)}`}
                            >
                              <ScheduleIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                      )}

                      {onCancel && (
                        <Tooltip title="Cancelar" arrow>
                          <span>
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => onCancel(getAppointmentId(appointment))}
                              aria-label={`cancel-${getAppointmentId(appointment)}`}
                            >
                              <CancelIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                      )}

                      <Tooltip title="Eliminar" arrow>
                        <span>
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => handleDelete(appointment)}
                            aria-label={`delete-${getAppointmentId(appointment)}`}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </span>
                      </Tooltip>

                      <Tooltip title="Ver" arrow>
                        <span>
                          <IconButton
                            size="small"
                            onClick={() => handleViewClick(appointment)}
                            aria-label={`view-${getAppointmentId(appointment)}`}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <ViewAppointments open={viewModalOpen} onClose={() => setViewModalOpen(false)} appointment={viewAppointment} />
    </Paper>
  );
};

export default AppointmentList;