import React, { useState, useEffect } from 'react';
import {
  AppBar, Toolbar, Typography, Button, Container, Paper, Grid, TextField, Select, MenuItem,
  FormControl, InputLabel, Box, TableContainer, Table,TableHead, TableRow, TableCell, TableBody, IconButton, TablePagination, Fab, Chip, Snackbar, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, Divider, InputAdornment, Menu
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  PersonAdd as PersonAddIcon, Save as SaveIcon, Clear as ClearIcon, MedicalServices as MedicalServicesIcon,
  Search as SearchIcon, Visibility as VisibilityIcon, Edit as EditIcon, Delete as DeleteIcon,
  Phone as PhoneIcon, Email as EmailIcon, Home as HomeIcon,
  Schedule as ScheduleIcon, CalendarMonth as CalendarMonthIcon, Description as DescriptionIcon,
  PictureAsPdf as PictureAsPdfIcon, TableChart as TableChartIcon
} from '@mui/icons-material';

// NOTA: jsPDF, jspdf-autotable y xlsx se asumen disponibles globalmente a través de CDN.
// Eliminar importaciones locales para evitar errores de "Could not resolve".

// Definición del tema personalizado con los colores especificados
const theme = createTheme({
  palette: {
    primary: {
      main: '#BA6E8F', // Color principal
    },
    secondary: {
      main: '#D391B0', // Color secundario
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Bordes redondeados para botones
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12, // Bordes redondeados para Paper
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Bordes redondeados para TextField
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Bordes redondeados para Select
        },
      },
    },
  },
});

// Datos de ejemplo para las especialidades
const especialidades = [
 'Estetica', 'Podologia'
];

// Generador de IDs simples para médicos
let nextDoctorId = 1;
const generateDoctorId = () => `MED-${String(nextDoctorId++).padStart(4, '0')}`;

// Componente de la pantalla de registro de médico
const RegistrarMedico = ({ onSave, onCancel, generateDoctorId }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    identidad: '',
    fechaNacimiento: '',
    genero: '',
    colegiado: '',
    especialidad: [],
    telefono: '',
    correo: '',
    direccion: '',
    horarios: [],
    estado: 'Activo', // Estado por defecto
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Maneja los cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Maneja los cambios en las especialidades (Select múltiple)
  const handleEspecialidadChange = (e) => {
    setFormData({ ...formData, especialidad: e.target.value });
  };

  // Maneja el guardado del médico
  const handleSave = () => {
    if (!formData.nombre || !formData.apellido || !formData.colegiado || formData.especialidad.length === 0) {
      setSnackbarMessage('Por favor, complete los campos obligatorios.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    const newDoctor = { ...formData, id: generateDoctorId() };
    onSave(newDoctor);
    setSnackbarMessage('Médico registrado exitosamente.');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    handleClear(); // Limpiar formulario después de guardar
  };

  // Limpia el formulario
  const handleClear = () => {
    setFormData({
      nombre: '',
      apellido: '',
      identidad: '',
      fechaNacimiento: '',
      genero: '',
      colegiado: '',
      especialidad: [],
      telefono: '',
      correo: '',
      direccion: '',
      horarios: [],
      estado: 'Activo',
    });
  };

  // Cierra el Snackbar
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container maxWidth="lg" className="py-8">
      <Paper elevation={3} className="p-6 md:p-8">
        <Typography variant="h4" component="h1" gutterBottom className="text-center font-bold text-primary-main mb-6">
          Registrar Nuevo Médico
        </Typography>
        <Grid container spacing={4}>
          {/* Sección de Datos Personales y Profesionales */}
          <Grid item xs={12}>
            <Typography variant="h6" className="mb-4 text-secondary-main">Datos Personales y Profesionales</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  label="Nombre(s)"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  fullWidth
                  required
                  variant="outlined"
                  className="rounded-lg"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  label="Apellido(s)"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  fullWidth
                  required
                  variant="outlined"
                  className="rounded-lg"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  label="Número de Identidad"
                  name="identidad"
                  value={formData.identidad}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  className="rounded-lg"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  label="Fecha de Nacimiento"
                  name="fechaNacimiento"
                  type="date"
                  value={formData.fechaNacimiento}
                  onChange={handleChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  className="rounded-lg"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth variant="outlined" className="rounded-lg">
                  <InputLabel>Género</InputLabel>
                  <Select
                    name="genero"
                    value={formData.genero}
                    onChange={handleChange}
                    label="Género"
                  >
                    <MenuItem value=""><em>Ninguno</em></MenuItem>
                    <MenuItem value="Masculino">Masculino</MenuItem>
                    <MenuItem value="Femenino">Femenino</MenuItem>
                    <MenuItem value="Otro">Otro</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  label="Número de Colegiado"
                  name="colegiado"
                  value={formData.colegiado}
                  onChange={handleChange}
                  fullWidth
                  required
                  variant="outlined"
                  className="rounded-lg"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth variant="outlined" className="rounded-lg">
                  <InputLabel>Especialidad(es)</InputLabel>
                  <Select
                    name="especialidad"
                    multiple
                    value={formData.especialidad}
                    onChange={handleEspecialidadChange}
                    label="Especialidad(es)"
                    renderValue={(selected) => selected.join(', ')}
                    required
                  >
                    {especialidades.map((esp) => (
                      <MenuItem key={esp} value={esp}>
                        {esp}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  label="Número de Teléfono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  className="rounded-lg"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  label="Correo Electrónico"
                  name="correo"
                  type="email"
                  value={formData.correo}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  className="rounded-lg"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Dirección de Residencia"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={2}
                  variant="outlined"
                  className="rounded-lg"
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Sección de Horarios de Atención (Simplificado para el diseño) */}
          <Grid item xs={12}>
            <Typography variant="h6" className="mb-4 text-secondary-main">Horarios de Atención (Opcional)</Typography>
            <Paper variant="outlined" className="p-4">
              <Typography variant="body2" color="textSecondary">
                Aquí se podría implementar una tabla o campos para configurar horarios por día.
                Por ejemplo: Lunes de 8:00 AM a 5:00 PM.
              </Typography>
            </Paper>
          </Grid>

          {/* Botones de Acción */}
          <Grid item xs={12} className="flex justify-end gap-4 mt-6">
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<ClearIcon />}
              onClick={handleClear}
              className="px-6 py-2"
            >
              Limpiar Formulario
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              className="px-6 py-2"
            >
              Guardar Médico
            </Button>
          </Grid>
        </Grid>
      </Paper>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

// Componente del modal de Ver Detalles del Médico
const VerDetallesMedicoModal = ({ open, onClose, doctor }) => {
  if (!doctor) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle className="bg-primary-main text-white flex items-center justify-between">
        <Typography variant="h6" className="font-bold">Detalles del Médico: {doctor.nombre} {doctor.apellido}</Typography>
        <IconButton onClick={onClose} className="text-white">
          <ClearIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers className="p-6">
        <Grid container spacing={4}>
          {/* Datos Personales */}
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" className="p-4 h-full flex flex-col justify-between">
              <Typography variant="h6" className="mb-3 text-secondary-main flex items-center gap-2">
                <PersonAddIcon /> Datos Personales
              </Typography>
              <Divider className="mb-3" />
              <Typography variant="body1" className="mb-2"><strong>Nombre Completo:</strong> {doctor.nombre} {doctor.apellido}</Typography>
              <Typography variant="body1" className="mb-2"><strong>Número de Identidad:</strong> {doctor.identidad || 'N/A'}</Typography>
              <Typography variant="body1" className="mb-2"><strong>Fecha de Nacimiento:</strong> {doctor.fechaNacimiento || 'N/A'}</Typography>
              <Typography variant="body1" className="mb-2"><strong>Género:</strong> {doctor.genero || 'N/A'}</Typography>
              <Typography variant="body1" className="mb-2 flex items-center gap-2"><PhoneIcon fontSize="small" /> <strong>Teléfono:</strong> {doctor.telefono || 'N/A'}</Typography>
              <Typography variant="body1" className="mb-2 flex items-center gap-2"><EmailIcon fontSize="small" /> <strong>Correo:</strong> {doctor.correo || 'N/A'}</Typography>
              <Typography variant="body1" className="flex items-center gap-2"><HomeIcon fontSize="small" /> <strong>Dirección:</strong> {doctor.direccion || 'N/A'}</Typography>
            </Paper>
          </Grid>

          {/* Datos Profesionales y Horarios */}
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" className="p-4 h-full flex flex-col justify-between">
              <Typography variant="h6" className="mb-3 text-secondary-main flex items-center gap-2">
                <MedicalServicesIcon /> Datos Profesionales
              </Typography>
              <Divider className="mb-3" />
              <Typography variant="body1" className="mb-2"><strong>Número de Colegiado:</strong> {doctor.colegiado}</Typography>
              <Typography variant="body1" className="mb-2"><strong>Especialidad(es):</strong> {doctor.especialidad.join(', ')}</Typography>
              <Typography variant="body1" className="mb-2"><strong>Estado:</strong> <Chip label={doctor.estado} color={doctor.estado === 'Activo' ? 'success' : 'error'} size="small" /></Typography>

              <Typography variant="h6" className="mt-4 mb-3 text-secondary-main flex items-center gap-2">
                <ScheduleIcon /> Horarios de Atención
              </Typography>
              <Divider className="mb-3" />
              {doctor.horarios && doctor.horarios.length > 0 ? (
                <ul className="list-disc pl-5">
                  {doctor.horarios.map((horario, index) => (
                    <li key={index}>{horario}</li>
                  ))}
                </ul>
              ) : (
                <Typography variant="body2" color="textSecondary">No hay horarios configurados.</Typography>
              )}
            </Paper>
          </Grid>

          {/* Historial de Citas (Simulado) */}
          <Grid item xs={12}>
            <Paper variant="outlined" className="p-4">
              <Typography variant="h6" className="mb-3 text-secondary-main flex items-center gap-2">
                <CalendarMonthIcon /> Historial de Citas (Resumido)
              </Typography>
              <Divider className="mb-3" />
              <Typography variant="body2" color="textSecondary">
                Aquí se mostraría un resumen de las últimas citas atendidas o estadísticas.
                Ej: Última cita: 15/07/2025 con Juan Pérez. Pacientes atendidos este mes: 25.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions className="p-4 flex justify-end gap-3">
        <Button onClick={onClose} variant="outlined" color="secondary">
          Cerrar
        </Button>
        {/* Podrías añadir un botón de editar aquí si el modal de edición es separado */}
      </DialogActions>
    </Dialog>
  );
};

// Componente del modal de Editar Médico
const EditarMedicoModal = ({ open, onClose, doctor, onUpdate }) => {
  const [formData, setFormData] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Carga los datos del médico cuando el modal se abre o el médico cambia
  useEffect(() => {
    if (doctor) {
      setFormData({ ...doctor });
    }
  }, [doctor]);

  // Maneja los cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Maneja los cambios en las especialidades (Select múltiple)
  const handleEspecialidadChange = (e) => {
    setFormData({ ...formData, especialidad: e.target.value });
  };

  // Maneja la actualización del médico
  const handleUpdate = () => {
    if (!formData.nombre || !formData.apellido || !formData.colegiado || formData.especialidad.length === 0) {
      setSnackbarMessage('Por favor, complete los campos obligatorios.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    onUpdate(formData);
    setSnackbarMessage('Médico actualizado exitosamente.');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    onClose(); // Cerrar modal después de actualizar
  };

  // Cierra el Snackbar
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  if (!doctor) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle className="bg-secondary-main text-white flex items-center justify-between">
        <Typography variant="h6" className="font-bold">Editar Información del Médico</Typography>
        <IconButton onClick={onClose} className="text-white">
          <ClearIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers className="p-6">
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Nombre(s)"
              name="nombre"
              value={formData.nombre || ''}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
              className="rounded-lg"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Apellido(s)"
              name="apellido"
              value={formData.apellido || ''}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
              className="rounded-lg"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Número de Identidad"
              name="identidad"
              value={formData.identidad || ''}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              className="rounded-lg"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Fecha de Nacimiento"
              name="fechaNacimiento"
              type="date"
              value={formData.fechaNacimiento || ''}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
              variant="outlined"
              className="rounded-lg"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth variant="outlined" className="rounded-lg">
              <InputLabel>Género</InputLabel>
              <Select
                name="genero"
                value={formData.genero || ''}
                onChange={handleChange}
                label="Género"
              >
                <MenuItem value=""><em>Ninguno</em></MenuItem>
                <MenuItem value="Masculino">Masculino</MenuItem>
                <MenuItem value="Femenino">Femenino</MenuItem>
                <MenuItem value="Otro">Otro</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Número de Colegiado"
              name="colegiado"
              value={formData.colegiado || ''}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
              className="rounded-lg"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth variant="outlined" className="rounded-lg">
              <InputLabel>Especialidad(es)</InputLabel>
              <Select
                name="especialidad"
                multiple
                value={formData.especialidad || []}
                onChange={handleEspecialidadChange}
                label="Especialidad(es)"
                renderValue={(selected) => selected.join(', ')}
                required
              >
                {especialidades.map((esp) => (
                  <MenuItem key={esp} value={esp}>
                    {esp}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Número de Teléfono"
              name="telefono"
              value={formData.telefono || ''}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              className="rounded-lg"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Correo Electrónico"
              name="correo"
              type="email"
              value={formData.correo || ''}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              className="rounded-lg"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Dirección de Residencia"
              name="direccion"
              value={formData.direccion || ''}
              onChange={handleChange}
              fullWidth
              multiline
              rows={2}
              variant="outlined"
              className="rounded-lg"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth variant="outlined" className="rounded-lg">
              <InputLabel>Estado</InputLabel>
              <Select
                name="estado"
                value={formData.estado || 'Activo'}
                onChange={handleChange}
                label="Estado"
              >
                <MenuItem value="Activo">Activo</MenuItem>
                <MenuItem value="Inactivo">Inactivo</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions className="p-4 flex justify-end gap-3">
        <Button onClick={onClose} variant="outlined" color="secondary">
          Cancelar
        </Button>
        <Button onClick={handleUpdate} variant="contained" color="primary" startIcon={<SaveIcon />}>
          Guardar Cambios
        </Button>
      </DialogActions>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

// Componente de la pantalla de lista de médicos
const ListaMedicos = ({ onRegisterNew, onEdit, onViewDetails, doctors, onDelete, selectedDoctor, viewDetailsModalOpen, setViewDetailsModalOpen, editModalOpen, setEditModalOpen, onUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEspecialidad, setFilterEspecialidad] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState(null);

  // Estado para el menú de reportes
  const [anchorEl, setAnchorEl] = useState(null);
  const openReportsMenu = Boolean(anchorEl);

  // Maneja la apertura del menú de reportes
  const handleReportsMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Maneja el cierre del menú de reportes
  const handleReportsMenuClose = () => {
    setAnchorEl(null);
  };

  // Filtra los médicos basándose en el término de búsqueda y la especialidad
  const filteredDoctors = (doctors || []).filter(doctor => {
    const matchesSearch = searchTerm === '' ||
      doctor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.especialidad.some(esp => esp.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesEspecialidad = filterEspecialidad === '' ||
      doctor.especialidad.includes(filterEspecialidad);

    return matchesSearch && matchesEspecialidad;
  });

  // Paginación
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Abre el diálogo de confirmación de eliminación
  const confirmDelete = (doctor) => {
    setDoctorToDelete(doctor);
    setOpenDeleteConfirm(true);
  };

  // Ejecuta la eliminación y cierra el diálogo
  const handleDeleteConfirmed = () => {
    onDelete(doctorToDelete.id);
    setOpenDeleteConfirm(false);
    setDoctorToDelete(null);
  };

  // Función para exportar a PDF
  const handlePDFExport = () => {
    // Asegúrate de que jsPDF y jspdf-autotable estén cargados globalmente
    if (typeof window.jsPDF === 'undefined' || typeof window.jsPDF.autoTable === 'undefined') {
      console.error('jsPDF o jspdf-autotable no están disponibles. Asegúrate de que las librerías estén cargadas.');
      return;
    }
    const doc = new window.jsPDF.jsPDF();
    doc.text("Reporte de Médicos", 14, 16);

    const tableColumn = ["ID / Colegiado", "Nombre Completo", "Especialidad", "Teléfono", "Correo Electrónico", "Estado"];
    const tableRows = [];

    filteredDoctors.forEach(doctor => {
      const doctorData = [
        doctor.colegiado,
        `${doctor.nombre} ${doctor.apellido}`,
        doctor.especialidad.join(', '),
        doctor.telefono,
        doctor.correo,
        doctor.estado
      ];
      tableRows.push(doctorData);
    });

    // Usa autoTable directamente desde el objeto doc si está adjunto
    if (doc.autoTable) {
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 20
      });
    } else {
      console.error('autoTable no está disponible en el objeto jsPDF. Asegúrate de que jspdf-autotable esté correctamente cargado.');
      return;
    }

    doc.save('reporte_medicos.pdf');
    handleReportsMenuClose();
  };

  // Función para exportar a Excel
  const handleExcelExport = () => {
    // Asegúrate de que XLSX esté cargado globalmente
    if (typeof window.XLSX === 'undefined') {
      console.error('XLSX no está disponible. Asegúrate de que la librería esté cargada.');
      return;
    }
    const data = filteredDoctors.map(doctor => ({
      'ID / Colegiado': doctor.colegiado,
      'Nombre Completo': `${doctor.nombre} ${doctor.apellido}`,
      'Especialidad': doctor.especialidad.join(', '),
      'Teléfono': doctor.telefono,
      'Correo Electrónico': doctor.correo,
      'Estado': doctor.estado
    }));

    const ws = window.XLSX.utils.json_to_sheet(data);
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, "Médicos");
    window.XLSX.writeFile(wb, "reporte_medicos.xlsx");
    handleReportsMenuClose();
  };


  return (
    <Container maxWidth="lg" className="py-8 relative">
      <Paper elevation={3} className="p-6 md:p-8">
        <Typography variant="h4" component="h1" gutterBottom className="text-center font-bold text-primary-main mb-6">
          Gestión de Médicos
        </Typography>

        {/* Filtros de Búsqueda y Botón de Reportes */}
        <Box className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <Grid container spacing={3} alignItems="center" className="flex-grow">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Buscar por Nombre, Apellido o Especialidad"
                variant="outlined"
                fullWidth
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                className="rounded-lg"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth variant="outlined" className="rounded-lg">
                <InputLabel>Filtrar por Especialidad</InputLabel>
                <Select
                  value={filterEspecialidad}
                  onChange={(e) => setFilterEspecialidad(e.target.value)}
                  label="Filtrar por Especialidad"
                >
                  <MenuItem value=""><em>Todas</em></MenuItem>
                  {especialidades.map((esp) => (
                    <MenuItem key={esp} value={esp}>
                      {esp}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4} className="flex justify-end gap-3">
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => { setSearchTerm(''); setFilterEspecialidad(''); }}
                className="px-6 py-2"
              >
                Limpiar Filtros
              </Button>
            </Grid>
          </Grid>
          <Button
            variant="contained"
            color="primary"
            startIcon={<DescriptionIcon />}
            onClick={handleReportsMenuClick}
            className="px-6 py-2 mt-4 sm:mt-0"
            aria-controls={openReportsMenu ? 'reports-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={openReportsMenu ? 'true' : undefined}
          >
            Reportes
          </Button>
          <Menu
            id="reports-menu"
            anchorEl={anchorEl}
            open={openReportsMenu}
            onClose={handleReportsMenuClose}
            MenuListProps={{
              'aria-labelledby': 'reports-button',
            }}
          >
            <MenuItem onClick={handlePDFExport}>
              <PictureAsPdfIcon className="mr-2" /> Descargar PDF
            </MenuItem>
            <MenuItem onClick={handleExcelExport}>
              <TableChartIcon className="mr-2" /> Exportar a Excel
            </MenuItem>
          </Menu>
        </Box>

        {/* Tabla de Médicos */}
        <TableContainer component={Paper} elevation={2} className="mt-8 rounded-lg overflow-x-auto">
          <Table aria-label="tabla de médicos">
            <TableHead className="bg-primary-main">
              <TableRow>
                <TableCell className="text-white font-semibold">ID / Colegiado</TableCell>
                <TableCell className="text-white font-semibold">Nombre Completo</TableCell>
                <TableCell className="text-white font-semibold">Especialidad</TableCell>
                <TableCell className="text-white font-semibold">Teléfono</TableCell>
                <TableCell className="text-white font-semibold">Correo Electrónico</TableCell>
                <TableCell className="text-white font-semibold">Estado</TableCell>
                <TableCell align="center" className="text-white font-semibold">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDoctors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" className="py-8 text-gray-500">
                    No se encontraron médicos.
                  </TableCell>
                </TableRow>
              ) : (
                filteredDoctors.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((doctor) => (
                  <TableRow key={doctor.id} className="hover:bg-gray-50">
                    <TableCell>{doctor.colegiado}</TableCell>
                    <TableCell>{doctor.nombre} {doctor.apellido}</TableCell>
                    <TableCell>{doctor.especialidad.join(', ')}</TableCell>
                    <TableCell>{doctor.telefono}</TableCell>
                    <TableCell>{doctor.correo}</TableCell>
                    <TableCell>
                      <Chip
                        label={doctor.estado}
                        color={doctor.estado === 'Activo' ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton color="primary" onClick={() => onViewDetails(doctor)}>
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton color="secondary" onClick={() => onEdit(doctor)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => confirmDelete(doctor)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredDoctors.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Filas por página:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`}
          />
        </TableContainer>
      </Paper>

      {/* Botón Flotante para Registrar Nuevo Médico */}
      <Fab
        color="primary"
        aria-label="add"
        className="fixed bottom-8 right-8"
        onClick={onRegisterNew}
      >
        <PersonAddIcon />
      </Fab>

      {/* Modal de Ver Detalles del Médico */}
      <VerDetallesMedicoModal
        open={viewDetailsModalOpen}
        onClose={() => setViewDetailsModalOpen(false)}
        doctor={selectedDoctor}
      />

      {/* Modal de Editar Médico */}
      <EditarMedicoModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        doctor={selectedDoctor}
        onUpdate={onUpdate}
      />

      {/* Modal de Confirmación de Eliminación */}
      <Dialog
        open={openDeleteConfirm}
        onClose={() => setOpenDeleteConfirm(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" className="text-red-600">{"Confirmar Eliminación"}</DialogTitle>
        <DialogContent>
          <Typography id="alert-dialog-description">
            ¿Está seguro de que desea eliminar a {doctorToDelete?.nombre} {doctorToDelete?.apellido}? Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteConfirm(false)} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleDeleteConfirmed} color="error" autoFocus variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

// Componente principal de la aplicación
const App = () => {
  const [currentScreen, setCurrentScreen] = useState('list'); // 'list' o 'register'
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [viewDetailsModalOpen, setViewDetailsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Cargar algunos médicos de prueba al inicio
  useEffect(() => {
    setDoctors([
      {
        id: generateDoctorId(),
        nombre: 'Ana',
        apellido: 'García',
        identidad: '0801-1985-00123',
        fechaNacimiento: '1985-05-10',
        genero: 'Femenino',
        colegiado: 'C-12345',
        especialidad: ['Cardiología'],
        telefono: '9876-5432',
        correo: 'ana.garcia@example.com',
        direccion: 'Col. Palmira, Casa #123',
        horarios: ['Lunes, Miércoles, Viernes: 8 AM - 4 PM'],
        estado: 'Activo',
      },
      {
        id: generateDoctorId(),
        nombre: 'Juan',
        apellido: 'Pérez',
        identidad: '0801-1978-00456',
        fechaNacimiento: '1978-11-20',
        genero: 'Masculino',
        colegiado: 'C-67890',
        especialidad: ['Pediatría', 'Medicina General'],
        telefono: '8765-4321',
        correo: 'juan.perez@example.com',
        direccion: 'Barrio El Centro, Edificio 5, Apt 101',
        horarios: ['Martes, Jueves: 9 AM - 6 PM'],
        estado: 'Activo',
      },
      {
        id: generateDoctorId(),
        nombre: 'María',
        apellido: 'Rodríguez',
        identidad: '0801-1990-00789',
        fechaNacimiento: '1990-03-25',
        genero: 'Femenino',
        colegiado: 'C-11223',
        especialidad: ['Dermatología'],
        telefono: '3456-7890',
        correo: 'maria.rodriguez@example.com',
        direccion: 'Res. Las Lomas, Bloque A, Casa 5',
        horarios: [],
        estado: 'Inactivo',
      },
    ]);
  }, []);

  // Maneja el guardado de un nuevo médico
  const handleSaveDoctor = (newDoctor) => {
    setDoctors([...doctors, newDoctor]);
    setCurrentScreen('list'); // Volver a la lista después de guardar
  };

  // Maneja la actualización de un médico existente
  const handleUpdateDoctor = (updatedDoctor) => {
    setDoctors(doctors.map(doc => (doc.id === updatedDoctor.id ? updatedDoctor : doc)));
    setSelectedDoctor(null); // Limpiar el médico seleccionado
  };

  // Maneja la eliminación de un médico
  const handleDeleteDoctor = (id) => {
    setDoctors(doctors.filter(doc => doc.id !== id));
  };

  // Handlers para abrir modales y setear el médico seleccionado
  const handleViewDetails = (doctor) => {
    setSelectedDoctor(doctor);
    setViewDetailsModalOpen(true);
  };

  const handleEditDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setEditModalOpen(true);
  };

  // Renderiza la pantalla actual
  const renderScreen = () => {
    switch (currentScreen) {
      case 'register':
        return <RegistrarMedico onSave={handleSaveDoctor} onCancel={() => setCurrentScreen('list')} generateDoctorId={generateDoctorId} />;
      case 'list':
      default:
        return (
          <ListaMedicos
            onRegisterNew={() => setCurrentScreen('register')}
            onEdit={handleEditDoctor} // Pasa el handler de edición
            onViewDetails={handleViewDetails} // Pasa el handler de vista de detalles
            doctors={doctors}
            onDelete={handleDeleteDoctor}
            selectedDoctor={selectedDoctor} // Pasa el médico seleccionado
            viewDetailsModalOpen={viewDetailsModalOpen}
            setViewDetailsModalOpen={setViewDetailsModalOpen}
            editModalOpen={editModalOpen}
            setEditModalOpen={setEditModalOpen}
            onUpdate={handleUpdateDoctor} // Pasa el handler de actualización
          />
        );
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="min-h-screen bg-gray-100 font-inter">
        {/* Barra de Navegación Superior */}
        <AppBar position="static" className="bg-primary-main shadow-md">
          <Toolbar className="container mx-auto flex justify-between items-center py-3">
            <Typography variant="h5" className="font-bold text-white flex items-center gap-2">
              <MedicalServicesIcon fontSize="large" /> Módulo de Médicos
            </Typography>
            <div>
              <Button color="inherit" onClick={() => setCurrentScreen('list')} className="mx-2 text-white hover:bg-primary-dark rounded-lg px-4 py-2">
                <MedicalServicesIcon className="mr-2" /> Gestión de Médicos
              </Button>
              <Button color="inherit" onClick={() => setCurrentScreen('register')} className="mx-2 text-white hover:bg-primary-dark rounded-lg px-4 py-2">
                <PersonAddIcon className="mr-2" /> Registrar Médico
              </Button>
            </div>
          </Toolbar>
        </AppBar>

        {/* Contenido principal de la aplicación */}
        {renderScreen()}
      </div>
    </ThemeProvider>
  );
};

export default App;
