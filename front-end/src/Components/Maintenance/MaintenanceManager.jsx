import React, { useEffect, useState, useCallback } from 'react';
import { Box, Button, Dialog, DialogContent, DialogTitle, TextField, IconButton, Typography, Snackbar, Alert, MenuItem, Select, InputLabel, FormControl, Tooltip, CircularProgress } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import CloseIcon from '@mui/icons-material/Close';
import maintenanceService from '../../services/maintenanceService';
import getRowId from '../../utils/rowUtils';
import MaintenanceForm from './MaintenanceForm';

const MaintenanceManager = ({ model, columnLabels = {} }) => {
  const [meta, setMeta] = useState([]);
  const [primaryKeyAttributes, setPrimaryKeyAttributes] = useState([]);
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const defaultLimit = Number(process.env.REACT_APP_ADMIN_NUM_REGISTROS || 10);
  const [limit, setLimit] = useState(defaultLimit);
  const [, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [query, setQuery] = useState('');
  const [searchField, setSearchField] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // central load function so we can call it from effect and from "Recargar" button
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
  const m = await maintenanceService.getMeta(model);
  // m is normalized as { data: attributesArray, primaryKeyAttributes: [...] }
  setMeta((m && m.data) ? m.data : (m || []));
  setPrimaryKeyAttributes((m && m.primaryKeyAttributes) ? m.primaryKeyAttributes : []);
      const offset = (page - 1) * limit;
      const list = await maintenanceService.list(model, page, limit, query, { offset, field: searchField });
      setRows((list.data && list.data) || []);
      setTotal(list.pagination ? list.pagination.total : 0);

      // permisos
      try {
        const p = await maintenanceService.getPermissions(model);
        setPermissions((p && p.data) ? (p.data.data || p.data) : p);
      } catch (err) {
        setPermissions({ create: false, read: true, update: false, delete: false });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [model, page, limit, query, searchField]);

  useEffect(() => { loadData(); }, [loadData]);

  const [permissions, setPermissions] = useState({ create: false, read: false, update: false, delete: false });

  const TRUNCATE_THRESHOLD = 40;

  const columns = (meta.length > 0
    ? meta.filter(m => !m.primaryKey).map((m, idx) => ({ field: m.name, headerName: columnLabels[m.name] || m.name, width: 150 }))
    : (rows[0] ? Object.keys(rows[0]).map(k => ({ field: k, headerName: columnLabels[k] || k, width: 150 })) : []))
    .map(col => ({
      ...col,
      renderCell: (params) => {
        const v = params.value === null || typeof params.value === 'undefined' ? '' : String(params.value);
        if (v.length > TRUNCATE_THRESHOLD) {
          return (
            <Tooltip title={v} placement="top">
              <span>{v.substring(0, TRUNCATE_THRESHOLD)}...</span>
            </Tooltip>
          );
        }
        return <span>{v}</span>;
      }
    }));

  const openNew = () => { setEditing(null); setOpen(true); };
  const openEdit = (row) => { setEditing(row); setOpen(true); };

  const handleDelete = async (rowOrId) => {
    if (!window.confirm('¿Eliminar registro?')) return;
    // Determine if caller passed a full row or an id
    let idParam = rowOrId;
    if (typeof rowOrId === 'object' && !Array.isArray(rowOrId)) {
      // build id param for composite keys if needed (as ordered path segments)
      const pkFields = (primaryKeyAttributes && primaryKeyAttributes.length)
        ? primaryKeyAttributes
        : ((meta && meta.length) ? meta.filter(m => m.primaryKey).map(m => m.name) : []);
      if (pkFields.length === 1) idParam = rowOrId[pkFields[0]] || rowOrId.id;
      else if (pkFields.length > 1) {
        // join values in the order defined by primaryKeyAttributes -> 'val1/val2/...'
        const parts = pkFields.map(k => rowOrId[k]);
        idParam = parts.join('/');
      } else {
        idParam = rowOrId.id || rowOrId;
      }
    }

    await maintenanceService.remove(model, idParam);
    // refresh
    try {
  const offset = (page - 1) * limit;
  const list = await maintenanceService.list(model, page, limit, query, { offset, field: searchField });
      setRows((list.data && list.data) || []);
      setSnackbar({ open: true, message: 'Registro eliminado', severity: 'success' });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Error al eliminar', severity: 'error' });
    }
  };

  // initial values and validation schema are produced by the form hook

  const handleSubmit = async (values, { setSubmitting, resetForm, setErrors }) => {
    try {
      if (editing) {
        // detect primary keys (support composite)
        const pkFields = (primaryKeyAttributes && primaryKeyAttributes.length)
          ? primaryKeyAttributes
          : ((meta && meta.length) ? meta.filter(m => m.primaryKey).map(m => m.name) : []);
        let idParam = null;
        if (pkFields.length === 1) {
          idParam = editing[pkFields[0]] || editing.id;
        } else if (pkFields.length > 1) {
          // compose ordered path string for composite keys
          const parts = pkFields.map(k => editing[k]);
          idParam = parts.join('/');
        } else {
          // fallback to common id names
          const pk = meta.find(m => m.primaryKey);
          idParam = editing[pk ? pk.name : (editing.id ? 'id' : null)];
        }

        if (idParam) {
          await maintenanceService.update(model, idParam, values);
        } else {
          await maintenanceService.create(model, values);
        }
      } else {
        await maintenanceService.create(model, values);
      }
  const offset = (page - 1) * limit;
  const list = await maintenanceService.list(model, page, limit, query, { offset, field: searchField });
      setRows((list.data && list.data) || []);
      setOpen(false);
      resetForm();
      setSnackbar({ open: true, message: editing ? 'Registro actualizado' : 'Registro creado', severity: 'success' });
    } catch (err) {
      console.error(err);
      // If backend returns validation errors (422), map them to form fields
      const status = err && err.response && err.response.status;
      const data = err && err.response && err.response.data ? err.response.data : err;
      if (status === 422 && data) {
        const fieldErrors = {};
        // Possible shapes for data.errors:
        // 1) object: { field: ['msg1','msg2'], ... }
        // 2) object: { field: { message: '...' } }
        // 3) array: [{ field: 'name', message: '...' }, ...]
        // 4) string or message only
        const errors = data.errors;
        if (errors) {
          if (Array.isArray(errors)) {
            errors.forEach(e => {
              if (e.field) {
                fieldErrors[e.field] = fieldErrors[e.field] ? fieldErrors[e.field] + ' ' + (e.message || '') : (e.message || '');
              }
            });
          } else if (typeof errors === 'object') {
            Object.keys(errors).forEach(k => {
              const v = errors[k];
              if (Array.isArray(v)) fieldErrors[k] = v.join(' ');
              else if (v && typeof v === 'object' && (v.message || v.msg)) fieldErrors[k] = v.message || v.msg;
              else fieldErrors[k] = String(v);
            });
          } else if (typeof errors === 'string') {
            // general error string
            setSnackbar({ open: true, message: errors, severity: 'error' });
          }
        }

        if (Object.keys(fieldErrors).length > 0) {
          if (setErrors) setErrors(fieldErrors);
          setSnackbar({ open: true, message: data.message || 'Errores de validación', severity: 'error' });
        } else {
          const msg = data.message || 'Errores de validación';
          setSnackbar({ open: true, message: msg, severity: 'error' });
        }
      } else {
        const msg = (data && data.message) ? data.message : (err.message || 'Error');
        setSnackbar({ open: true, message: 'Error: ' + msg, severity: 'error' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // helper functions removed (not used) to reduce lint noise

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="h6">Mantenimiento: {model}</Typography>
        <Box>
          <FormControl size="small" sx={{ mr: 1, minWidth: 160 }}>
            <InputLabel id="search-field-label">Buscar campo</InputLabel>
            <Select labelId="search-field-label" label="Buscar campo" value={searchField} onChange={e => setSearchField(e.target.value)}>
              <MenuItem value="">--Todos--</MenuItem>
              {(meta.length ? meta.filter(m => !m.primaryKey) : Object.keys(rows[0] || {}).map(k => ({ name: k }))).map(f => (
                <MenuItem key={f.name || f} value={f.name || f}>{f.name || f}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField size="small" placeholder="Buscar" value={query} onChange={e => setQuery(e.target.value)} sx={{ mr: 1 }} />
          <FormControl size="small" sx={{ mr: 1, minWidth: 120 }}>
            <InputLabel id="page-size-label">Registros</InputLabel>
            <Select labelId="page-size-label" label="Registros" value={limit} onChange={e => { setLimit(Number(e.target.value)); setPage(1); }}>
              {
                Array.from(new Set([5,10,20,50,100, defaultLimit])).map(n => (
                  <MenuItem key={n} value={n}>{n}</MenuItem>
                ))
              }
            </Select>
          </FormControl>
          {permissions.create && (String(model).toLowerCase() === 'rol' || String(model).toLowerCase() === 'roles'
            ? <Button variant="contained" onClick={openNew}>Ingresar rol</Button>
            : <Button variant="contained" onClick={openNew}>Nuevo</Button>)}
          <Button variant="outlined" onClick={async () => { await loadData(); }} disabled={loading} sx={{ ml: 1 }}>
            {loading ? <CircularProgress size={16} /> : 'Recargar'}
          </Button>
          <Button variant="outlined" onClick={async () => {
            try {
              const res = await maintenanceService.exportData(model, 'csv');
              const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              const ts = new Date().toISOString().replace(/[:.]/g, '-');
              a.download = `${model}_export_${ts}.csv`;
              document.body.appendChild(a);
              a.click();
              a.remove();
              window.URL.revokeObjectURL(url);
            } catch (err) { console.error(err); setSnackbar({ open: true, message: 'Error exportando CSV', severity: 'error' }); }
          }} sx={{ ml: 1 }}>Exportar CSV</Button>
          <Button variant="outlined" onClick={async () => {
            try {
              const res = await maintenanceService.exportData(model, 'pdf');
              const blob = new Blob([res.data], { type: 'application/pdf' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              const ts = new Date().toISOString().replace(/[:.]/g, '-');
              a.download = `${model}_export_${ts}.pdf`;
              document.body.appendChild(a);
              a.click();
              a.remove();
              window.URL.revokeObjectURL(url);
            } catch (err) { console.error(err); setSnackbar({ open: true, message: 'Error exportando PDF', severity: 'error' }); }
          }} sx={{ ml: 1 }}>Exportar PDF</Button>
        </Box>
      </Box>

      <DataGrid
        rows={rows.map(r => ({ ...r, id: getRowId(r, primaryKeyAttributes) }))}
        columns={[...columns, { field: '__actions', headerName: 'Acciones', width: 150, renderCell: (params) => (
          <Box>
            {permissions.update && <Button size="small" onClick={() => openEdit(params.row)}>Editar</Button>}
            {permissions.delete && <Button size="small" color="error" onClick={() => handleDelete(params.row)}>Eliminar</Button>}
          </Box>
        ) }]}
        pageSize={limit}
        rowsPerPageOptions={Array.from(new Set([5,10,20,50, defaultLimit]))}
        loading={loading}
        autoHeight
      />

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>
          {editing ? 'Editar' : 'Nuevo'}
          <IconButton aria-label="close" onClick={() => setOpen(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <MaintenanceForm
            model={model}
            meta={meta}
            editing={editing}
            onCancel={() => setOpen(false)}
            onSubmit={handleSubmit}
          />
        </DialogContent>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
        <Alert onClose={() => setSnackbar(s => ({ ...s, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MaintenanceManager;
