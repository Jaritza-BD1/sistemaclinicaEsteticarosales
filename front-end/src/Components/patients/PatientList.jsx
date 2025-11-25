// File: src/Components/patients/PatientList.jsx
import React, { useEffect, useState } from 'react';
import {
  Box, Button, Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TablePagination, Paper, TextField, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, Snackbar, Alert, Tooltip, Accordion, AccordionSummary, AccordionDetails,
  CircularProgress, Chip
} from '@mui/material';
import { Edit, Delete, Visibility, Phone, Email, LocationOn } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import logoSvg from '../../logo.svg';
import { DataGrid } from '@mui/x-data-grid';
import ModalForm from '../common/ModalForm';
import PatientForm from './PatientForm';
import PatientHistory from './PatientHistory';
import ConsultationList from './ConsultationList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import { fetchPatients, deletePatient, clearError, getPatient } from '../../redux/patients/patientsSlice';

const theme = createTheme({
  palette: {
    primary: { main: '#BA6E8F' },
    secondary: { main: '#D391B0' },
  }
});

const PatientList = ({ onEdit, onDelete, onView, refresh }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: pacientes, status, error } = useSelector(state => state.patients);
  
  const [filtered, setFiltered] = useState([]);
  const [filters, setFilters] = useState({ nombre: '', expediente: '' });
  const [selected, setSelected] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, msg: '', severity: 'success' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    dispatch(fetchPatients());
  }, [dispatch]);

  useEffect(() => {
    if (pacientes.length > 0) {
      setFiltered(pacientes);
    }
  }, [pacientes]);

  // Limpiar error cuando cambia
  useEffect(() => {
    if (error) {
      setSnackbar({ open: true, msg: error, severity: 'error' });
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const applyFilters = () => {
    const f = pacientes.filter(p =>
      p.atr_nombre.toLowerCase().includes(filters.nombre.toLowerCase()) &&
      p.atr_numero_expediente.toString().includes(filters.expediente)
    );
    setFiltered(f);
    setPage(0);
  };

  const handleDelete = async () => {
    try {
      await dispatch(deletePatient(selected.atr_id_paciente)).unwrap();
      setSnackbar({ open: true, msg: 'Paciente eliminado exitosamente', severity: 'success' });
      setDeleteOpen(false);
      setSelected(null);
    } catch (err) {
      setSnackbar({ open: true, msg: 'Error al eliminar paciente', severity: 'error' });
    }
  };

  // Función placeholder para actualización futura
  const handleUpdate = async () => {
    // TODO: Implementar actualización de paciente
    console.log('Función de actualización no implementada');
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
      const rows = filtered.map(p => {
        const phones = p.telefonos || [];
        const mainPhone = phones && phones.length > 0 ? (phones[0].telefono || phones[0].atr_telefono || phones[0].numero || '') : '';
        return [
          p.atr_nombre || '-',
          p.atr_apellido || '-',
          p.atr_numero_expediente || '-',
          p.atr_identidad || '-',
          p.atr_fecha_nacimiento || '-',
          mainPhone || '-',
          p.atr_estado_paciente || 'ACTIVO'
        ];
      });
    doc.autoTable({ 
      head: [['Nombre', 'Apellido', 'Expediente', 'Identidad', 'Fecha Nacimiento', 'Teléfono principal', 'Estado']], 
      body: rows 
    });
    doc.save('pacientes.pdf');
  };

  const handleExportExcel = () => {
    const data = filtered.map(p => ({
      Nombre: p.atr_nombre,
      Apellido: p.atr_apellido,
      Expediente: p.atr_numero_expediente,
      Identidad: p.atr_identidad,
      Estado: p.atr_estado_paciente || 'ACTIVO',
      'Fecha Nacimiento': p.atr_fecha_nacimiento,
      'Teléfonos': p.telefonos?.length || 0,
      'Correos': p.correos?.length || 0,
      'Direcciones': p.direcciones?.length || 0
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pacientes');
    XLSX.writeFile(wb, 'pacientes.xlsx');
  };

  const [viewPatient, setViewPatient] = useState(null);
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [consultationsExpanded, setConsultationsExpanded] = useState(false);

  const handleViewPatient = (paciente) => {
    // If parent provided an onView handler, call it but still maintain local view state
    if (onView) {
      try { onView(paciente); } catch (e) { console.warn('onView handler error', e); }
    }

    // toggle local view when parent doesn't control view; auto-expand history when selecting
    setViewPatient(prev => {
      const same = prev && prev.atr_id_paciente === paciente.atr_id_paciente;
      const next = same ? null : paciente;
      if (!same) {
        setHistoryExpanded(true);
      }
      return next;
    });
  };

  const handleEditPatient = async (paciente) => {
    if (onEdit) return onEdit(paciente);
    try {
      // If the patient object already contains the tipo field, use it directly
      if (paciente && (paciente.atr_id_tipo_paciente !== undefined || paciente.tipoPaciente !== undefined)) {
        setSelected(paciente);
        setEditOpen(true);
        return;
      }

      // Otherwise fetch full patient details to ensure atr_id_tipo_paciente is available
      const full = await dispatch(getPatient(paciente.atr_id_paciente)).unwrap();
      setSelected(full || paciente);
      setEditOpen(true);
    } catch (err) {
      // fallback to opening with the partial object
      console.warn('No se pudo cargar paciente completo, abriendo con datos parciales', err);
      setSelected(paciente);
      setEditOpen(true);
    }
  };

  const handleDeletePatient = (paciente) => {
    if (onDelete) return onDelete(paciente);
    setSelected(paciente);
    setDeleteOpen(true);
  };

  // New: generate styled PDF report for current filtered patients using clinic header/logo
  const handleGenerateReport = async () => {
    try {
      // convert logo SVG to PNG like other components
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
          doc.text('Listado de Pacientes', margin + imgWidth + 12, logoY + 18);
          doc.setFontSize(10);
          doc.setFont(undefined, 'normal');
          doc.text(`Generado: ${new Date().toLocaleString()}`, margin + imgWidth + 12, logoY + 36);

          const rows = filtered.map(p => {
            const phones = p.telefonos || [];
            const mainPhone = phones && phones.length > 0 ? (phones[0].telefono || phones[0].atr_telefono || phones[0].numero || '') : '';
            return [
              p.atr_nombre || '-',
              p.atr_apellido || '-',
              p.atr_numero_expediente || '-',
              p.atr_identidad || '-',
              p.atr_fecha_nacimiento || '-',
              mainPhone || '-',
              p.atr_estado_paciente || 'ACTIVO'
            ];
          });

          const startY = logoY + imgHeight + 12;
          doc.autoTable({
            startY,
            head: [['Nombre', 'Apellido', 'Expediente', 'Identidad', 'Fecha Nacimiento', 'Teléfono principal', 'Estado']],
            body: rows,
            styles: { fontSize: 10 },
            didDrawPage: () => drawClinicHeader()
          });

          const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : startY + 80;
          doc.setFontSize(9);
          doc.text('Documento generado desde la aplicación.', margin, finalY);

          doc.save(`pacientes_${Date.now()}.pdf`);
        } catch (err) {
          console.error('Error creando PDF de pacientes', err);
          setSnackbar({ open: true, msg: 'Error al generar el reporte', severity: 'error' });
        }
      };

      img.onerror = (e) => {
        console.error('Error cargando logo para PDF', e);
        setSnackbar({ open: true, msg: 'No se pudo cargar el logo para generar el reporte', severity: 'error' });
      };
    } catch (err) {
      console.error('Error generando reporte', err);
      setSnackbar({ open: true, msg: 'Error al generar el reporte', severity: 'error' });
    }
  };

  const [editOpen, setEditOpen] = useState(false);

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'ACTIVO':
        return 'success';
      case 'INACTIVO':
        return 'error';
      case 'PENDIENTE':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (status === 'loading') {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ color: 'black', mb: 2, fontWeight: 600 }}>
            Gestión de Pacientes
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Administra la información de todos los pacientes registrados en el sistema
          </Typography>
        </Box>

        {/* Filtros y acciones */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <TextField
              label="Buscar por nombre"
              value={filters.nombre}
              onChange={(e) => setFilters(prev => ({ ...prev, nombre: e.target.value }))}
              size="small"
              sx={{ minWidth: 200 }}
            />
            <TextField
              label="Buscar por expediente"
              value={filters.expediente}
              onChange={(e) => setFilters(prev => ({ ...prev, expediente: e.target.value }))}
              size="small"
              sx={{ minWidth: 200 }}
            />
            <Button
              variant="contained"
              onClick={applyFilters}
              sx={{ minWidth: 120 }}
            >
              Filtrar
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setFilters({ nombre: '', expediente: '' });
                setFiltered(pacientes);
              }}
              sx={{ minWidth: 120 }}
            >
              Limpiar
            </Button>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              onClick={() => navigate('/pacientes/registrar')}
              sx={{ minWidth: 150 }}
            >
              Nuevo Paciente
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<PictureAsPdfIcon />}
              onClick={handleExportPDF}
              sx={{ minWidth: 120 }}
            >
              Exportar PDF
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<PictureAsPdfIcon />}
              onClick={handleGenerateReport}
              sx={{ minWidth: 160 }}
            >
              Generar Reporte
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<TableChartIcon />}
              onClick={handleExportExcel}
              sx={{ minWidth: 120 }}
            >
              Exportar Excel
            </Button>
          </Box>
        </Paper>

        {/* DataGrid de pacientes */}
        <Paper sx={{ borderRadius: 2, overflow: 'hidden', p: 2 }}>
          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={filtered}
              columns={[
                { field: 'fullName', headerName: 'Nombre completo', flex: 1, minWidth: 200, valueGetter: (params) => `${params.row.atr_nombre || ''} ${params.row.atr_apellido || ''}` },
                { field: 'atr_identidad', headerName: 'Identidad', flex: 0.6, minWidth: 140 },
                { field: 'atr_numero_expediente', headerName: 'Expediente', flex: 0.6, minWidth: 120 },
                { field: 'telefonoPrincipal', headerName: 'Teléfono principal', flex: 0.8, minWidth: 160, valueGetter: (params) => {
                    const phones = params.row.telefonos || [];
                    if (!phones || phones.length === 0) return '';
                    const first = phones[0];
                    return first.telefono || first.atr_telefono || first.numero || '';
                  }
                },
                { field: 'actions', headerName: 'Acciones', sortable: false, filterable: false, width: 160, renderCell: (params) => (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Ver detalles">
                      <IconButton size="small" onClick={() => handleViewPatient(params.row)} sx={{ color: 'primary.main' }}>
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Editar">
                      <IconButton size="small" onClick={() => handleEditPatient(params.row)} sx={{ color: 'primary.main' }}>
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton size="small" onClick={() => handleDeletePatient(params.row)} sx={{ color: 'error.main' }}>
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              ]}
              getRowId={row => row.atr_id_paciente}
              pageSize={10}
              rowsPerPageOptions={[5,10,20]}
              loading={status === 'loading'}
              autoHeight
            />
          </Box>
        </Paper>

        {/* Paneles colapsables debajo de la tabla: Historial y Consultas */}
        <Box sx={{ mt: 3 }}>
          <Accordion expanded={historyExpanded} onChange={(e, expanded) => setHistoryExpanded(expanded)}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Historial del paciente {viewPatient ? `${viewPatient.atr_nombre} ${viewPatient.atr_apellido}` : ''}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {historyExpanded ? (
                viewPatient ? (
                  <PatientHistory patientId={viewPatient.atr_id_paciente} />
                ) : (
                  <Typography>Seleccione un paciente para ver el historial.</Typography>
                )
              ) : null}
            </AccordionDetails>
          </Accordion>

          <Accordion expanded={consultationsExpanded} onChange={(e, expanded) => setConsultationsExpanded(expanded)} sx={{ mt: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Consultas relacionadas {viewPatient ? `de ${viewPatient.atr_nombre} ${viewPatient.atr_apellido}` : ''}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {consultationsExpanded ? (
                viewPatient ? (
                  <ConsultationList patientId={viewPatient.atr_id_paciente} />
                ) : (
                  <Typography>Seleccione un paciente para ver las consultas.</Typography>
                )
              ) : null}
            </AccordionDetails>
          </Accordion>
        </Box>

        {/* Diálogo de eliminación */}
        <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
          <DialogTitle>Confirmar Eliminación</DialogTitle>
          <DialogContent>
            <Typography>
              ¿Está seguro de que desea eliminar al paciente{' '}
              <strong>{selected?.atr_nombre} {selected?.atr_apellido}</strong>?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Esta acción no se puede deshacer.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteOpen(false)}>Cancelar</Button>
            <Button onClick={handleDelete} color="error" variant="contained">
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal edición/registro */}
        <ModalForm open={editOpen} onClose={() => { setEditOpen(false); setSelected(null); }} title={selected ? 'Editar Paciente' : 'Registrar Paciente'} maxWidth="md">
          <PatientForm initialData={selected || {}} onSuccess={async () => {
            setEditOpen(false);
            setSelected(null);
            try { await dispatch(fetchPatients()).unwrap(); } catch (e) {}
            setSnackbar({ open: true, msg: 'Paciente guardado', severity: 'success' });
          }} onCancel={() => { setEditOpen(false); setSelected(null); }} />
        </ModalForm>

        {/* Snackbar para notificaciones */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.msg}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
};

export default PatientList;


