import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  PlayArrow,
  Stop,
  Delete,
  Edit,
  Add,
  Schedule,
  Refresh
} from '@mui/icons-material';
import { backupService } from '../../services/backupService';

const BackupJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [stats, setStats] = useState({});

  // Formulario para crear/editar job
  const [jobForm, setJobForm] = useState({
    name: '',
    schedule: '',
    server: '',
    database: '',
    user: '',
    password: '',
    backupPath: './backups',
    retentionDays: 30
  });

  // Cargar jobs al montar el componente
  useEffect(() => {
    loadJobs();
    loadStats();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const response = await backupService.getJobs();
      setJobs(response.data || []);
    } catch (error) {
      setError('Error cargando jobs automáticos');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await backupService.getJobStats();
      setStats(response.data || {});
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const handleCreateJob = async () => {
    try {
      setLoading(true);
      setError('');
      
      await backupService.createJob(jobForm);
      
      setSuccess('Job automático creado exitosamente');
      setOpenDialog(false);
      resetForm();
      loadJobs();
      loadStats();
    } catch (error) {
      setError(error.response?.data?.message || 'Error creando job automático');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateJob = async () => {
    try {
      setLoading(true);
      setError('');
      
      await backupService.updateJob(editingJob.id, jobForm);
      
      setSuccess('Job automático actualizado exitosamente');
      setOpenDialog(false);
      setEditingJob(null);
      resetForm();
      loadJobs();
      loadStats();
    } catch (error) {
      setError(error.response?.data?.message || 'Error actualizando job automático');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este job?')) return;
    
    try {
      setLoading(true);
      await backupService.deleteJob(jobId);
      setSuccess('Job eliminado exitosamente');
      loadJobs();
      loadStats();
    } catch (error) {
      setError('Error eliminando job');
    } finally {
      setLoading(false);
    }
  };

  const handleStartJob = async (jobId) => {
    try {
      await backupService.startJob(jobId);
      setSuccess('Job iniciado exitosamente');
      loadJobs();
    } catch (error) {
      setError('Error iniciando job');
    }
  };

  const handleStopJob = async (jobId) => {
    try {
      await backupService.stopJob(jobId);
      setSuccess('Job detenido exitosamente');
      loadJobs();
    } catch (error) {
      setError('Error deteniendo job');
    }
  };

  const handleExecuteJob = async (jobId) => {
    try {
      setLoading(true);
      await backupService.executeJob(jobId);
      setSuccess('Job ejecutado manualmente exitosamente');
    } catch (error) {
      setError('Error ejecutando job manualmente');
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingJob(null);
    resetForm();
    setOpenDialog(true);
  };

  const openEditDialog = (job) => {
    setEditingJob(job);
    setJobForm({
      name: job.name,
      schedule: job.schedule,
      server: job.server,
      database: job.database,
      user: job.user || '',
      password: job.password || '',
      backupPath: job.backupPath || './backups',
      retentionDays: job.retentionDays || 30
    });
    setOpenDialog(true);
  };

  const resetForm = () => {
    setJobForm({
      name: '',
      schedule: '',
      server: '',
      database: '',
      user: '',
      password: '',
      backupPath: './backups',
      retentionDays: 30
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'success';
      case 'stopped': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'running': return 'Ejecutándose';
      case 'stopped': return 'Detenido';
      case 'error': return 'Error';
      default: return 'Desconocido';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Jobs Automáticos de Backup
      </Typography>

      {/* Estadísticas */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total de Jobs
              </Typography>
              <Typography variant="h4">
                {stats.total || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Ejecutándose
              </Typography>
              <Typography variant="h4" color="success.main">
                {stats.running || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Detenidos
              </Typography>
              <Typography variant="h4" color="warning.main">
                {stats.stopped || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={openCreateDialog}
                fullWidth
              >
                Crear Job
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alertas */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Tabla de Jobs */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Programación</TableCell>
                <TableCell>Servidor</TableCell>
                <TableCell>Base de Datos</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Próxima Ejecución</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : jobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No hay jobs automáticos configurados
                  </TableCell>
                </TableRow>
              ) : (
                jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell>{job.name}</TableCell>
                    <TableCell>
                      <Chip
                        icon={<Schedule />}
                        label={job.schedule}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{job.server}</TableCell>
                    <TableCell>{job.database}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(job.status)}
                        color={getStatusColor(job.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {job.nextRun ? new Date(job.nextRun).toLocaleString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => job.status === 'running' ? handleStopJob(job.id) : handleStartJob(job.id)}
                        color={job.status === 'running' ? 'warning' : 'success'}
                        size="small"
                      >
                        {job.status === 'running' ? <Stop /> : <PlayArrow />}
                      </IconButton>
                      <IconButton
                        onClick={() => handleExecuteJob(job.id)}
                        color="primary"
                        size="small"
                      >
                        <Refresh />
                      </IconButton>
                      <IconButton
                        onClick={() => openEditDialog(job)}
                        color="info"
                        size="small"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeleteJob(job.id)}
                        color="error"
                        size="small"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialog para crear/editar job */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingJob ? 'Editar Job Automático' : 'Crear Job Automático'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nombre del Job"
                value={jobForm.name}
                onChange={(e) => setJobForm({ ...jobForm, name: e.target.value })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Programación (Cron)"
                value={jobForm.schedule}
                onChange={(e) => setJobForm({ ...jobForm, schedule: e.target.value })}
                margin="normal"
                placeholder="0 2 * * * (diario a las 2 AM)"
                helperText="Formato cron: minuto hora día mes día_semana"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Servidor"
                value={jobForm.server}
                onChange={(e) => setJobForm({ ...jobForm, server: e.target.value })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Base de Datos"
                value={jobForm.database}
                onChange={(e) => setJobForm({ ...jobForm, database: e.target.value })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Usuario"
                value={jobForm.user}
                onChange={(e) => setJobForm({ ...jobForm, user: e.target.value })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contraseña"
                type="password"
                value={jobForm.password}
                onChange={(e) => setJobForm({ ...jobForm, password: e.target.value })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Directorio de Backup"
                value={jobForm.backupPath}
                onChange={(e) => setJobForm({ ...jobForm, backupPath: e.target.value })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Días de Retención"
                type="number"
                value={jobForm.retentionDays}
                onChange={(e) => setJobForm({ ...jobForm, retentionDays: parseInt(e.target.value) })}
                margin="normal"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            Cancelar
          </Button>
          <Button
            onClick={editingJob ? handleUpdateJob : handleCreateJob}
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : (editingJob ? 'Actualizar' : 'Crear')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BackupJobs; 