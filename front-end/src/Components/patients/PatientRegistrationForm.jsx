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
  Phone as PhoneIcon,
  MedicalServices as MedicalIcon,
  CheckCircle as CheckIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import BaseForm from '../common/BaseForm';
import { FormTextField, FormDateField, FormSelectField, FormDynamicFields } from '../common/FormFields';
import { createPatient, clearError } from '../../redux/patients/patientsSlice';

function PatientRegistrationForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector(state => state.patients);
  
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [stepValidation, setStepValidation] = useState({});
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [direction, setDirection] = useState('right');

  // Datos para selectores
  const generos = [
    { value: 1, label: 'Masculino' },
    { value: 2, label: 'Femenino' },
    { value: 3, label: 'Otro' }
  ];

  // Datos para selectores (comentados para evitar warnings)
  // const alergiasComunes = [
  //   'Penicilina', 'Sulfamidas', 'Aspirina', 'Ibuprofeno', 'Paracetamol',
  //   'Látex', 'Polen', 'Ácaros', 'Alimentos', 'Otros'
  // ];

  // const vacunasComunes = [
  //   'BCG', 'Hepatitis B', 'Pentavalente', 'Rotavirus', 'Neumococo',
  //   'Influenza', 'Sarampión', 'Rubéola', 'Paperas', 'Varicela',
  //   'VPH', 'Meningococo', 'Tétanos', 'Difteria', 'Tosferina'
  // ];

  const steps = [
    { 
      label: 'Información Personal', 
      icon: <PersonIcon />,
      validation: ['nombre', 'apellido', 'fechaNacimiento', 'identidad', 'genero', 'numeroExpediente']
    },
    { 
      label: 'Información de Contacto', 
      icon: <PhoneIcon />,
      validation: ['telefonos']
    },
    { 
      label: 'Información Médica', 
      icon: <MedicalIcon />,
      validation: ['alergias', 'vacunas']
    },
    { 
      label: 'Confirmación', 
      icon: <CheckIcon />,
      validation: []
    }
  ];

  // Cargar progreso guardado al iniciar
  useEffect(() => {
    const savedData = localStorage.getItem('patientFormProgress');
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
      localStorage.setItem('patientFormProgress', JSON.stringify(formData));
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
        if (!stepData.nombre || !stepData.apellido || !stepData.fechaNacimiento || !stepData.identidad || !stepData.genero || !stepData.numeroExpediente) {
          return false;
        }
      } else if (stepIndex === 1) {
        if (!stepData.telefonos || stepData.telefonos.length === 0) {
          return false;
        }
      } else if (stepIndex === 2) {
        // Los campos médicos son opcionales
        return true;
      }
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleNext = () => {
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
    try {
      await dispatch(createPatient(data)).unwrap();
      
      // Limpiar progreso guardado al completar
      localStorage.removeItem('patientFormProgress');
      
      setShowSuccessNotification(true);
      
      // Redirigir a la lista de pacientes después de 2 segundos
      setTimeout(() => {
        navigate('/pacientes/lista');
      }, 2000);
      
      return { success: true, message: 'Paciente registrado exitosamente' };
    } catch (error) {
      console.error('Error al registrar paciente:', error);
      throw error;
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
                    Información Personal
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
                      <FormTextField
                        name="nombre"
                        label="Nombre"
                        required
                        value={formData.nombre || ''}
                        onChange={(e) => handleFormDataChange('nombre', e.target.value)}
                      />
                    </Fade>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Fade in={true} timeout={1200}>
                      <FormTextField
                        name="apellido"
                        label="Apellido"
                        required
                        value={formData.apellido || ''}
                        onChange={(e) => handleFormDataChange('apellido', e.target.value)}
                      />
                    </Fade>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Fade in={true} timeout={1400}>
                      <FormTextField
                        name="identidad"
                        label="Número de Identidad"
                        required
                        value={formData.identidad || ''}
                        onChange={(e) => handleFormDataChange('identidad', e.target.value)}
                      />
                    </Fade>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Fade in={true} timeout={1600}>
                      <FormDateField
                        name="fechaNacimiento"
                        label="Fecha de Nacimiento"
                        required
                        value={formData.fechaNacimiento || ''}
                        onChange={(e) => handleFormDataChange('fechaNacimiento', e.target.value)}
                      />
                    </Fade>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Fade in={true} timeout={1800}>
                      <FormSelectField
                        name="genero"
                        label="Género"
                        options={generos}
                        required
                        value={formData.genero || ''}
                        onChange={(e) => handleFormDataChange('genero', e.target.value)}
                      />
                    </Fade>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Fade in={true} timeout={2000}>
                      <FormTextField
                        name="numeroExpediente"
                        label="Número de Expediente"
                        required
                        value={formData.numeroExpediente || ''}
                        onChange={(e) => handleFormDataChange('numeroExpediente', e.target.value)}
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
                    <PhoneIcon sx={{ mr: 2, fontSize: '1.5rem', color: 'primary.main' }} />
                    Información de Contacto
                  </Typography>
                </Zoom>
                <Divider sx={{ mb: 4, opacity: 0.3 }} />
                
                {stepValidation[step] === false && (
                  <Grow in={true} timeout={500}>
                    <Alert severity="error" sx={{ mb: 3 }}>
                      Por favor agregue al menos un número de teléfono
                    </Alert>
                  </Grow>
                )}
                
                <Fade in={true} timeout={1000}>
                  <FormDynamicFields
                    name="telefonos"
                    label="Teléfonos"
                    fields={[
                      { name: 'numero', label: 'Número', type: 'text', required: true },
                      { name: 'tipo', label: 'Tipo', type: 'select', options: [
                        { value: 'Móvil', label: 'Móvil' },
                        { value: 'Trabajo', label: 'Trabajo' },
                        { value: 'Casa', label: 'Casa' }
                      ], required: true }
                    ]}
                    value={formData.telefonos || []}
                    onChange={(value) => handleFormDataChange('telefonos', value)}
                    required
                  />
                </Fade>
                
                <Fade in={true} timeout={1200}>
                  <FormDynamicFields
                    name="correos"
                    label="Correos Electrónicos"
                    fields={[
                      { name: 'correo', label: 'Correo', type: 'email', required: true },
                      { name: 'tipo', label: 'Tipo', type: 'select', options: [
                        { value: 'Personal', label: 'Personal' },
                        { value: 'Trabajo', label: 'Trabajo' }
                      ], required: true }
                    ]}
                    value={formData.correos || []}
                    onChange={(value) => handleFormDataChange('correos', value)}
                  />
                </Fade>
                
                <Fade in={true} timeout={1400}>
                  <FormDynamicFields
                    name="direcciones"
                    label="Direcciones"
                    fields={[
                      { name: 'direccion', label: 'Dirección', type: 'text', required: true },
                      { name: 'ciudad', label: 'Ciudad', type: 'text', required: true },
                      { name: 'tipo', label: 'Tipo', type: 'select', options: [
                        { value: 'Casa', label: 'Casa' },
                        { value: 'Trabajo', label: 'Trabajo' }
                      ], required: true }
                    ]}
                    value={formData.direcciones || []}
                    onChange={(value) => handleFormDataChange('direcciones', value)}
                  />
                </Fade>
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
                    <MedicalIcon sx={{ mr: 2, fontSize: '1.5rem', color: 'primary.main' }} />
                    Información Médica
                  </Typography>
                </Zoom>
                <Divider sx={{ mb: 4, opacity: 0.3 }} />
                
                <Fade in={true} timeout={1000}>
                  <FormDynamicFields
                    name="alergias"
                    label="Alergias"
                    fields={[
                      { name: 'alergia', label: 'Alergia', type: 'text', required: true },
                      { name: 'severidad', label: 'Severidad', type: 'select', options: [
                        { value: 'Leve', label: 'Leve' },
                        { value: 'Moderada', label: 'Moderada' },
                        { value: 'Severa', label: 'Severa' }
                      ], required: true }
                    ]}
                    value={formData.alergias || []}
                    onChange={(value) => handleFormDataChange('alergias', value)}
                  />
                </Fade>
                
                <Fade in={true} timeout={1200}>
                  <FormDynamicFields
                    name="vacunas"
                    label="Vacunas"
                    fields={[
                      { name: 'vacuna', label: 'Vacuna', type: 'text', required: true },
                      { name: 'fecha', label: 'Fecha', type: 'date', required: true },
                      { name: 'proxima', label: 'Próxima Dosis', type: 'date', required: false }
                    ]}
                    value={formData.vacunas || []}
                    onChange={(value) => handleFormDataChange('vacunas', value)}
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
                    Confirmación de Registro
                  </Typography>
                </Zoom>
                <Divider sx={{ mb: 4, opacity: 0.3 }} />
                
                <Fade in={true} timeout={1000}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontSize: '1rem' }}>
                    📋 <strong>Resumen de la información del paciente:</strong>
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
                      <strong>Nombre:</strong> {formData.nombre} {formData.apellido}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Identidad:</strong> {formData.identidad}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Número de Expediente:</strong> {formData.numeroExpediente}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Teléfonos:</strong> {formData.telefonos?.length || 0} registrados
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Correos:</strong> {formData.correos?.length || 0} registrados
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Direcciones:</strong> {formData.direcciones?.length || 0} registradas
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Alergias:</strong> {formData.alergias?.length || 0} registradas
                    </Typography>
                    <Typography variant="body2">
                      <strong>Vacunas:</strong> {formData.vacunas?.length || 0} registradas
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
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <BaseForm
        title="Registro de Paciente"
        subtitle="Registra un nuevo paciente en el sistema"
        formType="patient"
        onSubmit={handleSubmit}
        requiredPermissions={['patients:write']}
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
                localStorage.setItem('patientFormProgress', JSON.stringify(formData));
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
              <Button
                variant="contained"
                onClick={() => handleSubmit(formData)}
                endIcon={<CheckIcon />}
                disabled={status === 'loading'}
                sx={{
                  backgroundColor: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  boxShadow: '0 4px 14px 0 rgba(236, 72, 153, 0.25)',
                }}
              >
                {status === 'loading' ? 'Registrando...' : 'Registrar Paciente'}
              </Button>
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
            ¡Paciente registrado exitosamente! Redirigiendo a la lista...
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

export default PatientRegistrationForm;

