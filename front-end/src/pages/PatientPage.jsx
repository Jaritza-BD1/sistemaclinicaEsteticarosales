import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, TextField, Stack } from '@mui/material';
import PatientList from '../Components/patients/PatientList';
import PatientRegistrationForm from '../Components/patients/PatientRegistrationForm';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPatients } from '../redux/patients/patientsSlice';
import SideBar from '../Components/common/SideBar';

const PatientPage = () => {
  const [openRegister, setOpenRegister] = React.useState(false);
  const dispatch = useDispatch();
  const [filters, setFilters] = useState({ name: '', identidad: '', expediente: '' });

  const { status } = useSelector(state => state.patients);

  const handleOpen = () => setOpenRegister(true);
  const handleClose = () => setOpenRegister(false);

  useEffect(() => {
    // load initial list
    dispatch(fetchPatients());
  }, [dispatch]);

  const handleSearch = async () => {
    await dispatch(fetchPatients({ name: filters.name, identidad: filters.identidad, expediente: filters.expediente }));
  };

  const handleSuccess = async () => {
    // Close modal and refresh patients list
    setOpenRegister(false);
    try {
      await dispatch(fetchPatients());
    } catch (e) {}
  };

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      <SideBar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">Sistema - Pacientes</Typography>
          <Button variant="contained" color="primary" onClick={handleOpen}>Registrar Paciente</Button>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <TextField
            placeholder="Nombre"
            size="small"
            value={filters.name}
            onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
          />
          <TextField
            placeholder="Identidad"
            size="small"
            value={filters.identidad}
            onChange={(e) => setFilters(prev => ({ ...prev, identidad: e.target.value }))}
          />
          <TextField
            placeholder="Expediente"
            size="small"
            value={filters.expediente}
            onChange={(e) => setFilters(prev => ({ ...prev, expediente: e.target.value }))}
          />
          <Button variant="contained" onClick={handleSearch} disabled={status === 'loading'}>Buscar</Button>
          <Button variant="outlined" onClick={() => { setFilters({ name: '', identidad: '', expediente: '' }); dispatch(fetchPatients()); }}>Limpiar</Button>
        </Stack>

        <PatientList />

        <Dialog open={openRegister} onClose={handleClose} fullWidth maxWidth="lg">
          <DialogTitle>Registrar Paciente</DialogTitle>
          <DialogContent>
            <PatientRegistrationForm inModal onSuccess={handleSuccess} />
          </DialogContent>
        </Dialog>
      </Box>
    </Box>
  );
};

export default PatientPage;
