import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, IconButton, Tooltip, Card, CardContent, Stack, Paper, Button, Dialog, DialogTitle, DialogContent } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import './AdminErrores.css';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MaintenanceForm from '../Components/Maintenance/MaintenanceForm';
import maintenanceService from '../services/maintenanceService';
import api from '../services/api';
import { useAuth } from '../Components/context/AuthContext';
import { useNotifications } from '../context/NotificationsContext';
import CloseIcon from '@mui/icons-material/Close';

const AdminErrores = () => {
  const [meta, setMeta] = useState([]);
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { notify } = useNotifications();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await maintenanceService.getMeta('Errores');
        if (!mounted) return;
        setMeta(res.data || res || []);
      } catch (err) {
        console.warn('No se pudo obtener meta de Errores, renderizando formulario básico', err);
        setMeta([]);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const offset = (page - 1) * limit;
      const list = await maintenanceService.list('Errores', page, limit, '', { offset });
      setRows((list && list.data) || []);
      setTotal(list && list.pagination ? list.pagination.total : (list && list.total) || 0);
    } catch (e) {
      console.error('Error cargando errores:', e);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => { fetchList(); }, [fetchList]);

  const handleSubmit = async (values, helpers) => {
    try {
      let res;
      if (editing && editing.id) {
        res = await maintenanceService.update('Errores', editing.id, values);
      } else {
        res = await maintenanceService.create('Errores', values);
      }
      notify({ message: editing ? 'Error actualizado' : 'Error registrado', severity: 'success' });
      if (helpers && helpers.resetForm) helpers.resetForm();
      setEditing(null);
      // registrar en bitácora
      try {
        const idObjeto = res && (res.id || res.atr_id_errores || res.atr_id_error || 0);
        await api.post('/bitacora/registrar', {
          accion: editing ? 'Actualizar Error' : 'Registrar Error',
          descripcion: `Registro de error para modelo Errores: ${values.crid || values.message || ''}`,
          idUsuario: user ? (user.atr_id_usuario || user.id || 0) : 0,
          idObjeto: idObjeto || 0
        });
      } catch (e) {
        console.warn('No se pudo registrar en bitácora:', e);
      }
      await fetchList();
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data || err;
      if (status === 422 && data) {
        // map validation errors back to form
        const fieldErrors = {};
        const errors = data.errors;
        if (errors) {
          if (Array.isArray(errors)) {
            errors.forEach(e => { if (e.field) fieldErrors[e.field] = e.message || ''; });
          } else if (typeof errors === 'object') {
            Object.keys(errors).forEach(k => { const v = errors[k]; fieldErrors[k] = Array.isArray(v) ? v.join(' ') : (v.message || String(v)); });
          }
        }
        if (Object.keys(fieldErrors).length) {
          if (helpers && helpers.setErrors) helpers.setErrors(fieldErrors);
        }
        notify({ message: data.message || 'Errores de validación', severity: 'error' });
      } else {
        notify({ message: data.message || err.message || 'Error', severity: 'error' });
      }
    } finally {
      if (helpers && helpers.setSubmitting) helpers.setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar registro?')) return;
    try {
  await maintenanceService.remove('Errores', id);
      notify({ message: 'Registro eliminado', severity: 'success' });
      // registrar en bitácora
      try {
        await api.post('/bitacora/registrar', {
          accion: 'Eliminar Error',
          descripcion: `Eliminación de error id ${id}`,
          idUsuario: user ? (user.atr_id_usuario || user.id || 0) : 0,
          idObjeto: id
        });
      } catch (e) { console.warn('No se pudo registrar eliminación en bitácora', e); }
      await fetchList();
    } catch (e) {
      console.error('Error eliminando:', e);
      notify({ message: 'Error al eliminar', severity: 'error' });
    }
  };

  const handleEdit = (row) => {
    setEditing(row);
    setOpen(true);
  };

  const openNew = () => {
    setEditing(null);
    setOpen(true);
  };

  return (
    <Box className="roles-permissions-page">
      <Box className="roles-permissions-header">
        <Box sx={{ maxWidth: 920, width: '100%', mx: 'auto', textAlign: 'center' }}>
          <Typography variant="h4">Errores del Sistema</Typography>
          <Typography variant="body1">Registrar y gestionar errores del sistema</Typography>
        </Box>
      </Box>

      <Box sx={{ width: '100%', px: { xs: 2, sm: 3 } }}>
        <Box sx={{ maxWidth: 1100, width: '100%', mx: 'auto', mt: 0 }} className="tabs-container">
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} alignItems="center" justifyContent="space-between">
                <Typography variant="h6">Registrar Error</Typography>
                <Box>
                  <Button variant="contained" onClick={openNew}>Nuevo</Button>
                  <Button startIcon={<RefreshIcon />} onClick={fetchList} variant="outlined" size="small" sx={{ ml: 1 }}>Recargar</Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography variant="h6">Errores registrados</Typography>
          <Button startIcon={<RefreshIcon />} onClick={fetchList} variant="contained" size="small">Recargar</Button>
        </Stack>
        <Paper sx={{ p: 2 }} className="data-grid-wrapper">
          <Box sx={{ height: 500, width: '100%' }}>
            <DataGrid
            rows={rows.map(r => ({ ...r, id: r.id || r.atr_id_errores || r.atr_id_error || r.atr_id }))}
            columns={(() => {
              const base = meta.length > 0
                ? meta.filter(m => !m.primaryKey).slice(0, 6).map(m => ({ field: m.name, headerName: m.label || m.name, width: 180 }))
                : (rows[0] ? Object.keys(rows[0]).slice(0, 6).map(k => ({ field: k, headerName: k, width: 180 })) : []);
              base.push({
                field: '__actions', headerName: 'Acciones', width: 160, renderCell: (params) => (
                  <Box>
                    <Tooltip title="Ver"><IconButton size="small"><VisibilityIcon /></IconButton></Tooltip>
                    <Tooltip title="Editar"><IconButton size="small" onClick={() => handleEdit(params.row)}><EditIcon /></IconButton></Tooltip>
                    <Tooltip title="Eliminar"><IconButton size="small" color="error" onClick={() => handleDelete(params.row.id)}><DeleteIcon /></IconButton></Tooltip>
                  </Box>
                )
              });
              return base;
            })()}
            pageSize={limit}
            onPageChange={(newPage) => { setPage(newPage + 1); fetchList(); }}
            onPageSizeChange={(newSize) => { setLimit(newSize); setPage(1); fetchList(); }}
            rowsPerPageOptions={[5,10,20,50]}
            loading={loading}
            autoHeight
          />
          </Box>
        </Paper>
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>
          {editing ? 'Editar Error' : 'Nuevo Error'}
          <IconButton aria-label="close" onClick={() => setOpen(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <MaintenanceForm model="Errores" meta={meta} editing={editing} onCancel={() => { setOpen(false); setEditing(null); }} onSubmit={async (values, helpers) => {
            await handleSubmit(values, helpers);
            setOpen(false);
          }} submitLabel={editing ? 'Guardar' : 'Registrar'} />
        </DialogContent>
      </Dialog>

      {/* Notifications handled by NotificationsContext */}
    </Box>
  );
};

export default AdminErrores;
