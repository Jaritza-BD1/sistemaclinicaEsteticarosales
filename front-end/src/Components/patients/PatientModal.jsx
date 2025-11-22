import React from 'react';
import {
  Typography,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Grid,
  Card,
  CardContent,
  Chip,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Description as DescriptionIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Badge as BadgeIcon,
  Close as CloseIcon,
  Print as PrintIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';

// Componente para el Modal de Ver Detalles del Paciente
const PatientDetailsModal = ({ open, onClose, patient, onEditPatient }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (!patient) return null;

  const handleGenerateReport = () => {
    console.log(`Generando reporte para el paciente: ${patient.nombre} ${patient.apellido}`);
    // Aquí podrías integrar una API de generación de PDF
  };

  const handleScheduleAppointment = () => {
    console.log(`Agendando cita para: ${patient.nombre} ${patient.apellido}`);
    // Aquí podrías abrir un modal de agendar cita
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'activo': return 'success';
      case 'inactivo': return 'error';
      case 'pendiente': return 'warning';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'activo': return 'Activo';
      case 'inactivo': return 'Inactivo';
      case 'pendiente': return 'Pendiente';
      default: return 'Activo';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 3,
          backgroundColor: 'background.paper',
          color: 'accent.main',
          border: '1px solid',
          borderColor: 'brand.paleL2',
          minHeight: isMobile ? '100vh' : 'auto',
          maxHeight: isMobile ? '100vh' : '90vh',
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{ 
        color: 'primary.main', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        pb: 1,
        borderBottom: '1px solid',
        borderColor: 'primary.200',
        backgroundColor: 'background.paper'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PersonIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Detalles del Paciente: {patient.nombre} {patient.apellido}
          </Typography>
        </Box>
        <IconButton 
          onClick={onClose} 
          sx={{ 
            color: 'primary.main',
            '&:hover': {
              backgroundColor: 'primary.50',
              transform: 'scale(1.1)',
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent 
        dividers 
        sx={{ 
          p: 3,
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'brand.pale',
            borderRadius: '4px',
            '&:hover': {
              background: 'brand.paleDark',
            },
          },
        }}
      >
        <Grid container spacing={3}>
          {/* Información Personal */}
          <Grid item xs={12} md={6}>
            <Card sx={{ 
                borderRadius: 2,
                backgroundColor: 'background.paper',
                border: '1px solid',
                borderColor: 'brand.paleL2'
              }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: 'primary.main', mb: 2, display: 'flex', alignItems: 'center' }}>
                  <PersonIcon sx={{ mr: 1 }} />
                  Información Personal
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Nombre Completo
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      {patient.nombre} {patient.apellido}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Número de Identidad
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'medium', fontFamily: 'monospace' }}>
                      {patient.identidad || 'No especificado'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Número de Expediente
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'medium', fontFamily: 'monospace' }}>
                      {patient.numero_expediente || 'No especificado'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Fecha de Nacimiento
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'medium', display: 'flex', alignItems: 'center' }}>
                      <CalendarIcon sx={{ mr: 1, fontSize: 'small' }} />
                      {patient.fecha_nacimiento || 'No especificada'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Género
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'medium', display: 'flex', alignItems: 'center' }}>
                      <BadgeIcon sx={{ mr: 1, fontSize: 'small' }} />
                      {patient.genero || 'No especificado'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Estado
                    </Typography>
                    <Chip 
                      label={getStatusText(patient.estado)}
                      color={getStatusColor(patient.estado)}
                      size="small"
                      sx={{ fontWeight: 'medium' }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Información de Contacto */}
          <Grid item xs={12} md={6}>
            <Card sx={{ 
                borderRadius: 2,
                backgroundColor: 'background.paper',
                border: '1px solid',
                borderColor: 'brand.paleL2'
              }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: 'primary.main', mb: 2, display: 'flex', alignItems: 'center' }}>
                  <PhoneIcon sx={{ mr: 1 }} />
                  Información de Contacto
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Teléfono
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'medium', display: 'flex', alignItems: 'center' }}>
                      <PhoneIcon sx={{ mr: 1, fontSize: 'small' }} />
                      {patient.telefono || 'No especificado'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Correo Electrónico
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'medium', display: 'flex', alignItems: 'center' }}>
                      <EmailIcon sx={{ mr: 1, fontSize: 'small' }} />
                      {patient.correo || 'No especificado'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Dirección
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'medium', display: 'flex', alignItems: 'center' }}>
                      <HomeIcon sx={{ mr: 1, fontSize: 'small' }} />
                      {patient.direccion || 'No especificada'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Información Médica */}
          {(patient.alergias || patient.antecedentes || patient.medicamentos) && (
            <Grid item xs={12}>
              <Card sx={{ 
                borderRadius: 2,
                backgroundColor: 'background.paper',
                border: '1px solid',
                borderColor: 'brand.paleL2'
              }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: 'primary.main', mb: 2, display: 'flex', alignItems: 'center' }}>
                    <DescriptionIcon sx={{ mr: 1 }} />
                    Información Médica
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  <Grid container spacing={3}>
                    {patient.alergias && (
                      <Grid item xs={12} md={4}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Alergias
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {patient.alergias.map((alergia, index) => (
                            <Chip 
                              key={index}
                              label={alergia} 
                              size="small" 
                              color="warning"
                              sx={{ fontWeight: 'medium' }}
                            />
                          ))}
                        </Box>
                      </Grid>
                    )}
                    
                    {patient.antecedentes && (
                      <Grid item xs={12} md={4}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Antecedentes Médicos
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {patient.antecedentes}
                        </Typography>
                      </Grid>
                    )}
                    
                    {patient.medicamentos && (
                      <Grid item xs={12} md={4}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Medicamentos Actuales
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {patient.medicamentos.map((medicamento, index) => (
                            <Chip 
                              key={index}
                              label={medicamento} 
                              size="small" 
                              color="info"
                              sx={{ fontWeight: 'medium' }}
                            />
                          ))}
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Información Adicional */}
          {patient.observaciones && (
            <Grid item xs={12}>
              <Card sx={{ 
                borderRadius: 2,
                backgroundColor: 'background.paper',
                border: '1px solid',
                borderColor: 'brand.paleL2'
              }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: 'primary.main', mb: 2 }}>
                    Observaciones
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                    {patient.observaciones}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ 
        p: 3, 
        pt: 1,
        borderTop: '1px solid',
        borderColor: 'brand.paleL2',
        backgroundColor: 'background.paper',
        color: 'accent.main',
        flexWrap: 'wrap',
        gap: 1
      }}>
        <Button
          variant="outlined"
          startIcon={<DescriptionIcon />}
          onClick={handleGenerateReport}
          sx={{
            borderColor: 'primary.300',
            color: 'primary.main',
            '&:hover': {
              borderColor: 'primary.main',
              backgroundColor: 'primary.50',
            },
          }}
        >
          Generar Reporte
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<ScheduleIcon />}
          onClick={handleScheduleAppointment}
          sx={{
            borderColor: 'info.300',
            color: 'info.main',
            '&:hover': {
              borderColor: 'info.main',
              backgroundColor: 'info.50',
            },
          }}
        >
          Agendar Cita
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={() => { onEditPatient(patient); onClose(); }}
          sx={{
            borderColor: 'warning.300',
            color: 'warning.main',
            '&:hover': {
              borderColor: 'warning.main',
              backgroundColor: 'warning.50',
            },
          }}
        >
          Editar Paciente
        </Button>
        
        <Button
          variant="contained"
          onClick={onClose}
          sx={{
            backgroundColor: 'brand.pale',
            color: 'accent.main',
            '&:hover': {
              backgroundColor: 'brand.paleDark',
              transform: 'translateY(-1px)',
            },
            boxShadow: '0 4px 14px 0 rgba(33,40,69,0.06)',
          }}
        >
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PatientDetailsModal;
