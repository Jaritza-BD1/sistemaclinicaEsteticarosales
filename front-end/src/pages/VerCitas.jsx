import React, { useMemo, useState, useEffect } from 'react';
import {
  Container, Paper, Typography, Box, TextField, Button, FormControl, InputLabel, Select, MenuItem,
  Table, TableHead, TableRow, TableCell, TableBody, TableContainer, TablePagination, Chip, Tooltip,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Grid, useMediaQuery, Card, CardContent
} from '@mui/material';
import { useLocation } from 'react-router-dom';
import CitasAgendarPage from './CitasAgendarPage';
import { APPOINTMENT_STATUS, getStatusLabel } from '../config/appointmentStatus';
import { useNotifications } from '../context/NotificationsContext';

export default function VerCitas() {
  const { appointments, patients, doctors, reload, confirmAppointment, rescheduleAppointment, cancelAppointment } = useAppointments();
  const isXs = useMediaQuery(theme => theme.breakpoints.down('sm'));
  const location = useLocation();
  const [openAgendarDialog, setOpenAgendarDialog] = useState(false);

  useEffect(() => {
    if (location && location.state && location.state.background) {
      setOpenAgendarDialog(true);
    }
  }, [location]);
  const isMdDown = useMediaQuery(theme => theme.breakpoints.down('md'));

  const [filters, setFilters] = useState({ dateFrom: '', dateTo: '', status: '', doctorId: '', patientSearch: '' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // modal states
  const [selected, setSelected] = useState(null);
  const [reprogramOpen, setReprogramOpen] = useState(false);
  const [rescheduleDT, setRescheduleDT] = useState(null);
  const [rescheduleError, setRescheduleError] = useState('');
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const { notify } = useNotifications();

  const filtered = useMemo(() => {
    let list = appointments || [];
    if (filters.patientSearch) {
      const q = filters.patientSearch.toLowerCase();
      list = list.filter(a => {
        const pname = (a.patient && (a.patient.atr_nombre || a.patient.atr_nombre)) || '';
        const doc = (patients || []).find(p => p.value === a.patientId);
        const label = doc ? doc.label : pname;
        return (label || '').toLowerCase().includes(q) || (a.title || '').toLowerCase().includes(q);
      });
    }
    if (filters.status) list = list.filter(a => String(a.status) === String(filters.status));
    if (filters.doctorId) list = list.filter(a => String(a.doctorId) === String(filters.doctorId));
    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom);
      list = list.filter(a => new Date(a.start) >= from);
    }
    if (filters.dateTo) {
      const to = new Date(filters.dateTo);
      to.setHours(23,59,59,999);
      list = list.filter(a => new Date(a.start) <= to);
    }
    return list.sort((a,b)=>new Date(a.start)-new Date(b.start));
  }, [appointments, filters, patients]);

  useEffect(() => setPage(0), [filters]);

  const handleExportExcel = () => {
    const data = filtered.map(a => ({
      Fecha: format(new Date(a.start), 'dd/MM/yyyy'),
      Hora: format(new Date(a.start), 'HH:mm'),
      Paciente: (a.patient && `${a.patient.atr_nombre || ''} ${a.patient.atr_apellido || ''}`).trim() || (patients.find(p=>p.value===a.patientId)?.label || ''),
      Médico: (a.doctor && `${a.doctor.atr_nombre || ''} ${a.doctor.atr_apellido || ''}`).trim() || (doctors.find(d=>d.value===a.doctorId)?.label || ''),
      Motivo: a.title,
      Estado: getStatusLabel(a.statusName || a.status)
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Citas');
    XLSX.writeFile(wb, 'citas.xlsx');
    notify({ message: 'Exportado a Excel', severity: 'success' });
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const rows = filtered.map(a => ([
      format(new Date(a.start), 'dd/MM/yyyy'),
      format(new Date(a.start), 'HH:mm'),
      (a.patient && `${a.patient.atr_nombre || ''} ${a.patient.atr_apellido || ''}`).trim() || (patients.find(p=>p.value===a.patientId)?.label || ''),
      (a.doctor && `${a.doctor.atr_nombre || ''} ${a.doctor.atr_apellido || ''}`).trim() || (doctors.find(d=>d.value===a.doctorId)?.label || ''),
      a.title,
      getStatusLabel(a.statusName || a.status)
    ]));
    doc.autoTable({ head: [['Fecha','Hora','Paciente','Médico','Motivo','Estado']], body: rows });
    doc.save('citas.pdf');
    notify({ message: 'PDF generado', severity: 'success' });
  };

  const handleConfirm = async (row) => {
    try {
      await confirmAppointment(row.id);
      notify({ message: 'Cita confirmada', severity: 'success' });
      reload();
    } catch (e) { setSnackbar({ open: true, message: 'Error al confirmar', severity: 'error' }); }
  };

  const openReprogram = (row) => { setSelected(row); setRescheduleDT(row && row.start ? new Date(row.start) : null); setRescheduleError(''); setReprogramOpen(true); };
  const openCancel = (row) => { setSelected(row); setCancelOpen(true); };

  const submitCancel = async () => {
    if (!selected) return;
    try {
      await cancelAppointment(selected.id, cancelReason);
      notify({ message: 'Cita cancelada', severity: 'success' });
      setCancelOpen(false);
      setCancelReason('');
      reload();
    } catch (e) { setSnackbar({ open: true, message: 'Error al cancelar', severity: 'error' }); }
  };

  const submitReschedule = async () => {
    if (!selected) return;
    if (!rescheduleDT) {
      setRescheduleError('Selecciona fecha y hora');
      return;
    }
    const now = new Date();
    if (rescheduleDT <= now) {
      setRescheduleError('La fecha debe ser futura');
      return;
    }
    setRescheduleLoading(true);
    try {
      const yyyy = rescheduleDT.getFullYear();
      const mm = String(rescheduleDT.getMonth() + 1).padStart(2, '0');
      const dd = String(rescheduleDT.getDate()).padStart(2, '0');
      const HH = String(rescheduleDT.getHours()).padStart(2, '0');
      const MM = String(rescheduleDT.getMinutes()).padStart(2, '0');
      const date = `${yyyy}-${mm}-${dd}`;
      const time = `${HH}:${MM}`;

      await rescheduleAppointment(selected.id, { nuevaFecha: date, nuevaHora: time, motivo: 'Reprogramación desde interfaz' });
      notify({ message: 'Cita reprogramada', severity: 'success' });
      setReprogramOpen(false);
      setSelected(null);
      setRescheduleDT(null);
      reload();
    } catch (e) {
      notify({ message: 'Error al reprogramar', severity: 'error' });
    } finally {
      setRescheduleLoading(false);
    }
  };

  // delete handled elsewhere (if needed), remove unused function

  return (
    <Container sx={{ py: 3 }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">Gestión de Citas</Typography>
          </Grid>
          <Grid item xs={12} sm={6} container justifyContent={isXs ? 'flex-start' : 'flex-end'} spacing={1}>
            <Grid item>
              <Button variant="contained" onClick={() => { setOpenAgendarDialog(true); }} size="small">Agendar Cita</Button>
            </Grid>
            <Grid item>
              <Button variant="outlined" onClick={handleExportPDF} size="small">Exportar PDF</Button>
            </Grid>
            <Grid item>
              <Button variant="outlined" onClick={handleExportExcel} size="small">Exportar Excel</Button>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Grid container spacing={1}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth label="Paciente / Motivo" size="small" value={filters.patientSearch} onChange={(e)=>setFilters(f=>({...f,patientSearch:e.target.value}))} />
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <TextField fullWidth label="Desde" type="date" size="small" InputLabelProps={{ shrink: true }} value={filters.dateFrom} onChange={(e)=>setFilters(f=>({...f,dateFrom:e.target.value}))} />
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <TextField fullWidth label="Hasta" type="date" size="small" InputLabelProps={{ shrink: true }} value={filters.dateTo} onChange={(e)=>setFilters(f=>({...f,dateTo:e.target.value}))} />
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Estado</InputLabel>
                  <Select label="Estado" value={filters.status} onChange={(e)=>setFilters(f=>({...f,status:e.target.value}))}>
                    <MenuItem value=""><em>Todos</em></MenuItem>
                    <MenuItem value={APPOINTMENT_STATUS.PROGRAMADA}>{getStatusLabel(APPOINTMENT_STATUS.PROGRAMADA)}</MenuItem>
                    <MenuItem value={APPOINTMENT_STATUS.CONFIRMADA}>{getStatusLabel(APPOINTMENT_STATUS.CONFIRMADA)}</MenuItem>
                    <MenuItem value={APPOINTMENT_STATUS.EN_CONSULTA}>{getStatusLabel(APPOINTMENT_STATUS.EN_CONSULTA)}</MenuItem>
                    <MenuItem value={APPOINTMENT_STATUS.PENDIENTE_PAGO}>{getStatusLabel(APPOINTMENT_STATUS.PENDIENTE_PAGO)}</MenuItem>
                    <MenuItem value={APPOINTMENT_STATUS.FINALIZADA}>{getStatusLabel(APPOINTMENT_STATUS.FINALIZADA)}</MenuItem>
                    <MenuItem value={APPOINTMENT_STATUS.CANCELADA}>{getStatusLabel(APPOINTMENT_STATUS.CANCELADA)}</MenuItem>
                    <MenuItem value={APPOINTMENT_STATUS.NO_ASISTIO}>{getStatusLabel(APPOINTMENT_STATUS.NO_ASISTIO)}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} sm={3} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Médico</InputLabel>
                  <Select label="Médico" value={filters.doctorId} onChange={(e)=>setFilters(f=>({...f,doctorId:e.target.value}))}>
                    <MenuItem value=""><em>Todos</em></MenuItem>
                    {(doctors||[]).map(d => <MenuItem key={d.value} value={d.value}>{d.label}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      {/* List: table on md+, cards on xs/sm */}
      {isXs ? (
        <Grid container spacing={1}>
          {filtered.slice(page*rowsPerPage, page*rowsPerPage+rowsPerPage).map(row => (
            <Grid item xs={12} key={row.id}>
              <Card variant="outlined" sx={{ p: 1 }}>
                <CardContent sx={{ py: 1, px: 1 }}>
                  <Grid container spacing={1} alignItems="center">
                    <Grid item xs={8}>
                      <Typography variant="subtitle2">{(row.patient && `${row.patient.atr_nombre || ''} ${row.patient.atr_apellido || ''}`).trim() || (patients.find(p=>p.value===row.patientId)?.label||'')}</Typography>
                      {row.title ? <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, mb: 0.5 }}>{(row.title || '')}</Typography> : null}
                      <Typography variant="caption">{format(new Date(row.start), 'dd/MM/yyyy HH:mm')}</Typography>
                    </Grid>
                    <Grid item xs={4} container justifyContent="flex-end">
                      <Chip label={getStatusLabel(row.statusName || row.status)} size="small" />
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                        <Button size="small" variant="outlined" onClick={()=>handleConfirm(row)}>Confirmar</Button>
                        <Button size="small" variant="outlined" onClick={()=>openReprogram(row)}>Reprogramar</Button>
                        <Button size="small" variant="outlined" color="error" onClick={()=>openCancel(row)}>Cancelar</Button>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Hora</TableCell>
                  <TableCell>Paciente</TableCell>
                  <TableCell>Médico</TableCell>
                  {!isMdDown && <TableCell>Motivo</TableCell>}
                  <TableCell>Estado</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.slice(page*rowsPerPage, page*rowsPerPage+rowsPerPage).map(row => (
                  <TableRow key={row.id}>
                    <TableCell>{format(new Date(row.start), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{format(new Date(row.start), 'HH:mm')}</TableCell>
                    <TableCell>{(row.patient && `${row.patient.atr_nombre || ''} ${row.patient.atr_apellido || ''}`).trim() || (patients.find(p=>p.value===row.patientId)?.label||'')}</TableCell>
                    <TableCell>{(row.doctor && `${row.doctor.atr_nombre || ''} ${row.doctor.atr_apellido || ''}`).trim() || (doctors.find(d=>d.value===row.doctorId)?.label||'')}</TableCell>
                    {!isMdDown && <TableCell>{row.title}</TableCell>}
                    <TableCell><Chip label={getStatusLabel(row.statusName || row.status)} size="small" /></TableCell>
                    <TableCell>
                      <Tooltip title="Confirmar"><IconButton size="small" onClick={()=>handleConfirm(row)}><CheckCircleIcon fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Reprogramar"><IconButton size="small" onClick={()=>openReprogram(row)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Cancelar"><IconButton size="small" onClick={()=>openCancel(row)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination rowsPerPageOptions={[5,10,25]} component="div" count={filtered.length} rowsPerPage={rowsPerPage} page={page} onPageChange={(e,newPage)=>setPage(newPage)} onRowsPerPageChange={(e)=>{setRowsPerPage(parseInt(e.target.value,10)); setPage(0);}} />
        </Paper>
      )}

      {/* Agendar modal (same form embedded) */}
      <Dialog open={openAgendarDialog} onClose={() => { setOpenAgendarDialog(false); }} fullScreen={isXs} maxWidth="lg" fullWidth>
        <DialogTitle>Agendar Cita</DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          <CitasAgendarPage onClose={() => setOpenAgendarDialog(false)} onSuccess={() => reload()} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenAgendarDialog(false); }}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Reprogram Modal */}
      <Dialog open={reprogramOpen} onClose={()=>setReprogramOpen(false)} fullWidth fullScreen={isXs}>
        <DialogTitle>Reprogramar Cita</DialogTitle>
        <DialogContent>
          {selected && (
            <Box sx={{ mb: 2, p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
              <Grid container spacing={1}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Paciente</Typography>
                  <Typography variant="body2">{(selected.patient && `${selected.patient.atr_nombre || ''} ${selected.patient.atr_apellido || ''}`).trim() || (patients.find(p=>p.value===selected.patientId)?.label || '')}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Médico</Typography>
                  <Typography variant="body2">{(selected.doctor && `${selected.doctor.atr_nombre || ''} ${selected.doctor.atr_apellido || ''}`).trim() || (doctors.find(d=>d.value===selected.doctorId)?.label || '')}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">Fecha</Typography>
                  <Typography variant="body2">{format(new Date(selected.start), 'dd/MM/yyyy')}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">Hora</Typography>
                  <Typography variant="body2">{format(new Date(selected.start), 'HH:mm')}</Typography>
                </Grid>
                {selected.title && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Motivo</Typography>
                    <Typography variant="body2">{selected.title}</Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              label="Nueva fecha y hora"
              value={rescheduleDT}
              onChange={(v) => { setRescheduleDT(v); setRescheduleError(''); }}
              renderInput={(params) => (
                <TextField {...params} fullWidth margin="normal" error={Boolean(rescheduleError)} helperText={rescheduleError} />
              )}
            />
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setReprogramOpen(false)} disabled={rescheduleLoading}>Cerrar</Button>
          <LoadingButton onClick={submitReschedule} variant="contained" loading={rescheduleLoading}>Confirmar</LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog open={cancelOpen} onClose={()=>setCancelOpen(false)} fullWidth fullScreen={isXs}>
        <DialogTitle>Cancelar Cita</DialogTitle>
        <DialogContent>
          {selected && (
            <Box sx={{ mb: 2, p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
              <Grid container spacing={1}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Paciente</Typography>
                  <Typography variant="body2">{(selected.patient && `${selected.patient.atr_nombre || ''} ${selected.patient.atr_apellido || ''}`).trim() || (patients.find(p=>p.value===selected.patientId)?.label || '')}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Médico</Typography>
                  <Typography variant="body2">{(selected.doctor && `${selected.doctor.atr_nombre || ''} ${selected.doctor.atr_apellido || ''}`).trim() || (doctors.find(d=>d.value===selected.doctorId)?.label || '')}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">Fecha</Typography>
                  <Typography variant="body2">{format(new Date(selected.start), 'dd/MM/yyyy')}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">Hora</Typography>
                  <Typography variant="body2">{format(new Date(selected.start), 'HH:mm')}</Typography>
                </Grid>
                {selected.title && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Motivo</Typography>
                    <Typography variant="body2">{selected.title}</Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
          <TextField fullWidth multiline rows={4} label="Motivo de cancelación" value={cancelReason} onChange={(e)=>setCancelReason(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setCancelOpen(false)}>Cerrar</Button>
          <Button variant="contained" color="error" onClick={submitCancel}>Confirmar</Button>
        </DialogActions>
      </Dialog>

      {/* Notifications handled by NotificationsContext */}
    </Container>
  );
}
