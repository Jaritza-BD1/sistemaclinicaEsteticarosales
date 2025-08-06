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
  useMediaQuery,
  Fade,
  Slide,
  Grow,
  Zoom,
  CircularProgress,
  Skeleton,
  Backdrop,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon
} from '@mui/material';
import {
  Person as PersonIcon,
  CheckCircle as CheckIcon,
  Healing as HealingIcon,
  Timeline as TimelineIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Save as SaveIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Help as HelpIcon
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import BaseForm from '../common/BaseForm';
import { FormTextField, FormDateField, FormSelectField } from '../common/FormFields';
import { treatmentSchema } from '../../services/validationSchemas';
import { createTreatment, clearError } from '../../redux/treatments/treatmentsSlice';
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

function TreatmentRegister() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector(state => state.treatments);
  const { activePatients } = useSelector(state => state.patients);
  const { activeDoctors } = useSelector(state => state.doctors);
  
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [stepValidation, setStepValidation] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showHelpInfo, setShowHelpInfo] = useState(false);
  const [direction, setDirection] = useState('right');
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [showSpeedDial, setShowSpeedDial] = useState(false);

  // Cargar datos necesarios
  useEffect(() => {
    dispatch(getActivePatients());
    dispatch(getActiveDoctors());
  }, [dispatch]);

  // Datos para selectores
  const mockTiposTratamiento = useMemo(() => [
    { value: 'Fisioterapia', label: 'Fisioterapia' },
    { value: 'Farmacológico', label: 'Farmacológico' },
    { value: 'Quirúrgico', label: 'Quirúrgico' },
    { value: 'Psicoterapia', label: 'Psicoterapia' },
    { value: 'Rehabilitación', label: 'Rehabilitación' },
    { value: 'Terapia Ocupacional', label: 'Terapia Ocupacional' },
    { value: 'Terapia del Lenguaje', label: 'Terapia del Lenguaje' },
    { value: 'Terapia Respiratoria', label: 'Terapia Respiratoria' },
    { value: 'Terapia Cardiaca', label: 'Terapia Cardiaca' },
    { value: 'Terapia Neurológica', label: 'Terapia Neurológica' }
  ], []);

  const mockFrecuencias = useMemo(() => [
    { value: 'Diario', label: 'Diario' },
    { value: 'Semanal', label: 'Semanal' },
    { value: 'Quincenal', label: 'Quincenal' },
    { value: 'Mensual', label: 'Mensual' },
    { value: 'Según necesidad', label: 'Según necesidad' }
  ], []);

  const mockDuraciones = useMemo(() => [
    { value: '1 semana', label: '1 semana' },
    { value: '2 semanas', label: '2 semanas' },
    { value: '1 mes', label: '1 mes' },
    { value: '3 meses', label: '3 meses' },
    { value: '6 meses', label: '6 meses' },
    { value: '1 año', label: '1 año' },
    { value: 'Indefinido', label: 'Indefinido' }
  ], []);

  const steps = useMemo(() => [
    { 
      label: 'Información Básica', 
      icon: <PersonIcon />,
      validation: ['patientId', 'doctorId', 'treatmentType', 'startDate']
    },
    { 
      label: 'Detalles del Tratamiento', 
      icon: <HealingIcon />,
      validation: ['description', 'frequency', 'duration']
    },
    { 
      label: 'Medicamentos y Observaciones', 
      icon: <TimelineIcon />,
      validation: []
    },
    { 
      label: 'Confirmación', 
      icon: <CheckIcon />,
      validation: []
    }
  ], []);

  // Cargar progreso guardado al iniciar
  useEffect(() => {
    const loadSavedProgress = async () => {
      try {
        const savedData = localStorage.getItem('treatmentFormProgress');
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
      localStorage.setItem('treatmentFormProgress', JSON.stringify(formData));
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
        if (!stepData.patientId || !stepData.doctorId || !stepData.treatmentType || !stepData.startDate) {
          return false;
        }
      } else if (stepIndex === 1) {
        if (!stepData.description || !stepData.frequency || !stepData.duration) {
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
      await dispatch(createTreatment(data)).unwrap();
      
      // Limpiar progreso guardado al completar
      localStorage.removeItem('treatmentFormProgress');
      
      setShowSuccessNotification(true);
      
      // Redirigir a la lista de tratamientos después de 2 segundos
      setTimeout(() => {
        navigate('/tratamientos/lista');
      }, 2000);
      
      return { success: true, message: 'Tratamiento registrado exitosamente' };
    } catch (error) {
      console.error('Error al registrar tratamiento:', error);
      throw error;
    }
  }, [dispatch, navigate]);

  // Acciones del SpeedDial
  const speedDialActions = useMemo(() => [
    {
      icon: <SaveIcon />,
      name: 'Guardar',
      action: () => {
        localStorage.setItem('treatmentFormProgress', JSON.stringify(formData));
        setShowSaveNotification(true);
      }
    },
    {
      icon: <PrintIcon />,
      name: 'Imprimir',
      action: () => window.print()
    },
    {
      icon: <ShareIcon />,
      name: 'Compartir',
      action: () => {
        if (navigator.share) {
          navigator.share({
            title: 'Registro de Tratamiento',
            text: 'Formulario de registro de tratamiento médico'
          });
        }
      }
    },
    {
      icon: <HelpIcon />,
      name: 'Ayuda',
      action: () => setShowHelpInfo(true)
    }
  ], [formData]);

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
                    Información Básica
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
                        label="Médico"
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
                        name="treatmentType"
                        label="Tipo de Tratamiento"
                        options={mockTiposTratamiento}
                        required
                        value={formData.treatmentType || ''}
                        onChange={(e) => handleFormDataChange('treatmentType', e.target.value)}
                      />
                    </Fade>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Fade in={true} timeout={1600}>
                      <FormDateField
                        name="startDate"
                        label="Fecha de Inicio"
                        required
                        value={formData.startDate || ''}
                        onChange={(e) => handleFormDataChange('startDate', e.target.value)}
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
                    <HealingIcon sx={{ mr: 2, fontSize: '1.5rem', color: 'primary.main' }} />
                    Detalles del Tratamiento
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
                  <Grid item xs={12}>
                    <Fade in={true} timeout={1000}>
                      <FormTextField
                        name="description"
                        label="Descripción del Tratamiento"
                        multiline
                        rows={4}
                        required
                        value={formData.description || ''}
                        onChange={(e) => handleFormDataChange('description', e.target.value)}
                      />
                    </Fade>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Fade in={true} timeout={1200}>
                      <FormSelectField
                        name="frequency"
                        label="Frecuencia"
                        options={mockFrecuencias}
                        required
                        value={formData.frequency || ''}
                        onChange={(e) => handleFormDataChange('frequency', e.target.value)}
                      />
                    </Fade>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Fade in={true} timeout={1400}>
                      <FormSelectField
                        name="duration"
                        label="Duración"
                        options={mockDuraciones}
                        required
                        value={formData.duration || ''}
                        onChange={(e) => handleFormDataChange('duration', e.target.value)}
                      />
                    </Fade>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Fade in={true} timeout={1600}>
                      <FormDateField
                        name="endDate"
                        label="Fecha de Fin (Opcional)"
                        value={formData.endDate || ''}
                        onChange={(e) => handleFormDataChange('endDate', e.target.value)}
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
                    <TimelineIcon sx={{ mr: 2, fontSize: '1.5rem', color: 'primary.main' }} />
                    Medicamentos y Observaciones
                  </Typography>
                </Zoom>
                <Divider sx={{ mb: 4, opacity: 0.3 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Fade in={true} timeout={1000}>
                      <FormTextField
                        name="medications"
                        label="Medicamentos (Opcional)"
                        multiline
                        rows={3}
                        value={formData.medications || ''}
                        onChange={(e) => handleFormDataChange('medications', e.target.value)}
                        placeholder="Especifique medicamentos, dosis y horarios..."
                      />
                    </Fade>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Fade in={true} timeout={1200}>
                      <FormTextField
                        name="observations"
                        label="Observaciones (Opcional)"
                        multiline
                        rows={4}
                        value={formData.observations || ''}
                        onChange={(e) => handleFormDataChange('observations', e.target.value)}
                        placeholder="Observaciones adicionales, contraindicaciones, etc..."
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
                    Confirmación de Registro
                  </Typography>
                </Zoom>
                <Divider sx={{ mb: 4, opacity: 0.3 }} />
                
                <Fade in={true} timeout={1000}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontSize: '1rem' }}>
                    📋 <strong>Resumen del tratamiento:</strong>
                  </Typography>
                </Fade>
                
                <Fade in={true} timeout={1200}>
                  <Box sx={{ 
                    backgroundColor: 'grey.50', 
                    p: 3, 
                    borderRadius: 2,
                    mb: 3
                  }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Paciente:</strong> {activePatients.find(p => p.value == formData.patientId)?.label || 'N/A'}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Médico:</strong> {activeDoctors.find(d => d.value == formData.doctorId)?.label || 'N/A'}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Tipo:</strong> {formData.treatmentType}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Fecha Inicio:</strong> {formData.startDate}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Frecuencia:</strong> {formData.frequency}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Duración:</strong> {formData.duration}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Medicamentos:</strong> {formData.medications ? 'Especificados' : 'No especificados'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Observaciones:</strong> {formData.observations ? 'Incluidas' : 'Sin observaciones'}
                    </Typography>
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
        title="Registro de Tratamiento"
        subtitle="Registra un nuevo tratamiento médico"
        validationSchema={treatmentSchema}
        formType="treatment"
        onSubmit={handleSubmit}
        requiredPermissions={['treatments:write']}
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
            {activeStep === steps.length - 1 ? (
              <LoadingButton
                variant="contained"
                onClick={() => handleSubmit(formData)}
                endIcon={<CheckIcon />}
                loading={status === 'loading'}
                sx={{
                  backgroundColor: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  boxShadow: '0 4px 14px 0 rgba(236, 72, 153, 0.25)',
                }}
              >
                {status === 'loading' ? 'Registrando...' : 'Registrar Tratamiento'}
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

        {/* SpeedDial para acciones rápidas */}
        <SpeedDial
          ariaLabel="Acciones rápidas"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          icon={<SpeedDialIcon />}
          open={showSpeedDial}
          onOpen={() => setShowSpeedDial(true)}
          onClose={() => setShowSpeedDial(false)}
        >
          {speedDialActions.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              onClick={action.action}
            />
          ))}
        </SpeedDial>

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
            ¡Tratamiento registrado exitosamente! Redirigiendo a la lista...
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

export default TreatmentRegister;
