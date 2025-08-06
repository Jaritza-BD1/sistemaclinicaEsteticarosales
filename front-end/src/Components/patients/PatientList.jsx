// File: src/Components/patients/PatientList.jsx
import React, { useEffect, useState } from 'react';
import {
  Box, Button, Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TablePagination, Paper, TextField, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, Snackbar, Alert, Tooltip,
  CircularProgress, Chip
} from '@mui/material';
import { Edit, Delete, Visibility, Phone, Email, LocationOn } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import { fetchPatients, deletePatient, clearError } from '../../redux/patients/patientsSlice';

const theme = createTheme({
  palette: {
    primary: { main: '#BA6E8F' },
    secondary: { main: '#D391B0' },
  }
});

const PatientList = () => {
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
    const rows = filtered.map(p => [
      p.atr_nombre, 
      p.atr_apellido, 
      p.atr_numero_expediente, 
      p.atr_identidad,
      p.atr_estado_paciente || 'ACTIVO'
    ]);
    doc.autoTable({ 
      head: [['Nombre', 'Apellido', 'Expediente', 'Identidad', 'Estado']], 
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

  const handleViewPatient = (paciente) => {
    navigate(`/pacientes/detalle/${paciente.atr_id_paciente}`);
  };

  const handleEditPatient = (paciente) => {
    // TODO: Implementar edición de paciente
    console.log('Editar paciente:', paciente);
  };

  const handleDeletePatient = (paciente) => {
    setSelected(paciente);
    setDeleteOpen(true);
  };

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
              startIcon={<TableChartIcon />}
              onClick={handleExportExcel}
              sx={{ minWidth: 120 }}
            >
              Exportar Excel
            </Button>
          </Box>
        </Paper>

        {/* Tabla de pacientes */}
        <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'primary.main' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Nombre</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Expediente</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Identidad</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Estado</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Contacto</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((paciente) => (
                    <TableRow key={paciente.atr_id_paciente} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {paciente.atr_nombre} {paciente.atr_apellido}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {paciente.atr_fecha_nacimiento}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {paciente.atr_numero_expediente}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {paciente.atr_identidad}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={paciente.atr_estado_paciente || 'ACTIVO'}
                          color={getStatusColor(paciente.atr_estado_paciente)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {paciente.telefonos?.length > 0 && (
                            <Tooltip title={`${paciente.telefonos.length} teléfono(s)`}>
                              <Phone />
                            </Tooltip>
                          )}
                          {paciente.correos?.length > 0 && (
                            <Tooltip title={`${paciente.correos.length} correo(s)`}>
                              <Email />
                            </Tooltip>
                          )}
                          {paciente.direcciones?.length > 0 && (
                            <Tooltip title={`${paciente.direcciones.length} dirección(es)`}>
                              <LocationOn />
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Ver detalles">
                            <IconButton
                              size="small"
                              onClick={() => handleViewPatient(paciente)}
                              sx={{ color: 'primary.main' }}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Editar">
                            <IconButton
                              size="small"
                              onClick={() => handleEditPatient(paciente)}
                              sx={{ color: 'primary.main' }}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar">
                            <IconButton
                              size="small"
                              onClick={() => handleDeletePatient(paciente)}
                              sx={{ color: 'error.main' }}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filtered.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage="Filas por página:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          />
        </Paper>

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


