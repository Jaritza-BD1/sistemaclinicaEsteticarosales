import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import {
  Restore as RestoreIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Folder as FolderIcon,
  ExitToApp as ExitIcon
} from '@mui/icons-material';
import { backupService } from '../../services/backupService';

const BackupRestore = () => {
  const [restoreConfig, setRestoreConfig] = useState({
    server: 'CRISTIAN',
    database: 'Farmacia',
    backupFile: 'D:\\DEMO.bak'
  });

  const [availableServers, setAvailableServers] = useState([]);
  const [availableDatabases, setAvailableDatabases] = useState([]);
  const [status, setStatus] = useState({
    loading: false,
    success: false,
    message: ''
  });

  // Cargar servidores disponibles
  useEffect(() => {
    loadAvailableServers();
  }, []);

  // Cargar bases de datos cuando cambie el servidor
  useEffect(() => {
    if (restoreConfig.server) {
      loadAvailableDatabases(restoreConfig.server);
    }
  }, [restoreConfig.server]);

  const loadAvailableServers = async () => {
    try {
      const servers = await backupService.getAvailableServers();
      setAvailableServers(servers);
    } catch (error) {
      console.error('Error cargando servidores:', error);
    }
  };

  const loadAvailableDatabases = async (server) => {
    try {
      const databases = await backupService.getAvailableDatabases(server);
      setAvailableDatabases(databases);
    } catch (error) {
      console.error('Error cargando bases de datos:', error);
    }
  };

  // Seleccionar archivo de backup
  const selectBackupFile = () => {
    // Implementar lógica para seleccionar archivo .bak
    console.log('Seleccionar archivo de backup');
  };

  // Restaurar backup
  const restoreBackup = async () => {
    if (!restoreConfig.backupFile) {
      setStatus({
        loading: false,
        success: false,
        message: 'Debe seleccionar un archivo de backup'
      });
      return;
    }

    setStatus({
      loading: true,
      success: false,
      message: ''
    });

    try {
      await backupService.restoreBackup(restoreConfig);
      setStatus({
        loading: false,
        success: true,
        message: 'Backup restaurado exitosamente'
      });
    } catch (error) {
      setStatus({
        loading: false,
        success: false,
        message: error.message || 'Error al restaurar el backup'
      });
    }
  };

  // Salir del módulo
  const handleExit = () => {
    // Implementar lógica para salir
    console.log('Salir del módulo de backup');
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 3 }}>
        Restaurar
      </Typography>

      <Paper elevation={2} sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Servidor Local</InputLabel>
              <Select
                value={restoreConfig.server}
                onChange={(e) => setRestoreConfig(prev => ({ ...prev, server: e.target.value }))}
                label="Servidor Local"
              >
                {availableServers.map((server) => (
                  <MenuItem key={server} value={server}>
                    {server}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Base de Datos</InputLabel>
              <Select
                value={restoreConfig.database}
                onChange={(e) => setRestoreConfig(prev => ({ ...prev, database: e.target.value }))}
                label="Base de Datos"
              >
                {availableDatabases.map((db) => (
                  <MenuItem key={db} value={db}>
                    {db}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Directorio"
              value={restoreConfig.backupFile}
              onChange={(e) => setRestoreConfig(prev => ({ ...prev, backupFile: e.target.value }))}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={selectBackupFile}>
                      <FolderIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />
          </Grid>
        </Grid>

        {/* Botones de acción */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={handleExit}
            startIcon={<ExitIcon />}
          >
            Salir
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            onClick={restoreBackup}
            disabled={status.loading || !restoreConfig.backupFile}
            startIcon={
              status.loading ? 
              <CircularProgress size={20} /> : 
              <RestoreIcon />
            }
          >
            Restaurar
          </Button>
        </Box>

        {/* Mensajes de estado */}
        {status.message && (
          <Alert 
            severity={status.success ? 'success' : 'error'}
            icon={status.success ? <CheckCircleIcon /> : <ErrorIcon />}
            sx={{ mt: 2 }}
          >
            {status.message}
          </Alert>
        )}
      </Paper>
    </Box>
  );
};

export default BackupRestore; 