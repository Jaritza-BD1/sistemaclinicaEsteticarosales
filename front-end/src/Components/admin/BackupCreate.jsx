import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Divider
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Folder as FolderIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { backupService } from '../../services/backupService';

const BackupCreate = () => {
  const [connectionConfig, setConnectionConfig] = useState({
    server: '(local)',
    database: 'master',
    user: 'sa',
    password: ''
  });

  const [backupConfig, setBackupConfig] = useState({
    backupPath: 'J:\\PT-DB-Backup-Test',
    fileName: `master-full-backup-${new Date().toISOString().split('T')[0]}`
  });

  const [databaseInfo, setDatabaseInfo] = useState({
    name: '',
    totalSize: '',
    unallocatedSpace: ''
  });

  const [status, setStatus] = useState({
    connection: { success: false, message: '', loading: false },
    backup: { success: false, message: '', loading: false }
  });

  // Probar conexión
  const testConnection = async () => {
    setStatus(prev => ({
      ...prev,
      connection: { ...prev.connection, loading: true, message: '' }
    }));

    try {
      const response = await backupService.testConnection(connectionConfig);
      setStatus(prev => ({
        ...prev,
        connection: { 
          success: true, 
          message: 'Conexión establecida exitosamente.', 
          loading: false 
        }
      }));
      
      // Obtener información de la base de datos
      if (response.databaseInfo) {
        setDatabaseInfo(response.databaseInfo);
      }
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        connection: { 
          success: false, 
          message: error.message || 'Error al conectar con la base de datos', 
          loading: false 
        }
      }));
    }
  };

  // Crear backup
  const createBackup = async () => {
    if (!status.connection.success) {
      setStatus(prev => ({
        ...prev,
        backup: { 
          success: false, 
          message: 'Debe probar la conexión primero', 
          loading: false 
        }
      }));
      return;
    }

    setStatus(prev => ({
      ...prev,
      backup: { ...prev.backup, loading: true, message: '' }
    }));

    try {
      await backupService.createBackup({
        ...connectionConfig,
        ...backupConfig
      });
      
      setStatus(prev => ({
        ...prev,
        backup: { 
          success: true, 
          message: 'Backup creado exitosamente', 
          loading: false 
        }
      }));
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        backup: { 
          success: false, 
          message: error.message || 'Error al crear el backup', 
          loading: false 
        }
      }));
    }
  };

  // Seleccionar directorio
  const selectDirectory = () => {
    // Implementar lógica para seleccionar directorio
    console.log('Seleccionar directorio');
  };

  return (
    <Grid container spacing={3}>
      {/* Sección Izquierda: Configuración de Conexión */}
      <Grid item xs={12} md={6}>
        <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 3 }}>
            Configuración de la Conexión
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Servidor"
              value={connectionConfig.server}
              onChange={(e) => setConnectionConfig(prev => ({ ...prev, server: e.target.value }))}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Base de datos"
              value={connectionConfig.database}
              onChange={(e) => setConnectionConfig(prev => ({ ...prev, database: e.target.value }))}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Usuario"
              value={connectionConfig.user}
              onChange={(e) => setConnectionConfig(prev => ({ ...prev, user: e.target.value }))}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Contraseña"
              type="password"
              value={connectionConfig.password}
              onChange={(e) => setConnectionConfig(prev => ({ ...prev, password: e.target.value }))}
              sx={{ mb: 3 }}
            />
            
            <Button
              variant="contained"
              onClick={testConnection}
              disabled={status.connection.loading}
              startIcon={status.connection.loading ? <CircularProgress size={20} /> : <RefreshIcon />}
              sx={{ mb: 2 }}
            >
              Probar conexión
            </Button>
            
            {status.connection.message && (
              <Alert 
                severity={status.connection.success ? 'success' : 'error'}
                icon={status.connection.success ? <CheckCircleIcon /> : <ErrorIcon />}
                sx={{ mt: 2 }}
              >
                {status.connection.message}
              </Alert>
            )}
          </Box>
        </Paper>
      </Grid>

      {/* Sección Derecha: Información y Configuración del Backup */}
      <Grid item xs={12} md={6}>
        <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 3 }}>
            Información de la Base de Datos y Configuración del Backup
          </Typography>
          
          {/* Información de la BD */}
          {databaseInfo.name && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="success.main" gutterBottom>
                Nombre: {databaseInfo.name}
              </Typography>
              <Typography variant="subtitle2" color="success.main" gutterBottom>
                Tamaño total: {databaseInfo.totalSize}
              </Typography>
              <Typography variant="subtitle2" color="success.main" gutterBottom>
                Espacio no asignado: {databaseInfo.unallocatedSpace}
              </Typography>
            </Box>
          )}
          
          <Divider sx={{ my: 2 }} />
          
          {/* Configuración del backup */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Respaldar en"
              value={backupConfig.backupPath}
              onChange={(e) => setBackupConfig(prev => ({ ...prev, backupPath: e.target.value }))}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={selectDirectory}>
                      <FolderIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Nombre del archivo"
              value={backupConfig.fileName}
              onChange={(e) => setBackupConfig(prev => ({ ...prev, fileName: e.target.value }))}
              sx={{ mb: 3 }}
            />
            
            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              onClick={createBackup}
              disabled={!status.connection.success || status.backup.loading}
              startIcon={
                status.backup.loading ? 
                <CircularProgress size={20} /> : 
                <CloudUploadIcon />
              }
            >
              Respaldar
            </Button>
            
            {status.backup.message && (
              <Alert 
                severity={status.backup.success ? 'success' : 'error'}
                sx={{ mt: 2 }}
              >
                {status.backup.message}
              </Alert>
            )}
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default BackupCreate; 