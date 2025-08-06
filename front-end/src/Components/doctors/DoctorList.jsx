import React, { useState } from 'react';
import {
  Container, Paper, Grid, TextField, Select, MenuItem, FormControl, InputLabel, Box, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, IconButton, TablePagination, Fab, Chip, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, InputAdornment
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon, Search as SearchIcon, Visibility as VisibilityIcon, Edit as EditIcon, Delete as DeleteIcon
} from '@mui/icons-material';
import DoctorRegistrationForm from './DoctorRegistrationForm';

// Datos de ejemplo para las especialidades (repetido para simplicidad, idealmente vendría de un contexto o API)
const especialidades = [
  'Cardiología', 'Dermatología', 'Pediatría', 'Medicina General', 'Neurología',
  'Ginecología', 'Oftalmología', 'Ortopedia', 'Urología', 'Psiquiatría'
];

// Componente de la pantalla de lista de médicos
const ListaMedicos = ({ onRegisterNew, onEdit, onViewDetails, doctors: initialDoctors, onDelete }) => {
  const [doctors, setDoctors] = useState(initialDoctors || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEspecialidad, setFilterEspecialidad] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Abrir modal para registrar nuevo médico
  const handleOpenRegisterModal = () => {
    setEditingDoctor(null);
    setFormModalOpen(true);
  };
  // Abrir modal para editar médico
  const handleOpenEditModal = (doctor) => {
    setEditingDoctor(doctor);
    setFormModalOpen(true);
  };
  // Guardar médico (registro o edición)
  const handleSaveDoctor = (doctorData) => {
    if (doctorData.id && doctors.some(d => d.id === doctorData.id)) {
      setDoctors(prev => prev.map(d => (d.id === doctorData.id ? doctorData : d)));
      setSnackbar({ open: true, message: 'Médico actualizado con éxito!', severity: 'success' });
    } else {
      setDoctors(prev => [...prev, { ...doctorData, id: doctorData.id || `DOC${Date.now()}` }]);
      setSnackbar({ open: true, message: 'Médico registrado con éxito!', severity: 'success' });
    }
    setFormModalOpen(false);
    setEditingDoctor(null);
  };
  // Cancelar modal
  const handleCancelForm = () => {
    setFormModalOpen(false);
    setEditingDoctor(null);
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

  return (
    <Container maxWidth="lg" sx={{ py: 8, position: 'relative' }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 6 }}>
          Gestión de Médicos
        </Typography>

        {/* Filtros de Búsqueda */}
        <Box className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <Grid container spacing={3} alignItems="center">
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
                      <IconButton color="secondary" onClick={() => handleOpenEditModal(doctor)}>
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
        sx={{ position: 'fixed', bottom: { xs: 16, sm: 32 }, right: { xs: 16, sm: 32 }, zIndex: 1200 }}
        onClick={handleOpenRegisterModal}
      >
        <PersonAddIcon />
      </Fab>

      {/* Modal de formulario para registrar/editar médico */}
      <Dialog
        open={formModalOpen}
        onClose={handleCancelForm}
        maxWidth="md"
        fullWidth
        aria-labelledby="form-doctor-modal-title"
      >
        <DialogTitle id="form-doctor-modal-title" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
          {editingDoctor ? 'Editar Médico' : 'Registrar Médico'}
        </DialogTitle>
        <DialogContent dividers>
          <DoctorRegistrationForm
            initialData={editingDoctor}
            onSave={handleSaveDoctor}
            onCancel={handleCancelForm}
          />
        </DialogContent>
      </Dialog>

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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ListaMedicos;
