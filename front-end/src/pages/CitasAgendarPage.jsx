import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Button,
  Alert,
  Snackbar,
  useTheme,
  useMediaQuery,
  Fade,
  Slide,
  Grow,
  Zoom
} from '@mui/material';
import {
  Person as PersonIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import BaseForm from '../Components/common/BaseForm';
import { FormTextField, FormSelectField, FormDateField } from '../Components/common/FormFields';
import { appointmentSchema } from '../services/validationSchemas';
import { 
  fetchPatients, 
  fetchDoctors, 
  createAppointment,
  clearError 
} from '../redux/appointments/appointmentsSlice';

function CitasAgendarPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { patients, doctors, status, error } = useSelector(state => state.appointments);
  
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [stepValidation, setStepValidation] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [direction, setDirection] = useState('right');

  // Datos para los selectores
  const mockAppointmentTypes = [
    { value: 1, label: 'Consulta General' },
    { value: 2, label: 'Revisión' },
    { value: 3, label: 'Emergencia' },
  ];

  const mockAppointmentStates = [
    { value: 1, label: 'Pendiente' },
    { value: 2, label: 'Confirmada' },
    { value: 3, label: 'Cancelada' },
    { value: 4, label: 'Completada' },
  ];

  const steps = [
    { 
      label: 'Paciente y Médico', 
      icon: <PersonIcon />,
      validation: ['patientId', 'doctorId']
    },
    { 
      label: 'Fecha y Hora', 
      icon: <ScheduleIcon />,
      validation: ['start', 'startTime']
    },
    { 
      label: 'Detalles', 
      icon: <DescriptionIcon />,
      validation: ['title', 'tipo_cita', 'status']
    },
    { 
      label: 'Confirmación', 
      icon: <CheckIcon />,
      validation: []
    }
  ];

  // Cargar datos al montar el componente
  useEffect(() => {
    dispatch(fetchPatients());
    dispatch(fetchDoctors());
  }, [dispatch]);

  // Cargar progreso guardado al iniciar
  useEffect(() => {
    const savedData = localStorage.getItem('appointmentFormProgress');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData(parsedData);
      } catch (error) {
        console.error('Error al cargar progreso guardado:', error);
      }
    }
  }, []);

  // Guardar progreso automáticamente
  useEffect(() => {
    if (Object.keys(formData).length > 0) {
      localStorage.setItem('appointmentFormProgress', JSON.stringify(formData));
    }
  }, [formData]);

  // Limpiar error cuando cambia
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // Validación específica por paso
  const validateStep = (stepIndex) => {
    const step = steps[stepIndex];
    const stepData = {};
    
    step.validation.forEach(field => {
      if (formData[field]) {
        stepData[field] = formData[field];
      }
    });

    try {
      if (stepIndex === 0) {
        if (!stepData.patientId || !stepData.doctorId) {
          return false;
        }
      } else if (stepIndex === 1) {
        if (!stepData.start || !stepData.startTime) {
          return false;
        }
      } else if (stepIndex === 2) {
        if (!stepData.title || !stepData.tipo_cita) {
          return false;
        }
      }
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleNext = async () => {
    if (validateStep(activeStep)) {
      setDirection('right');
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
      setStepValidation(prev => ({ ...prev, [activeStep]: true }));
    } else {
      setStepValidation(prev => ({ ...prev, [activeStep]: false }));
    }
  };

  const handleBack = () => {
    setDirection('left');
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleFormDataChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (data) => {
    setIsLoading(true);
    try {
      await dispatch(createAppointment(data)).unwrap();
      
      // Limpiar progreso guardado al completar
      localStorage.removeItem('appointmentFormProgress');
      
      setShowSuccessNotification(true);
      
      // Redirigir al calendario después de 2 segundos
      setTimeout(() => {
        navigate('/calendario');
      }, 2000);
      
      return { success: true, message: 'Cita agendada exitosamente' };
    } catch (error) {
      console.error('Error al agendar cita:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = (step) => {
    const animationProps = {
      in: true,
      timeout: 600,
      mountOnEnter: true,
      unmountOnExit: true
    };

    switch (step) {
      case 0:
        return (
          <Slide direction={direction} {...animationProps}>
            <Card sx={{ 
              borderRadius: 3,
              background: 'white',
              border: '1px solid',
              borderColor: stepValidation[step] === false ? 'error.main' : 'grey.200',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease-in-out'
            }}>
              <CardContent sx={{ p: 4 }}>
                <Zoom in={true} timeout={800}>
                  <Typography variant="h6" sx={{ 
                    color: 'black', 
                    mb: 3, 
                    display: 'flex', 
                    alignItems: 'center',
                    fontSize: '1.25rem',
                    fontWeight: 600
                  }}>
                    <PersonIcon sx={{ mr: 2, fontSize: '1.5rem', color: 'primary.main' }} />
                    Información del Paciente y Médico
                  </Typography>
                </Zoom>
                <Divider sx={{ mb: 4, opacity: 0.3 }} />
                
                {stepValidation[step] === false && (
                  <Grow in={true} timeout={500}>
                    <Alert severity="error" sx={{ mb: 3 }}>
                      Por favor complete todos los campos requeridos
                    </Alert>
                  </Grow>
                )}
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Fade in={true} timeout={1000}>
                      <FormSelectField
                        name="patientId"
                        label="Paciente"
                        options={patients}
                        required
                        value={formData.patientId || ''}
                        onChange={(e) => handleFormDataChange('patientId', e.target.value)}
                        disabled={status === 'loading'}
                      />
                    </Fade>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Fade in={true} timeout={1200}>
                      <FormSelectField
                        name="doctorId"
                        label="Médico"
                        options={doctors}
                        required
                        value={formData.doctorId || ''}
                        onChange={(e) => handleFormDataChange('doctorId', e.target.value)}
                        disabled={status === 'loading'}
                      />
                    </Fade>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Slide>
        );

      case 1:
        return (
          <Slide direction={direction} {...animationProps}>
            <Card sx={{ 
              borderRadius: 3,
              background: 'white',
              border: '1px solid',
              borderColor: stepValidation[step] === false ? 'error.main' : 'grey.200',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease-in-out'
            }}>
              <CardContent sx={{ p: 4 }}>
                <Zoom in={true} timeout={800}>
                  <Typography variant="h6" sx={{ 
                    color: 'black', 
                    mb: 3, 
                    display: 'flex', 
                    alignItems: 'center',
                    fontSize: '1.25rem',
                    fontWeight: 600
                  }}>
                    <ScheduleIcon sx={{ mr: 2, fontSize: '1.5rem', color: 'primary.main' }} />
                    Fecha y Hora de la Cita
                  </Typography>
                </Zoom>
                <Divider sx={{ mb: 4, opacity: 0.3 }} />
                
                {stepValidation[step] === false && (
                  <Grow in={true} timeout={500}>
                    <Alert severity="error" sx={{ mb: 3 }}>
                      Por favor seleccione fecha y hora
                    </Alert>
                  </Grow>
                )}
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Fade in={true} timeout={1000}>
                      <FormDateField
                        name="start"
                        label="Fecha de la Cita"
                        required
                        value={formData.start || ''}
                        onChange={(e) => handleFormDataChange('start', e.target.value)}
                      />
                    </Fade>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Fade in={true} timeout={1200}>
                      <FormTextField
                        name="startTime"
                        label="Hora de la Cita"
                        type="time"
                        required
                        InputLabelProps={{
                          shrink: true,
                        }}
                        value={formData.startTime || ''}
                        onChange={(e) => handleFormDataChange('startTime', e.target.value)}
                      />
                    </Fade>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Slide>
        );

      case 2:
        return (
          <Slide direction={direction} {...animationProps}>
            <Card sx={{ 
              borderRadius: 3,
              background: 'white',
              border: '1px solid',
              borderColor: stepValidation[step] === false ? 'error.main' : 'grey.200',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease-in-out'
            }}>
              <CardContent sx={{ p: 4 }}>
                <Zoom in={true} timeout={800}>
                  <Typography variant="h6" sx={{ 
                    color: 'black', 
                    mb: 3, 
                    display: 'flex', 
                    alignItems: 'center',
                    fontSize: '1.25rem',
                    fontWeight: 600
                  }}>
                    <DescriptionIcon sx={{ mr: 2, fontSize: '1.5rem', color: 'primary.main' }} />
                    Detalles de la Cita
                  </Typography>
                </Zoom>
                <Divider sx={{ mb: 4, opacity: 0.3 }} />
                
                {stepValidation[step] === false && (
                  <Grow in={true} timeout={500}>
                    <Alert severity="error" sx={{ mb: 3 }}>
                      Por favor complete los detalles de la cita
                    </Alert>
                  </Grow>
                )}
                
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Fade in={true} timeout={1000}>
                      <FormTextField
                        name="title"
                        label="Motivo de la Cita"
                        multiline
                        rows={3}
                        required
                        placeholder="Describa el motivo de la consulta"
                        value={formData.title || ''}
                        onChange={(e) => handleFormDataChange('title', e.target.value)}
                      />
                    </Fade>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Fade in={true} timeout={1200}>
                      <FormSelectField
                        name="tipo_cita"
                        label="Tipo de Cita"
                        options={mockAppointmentTypes}
                        required
                        value={formData.tipo_cita || ''}
                        onChange={(e) => handleFormDataChange('tipo_cita', e.target.value)}
                      />
                    </Fade>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Fade in={true} timeout={1400}>
                      <FormSelectField
                        name="status"
                        label="Estado"
                        options={mockAppointmentStates}
                        required
                        value={formData.status || ''}
                        onChange={(e) => handleFormDataChange('status', e.target.value)}
                      />
                    </Fade>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Slide>
        );

      case 3:
        return (
          <Slide direction={direction} {...animationProps}>
            <Card sx={{ 
              borderRadius: 3,
              background: 'white',
              border: '1px solid',
              borderColor: 'grey.200',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease-in-out'
            }}>
              <CardContent sx={{ p: 4 }}>
                <Zoom in={true} timeout={800}>
                  <Typography variant="h6" sx={{ 
                    color: 'black', 
                    mb: 3, 
                    display: 'flex', 
                    alignItems: 'center',
                    fontSize: '1.25rem',
                    fontWeight: 600
                  }}>
                    <CheckIcon sx={{ mr: 2, fontSize: '1.5rem', color: 'primary.main' }} />
                    Información Importante
                  </Typography>
                </Zoom>
                <Divider sx={{ mb: 4, opacity: 0.3 }} />
                
                <Fade in={true} timeout={1000}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontSize: '1rem' }}>
                    💡 <strong>Consejos para una cita exitosa:</strong>
                  </Typography>
                </Fade>
                
                <Fade in={true} timeout={1200}>
                  <Box component="ul" sx={{ 
                    pl: 3, 
                    color: 'text.secondary',
                    '& li': {
                      mb: 1,
                      fontSize: '0.95rem',
                      lineHeight: 1.6
                    }
                  }}>
                    <li>Llegue 15 minutos antes de su cita</li>
                    <li>Traiga su identificación y documentos médicos relevantes</li>
                    <li>Si no puede asistir, cancele con al menos 24 horas de anticipación</li>
                    <li>Para emergencias, contacte directamente al médico</li>
                  </Box>
                </Fade>
              </CardContent>
            </Card>
          </Slide>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <BaseForm
        title="Agendar Cita"
        subtitle="Programa una nueva cita médica"
        validationSchema={appointmentSchema}
        formType="appointment"
        onSubmit={handleSubmit}
        requiredPermissions={['write:appointments']}
        maxWidth="lg"
      >
        {/* Stepper */}
        <Box sx={{ mb: 4 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel 
                  icon={step.icon}
                  sx={{
                    '& .MuiStepLabel-label': {
                      color: 'black',
                      fontWeight: 500
                    }
                  }}
                >
                  {step.label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Contenido del paso actual */}
        <Box sx={{ mb: 4 }}>
          {renderStepContent(activeStep)}
        </Box>

        {/* Botones de navegación */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<ArrowBackIcon />}
            variant="outlined"
            sx={{
              borderColor: 'primary.300',
              color: 'primary.main',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'primary.50',
              },
            }}
          >
            Anterior
          </Button>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              startIcon={<SaveIcon />}
              variant="outlined"
              onClick={() => {
                localStorage.setItem('appointmentFormProgress', JSON.stringify(formData));
                setShowSaveNotification(true);
              }}
              sx={{
                borderColor: 'success.300',
                color: 'success.main',
                '&:hover': {
                  borderColor: 'success.main',
                  backgroundColor: 'success.50',
                },
              }}
            >
              Guardar
            </Button>
            
            {activeStep === steps.length - 1 ? (
              <LoadingButton
                loading={isLoading}
                variant="contained"
                onClick={() => handleSubmit(formData)}
                endIcon={<CheckIcon />}
                sx={{
                  backgroundColor: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  boxShadow: '0 4px 14px 0 rgba(236, 72, 153, 0.25)',
                }}
              >
                Agendar Cita
              </LoadingButton>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  backgroundColor: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  boxShadow: '0 4px 14px 0 rgba(236, 72, 153, 0.25)',
                }}
              >
                Siguiente
              </Button>
            )}
          </Box>
        </Box>

        {/* Notificación de guardado */}
        <Snackbar
          open={showSaveNotification}
          autoHideDuration={2000}
          onClose={() => setShowSaveNotification(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => setShowSaveNotification(false)} 
            severity="success" 
            sx={{ width: '100%' }}
          >
            Progreso guardado automáticamente
          </Alert>
        </Snackbar>

        {/* Notificación de éxito */}
        <Snackbar
          open={showSuccessNotification}
          autoHideDuration={3000}
          onClose={() => setShowSuccessNotification(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setShowSuccessNotification(false)} 
            severity="success" 
            sx={{ width: '100%' }}
          >
            ¡Cita agendada exitosamente! Redirigiendo al calendario...
          </Alert>
        </Snackbar>

        {/* Notificación de error */}
        <Snackbar
          open={!!error}
          autoHideDuration={5000}
          onClose={() => dispatch(clearError())}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => dispatch(clearError())} 
            severity="error" 
            sx={{ width: '100%' }}
          >
            {error}
          </Alert>
        </Snackbar>
      </BaseForm>
    </Container>
  );
}

export default CitasAgendarPage;
