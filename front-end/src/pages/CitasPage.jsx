import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AppointmentList from '../Components/appointments/AppointmentList';
import HistorialdeCitas from '../Components/appointments/HistorialConsultas';
import PagosPendientesPage from './PagosPendientesPage';
import CitasReportesPage from './CitasReportesPage';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FormularioReservaCita from '../Components/appointments/FormularioReservaCita';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAppointments } from '../redux/appointments/appointmentsSlice';
import { checkInAppointment, updateAppointmentStatus } from '../services/appointmentService';
import { APPOINTMENT_STATUS, canTransitionTo, isFinalStatus } from '../config/appointmentStatus';
import { motion, AnimatePresence } from 'framer-motion';
// cleaned unused imports
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Snackbar, Alert, Box, TextField, Typography, Paper, useMediaQuery, IconButton, Tooltip } from '@mui/material';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logoSvg from '../logo.svg';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { getStatusNameById } from '../config/appointmentStatus';
import { rescheduleApp, cancelApp } from '../redux/appointments/appointmentsSlice';
import './citas-page.css';

const pageVariant = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export default function CitasPage() {
  const location = useLocation();
  const pathname = location.pathname || '';
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Si la ruta contiene /agendar, abrimos el modal automáticamente
    if (pathname.includes('/agendar')) setOpen(true);
  }, [pathname]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    // Si venimos de una ruta /agendar, navegamos de vuelta a la lista limpia
    if (pathname.includes('/agendar')) navigate('/citas', { replace: true });
  };

  const dispatch = useDispatch();
  const appointments = useSelector(state => state.appointments.items || []);
  const loading = useSelector(state => state.appointments.status === 'loading');
  const isXs = useMediaQuery(theme => theme.breakpoints.down('sm'));

  const handleAppointmentCreated = (created) => {
    // Cerrar modal y recargar lista
    setOpen(false);
    if (pathname.includes('/agendar')) navigate('/citas', { replace: true });
    try {
      dispatch(fetchAppointments());
    } catch (e) {
      // no-op
    }
  };

  const handleAppointmentDeleted = async (id) => {
    try {
      // Refresh appointments from the server after a delete
      await dispatch(fetchAppointments());
    } catch (e) {
      console.error('Error recargando citas tras eliminación', e);
    }
  };

  React.useEffect(() => {
    // Load appointments on mount
    dispatch(fetchAppointments());
  }, [dispatch]);

  // Helpers (small subset copied from AppointmentList.jsx to build report)
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
  const getFecha = (a) => a?.atr_fecha_cita ?? a?.fecha ?? a?.date ?? null;
  const getHora = (a) => a?.atr_hora_cita ?? a?.hora ?? a?.time ?? null;
  const getStatusId = (a) => a?.atr_id_estado ?? a?.estadoId ?? a?.statusId ?? a?.estado ?? a?.status ?? null;
  const getStartDate = (a) => {
    if (!a) return null;
    if (a.start) return (typeof a.start === 'string') ? new Date(a.start) : a.start;
    const fecha = getFecha(a);
    const hora = getHora(a);
    if (fecha && hora) return new Date(`${fecha} ${hora}`);
    if (fecha) return new Date(fecha);
    return null;
  };
  const getStatusName = (a) => {
    if (!a) return null;
    if (a.EstadoCita?.atr_nombre_estado) return a.EstadoCita.atr_nombre_estado;
    if (a.estadoName) return a.estadoName;
    if (a.statusName) return a.statusName;
    const id = a?.atr_id_estado ?? a?.estadoId ?? a?.statusId ?? a?.estado ?? a?.status ?? null;
    if (id) return getStatusNameById(id);
    return null;
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
          const rows = (appointments || []).map(a => {
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

  const handleCheckIn = async (id) => {
    try {
      await checkInAppointment(id);
      dispatch(fetchAppointments());
      setNotif({ open: true, message: 'Check-in realizado', severity: 'success' });
    } catch (err) {
      console.error('Error en check-in:', err);
      setNotif({ open: true, message: err?.response?.data?.message || err?.message || 'Error en check-in', severity: 'error' });
    }
  };

  const handleStartConsultation = async (id) => {
    try {
      // Cambiar estado a EN_CONSULTA via service (backend valida transición)
      await updateAppointmentStatus(id, APPOINTMENT_STATUS.EN_CONSULTA);
      // Refrescar lista
      dispatch(fetchAppointments());
      // Navegar a la vista de consulta
      navigate(`/citas/consulta/${id}`);
    } catch (err) {
      console.error('Error iniciando consulta:', err);
      setNotif({ open: true, message: err?.response?.data?.error || err?.message || 'Error iniciando consulta', severity: 'error' });
    }
  };

  const canPerformAction = (appointment, action) => {
    const id = appointment?.atr_id_estado ?? appointment?.estadoId ?? appointment?.statusId ?? appointment?.estado ?? appointment?.status ?? null;
    const status = getStatusName(appointment) || (id ? getStatusNameById(id) : null);
    if (!status) return false;

    switch (action) {
      case 'checkin':
        // Backend allows check-in only for PROGRAMADA or CONFIRMADA
        return ['PROGRAMADA', 'CONFIRMADA'].includes(String(status).toUpperCase());
      case 'start_consultation':
        return canTransitionTo(status, APPOINTMENT_STATUS.EN_CONSULTA);
      case 'reschedule':
        return !isFinalStatus(status);
      case 'cancel':
        return canTransitionTo(status, APPOINTMENT_STATUS.CANCELADA);
      default:
        return true;
    }
  };

  // Selected appointment rendered below the tables
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const handleViewFromList = (appointment) => {
    setSelectedAppointment(prev => {
      if (!appointment) return null;
      const prevId = prev?.atr_id_cita || prev?.id;
      const newId = appointment?.atr_id_cita || appointment?.id;
      return (prevId && newId && prevId === newId) ? null : appointment;
    });
  };

  // Accordion control state
  const [pagosExpanded, setPagosExpanded] = useState(false);
  const [reportesExpanded, setReportesExpanded] = useState(false);
  const [historialExpanded, setHistorialExpanded] = useState(false);

  const handleCancel = (id) => {
    // Open cancel dialog to collect reason
    setCurrentAppointmentId(id);
    setCancelReason('');
    setCancelDialogOpen(true);
  };

  const handleReschedule = async (id, payload) => {
    try {
      await dispatch(rescheduleApp({ id, data: payload })).unwrap();
      dispatch(fetchAppointments());
      setNotif({ open: true, message: 'Cita reprogramada correctamente', severity: 'success' });
    } catch (err) {
      console.error('Error reprogramando cita:', err);
      setNotif({ open: true, message: err?.message || 'Error reprogramando cita', severity: 'error' });
    }
  };

  // --- Reschedule / Cancel dialog state & handlers ---
  const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false);
  const [currentAppointmentId, setCurrentAppointmentId] = React.useState(null);
  const [cancelReason, setCancelReason] = React.useState('');
  const [notif, setNotif] = React.useState({ open: false, message: '', severity: 'info' });

  // openRescheduleDialog removed — reprogram action navigates to edit page instead


  const submitCancel = async () => {
    if (!currentAppointmentId) return;
    try {
      await dispatch(cancelApp({ id: currentAppointmentId, reason: cancelReason })).unwrap();
      setCancelDialogOpen(false);
      dispatch(fetchAppointments());
      setNotif({ open: true, message: 'Cita cancelada correctamente', severity: 'success' });
    } catch (err) {
      console.error('Error cancelando cita:', err);
      setNotif({ open: true, message: err?.message || 'Error cancelando cita', severity: 'error' });
    }
  };

  const handleCloseNotif = () => setNotif(prev => ({ ...prev, open: false }));

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div className="citas-page-container" key="list" variants={pageVariant} initial="initial" animate="animate" exit="exit">
          <div className="section-header">
            <h2>Citas</h2>
            <div className="header-actions">
              {isXs ? (
                <Tooltip title="Generar Reporte" arrow>
                  <IconButton size="small" onClick={handleGenerateReport} aria-label="generar-reporte">
                    <PictureAsPdfIcon />
                  </IconButton>
                </Tooltip>
              ) : (
                <Button variant="outlined" onClick={handleGenerateReport} sx={{ mr: 1 }}>Generar Reporte</Button>
              )}
              <Button variant="contained" color="primary" onClick={handleOpen}>Agendar Cita</Button>
            </div>
          </div>

          <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
            <Box sx={{ flex: 1 }}>
              <AppointmentList
                appointments={appointments}
                loading={loading}
                onCheckIn={handleCheckIn}
                onStartConsultation={handleStartConsultation}
                onCancel={handleCancel}
                onReschedule={handleReschedule}
                onEdit={(id) => navigate(`/citas/${id}/editar`)}
                onView={handleViewFromList}
                onDelete={handleAppointmentDeleted}
                onRefresh={handleAppointmentDeleted}
                canPerformAction={canPerformAction}
                showGenerateButton={false}
              />
            </Box>
          </Box>
        </motion.div>
      </AnimatePresence>

      {/* Render selected appointment below the tables */}
      {selectedAppointment && (
        <Box sx={{ mt: 3 }}>
          <Paper sx={{ p: 2 }} variant="outlined">
            <Typography variant="h6">Detalle de cita seleccionado</Typography>
            <Box sx={{ mt: 1 }}>
              <Typography><strong>Paciente:</strong> {selectedAppointment.paciente?.nombreCompleto || selectedAppointment.paciente?.atr_nombre || selectedAppointment.Patient?.atr_nombre || '-'}</Typography>
              <Typography><strong>Médico:</strong> {selectedAppointment.medico?.nombreCompleto || selectedAppointment.doctor?.atr_nombre || selectedAppointment.atr_nombre_medico || '-'}</Typography>
              <Typography><strong>Fecha:</strong> {selectedAppointment.atr_fecha_cita ? new Date(selectedAppointment.atr_fecha_cita).toLocaleDateString('es-ES') : (selectedAppointment.fecha || '-')}</Typography>
              <Typography><strong>Hora:</strong> {selectedAppointment.atr_hora_cita || selectedAppointment.hora || '-'}</Typography>
              <Typography><strong>Motivo:</strong> {selectedAppointment.atr_motivo_cita || selectedAppointment.motivo || selectedAppointment.reason || '-'}</Typography>
            </Box>
          </Paper>
        </Box>
      )}

      {/* Historial de consultas: panel independiente dentro de un Accordion (lazy load) */}
      <Box sx={{ mt: 3 }}>
        <Accordion expanded={historialExpanded} onChange={() => setHistorialExpanded(prev => !prev)}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">Historial de Citas</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {historialExpanded && (
              <HistorialdeCitas
                patientId={
                  selectedAppointment?.paciente?.atr_id_paciente ||
                  selectedAppointment?.paciente?.id ||
                  selectedAppointment?.Patient?.atr_id_paciente ||
                  selectedAppointment?.paciente?.atr_id ||
                  selectedAppointment?.Patient?.id ||
                  null
                }
              />
            )}
          </AccordionDetails>
        </Accordion>
      </Box>

      {/* Panel de Pagos Pendientes: renderizar la página embebida dentro de un Accordion */}
      <Box sx={{ mt: 2 }}>
        <Accordion expanded={pagosExpanded} onChange={() => setPagosExpanded(prev => !prev)}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}> 
            <Typography variant="subtitle1">Pagos Pendientes</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {/* Render PagosPendientesPage only when expanded to avoid unnecessary fetches */}
            {pagosExpanded && <PagosPendientesPage />}
          </AccordionDetails>
        </Accordion>
      </Box>

      {/* Panel de Reportes: CitasReportesPage embebido debajo de Pagos Pendientes */}
      <Box sx={{ mt: 2 }}>
        <Accordion expanded={reportesExpanded} onChange={() => setReportesExpanded(prev => !prev)}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">Reportes de Citas</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {reportesExpanded && <CitasReportesPage />}
          </AccordionDetails>
        </Accordion>
      </Box>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="lg">
        <DialogTitle>Agendar Cita</DialogTitle>
        <DialogContent dividers>
          <FormularioReservaCita inModal onSuccess={handleAppointmentCreated} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Reschedule Dialog removed — reprogram UI now renders inline in the page's right column */}

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Cancelar Cita</DialogTitle>
        <DialogContent>
          <TextField
            label="Motivo de cancelación (opcional)"
            fullWidth
            multiline
            rows={3}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>Cerrar</Button>
          <Button variant="contained" color="error" onClick={submitCancel}>Confirmar Cancelación</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={notif.open} autoHideDuration={6000} onClose={handleCloseNotif} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseNotif} severity={notif.severity} sx={{ width: '100%' }}>
          {notif.message}
        </Alert>
      </Snackbar>
    </>
  );
}
