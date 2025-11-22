import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Typography,
  Tooltip,
  IconButton,
  CircularProgress,
  Box,
  Snackbar,
  Alert
} from '@mui/material';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LoadingButton } from '@mui/lab';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import EventIcon from '@mui/icons-material/Event';
import CancelIcon from '@mui/icons-material/Cancel';
import useAppointments from '../../hooks/useAppointments';
import AppointmentForm from './AppointmentForm';
import ModalForm from '../common/ModalForm';

const columns = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'title', headerName: 'Motivo', width: 130 },
  { field: 'status', headerName: 'Estado', width: 120 },
  { field: 'start', headerName: 'Fecha', width: 120, valueGetter: (params) => new Date(params.row.start).toLocaleDateString() },
  {
    field: 'actions',
    headerName: 'Acciones',
    width: 180,
    renderCell: (params) => params.row.renderActions(params.row)
  }
];

export default function AppointmentDataGrid() {
  const {
    filtered: rows,
    search,
    setSearch,
    deleteAppointment,
    confirmAppointment,
    rescheduleAppointment,
    cancelAppointment,
    reload,
    loading,
    error,
  } = useAppointments();
  
  // Escuchar evento custom para forzar recarga desde la página de pestañas
  React.useEffect(() => {
    const h = () => { try { reload && reload(); } catch (e) { /* no-op */ } };
    window.addEventListener('appointments:reload', h);
    return () => window.removeEventListener('appointments:reload', h);
  }, [reload]);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [selected, setSelected] = React.useState(null);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [rescheduleOpen, setRescheduleOpen] = React.useState(false);
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const [rescheduleDT, setRescheduleDT] = React.useState(null); // Date | null
  const [cancelReason, setCancelReason] = React.useState('');
  const [rescheduleError, setRescheduleError] = React.useState('');
  const [cancelError, setCancelError] = React.useState('');
  const [actionLoading, setActionLoading] = React.useState({ id: null, type: null });
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' });
  const openSnackbar = (message, severity = 'success') => setSnackbar({ open: true, message, severity });
  const closeSnackbar = () => setSnackbar(s => ({ ...s, open: false }));

  // Notificación de errores globales del hook (carga inicial/CRUD)
  React.useEffect(() => {
    if (error) {
      const msg = typeof error === 'string' ? error : (error?.message || 'Ocurrió un error al cargar las citas');
      openSnackbar(msg, 'error');
    }
  }, [error]);

  const handleEdit = (row) => {
    setEditing(row);
    setModalOpen(true);
  };
  const handleAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const handleClose = () => setModalOpen(false);
  const handleDelete = async (row) => {
    if (window.confirm('¿Eliminar cita?')) {
      setActionLoading({ id: row.id, type: 'delete' });
      try {
        await deleteAppointment(row.id);
        openSnackbar('Cita eliminada correctamente', 'success');
      } catch (err) {
        openSnackbar('No se pudo eliminar la cita', 'error');
      } finally {
        setActionLoading({ id: null, type: null });
      }
    }
  };
  const handleSuccess = () => {
    setModalOpen(false);
    openSnackbar('Cita guardada correctamente', 'success');
    reload();
  };
  const handleConfirm = (row) => {
    setSelected(row);
    setConfirmOpen(true);
  };
  const submitConfirm = async () => {
    if (!selected) return;
    try {
      await confirmAppointment(selected.id);
      openSnackbar('Cita confirmada', 'success');
      setConfirmOpen(false);
      setSelected(null);
    } catch (err) {
      openSnackbar('No se pudo confirmar la cita', 'error');
    }
  };
  const handleReschedule = (row) => {
    setSelected(row);
    // precargar si hay fecha
    const dt = row.start ? new Date(row.start) : null;
    setRescheduleDT(dt);
    setRescheduleError('');
    setRescheduleOpen(true);
  };
  const submitReschedule = async () => {
    if (!selected || !rescheduleDT || rescheduleError) return;
    // Validar futuro
    const now = new Date();
    if (rescheduleDT <= now) {
      setRescheduleError('La fecha y hora debe ser futura');
      return;
    }
    const yyyy = rescheduleDT.getFullYear();
    const mm = String(rescheduleDT.getMonth() + 1).padStart(2, '0');
    const dd = String(rescheduleDT.getDate()).padStart(2, '0');
    const HH = String(rescheduleDT.getHours()).padStart(2, '0');
    const MM = String(rescheduleDT.getMinutes()).padStart(2, '0');
    const date = `${yyyy}-${mm}-${dd}`;
    const time = `${HH}:${MM}`;
    try {
      await rescheduleAppointment(selected.id, { atr_fecha_cita: date, atr_hora_cita: time });
      openSnackbar('Cita reprogramada', 'success');
      setRescheduleOpen(false);
      setSelected(null);
      setRescheduleDT(null);
    } catch (err) {
      openSnackbar('No se pudo reprogramar la cita', 'error');
    }
  };
  const handleCancel = (row) => {
    setSelected(row);
    setCancelReason('');
    setCancelError('');
    setCancelOpen(true);
  };
  const submitCancel = async () => {
    if (!selected) return;
    if (!cancelReason || cancelReason.trim().length < 3) {
      setCancelError('Indica un motivo (mínimo 3 caracteres)');
      return;
    }
    try {
      await cancelAppointment(selected.id, cancelReason.trim());
      openSnackbar('Cita cancelada', 'success');
      setCancelOpen(false);
      setSelected(null);
      setCancelReason('');
    } catch (err) {
      openSnackbar('No se pudo cancelar la cita', 'error');
    }
  };
  const rowsWithActions = rows.map(row => ({
    ...row,
    renderActions: (row) => (
      <Stack direction="row" spacing={0.5}>
        <Tooltip title="Editar">
          <span>
            <IconButton size="small" onClick={() => handleEdit(row)} disabled={loading}>
              <EditIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Eliminar">
          <span>
            <IconButton size="small" onClick={() => handleDelete(row)} disabled={loading || (actionLoading.id === row.id && actionLoading.type === 'delete')} color="error">
              {actionLoading.id === row.id && actionLoading.type === 'delete' ? (
                <CircularProgress size={18} />
              ) : (
                <DeleteIcon fontSize="small" />
              )}
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Confirmar">
          <span>
            <IconButton size="small" onClick={() => handleConfirm(row)} disabled={loading} color="success">
              <CheckIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Reprogramar">
          <span>
            <IconButton size="small" onClick={() => handleReschedule(row)} disabled={loading} color="primary">
              <EventIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Cancelar">
          <span>
            <IconButton size="small" onClick={() => handleCancel(row)} disabled={loading} color="warning">
              <CancelIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>
    )
  }));

  return (
    <div style={{ height: 500, width: '100%' }}>
      <h2>Citas</h2>
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      <input
        type="text"
        placeholder="Buscar por motivo o estado"
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ marginBottom: 16, width: 300 }}
      />
      <button onClick={handleAdd} style={{ marginBottom: 16 }} disabled={loading}>Agregar nueva cita</button>
      <ModalForm open={modalOpen} onClose={handleClose} title={editing ? "Editar Cita" : "Registrar Cita"}>
        <AppointmentForm initialData={editing || {}} onSuccess={handleSuccess} />
      </ModalForm>
      {/* Dialog Confirmación */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Confirmar Cita</DialogTitle>
        <DialogContent>
          <Typography>¿Deseas confirmar la cita {selected ? `#${selected.id}` : ''}?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={loading}>Cerrar</Button>
          <LoadingButton onClick={submitConfirm} variant="contained" loading={loading}>Confirmar</LoadingButton>
        </DialogActions>
      </Dialog>
      {/* Dialog Reprogramación */}
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Dialog open={rescheduleOpen} onClose={() => setRescheduleOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>Reprogramar Cita</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <DateTimePicker
                label="Nueva fecha y hora"
                value={rescheduleDT}
                onChange={(val) => {
                  setRescheduleDT(val);
                  setRescheduleError('');
                }}
                slotProps={{
                  textField: {
                    error: Boolean(rescheduleError),
                    helperText: rescheduleError || 'Selecciona una fecha futura',
                    fullWidth: true,
                  },
                }}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRescheduleOpen(false)} disabled={loading}>Cerrar</Button>
            <LoadingButton onClick={submitReschedule} variant="contained" loading={loading} disabled={!rescheduleDT || Boolean(rescheduleError)}>
              Guardar
            </LoadingButton>
          </DialogActions>
        </Dialog>
      </LocalizationProvider>
      {/* Dialog Cancelación */}
      <Dialog open={cancelOpen} onClose={() => setCancelOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Cancelar Cita</DialogTitle>
        <DialogContent>
          <TextField
            label="Motivo de cancelación"
            value={cancelReason}
            onChange={(e) => {
              setCancelReason(e.target.value);
              setCancelError('');
            }}
            error={Boolean(cancelError)}
            helperText={cancelError || 'Indica el motivo (mínimo 3 caracteres)'}
            fullWidth
            multiline
            minRows={3}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelOpen(false)} disabled={loading}>Cerrar</Button>
          <LoadingButton onClick={submitCancel} variant="contained" color="error" loading={loading} disabled={Boolean(cancelError) || !cancelReason}>
            Cancelar cita
          </LoadingButton>
        </DialogActions>
      </Dialog>
      {/* Encabezado y grilla */}
      <Box sx={{ mt: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography variant="h6">Citas</Typography>
        </Stack>
        <DataGrid
          rows={rowsWithActions}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 20]}
          getRowId={row => row.id}
          autoHeight
          loading={loading}
          density="compact"
        />
      </Box>
      {/* Snackbar de feedback */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={closeSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={closeSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}