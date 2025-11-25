
// Dentro de TreatmentList.jsx
import React, { useState } from 'react';
import {
  Typography,
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  Paper,
  IconButton,
  Chip,
  Grid,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Tooltip,
  Fab,
  FormControl,
  InputLabel,
  InputAdornment
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Clear as ClearIcon,
  Visibility as ViewIcon,
  MedicalServices as MedicalIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { useTreatment } from '../context/TreatmentContext';

function TreatmentList({ onOpenCreateModal, onOpenPatientDetailModal }) {
  const { treatments, loading, error, deleteTreatment, updateTreatment } = useTreatment();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deletingId, setDeletingId] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editErrors, setEditErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Datos simulados para estadísticas
  const stats = {
    totalTreatments: 45,
    activeTreatments: 32,
    completedTreatments: 8,
    pendingTreatments: 5,
    totalRevenue: 12500.75
  };



  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este tratamiento?')) return;
    setDeletingId(id);
    try {
      await deleteTreatment(id);
      setSnackbar({ open: true, message: 'Tratamiento eliminado', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Error al eliminar', severity: 'error' });
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditOpen = (treatment) => {
    setEditData(treatment);
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setEditOpen(false);
    setEditData(null);
    setEditErrors({});
  };

  const validateEdit = () => {
    const errors = {};
    if (!editData?.name || editData.name.trim() === '') errors.name = 'El nombre es requerido';
    if (!editData?.especialidad || editData.especialidad.trim() === '') errors.especialidad = 'La especialidad es requerida';
    if (!editData?.costo || isNaN(Number(editData.costo)) || Number(editData.costo) <= 0) errors.costo = 'El costo debe ser mayor a 0';
    return errors;
  };

  const handleEditSave = async () => {
    const errors = validateEdit();
    setEditErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setEditLoading(true);
    try {
      await updateTreatment(editData.id || editData._id, editData);
      setSnackbar({ open: true, message: 'Tratamiento actualizado', severity: 'success' });
      handleEditClose();
    } catch (err) {
      setSnackbar({ open: true, message: 'Error al actualizar', severity: 'error' });
    } finally {
      setEditLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterSpecialty('');
    setFilterStatus('');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'activo': return 'success';
      case 'pendiente': return 'warning';
      case 'completado': return 'info';
      case 'cancelado': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'activo': return 'Activo';
      case 'pendiente': return 'Pendiente';
      case 'completado': return 'Completado';
      case 'cancelado': return 'Cancelado';
      default: return 'Activo';
    }
  };

  const filteredTreatments = (treatments || []).filter(treatment => {
    const matchesSearch = treatment.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         treatment.especialidad?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = !filterSpecialty || treatment.especialidad === filterSpecialty;
    const matchesStatus = !filterStatus || treatment.estado === filterStatus;
    
    return matchesSearch && matchesSpecialty && matchesStatus;
  });

  const specialties = [...new Set((treatments || []).map(t => t.especialidad).filter(Boolean))];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ color: 'primary.main', mb: 1 }}>
          <MedicalIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Gestión de Tratamientos
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Administra los tipos de tratamientos disponibles
        </Typography>
      </Box>

      {/* Estadísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            borderRadius: 2,
            backgroundColor: '#FCE4EC',
            border: '1px solid',
            borderColor: 'primary.200'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <MedicalIcon sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h6" sx={{ color: 'primary.main' }}>
                  Total Tratamientos
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                {stats.totalTreatments}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            borderRadius: 2,
            backgroundColor: '#FCE4EC',
            border: '1px solid',
            borderColor: 'primary.200'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon sx={{ color: 'success.main', mr: 1 }} />
                <Typography variant="h6" sx={{ color: 'success.main' }}>
                  Activos
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                {stats.activeTreatments}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            borderRadius: 2,
            backgroundColor: '#FCE4EC',
            border: '1px solid',
            borderColor: 'primary.200'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ScheduleIcon sx={{ color: 'info.main', mr: 1 }} />
                <Typography variant="h6" sx={{ color: 'info.main' }}>
                  Completados
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                {stats.completedTreatments}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            borderRadius: 2,
            backgroundColor: '#FCE4EC',
            border: '1px solid',
            borderColor: 'primary.200'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <MoneyIcon sx={{ color: 'warning.main', mr: 1 }} />
                <Typography variant="h6" sx={{ color: 'warning.main' }}>
                  Ingresos Totales
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                L. {stats.totalRevenue.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filtros */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              placeholder="Buscar tratamientos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: 'primary.300',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.main',
                  },
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Especialidad</InputLabel>
              <Select
                value={filterSpecialty}
                onChange={(e) => setFilterSpecialty(e.target.value)}
                label="Especialidad"
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': {
                    '&:hover': {
                      borderColor: 'primary.300',
                    },
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                  },
                }}
              >
                <MenuItem value="">Todas las especialidades</MenuItem>
                {specialties.map((specialty) => (
                  <MenuItem key={specialty} value={specialty}>
                    {specialty}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={2}>
            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                label="Estado"
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': {
                    '&:hover': {
                      borderColor: 'primary.300',
                    },
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                  },
                }}
              >
                <MenuItem value="">Todos los estados</MenuItem>
                <MenuItem value="activo">Activo</MenuItem>
                <MenuItem value="pendiente">Pendiente</MenuItem>
                <MenuItem value="completado">Completado</MenuItem>
                <MenuItem value="cancelado">Cancelado</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={3}>
            <Box sx={{ display: 'flex', gap: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={handleClearFilters}
                aria-label="Limpiar filtros"
                sx={{
                  borderColor: 'primary.300',
                  color: 'primary.main',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'primary.50',
                  },
                  width: { xs: '100%', sm: 'auto' }
                }}
              >
                Limpiar
              </Button>

              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={onOpenCreateModal}
                aria-label="Agregar Tratamiento"
                sx={{
                  borderRadius: 1,
                  textTransform: 'none',
                  minWidth: 140,
                  height: 40,
                  fontSize: '0.95rem',
                  backgroundColor: '#F8C6D8',
                  color: '#3a1f2b',
                  '&:hover': {
                    backgroundColor: '#F3B6CB',
                    transform: 'translateY(-1px)'
                  },
                  boxShadow: '0 6px 20px rgba(120,90,110,0.12)',
                  width: { xs: '100%', sm: 'auto' }
                }}
              >
                Agregar Tratamiento
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabla de Tratamientos */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'primary.50' }}>
                <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  Tratamiento
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  Especialidad
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  Costo
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  Duración
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  Estado
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary">
                      Cargando tratamientos...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="error">
                      {typeof error === 'string' ? error : 'Error desconocido'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredTreatments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No hay tratamientos registrados.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTreatments
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((treatment) => (
                    <TableRow key={treatment.id || treatment._id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>
                            {treatment.name}
                          </Typography>
                          {treatment.description && (
                            <Typography variant="caption" color="text.secondary">
                              {treatment.description}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={treatment.especialidad || 'Sin especialidad'} 
                          size="small" 
                          sx={{ 
                            backgroundColor: 'primary.100', 
                            color: 'primary.main',
                            fontWeight: 'medium'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {treatment.costo ? `L. ${treatment.costo.toFixed(2)}` : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {treatment.duracion ? `${treatment.duracion} min` : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={getStatusText(treatment.estado)}
                          color={getStatusColor(treatment.estado)}
                          size="small"
                          sx={{ fontWeight: 'medium' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="Ver detalles">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => onOpenPatientDetailModal && onOpenPatientDetailModal(treatment)}
                              sx={{
                                '&:hover': {
                                  backgroundColor: 'primary.50',
                                  transform: 'scale(1.1)',
                                },
                                transition: 'all 0.2s ease-in-out'
                              }}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Editar tratamiento">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => handleEditOpen(treatment)}
                              sx={{
                                '&:hover': {
                                  backgroundColor: 'primary.50',
                                  transform: 'scale(1.1)',
                                },
                                transition: 'all 0.2s ease-in-out'
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar tratamiento">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleDelete(treatment.id || treatment._id)}
                              disabled={deletingId === (treatment.id || treatment._id)}
                              sx={{
                                '&:hover': {
                                  backgroundColor: 'error.50',
                                  transform: 'scale(1.1)',
                                },
                                transition: 'all 0.2s ease-in-out'
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredTreatments.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* (Add button moved into filters row) */}

      {/* Modal de Edición */}
      <Dialog 
        open={editOpen} 
        onClose={handleEditClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            backgroundColor: 'background.paper',
            color: 'accent.main',
            border: '1px solid',
            borderColor: 'brand.paleL2'
          }
        }}
      >
        <DialogTitle sx={{ 
          color: 'primary.main',
          borderBottom: '1px solid',
          borderColor: 'primary.200'
        }}>
          Editar Tratamiento
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre del Tratamiento"
                value={editData?.name || ''}
                onChange={e => setEditData({ ...editData, name: e.target.value })}
                error={!!editErrors.name}
                helperText={editErrors.name}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'primary.300',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Especialidad"
                value={editData?.especialidad || ''}
                onChange={e => setEditData({ ...editData, especialidad: e.target.value })}
                error={!!editErrors.especialidad}
                helperText={editErrors.especialidad}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'primary.300',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                multiline
                rows={3}
                value={editData?.description || ''}
                onChange={e => setEditData({ ...editData, description: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'primary.300',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Costo"
                type="number"
                value={editData?.costo || ''}
                onChange={e => setEditData({ ...editData, costo: e.target.value })}
                error={!!editErrors.costo}
                helperText={editErrors.costo}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'primary.300',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Duración (minutos)"
                type="number"
                value={editData?.duracion || ''}
                onChange={e => setEditData({ ...editData, duracion: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'primary.300',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
          <DialogActions sx={{ 
          p: 3, 
          pt: 1,
          borderTop: '1px solid',
          borderColor: 'brand.paleL2',
          backgroundColor: 'background.paper',
          color: 'accent.main'
        }}>
          <Button
            onClick={handleEditClose}
            variant="outlined"
            disabled={editLoading}
            sx={{
              borderColor: 'primary.300',
              color: 'primary.main',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'primary.50',
              },
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleEditSave}
            variant="contained"
            disabled={editLoading}
            sx={{
              backgroundColor: 'brand.pale',
              color: 'accent.main',
              '&:hover': {
                backgroundColor: 'brand.paleDark',
                transform: 'translateY(-1px)',
              },
              boxShadow: '0 4px 14px 0 rgba(33,40,69,0.06)',
            }}
          >
            {editLoading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default TreatmentList;

