import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
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
  Fade,
  Slide,
  Grow,
  Zoom,
  CircularProgress,
  Skeleton,
  Backdrop
} from '@mui/material';
import {
  Science as ScienceIcon,
  Person as PersonIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import BaseForm from '../common/BaseForm';
import { FormTextField, FormSelectField, FormDateField, FormDynamicFields } from '../common/FormFields';
import { createExam, clearError } from '../../redux/exams/examsSlice';
import { getActivePatients } from '../../redux/patients/patientsSlice';
import { getActiveDoctors } from '../../redux/doctors/doctorsSlice';

// Componente de carga optimizado
const LoadingStep = () => (
  <Card sx={{ 
    borderRadius: 3,
    background: 'white',
    border: '1px solid',
    borderColor: 'grey.200',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  }}>
    <CardContent sx={{ p: 4 }}>
      <Skeleton variant="text" width="60%" height={40} sx={{ mb: 3 }} />
      <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
      <Skeleton variant="text" width="80%" />
      <Skeleton variant="text" width="60%" />
    </CardContent>
  </Card>
);

function CreateExam() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector(state => state.exams);
  const { activePatients } = useSelector(state => state.patients);
  const { activeDoctors } = useSelector(state => state.doctors);
  
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [stepValidation, setStepValidation] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [direction, setDirection] = useState('right');
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Cargar datos necesarios
  useEffect(() => {
    dispatch(getActivePatients());
    dispatch(getActiveDoctors());
  }, [dispatch]);

  // Datos para selectores
  const mockExams = useMemo(() => [
    { value: 'Análisis de Sangre Completo', label: 'Análisis de Sangre Completo' },
    { value: 'Examen de Orina', label: 'Examen de Orina' },
    { value: 'Radiografía de Tórax', label: 'Radiografía de Tórax' },
    { value: 'Resonancia Magnética', label: 'Resonancia Magnética' },
    { value: 'Electrocardiograma', label: 'Electrocardiograma' },
    { value: 'Ecografía Abdominal', label: 'Ecografía Abdominal' },
    { value: 'Tomografía Computarizada', label: 'Tomografía Computarizada' },
    { value: 'Endoscopia', label: 'Endoscopia' },
    { value: 'Biopsia', label: 'Biopsia' },
    { value: 'Prueba de Esfuerzo', label: 'Prueba de Esfuerzo' }
  ], []);

  const prioridades = useMemo(() => [
    { value: 'baja', label: 'Baja' },
    { value: 'normal', label: 'Normal' },
    { value: 'alta', label: 'Alta' },
    { value: 'urgente', label: 'Urgente' }
  ], []);

  const steps = useMemo(() => [
    { 
      label: 'Paciente y Médico', 
      icon: <PersonIcon />,
      validation: ['patientId', 'doctorId', 'examType', 'examName']
    },
    { 
      label: 'Detalles del Examen', 
      icon: <ScienceIcon />,
      validation: ['scheduledDate', 'priority']
    },
    { 
      label: 'Observaciones Generales', 
      icon: <DescriptionIcon />,
      validation: []
    },
    { 
      label: 'Información Importante', 
      icon: <CheckIcon />,
      validation: []
    }
  ], []);

  // Cargar progreso guardado al iniciar
  useEffect(() => {
    const loadSavedProgress = async () => {
      try {
        const savedData = localStorage.getItem('examFormProgress');
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          setFormData(parsedData);
        }
        setIsDataLoaded(true);
      } catch (error) {
        console.error('Error al cargar progreso guardado:', error);
        setIsDataLoaded(true);
      }
    };

    loadSavedProgress();
  }, []);

  // Guardar progreso automáticamente
  useEffect(() => {
    if (Object.keys(formData).length > 0 && isDataLoaded) {
      localStorage.setItem('examFormProgress', JSON.stringify(formData));
    }
  }, [formData, isDataLoaded]);

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
  const validateStep = useCallback((stepIndex) => {
    const step = steps[stepIndex];
    const stepData = {};
    
    step.validation.forEach(field => {
      if (formData[field]) {
        stepData[field] = formData[field];
      }
    });

    try {
      if (stepIndex === 0) {
        if (!stepData.patientId || !stepData.doctorId || !stepData.examType || !stepData.examName) {
          return false;
        }
      } else if (stepIndex === 1) {
        if (!stepData.scheduledDate || !stepData.priority) {
          return false;
        }
      }
      return true;
    } catch (error) {
      return false;
    }
  }, [formData, steps]);

  const handleNext = useCallback(() => {
    if (validateStep(activeStep)) {
      setDirection('right');
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
      setStepValidation(prev => ({ ...prev, [activeStep]: true }));
    } else {
      setStepValidation(prev => ({ ...prev, [activeStep]: false }));
    }
  }, [activeStep, validateStep]);

  const handleBack = useCallback(() => {
    setDirection('left');
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  }, []);

  const handleFormDataChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleSubmit = useCallback(async (data) => {
    try {
      await dispatch(createExam(data)).unwrap();
      
      // Limpiar progreso guardado al completar
      localStorage.removeItem('examFormProgress');
      
      setShowSuccessNotification(true);
      
      // Redirigir a la lista de exámenes después de 2 segundos
      setTimeout(() => {
        navigate('/examenes/lista');
      }, 2000);
      
      return { success: true, message: 'Examen solicitado exitosamente' };
    } catch (error) {
      console.error('Error al solicitar examen:', error);
      throw error;
    }
  }, [dispatch, navigate]);

  // Componente de paso memoizado
  const StepContent = useMemo(() => {
    const animationProps = {
      in: true,
      timeout: 600,
      mountOnEnter: true,
      unmountOnExit: true
    };

    switch (activeStep) {
      case 0:
        return (
          <Slide direction={direction} {...animationProps}>
            <Card sx={{ 
              borderRadius: 3,
              background: 'white',
              border: '1px solid',
              borderColor: stepValidation[activeStep] === false ? 'error.main' : 'grey.200',
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
                
                {stepValidation[activeStep] === false && (
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
                        options={activePatients}
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
                        label="Médico Solicitante"
                        options={activeDoctors}
                        required
                        value={formData.doctorId || ''}
                        onChange={(e) => handleFormDataChange('doctorId', e.target.value)}
                        disabled={status === 'loading'}
                      />
                    </Fade>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Fade in={true} timeout={1400}>
                      <FormSelectField
                        name="examType"
                        label="Tipo de Examen"
                        options={mockExams}
                        required
                        value={formData.examType || ''}
                        onChange={(e) => handleFormDataChange('examType', e.target.value)}
                      />
                    </Fade>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Fade in={true} timeout={1600}>
                      <FormTextField
                        name="examName"
                        label="Nombre del Examen"
                        required
                        value={formData.examName || ''}
                        onChange={(e) => handleFormDataChange('examName', e.target.value)}
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
              borderColor: stepValidation[activeStep] === false ? 'error.main' : 'grey.200',
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
                    <ScienceIcon sx={{ mr: 2, fontSize: '1.5rem', color: 'primary.main' }} />
                    Detalles del Examen
                  </Typography>
                </Zoom>
                <Divider sx={{ mb: 4, opacity: 0.3 }} />
                
                {stepValidation[activeStep] === false && (
                  <Grow in={true} timeout={500}>
                    <Alert severity="error" sx={{ mb: 3 }}>
                      Por favor complete todos los campos requeridos
                    </Alert>
                  </Grow>
                )}
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Fade in={true} timeout={1000}>
                      <FormDateField
                        name="scheduledDate"
                        label="Fecha Programada"
                        required
                        value={formData.scheduledDate || ''}
                        onChange={(e) => handleFormDataChange('scheduledDate', e.target.value)}
                      />
                    </Fade>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Fade in={true} timeout={1200}>
                      <FormSelectField
                        name="priority"
                        label="Prioridad"
                        options={prioridades}
                        required
                        value={formData.priority || ''}
                        onChange={(e) => handleFormDataChange('priority', e.target.value)}
                      />
                    </Fade>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Fade in={true} timeout={1400}>
                      <FormTextField
                        name="cost"
                        label="Costo (Opcional)"
                        type="number"
                        value={formData.cost || ''}
                        onChange={(e) => handleFormDataChange('cost', e.target.value)}
                      />
                    </Fade>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Fade in={true} timeout={1600}>
                      <FormTextField
                        name="location"
                        label="Ubicación (Opcional)"
                        value={formData.location || ''}
                        onChange={(e) => handleFormDataChange('location', e.target.value)}
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
                    <DescriptionIcon sx={{ mr: 2, fontSize: '1.5rem', color: 'primary.main' }} />
                    Observaciones Generales
                  </Typography>
                </Zoom>
                <Divider sx={{ mb: 4, opacity: 0.3 }} />
                
                <Fade in={true} timeout={1000}>
                  <FormTextField
                    name="generalObservations"
                    label="Observaciones Generales"
                    multiline
                    rows={4}
                    placeholder="Observaciones generales sobre la solicitud de exámenes..."
                    value={formData.generalObservations || ''}
                    onChange={(e) => handleFormDataChange('generalObservations', e.target.value)}
                  />
                </Fade>
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
                    💡 <strong>Instrucciones para el paciente:</strong>
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
                    <li>Llegue 30 minutos antes de su cita</li>
                    <li>Traiga su identificación y orden médica</li>
                    <li>Algunos exámenes requieren ayuno de 8-12 horas</li>
                    <li>Los resultados estarán disponibles en 24-48 horas</li>
                  </Box>
                </Fade>
              </CardContent>
            </Card>
          </Slide>
        );

      default:
        return null;
    }
  }, [activeStep, direction, stepValidation, formData, activePatients, activeDoctors, status, handleFormDataChange]);

  if (!isDataLoaded) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <BaseForm
        title="Solicitud de Examen"
        subtitle="Solicita un nuevo examen médico"
        formType="exam"
        onSubmit={handleSubmit}
        requiredPermissions={['exams:write']}
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
          <Suspense fallback={<LoadingStep />}>
            {StepContent}
          </Suspense>
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
                localStorage.setItem('examFormProgress', JSON.stringify(formData));
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
                loading={status === 'loading'}
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
                {status === 'loading' ? 'Solicitando...' : 'Solicitar Examen'}
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
            ¡Examen solicitado exitosamente! Redirigiendo a la lista...
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

export default CreateExam;

