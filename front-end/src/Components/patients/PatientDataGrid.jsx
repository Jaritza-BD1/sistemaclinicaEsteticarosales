import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Snackbar,
  Alert
} from '@mui/material';
import { PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPatients, deletePatient, clearError } from '../../redux/patients/patientsSlice';
import ModalForm from '../common/ModalForm';
import PatientForm from './PatientForm';
import ScrollErrorBoundary from '../common/ScrollErrorBoundary';

const PatientDataGrid = () => {
  const dispatch = useDispatch();
  const { items: patients, status, error } = useSelector(state => state.patients);
  
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    dispatch(fetchPatients());
  }, [dispatch]);

  // Limpiar error cuando cambia
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleEdit = (patient) => {
    setEditing(patient);
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const handleSuccess = () => {
    setModalOpen(false);
    setEditing(null);
    setSnackbar({
      open: true,
      message: editing ? 'Paciente actualizado exitosamente' : 'Paciente registrado exitosamente',
      severity: 'success'
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este paciente?')) return;
    
    try {
      await dispatch(deletePatient(id)).unwrap();
      setSnackbar({
        open: true,
        message: 'Paciente eliminado exitosamente',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error al eliminar paciente',
        severity: 'error'
      });
    }
  };

  const filteredRows = patients.filter(patient =>
    patient.atr_nombre?.toLowerCase().includes(search.toLowerCase()) ||
    patient.atr_apellido?.toLowerCase().includes(search.toLowerCase()) ||
    patient.atr_identidad?.includes(search) ||
    patient.atr_numero_expediente?.toString().includes(search)
  );

  const columns = [
    {
      field: 'atr_nombre',
      headerName: 'Nombre',
      flex: 1,
      minWidth: 150
    },
    {
      field: 'atr_apellido',
      headerName: 'Apellido',
      flex: 1,
      minWidth: 150
    },
    {
      field: 'atr_identidad',
      headerName: 'Identidad',
      flex: 1,
      minWidth: 120
    },
    {
      field: 'atr_numero_expediente',
      headerName: 'Expediente',
      flex: 1,
      minWidth: 120
    },
    {
      field: 'atr_fecha_nacimiento',
      headerName: 'Fecha Nacimiento',
      flex: 1,
      minWidth: 150,
      valueFormatter: (params) => {
        if (!params.value) return '-';
        return new Date(params.value).toLocaleDateString('es-ES');
      }
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      flex: 1,
      minWidth: 200,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleEdit(params.row)}
            sx={{
              borderColor: 'primary.300',
              color: 'primary.main',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'primary.50',
              },
            }}
          >
            Editar
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="error"
            onClick={() => handleDelete(params.row.atr_id_paciente)}
            sx={{
              borderColor: 'error.300',
              color: 'error.main',
              '&:hover': {
                borderColor: 'error.main',
                backgroundColor: 'error.50',
              },
            }}
          >
            Eliminar
          </Button>
        </Box>
      )
    }
  ];

  return (
    <ScrollErrorBoundary>
      <Box sx={{ width: '100%', maxWidth: 1100, mx: 'auto', my: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, color: 'primary.main', fontWeight: 700 }}>
          Pacientes
        </Typography>
        
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
            Agregar nuevo paciente
          </Button>
        </Stack>

        <ScrollErrorBoundary>
          <ModalForm 
            open={modalOpen} 
            onClose={handleClose} 
            title={editing ? "Editar Paciente" : "Registrar Paciente"}
            maxWidth="md"
          >
            <PatientForm 
              initialData={editing || {}} 
              onSuccess={handleSuccess} 
            />
          </ModalForm>
        </ScrollErrorBoundary>

        <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, boxShadow: 2, p: 2 }}>
          <DataGrid
            rows={filteredRows}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5, 10, 20]}
            getRowId={row => row.atr_id_paciente}
            autoHeight
            loading={status === 'loading'}
            sx={{
              '& .MuiDataGrid-root': {
                border: 'none',
              },
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid',
                borderColor: 'divider',
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: 'primary.50',
                borderBottom: '2px solid',
                borderColor: 'primary.main',
              },
              '& .MuiDataGrid-columnHeader': {
                fontWeight: 'bold',
                color: 'primary.main',
              },
            }}
          />
        </Box>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            severity={snackbar.severity} 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ScrollErrorBoundary>
  );
};

export default PatientDataGrid; 