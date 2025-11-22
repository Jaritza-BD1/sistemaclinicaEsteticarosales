// src/components/ExamResult.jsx
import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Grid,
  Divider,
  Chip,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Edit as EditIcon,
  Print as PrintIcon,
  ArrowBack as ArrowBackIcon,
  UploadFile as UploadFileIcon,
  Description as DescriptionIcon,
  Science as ScienceIcon,
  MedicalServices as MedicalServicesIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Save as SaveIcon
} from '@mui/icons-material';

const ExamResult = ({ examId }) => {
  const theme = useTheme();
  
  const [editMode, setEditMode] = useState(false);
  const [notification, setNotification] = useState(null);
  const [editData, setEditData] = useState(null);

  const examDetails = {
    id: examId || 'EXM001',
    name: 'Hemograma Completo',
    patientName: 'Juan Pérez',
    patientRecord: '12345',
    requestingDoctor: 'Dra. Ana García',
    dateTime: '2025-07-20 10:00',
    department: 'Laboratorio Central',
    observations: 'Paciente en ayunas 8 horas.',
    resultStatus: 'Finalizado',
    resultEmissionDate: '2025-07-22',
    parameters: [
      { name: 'Glucosa', value: '90 mg/dL', reference: '70-100 mg/dL', status: 'normal' },
      { name: 'Hemoglobina', value: '14 g/dL', reference: '12-16 g/dL', status: 'normal' },
      { name: 'Colesterol Total', value: '220 mg/dL', reference: '<200 mg/dL', status: 'high' },
      { name: 'Triglicéridos', value: '150 mg/dL', reference: '<150 mg/dL', status: 'normal' },
      { name: 'Leucocitos', value: '7,500/μL', reference: '4,500-11,000/μL', status: 'normal' },
    ],
    interpretation: 'Colesterol alto, seguir dieta baja en grasas y ejercicio regular.',
    attachments: [
      { name: 'Reporte.pdf', url: 'https://www.africau.edu/images/default/sample.pdf' }
    ]
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Finalizado': return 'success';
      case 'Pendiente': return 'warning';
      case 'En Proceso': return 'info';
      default: return 'default';
    }
  };

  const getParameterStatusColor = (status) => {
    switch (status) {
      case 'normal': return 'success';
      case 'low': return 'warning';
      case 'high': return 'error';
      default: return 'default';
    }
  };

  const getParameterStatusIcon = (status) => {
    switch (status) {
      case 'normal': return <CheckIcon />;
      case 'low': return <WarningIcon />;
      case 'high': return <ErrorIcon />;
      default: return null;
    }
  };

  const handleUpload = () => {
    setNotification({ message: 'Función de carga implementada', type: 'info', open: true });
  };

  const handleEdit = () => {
    setEditData(examDetails);
    setEditMode(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    setNotification({ message: 'Navegando hacia atrás', type: 'info', open: true });
  };

  const handleSaveEdit = () => {
    setNotification({ message: 'Resultados actualizados exitosamente', type: 'success', open: true });
    setEditMode(false);
    setEditData(null);
  };

  const handleCloseEdit = () => {
    setEditMode(false);
    setEditData(null);
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ color: 'primary.main', mb: 1 }}>
          <ScienceIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Resultados del Examen
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          {examDetails.name} - {examDetails.patientName}
        </Typography>
      </Box>

      {/* Botones de Acción */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{
            borderColor: 'primary.300',
            color: 'primary.main',
            '&:hover': {
              borderColor: 'primary.main',
              backgroundColor: 'primary.50',
            },
          }}
        >
          Volver
        </Button>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Cargar resultados">
            <IconButton
              color="primary"
              onClick={handleUpload}
              sx={{
                '&:hover': {
                  backgroundColor: 'primary.50',
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <UploadFileIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Editar resultados">
            <IconButton
              color="primary"
              onClick={handleEdit}
              sx={{
                '&:hover': {
                  backgroundColor: 'primary.50',
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            sx={{
              background: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                transform: 'translateY(-1px)',
              },
              boxShadow: '0 4px 14px 0 rgba(236, 72, 153, 0.25)',
            }}
          >
            Imprimir
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Información General */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            borderRadius: 2,
            background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
            border: '1px solid',
            borderColor: 'primary.200'
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: 'primary.main', mb: 2, display: 'flex', alignItems: 'center' }}>
                <AssignmentIcon sx={{ mr: 1 }} />
                Información General
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    ID del Examen
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                    {examDetails.id}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Paciente
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'medium', display: 'flex', alignItems: 'center' }}>
                    <PersonIcon sx={{ mr: 1, fontSize: 'small' }} />
                    {examDetails.patientName} (Exp. {examDetails.patientRecord})
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Médico Solicitante
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'medium', display: 'flex', alignItems: 'center' }}>
                    <MedicalServicesIcon sx={{ mr: 1, fontSize: 'small' }} />
                    {examDetails.requestingDoctor}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Fecha y Hora
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'medium', display: 'flex', alignItems: 'center' }}>
                    <CalendarIcon sx={{ mr: 1, fontSize: 'small' }} />
                    {examDetails.dateTime}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Departamento
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'medium', display: 'flex', alignItems: 'center' }}>
                    <ScienceIcon sx={{ mr: 1, fontSize: 'small' }} />
                    {examDetails.department}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Observaciones
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                    {examDetails.observations}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Estado y Resultados */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            borderRadius: 2,
            background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
            border: '1px solid',
            borderColor: 'primary.200'
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: 'primary.main', mb: 2, display: 'flex', alignItems: 'center' }}>
                <CheckIcon sx={{ mr: 1 }} />
                Estado y Resultados
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Estado del Resultado
                  </Typography>
                  <Chip 
                    label={examDetails.resultStatus}
                    color={getStatusColor(examDetails.resultStatus)}
                    size="small"
                    sx={{ fontWeight: 'medium' }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Fecha de Emisión
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                    {examDetails.resultEmissionDate}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Interpretación
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                    {examDetails.interpretation}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Tabla de Parámetros */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: 'primary.main', mb: 2 }}>
                Parámetros del Examen
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'primary.50' }}>
                      <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        Parámetro
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        Valor
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        Rango de Referencia
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        Estado
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {examDetails.parameters.map((parameter, index) => (
                      <TableRow key={index} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {parameter.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {parameter.value}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {parameter.reference}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            icon={getParameterStatusIcon(parameter.status)}
                            label={parameter.status === 'normal' ? 'Normal' : 
                                   parameter.status === 'high' ? 'Alto' : 'Bajo'}
                            color={getParameterStatusColor(parameter.status)}
                            size="small"
                            sx={{ fontWeight: 'medium' }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Archivos Adjuntos */}
        {examDetails.attachments.length > 0 && (
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: 'primary.main', mb: 2, display: 'flex', alignItems: 'center' }}>
                  <DescriptionIcon sx={{ mr: 1 }} />
                  Archivos Adjuntos
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={2}>
                  {examDetails.attachments.map((attachment, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Paper 
                        sx={{ 
                          p: 2, 
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'primary.200',
                          '&:hover': {
                            borderColor: 'primary.main',
                            backgroundColor: 'primary.50',
                          },
                          transition: 'all 0.2s ease-in-out'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <DescriptionIcon sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {attachment.name}
                          </Typography>
                        </Box>
                        <Button
                          variant="outlined"
                          size="small"
                          href={attachment.url}
                          target="_blank"
                          sx={{
                            borderColor: 'primary.300',
                            color: 'primary.main',
                            '&:hover': {
                              borderColor: 'primary.main',
                              backgroundColor: 'primary.50',
                            },
                          }}
                        >
                          Ver Archivo
                        </Button>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Modal de Edición */}
      <Dialog 
        open={editMode} 
        onClose={handleCloseEdit}
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            backgroundColor: 'background.paper',
            color: 'accent.main',
            border: '1px solid',
            borderColor: 'primary.200'
          }
        }}
      >
        <DialogTitle sx={{ 
          color: 'primary.main',
          borderBottom: '1px solid',
          borderColor: 'primary.200'
        }}>
          Editar Resultados del Examen
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Interpretación"
                multiline
                rows={4}
                value={editData?.interpretation || ''}
                onChange={(e) => setEditData({ ...editData, interpretation: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'primary.300',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Estado del Resultado</InputLabel>
                <Select
                  value={editData?.resultStatus || 'Finalizado'}
                  onChange={(e) => setEditData({ ...editData, resultStatus: e.target.value })}
                  label="Estado del Resultado"
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      '&:hover': {
                        borderColor: 'primary.300',
                      },
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  <MenuItem value="Pendiente">Pendiente</MenuItem>
                  <MenuItem value="En Proceso">En Proceso</MenuItem>
                  <MenuItem value="Finalizado">Finalizado</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fecha de Emisión"
                type="date"
                value={editData?.resultEmissionDate || ''}
                onChange={(e) => setEditData({ ...editData, resultEmissionDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'primary.300',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ 
          p: 3, 
          pt: 1,
          borderTop: '1px solid',
          borderColor: 'primary.200'
        }}>
          <Button
            onClick={handleCloseEdit}
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
            Cancelar
          </Button>
          <Button
            onClick={handleSaveEdit}
            variant="contained"
            endIcon={<SaveIcon />}
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
            Guardar Cambios
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notificaciones */}
      <Snackbar
        open={notification?.open || false}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification?.type || 'info'}
          sx={{ borderRadius: 2 }}
        >
          {notification?.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ExamResult;
