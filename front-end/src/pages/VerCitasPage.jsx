// File: src/pages/CitasAgendarPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Typography, Button, Container, Box,
  TextField, Select, MenuItem, FormControl, InputLabel,
  Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
  IconButton, Chip, Fab, Modal,
  Snackbar, Alert, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, useTheme, useMediaQuery, Menu, ListItemIcon, ListItemText
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate para la navegación

import {
  Edit,
  Trash,
  CheckCircle,
  Eye,
  CalendarX,
  CalendarClock
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

// Importa los iconos de Material-UI para los nuevos botones
import AssessmentIcon from '@mui/icons-material/Assessment'; // Icono para Reporte
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // Icono para Regresar
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Importa el componente ScheduleAppointment que deseas usar para agendar
import ScheduleAppointment from '../Components/appointments/ScheduleAppointment'; // Asegúrate de que esta ruta sea correcta

// Define a custom Material-UI theme with specified colors
const theme = createTheme({
  palette: {
    primary: {
      main: '#BA6E8F', // A shade of pink/purple
    },
    secondary: {
      main: '#D391B0', // A lighter shade of pink/purple
    },
    background: {
      default: '#f8f8f8', // Light background for the app
      paper: '#ffffff', // White for cards and modals
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          backgroundColor: '#BA6E8F',
          '&:hover': {
            backgroundColor: '#D391B0',
          },
        },
      },
    },
    MuiModal: {
      styleOverrides: {
        backdrop: {
          backgroundColor: 'rgba(0, 0, 0, 0.3)', // Slightly lighter backdrop
        },
      },
    },
  },
});

// Mock Data (Mantén estos datos de prueba)
const mockPatients = [
  { id: 'p1', name: 'Juan Pérez', expediente: 'EXP001' },
  { id: 'p2', name: 'María García', expediente: 'EXP002' },
  { id: 'p3', name: 'Carlos López', expediente: 'EXP003' },
  { id: 'p4', name: 'Ana Martínez', expediente: 'EXP004' },
];

const mockDoctors = [
  { id: 'd1', name: 'Dra. Laura Soto', specialty: 'Cardiología' },
  { id: 'd2', name: 'Dr. Miguel Rivera', specialty: 'Pediatría' },
  { id: 'd3', name: 'Dra. Sofía Vargas', specialty: 'Dermatología' },
  { id: 'd4', name: 'Dr. Andrés Castro', specialty: 'Medicina General' },
];

const initialAppointments = [
  {
    id: 'a1',
    date: '2025-07-25T10:00:00',
    patientId: 'p1',
    doctorId: 'd1',
    type: 'Primera Consulta',
    reason: 'Dolor de pecho',
    status: 'Pendiente',
  },
  {
    id: 'a2',
    date: '2025-07-26T14:30:00',
    patientId: 'p2',
    doctorId: 'd2',
    type: 'Seguimiento',
    reason: 'Revisión de vacuna',
    status: 'Confirmada',
  },
  {
    id: 'a3',
    date: '2025-07-27T09:00:00',
    patientId: 'p3',
    doctorId: 'd3',
    type: 'Revisión',
    reason: 'Control de lunares',
    status: 'Realizada',
  },
  {
    id: 'a4',
    date: '2025-07-28T11:00:00',
    patientId: 'p4',
    doctorId: 'd4',
    type: 'Examen',
    reason: 'Chequeo anual',
    status: 'Cancelada',
  },
  {
    id: 'a5',
    date: '2025-07-29T16:00:00',
    patientId: 'p1',
    doctorId: 'd2',
    type: 'Seguimiento',
    reason: 'Control pediátrico',
    status: 'Pendiente',
  },
  {
    id: 'a6',
    date: '2025-08-01T10:00:00',
    patientId: 'p2',
    doctorId: 'd1',
    type: 'Primera Consulta',
    reason: 'Consulta de rutina',
    status: 'Pendiente',
  },
  {
    id: 'a7',
    date: '2025-08-02T15:00:00',
    patientId: 'p3',
    doctorId: 'd4',
    type: 'Seguimiento',
    reason: 'Revisión general',
    status: 'Confirmada',
  },
];

// Utility function to get patient/doctor name by ID
const getPatientName = (id) => mockPatients.find(p => p.id === id)?.name || 'Desconocido';
const getDoctorName = (id) => mockDoctors.find(d => d.id === id)?.name || 'Desconocido';


// Ver Citas Component
const VerCitas = ({ appointments, onUpdateAppointment, onDeleteAppointment, onNavigateToSchedule }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    dateFrom: null, // Stored as Date object
    dateTo: null,   // Stored as Date object
    status: '',
    doctorId: '',
    patientSearch: '',
  });
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  // Estado para el modal de detalles rápidos
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [detailsAppointment, setDetailsAppointment] = useState(null);
  const [reportAnchorEl, setReportAnchorEl] = useState(null);
  const openReportMenu = Boolean(reportAnchorEl);
  const handleReportMenuClick = (event) => setReportAnchorEl(event.currentTarget);
  const handleReportMenuClose = () => setReportAnchorEl(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Apply filters whenever filters or appointments change
  useEffect(() => {
    let tempAppointments = [...appointments];

    // Filter by date range
    if (filters.dateFrom) {
      tempAppointments = tempAppointments.filter(app =>
        parseISO(app.date) >= filters.dateFrom
      );
    }
    if (filters.dateTo) {
      // To include the entire day, set the time to the end of the day
      const dateToInclusive = new Date(filters.dateTo);
      dateToInclusive.setHours(23, 59, 59, 999);
      tempAppointments = tempAppointments.filter(app =>
        parseISO(app.date) <= dateToInclusive
      );
    }

    // Filter by status
    if (filters.status) {
      tempAppointments = tempAppointments.filter(app => app.status === filters.status);
    }

    // Filter by doctor
    if (filters.doctorId) {
      tempAppointments = tempAppointments.filter(app => app.doctorId === filters.doctorId);
    }

    // Filter by patient search (name or expediente)
    if (filters.patientSearch) {
      const lowerCaseSearch = filters.patientSearch.toLowerCase();
      tempAppointments = tempAppointments.filter(app => {
        const patient = mockPatients.find(p => p.id === app.patientId);
        return patient && (
          patient.name.toLowerCase().includes(lowerCaseSearch) ||
          patient.expediente.toLowerCase().includes(lowerCaseSearch)
        );
      });
    }

    // Sort by date (oldest first)
    tempAppointments.sort((a, b) => new Date(a.date) - new Date(b.date));

    setFilteredAppointments(tempAppointments);
    setPage(0); // Reset page when filters change
  }, [filters, appointments]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleDateFilterChange = (name, dateString) => {
    setFilters(prev => ({ ...prev, [name]: dateString ? new Date(dateString) : null }));
  };

  const handleClearFilters = () => {
    setFilters({
      dateFrom: null,
      dateTo: null,
      status: '',
      doctorId: '',
      patientSearch: '',
    });
  };

  const handleOpenEditModal = (appointment) => {
    setSelectedAppointment(appointment);
    setEditModalOpen(true);
  };

  const handleOpenCancelModal = (appointment) => {
    setSelectedAppointment(appointment);
    setCancelModalOpen(true);
  };

  const handleConfirmAppointment = (appointmentId) => {
    onUpdateAppointment(appointmentId, { status: 'Confirmada' });
    setSnackbarMessage('Cita confirmada exitosamente!');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const getStatusChipColor = (status) => {
    switch (status) {
      case 'Pendiente': return { label: 'Pendiente', color: 'warning' };
      case 'Confirmada': return { label: 'Confirmada', color: 'success' };
      case 'Realizada': return { label: 'Realizada', color: 'info' };
      case 'Cancelada': return { label: 'Cancelada', color: 'error' };
      case 'Reprogramada': return { label: 'Reprogramada', color: 'primary' };
      default: return { label: status, color: 'default' };
    }
  };

  // Exportar a Excel
  const handleExportExcel = () => {
    const data = filteredAppointments.map(app => ({
      Fecha: format(parseISO(app.date), 'dd/MM/yyyy', { locale: es }),
      Hora: format(parseISO(app.date), 'HH:mm', { locale: es }),
      Paciente: getPatientName(app.patientId),
      Médico: getDoctorName(app.doctorId),
      'Tipo de Cita': app.type,
      Motivo: app.reason,
      Estado: app.status
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Citas');
    XLSX.writeFile(wb, 'citas.xlsx');
    handleReportMenuClose();
  };

  // Exportar a PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    const columns = [
      { header: 'Fecha', dataKey: 'Fecha' },
      { header: 'Hora', dataKey: 'Hora' },
      { header: 'Paciente', dataKey: 'Paciente' },
      { header: 'Médico', dataKey: 'Médico' },
      { header: 'Tipo de Cita', dataKey: 'Tipo de Cita' },
      { header: 'Motivo', dataKey: 'Motivo' },
      { header: 'Estado', dataKey: 'Estado' },
    ];
    const rows = filteredAppointments.map(app => ({
      'Fecha': format(parseISO(app.date), 'dd/MM/yyyy', { locale: es }),
      'Hora': format(parseISO(app.date), 'HH:mm', { locale: es }),
      'Paciente': getPatientName(app.patientId),
      'Médico': getDoctorName(app.doctorId),
      'Tipo de Cita': app.type,
      'Motivo': app.reason,
      'Estado': app.status
    }));
    doc.autoTable({ columns, body: rows, styles: { fontSize: 9 }, headStyles: { fillColor: [186, 110, 143] } });
    doc.save('citas.pdf');
    handleReportMenuClose();
  };

  return (
    <Container sx={{ py: 4 }}>
      <Paper sx={{ p: { xs: 2, md: 4 }, boxShadow: 3 }}>
        <Typography variant="h4" sx={{ mb: 4, textAlign: 'center', color: theme.palette.primary.main, fontWeight: 'bold' }}>Gestión de Citas</Typography>

        {/* Filters Section */}
        <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 4, boxShadow: 2 }}>
          <Typography variant="h4" align="center" sx={{ mb: 3, color: theme.palette.primary.main, fontWeight: 600 }}>
            Gestión de Citas
          </Typography>
          <Box sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            flexWrap: 'wrap',
            gap: 2,
            mb: 2,
            alignItems: isMobile ? 'stretch' : 'flex-end'
          }}>
            <TextField
              label="Paciente"
              name="patientSearch"
              variant="outlined"
              size="small"
              value={filters.patientSearch}
              onChange={handleFilterChange}
              sx={{ minWidth: 180, flex: isMobile ? '1 1 100%' : 'none' }}
              fullWidth={isMobile}
            />
            <TextField
              label="Fecha Desde"
              type="date"
              variant="outlined"
              size="small"
              value={filters.dateFrom ? format(filters.dateFrom, 'yyyy-MM-dd') : ''}
              onChange={(e) => handleDateFilterChange('dateFrom', e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 150, flex: isMobile ? '1 1 100%' : 'none' }}
              fullWidth={isMobile}
            />
            <TextField
              label="Fecha Hasta"
              type="date"
              variant="outlined"
              size="small"
              value={filters.dateTo ? format(filters.dateTo, 'yyyy-MM-dd') : ''}
              onChange={(e) => handleDateFilterChange('dateTo', e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 150, flex: isMobile ? '1 1 100%' : 'none' }}
              fullWidth={isMobile}
            />
            <FormControl variant="outlined" size="small" sx={{ minWidth: 150, flex: isMobile ? '1 1 100%' : 'none' }} fullWidth={isMobile}>
              <InputLabel>Estado</InputLabel>
              <Select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                label="Estado"
              >
                <MenuItem value=""><em>Todos</em></MenuItem>
                <MenuItem value="Pendiente">Pendiente</MenuItem>
                <MenuItem value="Confirmada">Confirmada</MenuItem>
                <MenuItem value="Realizada">Realizada</MenuItem>
                <MenuItem value="Cancelada">Cancelada</MenuItem>
                <MenuItem value="Reprogramada">Reprogramada</MenuItem>
              </Select>
            </FormControl>
            <FormControl variant="outlined" size="small" sx={{ minWidth: 180, flex: isMobile ? '1 1 100%' : 'none' }} fullWidth={isMobile}>
              <InputLabel>Médico</InputLabel>
              <Select
                name="doctorId"
                value={filters.doctorId}
                onChange={handleFilterChange}
                label="Médico"
              >
                <MenuItem value=""><em>Todos</em></MenuItem>
                {mockDoctors.map(doctor => (
                  <MenuItem key={doctor.id} value={doctor.id}>{doctor.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant="contained" color="primary" onClick={() => setFilteredAppointments(appointments)} fullWidth={isMobile}>
              Buscar
            </Button>
            <Button variant="outlined" color="secondary" onClick={handleClearFilters} fullWidth={isMobile}>
              Limpiar
            </Button>
            <Box sx={{ flexGrow: 1, display: isMobile ? 'none' : 'block' }} />
            <Button
              variant="outlined"
              color="primary"
              startIcon={<AssessmentIcon />}
              onClick={handleReportMenuClick}
              sx={{ ml: isMobile ? 0 : 'auto', minWidth: 140 }}
              fullWidth={isMobile}
            >
              Reporte
            </Button>
          </Box>
          <Menu
            anchorEl={reportAnchorEl}
            open={openReportMenu}
            onClose={handleReportMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem onClick={handleExportPDF}>
              <ListItemIcon><PictureAsPdfIcon color="error" /></ListItemIcon>
              <ListItemText>Descargar PDF</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleExportExcel}>
              <ListItemIcon><TableChartIcon color="primary" /></ListItemIcon>
              <ListItemText>Exportar a Excel</ListItemText>
            </MenuItem>
          </Menu>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
            {filteredAppointments.length} resultados encontrados
          </Typography>
        </Paper>

        {/* Appointments Table */}
        <TableContainer component={Paper} sx={{ boxShadow: 3, overflowX: 'auto' }}>
          <Table aria-label="appointments table" size={isMobile ? 'small' : 'medium'}>
            <TableHead sx={{ bgcolor: theme.palette.primary.light }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.contrastText, fontSize: isMobile ? 13 : 16 }}>Fecha</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.contrastText, fontSize: isMobile ? 13 : 16 }}>Hora</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.contrastText, fontSize: isMobile ? 13 : 16 }}>Paciente</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.contrastText, fontSize: isMobile ? 13 : 16 }}>Médico</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.contrastText, fontSize: isMobile ? 13 : 16 }}>Tipo de Cita</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.contrastText, fontSize: isMobile ? 13 : 16 }}>Motivo</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.contrastText, fontSize: isMobile ? 13 : 16 }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.contrastText, fontSize: isMobile ? 13 : 16 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAppointments
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((appointment) => {
                  const statusInfo = getStatusChipColor(appointment.status);
                  // Colores suaves para filas según estado
                  const rowBg = {
                    'Pendiente': '#FFF8E1',
                    'Confirmada': '#E8F5E9',
                    'Realizada': '#E3F2FD',
                    'Cancelada': '#FFEBEE',
                    'Reprogramada': '#F3E5F5',
                  }[appointment.status] || 'inherit';
                  return (
                    <TableRow key={appointment.id} sx={{ backgroundColor: rowBg }}>
                      <TableCell>{format(parseISO(appointment.date), 'dd/MM/yyyy', { locale: es })}</TableCell>
                      <TableCell>{format(parseISO(appointment.date), 'HH:mm', { locale: es })}</TableCell>
                      <TableCell>{getPatientName(appointment.patientId)}</TableCell>
                      <TableCell>{getDoctorName(appointment.doctorId)}</TableCell>
                      <TableCell>{appointment.type}</TableCell>
                      <TableCell>{appointment.reason}</TableCell>
                      <TableCell>
                        <Chip label={statusInfo.label} color={statusInfo.color} size="small" />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Ver Detalles" arrow>
                          <IconButton size="small" color="info" onClick={() => { setDetailsAppointment(appointment); setDetailsModalOpen(true); }}>
                            <Eye size={18} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar/Reprogramar" arrow>
                          <IconButton size="small" color="primary" onClick={() => handleOpenEditModal(appointment)}>
                            <Edit size={18} />
                          </IconButton>
                        </Tooltip>
                        {appointment.status !== 'Cancelada' && appointment.status !== 'Realizada' && (
                          <Tooltip title="Cancelar" arrow>
                            <IconButton size="small" color="error" onClick={() => handleOpenCancelModal(appointment)}>
                              <Trash size={18} />
                            </IconButton>
                          </Tooltip>
                        )}
                        {appointment.status === 'Pendiente' && (
                          <Tooltip title="Confirmar" arrow>
                            <IconButton size="small" color="success" onClick={() => handleConfirmAppointment(appointment.id)}>
                              <CheckCircle size={18} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              {filteredAppointments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} sx={{ textAlign: 'center', py: 8, color: theme.palette.grey[500] }}>
                    No hay citas que coincidan con los filtros.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredAppointments.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Filas por página:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          />
        </TableContainer>

        {/* FAB for New Appointment - Now opens the modal */}
        <Fab
          color="primary"
          aria-label="add"
          sx={{ position: 'fixed', bottom: { xs: 16, sm: 32 }, right: { xs: 16, sm: 32 }, zIndex: 1200 }}
          onClick={onNavigateToSchedule}
        >
          {/* Plus icon removed as per edit hint */}
        </Fab>
      </Paper>

      {/* Modals */}
      {selectedAppointment && (
        <>
          <ReprogramarCitaModal
            open={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            appointment={selectedAppointment}
            onReprogram={onUpdateAppointment}
            setSnackbarMessage={setSnackbarMessage}
            setSnackbarSeverity={setSnackbarSeverity}
            setSnackbarOpen={setSnackbarOpen}
          />
          <CancelarCitaModal
            open={cancelModalOpen}
            onClose={() => setCancelModalOpen(false)}
            appointment={selectedAppointment}
            onCancel={onDeleteAppointment}
            setSnackbarMessage={setSnackbarMessage}
            setSnackbarSeverity={setSnackbarSeverity}
            setSnackbarOpen={setSnackbarOpen}
          />
        </>
      )}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Modal de Detalles Rápidos */}
      <Dialog open={detailsModalOpen} onClose={() => setDetailsModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Detalles de la Cita</DialogTitle>
        <DialogContent dividers>
          {detailsAppointment && (
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1 }}><strong>Paciente:</strong> {getPatientName(detailsAppointment.patientId)}</Typography>
              <Typography variant="subtitle1" sx={{ mb: 1 }}><strong>Médico:</strong> {getDoctorName(detailsAppointment.doctorId)}</Typography>
              <Typography variant="subtitle1" sx={{ mb: 1 }}><strong>Fecha:</strong> {format(parseISO(detailsAppointment.date), 'dd/MM/yyyy', { locale: es })}</Typography>
              <Typography variant="subtitle1" sx={{ mb: 1 }}><strong>Hora:</strong> {format(parseISO(detailsAppointment.date), 'HH:mm', { locale: es })}</Typography>
              <Typography variant="subtitle1" sx={{ mb: 1 }}><strong>Tipo de Cita:</strong> {detailsAppointment.type}</Typography>
              <Typography variant="subtitle1" sx={{ mb: 1 }}><strong>Motivo:</strong> {detailsAppointment.reason}</Typography>
              <Typography variant="subtitle1" sx={{ mb: 1 }}><strong>Estado:</strong> <Chip label={detailsAppointment.status} color={getStatusChipColor(detailsAppointment.status).color} size="small" /></Typography>
              {detailsAppointment.reprogramReason && (
                <Typography variant="body2" sx={{ mb: 1 }}><strong>Motivo de Reprogramación:</strong> {detailsAppointment.reprogramReason}</Typography>
              )}
              {detailsAppointment.cancelReason && (
                <Typography variant="body2" sx={{ mb: 1 }}><strong>Motivo de Cancelación:</strong> {detailsAppointment.cancelReason}</Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {detailsAppointment && detailsAppointment.status === 'Pendiente' && (
            <Button color="success" variant="contained" onClick={() => { handleConfirmAppointment(detailsAppointment.id); setDetailsModalOpen(false); }}>Confirmar</Button>
          )}
          {detailsAppointment && detailsAppointment.status !== 'Cancelada' && detailsAppointment.status !== 'Realizada' && (
            <Button color="error" variant="contained" onClick={() => { handleOpenCancelModal(detailsAppointment); setDetailsModalOpen(false); }}>Cancelar</Button>
          )}
          <Button color="primary" variant="outlined" onClick={() => { handleOpenEditModal(detailsAppointment); setDetailsModalOpen(false); }}>Editar/Reprogramar</Button>
          <Button onClick={() => setDetailsModalOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

// Reprogramar Cita Modal
const ReprogramarCitaModal = ({ open, onClose, appointment, onReprogram, setSnackbarMessage, setSnackbarSeverity, setSnackbarOpen }) => {
  const [newDate, setNewDate] = useState(appointment ? parseISO(appointment.date) : null);
  const [newTime, setNewTime] = useState(appointment ? parseISO(appointment.date) : null);
  const [reprogramReason, setReprogramReason] = useState('');

  const theme = useTheme(); // Access theme here

  useEffect(() => {
    if (appointment) {
      setNewDate(parseISO(appointment.date));
      setNewTime(parseISO(appointment.date));
      setReprogramReason('');
    }
  }, [appointment]);

  const handleReprogram = () => {
    if (!newDate || !newTime || !reprogramReason) {
      setSnackbarMessage('Por favor, complete todos los campos obligatorios para reprogramar.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    const combinedDateTime = new Date(newDate);
    combinedDateTime.setHours(newTime.getHours());
    combinedDateTime.setMinutes(newTime.getMinutes());
    combinedDateTime.setSeconds(0);
    combinedDateTime.setMilliseconds(0);

    onReprogram(appointment.id, {
      date: combinedDateTime.toISOString(),
      status: 'Reprogramada',
      reprogramReason: reprogramReason, // Add reprogram reason to the updated data
    });
    setSnackbarMessage('Cita reprogramada exitosamente!');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="reprogram-modal-title"
      aria-describedby="reprogram-modal-description"
    >
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: { xs: '90%', sm: 500 },
        bgcolor: theme.palette.background.paper,
        borderRadius: 2,
        boxShadow: 24,
        p: 4,
        outline: 'none',
        border: `2px solid ${theme.palette.primary.main}`, // Border color from theme
      }}>
        <Typography id="reprogram-modal-title" variant="h5" component="h2" sx={{ mb: 3, textAlign: 'center', color: theme.palette.primary.main }}>
          Reprogramar Cita
        </Typography>
        {appointment && (
          <Box sx={{ mb: 3, p: 2, bgcolor: theme.palette.grey[100], borderRadius: 1.5 }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Cita Original:</Typography>
            <Typography variant="body2">Paciente: {getPatientName(appointment.patientId)}</Typography>
            <Typography variant="body2">Médico: {getDoctorName(appointment.doctorId)}</Typography>
            <Typography variant="body2">Fecha: {format(parseISO(appointment.date), 'dd/MM/yyyy HH:mm', { locale: es })}</Typography>
            <Typography variant="body2">Motivo: {appointment.reason}</Typography>
          </Box>
        )}

        <TextField
          label="Nueva Fecha"
          type="date"
          fullWidth
          variant="outlined"
          value={newDate ? format(newDate, 'yyyy-MM-dd') : ''}
          onChange={(e) => setNewDate(e.target.value ? new Date(e.target.value) : null)}
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Nueva Hora"
          type="time"
          fullWidth
          variant="outlined"
          value={newTime ? format(newTime, 'HH:mm') : ''}
          onChange={(e) => setNewTime(e.target.value ? new Date(`2000-01-01T${e.target.value}`) : null)}
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Motivo de Reprogramación"
          variant="outlined"
          fullWidth
          multiline
          rows={3}
          value={reprogramReason}
          onChange={(e) => setReprogramReason(e.target.value)}
          required
          sx={{ mb: 3 }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button onClick={onClose} variant="outlined" color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleReprogram} variant="contained" color="primary" startIcon={<CalendarClock size={20} />}>
            Confirmar Reprogramación
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

// Cancelar Cita Modal
const CancelarCitaModal = ({ open, onClose, appointment, onCancel, setSnackbarMessage, setSnackbarSeverity, setSnackbarOpen }) => {
  const [cancelReason, setCancelReason] = useState('');

  const theme = useTheme(); // Access theme here

  useEffect(() => {
    if (appointment) {
      setCancelReason(''); // Reset reason when modal opens for a new appointment
    }
  }, [appointment]);

  const handleCancel = () => {
    if (!cancelReason) {
      setSnackbarMessage('Por favor, ingrese el motivo de la cancelación.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    onCancel(appointment.id, { status: 'Cancelada', cancelReason: cancelReason });
    setSnackbarMessage('Cita cancelada exitosamente!');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="cancel-modal-title"
      aria-describedby="cancel-modal-description"
    >
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: { xs: '90%', sm: 450 },
        bgcolor: theme.palette.background.paper,
        borderRadius: 2,
        boxShadow: 24,
        p: 4,
        outline: 'none',
        border: `2px solid ${theme.palette.error.main}`, // Red border for cancellation
      }}>
        <Typography id="cancel-modal-title" variant="h5" component="h2" sx={{ mb: 3, textAlign: 'center', color: theme.palette.error.main }}>
          ¿Confirmar Cancelación?
        </Typography>
        {appointment && (
          <Typography id="cancel-modal-description" sx={{ mb: 3, textAlign: 'center' }}>
            ¿Está seguro de que desea cancelar la cita del paciente <strong>{getPatientName(appointment.patientId)}</strong> con el Dr. <strong>{getDoctorName(appointment.doctorId)}</strong> el <strong>{format(parseISO(appointment.date), 'dd/MM/yyyy', { locale: es })}</strong> a las <strong>{format(parseISO(appointment.date), 'HH:mm', { locale: es })}</strong>?
          </Typography>
        )}
        <TextField
          label="Motivo de Cancelación"
          variant="outlined"
          fullWidth
          multiline
          rows={3}
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          required
          sx={{ mb: 3 }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button onClick={onClose} variant="outlined" color="secondary">
            No, Mantener Cita
          </Button>
          <Button onClick={handleCancel} variant="contained" color="error" startIcon={<CalendarX size={20} />}>
            Sí, Cancelar Cita
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};


// Main CitasAgendarPage Component
const CitasAgendarPage = () => {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false); // State for the schedule modal
  const [currentView, setCurrentView] = useState('list'); // 'list' or 'directSchedule'

  const navigate = useNavigate(); // Inicializa useNavigate

  const handleAddAppointment = (newAppointment) => {
    setAppointments((prevAppointments) => [...prevAppointments, newAppointment]);
    // No need for snackbar here, it's handled by ScheduleAppointment
  };

  const handleUpdateAppointment = (id, updatedFields) => {
    setAppointments((prevAppointments) =>
      prevAppointments.map((app) =>
        app.id === id ? { ...app, ...updatedFields } : app
      )
    );
  };

  const handleDeleteAppointment = (id) => {
    setAppointments((prevAppointments) => prevAppointments.filter((app) => app.id !== id));
  };

  const handleOpenScheduleModal = () => {
    setIsScheduleModalOpen(true);
  };

  const handleCloseScheduleModal = () => {
    setIsScheduleModalOpen(false);
  };

  const handleGoToReports = () => {
    navigate('/citas/reportes'); // Asume que tienes una ruta para reportes de citas
  };

  const handleGoBack = () => {
    navigate(-1); // Regresa a la página anterior en el historial
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: theme.palette.background.default }}>
        {/* Botón de Regresar Atrás */}
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-start' }}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleGoBack}
            startIcon={<ArrowBackIcon />}
          >
            Regresar Atrás
          </Button>
        </Box>

        {/* Main Content Area */}
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}> {/* Añadido flexWrap para responsividad */}
            <Button
              variant={currentView === 'list' ? 'contained' : 'outlined'}
              color="primary"
              onClick={() => setCurrentView('list')}
            >
              Ver Citas
            </Button>
             <Button
              variant={currentView === 'directSchedule' ? 'contained' : 'outlined'}
              color="primary"
              onClick={() => {
                setCurrentView('directSchedule');
                handleCloseScheduleModal();
              }}
            >
              Agendar Cita (Directo)
            </Button>
             <Button
              variant="contained"
              color="secondary"
              onClick={handleOpenScheduleModal}
            >
              Agendar Cita (Modal)
            </Button>
            {/* Nuevo botón de Reporte */}
            <Button
              variant="outlined"
              color="primary"
              onClick={handleGoToReports}
              startIcon={<AssessmentIcon />}
            >
              Reporte
            </Button>
          </Box>

          {currentView === 'list' && (
            <VerCitas
              appointments={appointments}
              onUpdateAppointment={handleUpdateAppointment}
              onDeleteAppointment={handleDeleteAppointment}
              onNavigateToSchedule={handleOpenScheduleModal}
            />
          )}
          {currentView === 'directSchedule' && (
            <ScheduleAppointment
              onAppointmentScheduled={handleAddAppointment}
              onClose={() => setCurrentView('list')}
            />
          )}
        </Box>

        {/* Modal for Agendar Cita (now specifically for ScheduleAppointment) */}
        <Modal
          open={isScheduleModalOpen}
          onClose={handleCloseScheduleModal}
          aria-labelledby="agendar-cita-modal-title"
          aria-describedby="agendar-cita-modal-description"
        >
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '95%', sm: 700, md: 800 },
            maxHeight: '90vh',
            overflowY: 'auto',
            bgcolor: theme.palette.background.paper,
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            outline: 'none',
            border: `2px solid ${theme.palette.primary.main}`,
          }}>
            <ScheduleAppointment
              onAppointmentScheduled={handleAddAppointment}
              onClose={handleCloseScheduleModal}
            />
          </Box>
        </Modal>
      </Box>
    </ThemeProvider>
  );
};

export default CitasAgendarPage;