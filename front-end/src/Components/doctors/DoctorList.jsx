import React, { useEffect, useState } from 'react';
import './doctor-list.css';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDoctors as fetchDoctorsThunk, deleteDoctor as deleteDoctorThunk } from '../../redux/doctors/doctorsSlice';
import { useNotifications } from '../../context/NotificationsContext';
import ConfirmDialog from '../common/ConfirmDialog';
import {
  Box,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  TextField,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Typography,
  TableFooter,
  TablePagination,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function DoctorList({ onEdit, onViewDetails, onRegisterNew, refresh }) {
  const dispatch = useDispatch();
  const { notify } = useNotifications();
  const doctors = useSelector(state => state.doctors.items || []);
  const status = useSelector(state => state.doctors.status);
  const error = useSelector(state => state.doctors.error);
  const total = useSelector(state => state.doctors.total ?? 0);
  const [confirmShow, setConfirmShow] = useState(false);
  const [targetDeleteId, setTargetDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortField, setSortField] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Debounce search input to avoid excessive requests
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    // Fetch server-side with current filters/sort/pagination
    const params = {
      page,
      pageSize,
      q: debouncedSearch,
      sortField,
      sortDir
    };
    dispatch(fetchDoctorsThunk(params));
  }, [dispatch, refresh, page, pageSize, debouncedSearch, sortField, sortDir]);

  const handleDeleteClick = (id) => {
    if (!id) return;
    setTargetDeleteId(id);
    setConfirmShow(true);
  };

  const handleConfirmDelete = async () => {
    if (!targetDeleteId) return;
    setDeleting(true);
    try {
      await dispatch(deleteDoctorThunk(targetDeleteId)).unwrap();
      notify({ message: 'Médico eliminado correctamente', severity: 'success' });
      setConfirmShow(false);
      setTargetDeleteId(null);
      // Re-fetch current page from server to ensure consistent data
      dispatch(fetchDoctorsThunk({ page, pageSize, q: debouncedSearch, sortField, sortDir }));
    } catch (err) {
      notify({ message: err?.message || 'Error al eliminar médico', severity: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setConfirmShow(false);
    setTargetDeleteId(null);
  };

  // Reset page when pageSize or sort changes
  useEffect(() => {
    setPage(1);
  }, [pageSize, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil((total || 0) / pageSize));

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const loading = status === 'loading';

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
        <TextField
          label="Buscar"
          placeholder="Nombre, apellido, identidad o especialidad"
          value={search}
          onChange={e => setSearch(e.target.value)}
          size="small"
          sx={{ flex: 1 }}
        />

        <Select value={pageSize} onChange={e => setPageSize(parseInt(e.target.value, 10))} size="small">
          <MenuItem value={5}>5 por página</MenuItem>
          <MenuItem value={10}>10 por página</MenuItem>
          <MenuItem value={25}>25 por página</MenuItem>
          <MenuItem value={50}>50 por página</MenuItem>
        </Select>

        <Button variant="contained" color="success" onClick={() => onRegisterNew && onRegisterNew()}>+ Nuevo Médico</Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ my: 2 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      ) : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell onClick={() => toggleSort('atr_id_medico')} sx={{ cursor: 'pointer' }}># {sortField === 'atr_id_medico' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</TableCell>
                  <TableCell onClick={() => toggleSort('atr_nombre')} sx={{ cursor: 'pointer' }}>Nombre {sortField === 'atr_nombre' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</TableCell>
                  <TableCell onClick={() => toggleSort('atr_apellido')} sx={{ cursor: 'pointer' }}>Apellido {sortField === 'atr_apellido' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</TableCell>
                  <TableCell onClick={() => toggleSort('atr_identidad')} sx={{ cursor: 'pointer' }}>Identidad {sortField === 'atr_identidad' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</TableCell>
                  <TableCell onClick={() => toggleSort('atr_numero_colegiado')} sx={{ cursor: 'pointer' }}>N° Colegiado {sortField === 'atr_numero_colegiado' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</TableCell>
                  <TableCell>Especialidades</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {doctors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">No hay médicos registrados</TableCell>
                  </TableRow>
                ) : (
                  doctors.map((d, idx) => (
                    <TableRow key={d.atr_id_medico ?? d.id ?? idx} hover>
                      <TableCell>{d.atr_id_medico ?? d.id ?? ((page - 1) * pageSize + idx + 1)}</TableCell>
                      <TableCell>{d.atr_nombre ?? d.nombre ?? ''}</TableCell>
                      <TableCell>{d.atr_apellido ?? d.apellido ?? ''}</TableCell>
                      <TableCell>{d.atr_identidad ?? d.identidad ?? ''}</TableCell>
                      <TableCell>{d.atr_numero_colegiado ?? d.numero_colegiado ?? ''}</TableCell>
                      <TableCell>{(d.Especialidades || d.especialidades || []).map(e => e.atr_especialidad || e.nombre || e.atr_nombre).filter(Boolean).join(', ')}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Ver">
                            <IconButton size="small" color="primary" onClick={() => onViewDetails && onViewDetails(d)} aria-label={`ver-${d.atr_id_medico ?? d.id ?? idx}`}>
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Editar">
                            <IconButton size="small" color="warning" onClick={() => onEdit && onEdit(d)} aria-label={`editar-${d.atr_id_medico ?? d.id ?? idx}`}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar">
                            <IconButton size="small" color="error" onClick={() => handleDeleteClick(d.atr_id_medico ?? d.id)} aria-label={`eliminar-${d.atr_id_medico ?? d.id ?? idx}`}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[5,10,25,50]}
                    count={total || 0}
                    rowsPerPage={pageSize}
                    page={Math.max(0, page - 1)}
                    onPageChange={(e, newPage) => setPage(newPage + 1)}
                    onRowsPerPageChange={(e) => { setPageSize(parseInt(e.target.value, 10)); setPage(1); }}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <ConfirmDialog
        show={confirmShow}
        title="Confirmar eliminación"
        message="¿Desea eliminar este médico? Esta acción no se puede deshacer."
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={deleting}
      />
    </Box>
  );
}
