import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { fetchDoctors } from '../../services/doctorService';
import ModalForm from '../common/ModalForm';
import DoctorRegistrationForm from './DoctorRegistrationForm';
import {
  Box, Stack, TextField, Button, IconButton, Snackbar, Alert, Typography
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const columnsBase = [
  { field: 'atr_id_medico', headerName: 'ID', width: 70 },
  { field: 'atr_nombre', headerName: 'Nombre', width: 130 },
  { field: 'atr_apellido', headerName: 'Apellido', width: 130 },
  { field: 'atr_identidad', headerName: 'Identidad', width: 120 },
  { field: 'atr_fecha_nacimiento', headerName: 'Nacimiento', width: 120 },
];

export default function DoctorDataGrid() {
  const [rows, setRows] = React.useState([]);
  const [search, setSearch] = React.useState('');
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' });

  React.useEffect(() => {
    fetchDoctors().then(res => setRows(res.data));
  }, []);

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
    if (window.confirm('¿Eliminar médico?')) {
      await import('../../services/doctorService').then(({ deleteDoctor }) => deleteDoctor(row.atr_id_medico));
      setRows(rows => rows.filter(r => r.atr_id_medico !== row.atr_id_medico));
      setSnackbar({ open: true, message: 'Médico eliminado.', severity: 'success' });
    }
  };
  const handleSuccess = () => {
    setModalOpen(false);
    fetchDoctors().then(res => setRows(res.data));
    setSnackbar({ open: true, message: 'Médico guardado correctamente.', severity: 'success' });
  };

  const filteredRows = rows.filter(r =>
    r.atr_nombre?.toLowerCase().includes(search.toLowerCase()) ||
    r.atr_apellido?.toLowerCase().includes(search.toLowerCase()) ||
    r.atr_identidad?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    ...columnsBase,
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton color="primary" onClick={() => handleEdit(params.row)} size="small">
            <EditIcon />
          </IconButton>
          <IconButton color="error" onClick={() => handleDelete(params.row)} size="small">
            <DeleteIcon />
          </IconButton>
        </Box>
      )
    }
  ];

  return (
    <Box sx={{ width: '100%', maxWidth: 1100, mx: 'auto', my: 4 }}>
      <Typography variant="h5" sx={{ mb: 2, color: 'primary.main', fontWeight: 700 }}>Médicos</Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2, alignItems: { sm: 'center' } }}>
        <TextField
          label="Buscar por nombre, apellido o identidad"
          value={search}
          onChange={e => setSearch(e.target.value)}
          size="small"
          sx={{ minWidth: 220, flex: 1 }}
        />
        <Button
          variant="contained"
          color="primary"
          startIcon={<PersonAddIcon />}
          onClick={handleAdd}
          sx={{ minWidth: 180 }}
        >
          Agregar nuevo médico
        </Button>
      </Stack>
      <ModalForm open={modalOpen} onClose={handleClose} title={editing ? "Editar Médico" : "Registrar Médico"}>
        <DoctorRegistrationForm initialData={editing || {}} onSave={handleSuccess} onCancel={handleClose} />
      </ModalForm>
      <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, boxShadow: 2, p: 2 }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 20]}
          getRowId={row => row.atr_id_medico}
          autoHeight
        />
      </Box>
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
    </Box>
  );
} 