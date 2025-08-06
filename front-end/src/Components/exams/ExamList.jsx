// src/components/ExamList.jsx
import React, { useState } from 'react';
import {
  Button,
  TextField,
  Typography,
  Paper,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  IconButton,
  Chip,
  Fab,
  Box, // Importar Box para usar sx y flex
  Menu, // Importar Menu para el botón de reportes
} from '@mui/material';
import { useTheme } from '@mui/material/styles'; // Importar useTheme para acceder a los colores del tema
import { // Importar íconos directamente desde @mui/icons-material
  Search,
  Visibility,
  Edit,
  UploadFile,
  Cancel,
  Add,
  FilterList,
  ClearAll,
  Article as ReportIcon, // Icono para el botón de Reportes
  PictureAsPdf as PdfIcon, // Icono para PDF
  Description as ExcelIcon, // Icono para Excel
} from '@mui/icons-material';

// Importaciones para PDF y Excel
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const ExamList = () => {
  const theme = useTheme(); // Hook para acceder al tema

  // Estados para los filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [examStatus, setExamStatus] = useState('');

  // Estados para la paginación de la tabla
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Estado para el menú de reportes
  const [anchorElReport, setAnchorElReport] = useState(null);
  const openReportMenu = Boolean(anchorElReport);

  // Datos de ejemplo para la tabla (simulando datos de una API)
  const allExams = [
    { id: 'EXM001', patient: 'Juan Pérez', exam: 'Hemograma Completo', type: 'Laboratorio', dateTime: '2025-07-20 10:00', doctor: 'Dra. Ana García', status: 'Con Resultados' },
    { id: 'EXM002', patient: 'María López', exam: 'Radiografía de Tórax', type: 'Imagen', dateTime: '2025-07-21 14:30', doctor: 'Dr. Carlos Ruiz', status: 'Pendiente' },
    { id: 'EXM003', patient: 'Pedro Gómez', exam: 'Consulta Dermatológica', type: 'Consulta Especializada', dateTime: '2025-07-22 09:00', doctor: 'Dr. Juan Pérez', status: 'Con Resultados' },
    { id: 'EXM004', patient: 'Laura García', exam: 'Examen de Orina', type: 'Laboratorio', dateTime: '2025-07-23 11:00', doctor: 'Dra. Ana García', status: 'Cancelado' },
    { id: 'EXM005', patient: 'Roberto Fernández', exam: 'Tomografía Axial', type: 'Imagen', dateTime: '2025-07-24 16:00', doctor: 'Dr. Carlos Ruiz', status: 'En Proceso' },
    { id: 'EXM006', patient: 'Sofía Martínez', exam: 'Electrocardiograma', type: 'Consulta Especializada', dateTime: '2025-07-25 08:30', doctor: 'Dra. Laura Soto', status: 'Pendiente' },
    { id: 'EXM007', patient: 'Daniel Herrera', exam: 'Resonancia Magnética', type: 'Imagen', dateTime: '2025-07-26 10:00', doctor: 'Dr. Carlos Ruiz', status: 'Con Resultados' },
    { id: 'EXM008', patient: 'Valeria Castro', exam: 'Perfil Lipídico', type: 'Laboratorio', dateTime: '2025-07-27 13:00', doctor: 'Dra. Ana García', status: 'Pendiente' },
    { id: 'EXM009', patient: 'Andrés Morales', exam: 'Endoscopia', type: 'Consulta Especializada', dateTime: '2025-07-28 15:00', doctor: 'Dr. Juan Pérez', status: 'En Proceso' },
    { id: 'EXM010', patient: 'Camila Rojas', exam: 'Cultivo de Orina', type: 'Laboratorio', dateTime: '2025-07-29 09:30', doctor: 'Dra. Laura Soto', status: 'Con Resultados' },
    { id: 'EXM011', patient: 'Juan Pérez', exam: 'Glicemia', type: 'Laboratorio', dateTime: '2025-07-30 08:00', doctor: 'Dra. Ana García', status: 'Pendiente' },
    { id: 'EXM012', patient: 'María López', exam: 'Mamografía', type: 'Imagen', dateTime: '2025-07-31 14:00', doctor: 'Dr. Carlos Ruiz', status: 'Pendiente' },
    { id: 'EXM013', patient: 'Pedro Gómez', exam: 'Examen de Tiroides', type: 'Laboratorio', dateTime: '2025-08-01 09:00', doctor: 'Dra. Ana García', status: 'Con Resultados' },
  ];

  // Lógica para filtrar los exámenes (simulada en el frontend)
  const filteredExams = allExams.filter(exam => {
    const matchesSearch = searchTerm === '' ||
      exam.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.exam.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.doctor.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === '' || exam.type === filterType;
    const matchesStatus = examStatus === '' || exam.status === examStatus;

    // Lógica de filtro por fecha
    const examDateObj = new Date(exam.dateTime.split(' ')[0]);
    const fromDateObj = dateFrom ? new Date(dateFrom) : null;
    const toDateObj = dateTo ? new Date(dateTo) : null;

    const matchesDate = (!fromDateObj || examDateObj >= fromDateObj) &&
      (!toDateObj || examDateObj <= toDateObj);

    return matchesSearch && matchesType && matchesStatus && matchesDate;
  });

  // Función para obtener el color del Chip según el estado
  const getStatusColor = (status) => {
    switch (status) {
      case 'Con Resultados': return { backgroundColor: '#D4EDDA', color: '#155724' }; // Verde claro
      case 'Pendiente': return { backgroundColor: '#FFF3CD', color: '#856404' }; // Naranja claro
      case 'Cancelado': return { backgroundColor: '#F8D7DA', color: '#721C24' }; // Rojo claro
      case 'En Proceso': return { backgroundColor: '#D1ECF1', color: '#0C5460' }; // Azul claro
      default: return {};
    }
  };

  // Manejadores para los filtros
  const handleApplyFilters = () => {
    setPage(0); // Reiniciar paginación al aplicar filtros
    console.log('Filtros aplicados:', { searchTerm, filterType, dateFrom, dateTo, examStatus });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterType('');
    setDateFrom('');
    setDateTo('');
    setExamStatus('');
    setPage(0); // Reiniciar paginación al limpiar filtros
  };

  // Manejadores para la paginación
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Manejadores para las acciones de la tabla
  const handleViewDetails = (id) => {
    console.log('Ver detalles de:', id);
    // Aquí podrías usar react-router-dom para navegar a /exam-result/:id
    // navigate(`/exam-result/${id}`);
  };

  const handleEdit = (id) => {
    console.log('Editar examen:', id);
    // Abrir un modal de edición o navegar a CreateExam con datos precargados
  };

  const handleUploadResults = (id) => {
    console.log('Cargar resultados para:', id);
    // Abrir un modal para subir archivos de resultados
  };

  const handleCancel = (id) => {
    console.log('Cancelar examen:', id);
    // Abrir un modal de confirmación antes de cancelar
  };

  // --- Funcionalidad de Reportes ---
  const handleOpenReportMenu = (event) => {
    setAnchorElReport(event.currentTarget);
  };

  const handleCloseReportMenu = () => {
    setAnchorElReport(null);
  };

  const generatePdfReport = () => {
    handleCloseReportMenu();
    const doc = new jsPDF();
    
    // Título del reporte
    doc.setFontSize(18);
    doc.text('Reporte de Exámenes', 14, 22);
    
    // Información de filtros
    doc.setFontSize(10);
    let filterInfo = 'Filtros: ';
    if(searchTerm) filterInfo += `Búsqueda: "${searchTerm}" `;
    if(filterType) filterInfo += `Tipo: "${filterType}" `;
    if(examStatus) filterInfo += `Estado: "${examStatus}" `;
    if(dateFrom) filterInfo += `Desde: "${dateFrom}" `;
    if(dateTo) filterInfo += `Hasta: "${dateTo}" `;
    if(filterInfo === 'Filtros: ') filterInfo += 'Ninguno';
    doc.text(filterInfo, 14, 30);

    // Encabezados de la tabla para el PDF
    const tableColumn = [
      "ID Examen", "Paciente", "Examen", "Tipo", "Fecha/Hora", "Médico", "Estado"
    ];
    // Datos de la tabla para el PDF
    const tableRows = [];
    filteredExams.forEach(exam => {
      const examData = [
        exam.id,
        exam.patient,
        exam.exam,
        exam.type,
        exam.dateTime,
        exam.doctor,
        exam.status,
      ];
      tableRows.push(examData);
    });

    // Generar la tabla en el PDF
    doc.autoTable(tableColumn, tableRows, { startY: 40 }); // startY es la posición inicial de la tabla

    // Guardar el PDF
    doc.save('reporte_examenes.pdf');
  };

  const exportToExcel = () => {
    handleCloseReportMenu();
    // Preparar los datos para Excel
    const data = filteredExams.map(exam => ({
      'ID Examen': exam.id,
      'Paciente': exam.patient,
      'Examen': exam.exam,
      'Tipo': exam.type,
      'Fecha/Hora': exam.dateTime,
      'Médico Solicitante': exam.doctor,
      'Estado': exam.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'reporte_examenes.xlsx');
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, mt: 4, mb: 4 }}> {/* Usar Box y sx para responsividad */}
      <Typography variant="h5" component="h1" gutterBottom sx={{ mb: 3, textAlign: 'center', color: theme.palette.primary.main, fontWeight: 'bold' }}>
        Gestión de Exámenes
      </Typography>

      {/* Sección de Filtros de Búsqueda */}
      <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, mb: 3, borderRadius: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2, color: theme.palette.secondary.main }}>
          Filtros de Búsqueda
        </Typography>
        <Grid container spacing={2} alignItems="center"> {/* spacing={2} para un espaciado consistente */}
          <Grid item xs={12} sm={6} md={4}> {/* xs=12 para pantalla pequeña, sm=6 para tablet, md=4 para desktop */}
            <TextField
              fullWidth
              label="Buscar (Paciente, Examen, Médico)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              variant="outlined"
              InputProps={{ endAdornment: <Search sx={{ color: 'action.active' }} /> }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="filter-type-label">Tipo de Examen</InputLabel>
              <Select
                labelId="filter-type-label"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                label="Tipo de Examen"
              >
                <MenuItem value=""><em>Todos</em></MenuItem>
                <MenuItem value="Laboratorio">Laboratorio</MenuItem>
                <MenuItem value="Imagen">Imagen</MenuItem>
                <MenuItem value="Consulta Especializada">Consulta Especializada</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={6} md={2}>
            <TextField
              fullWidth
              label="Fecha Desde"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              InputLabelProps={{ shrink: true }}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={6} sm={6} md={2}>
            <TextField
              fullWidth
              label="Fecha Hasta"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              InputLabelProps={{ shrink: true }}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="exam-status-label">Estado del Examen</InputLabel>
              <Select
                labelId="exam-status-label"
                value={examStatus}
                onChange={(e) => setExamStatus(e.target.value)}
                label="Estado del Examen"
              >
                <MenuItem value=""><em>Todos</em></MenuItem>
                <MenuItem value="Pendiente">Pendiente</MenuItem>
                <MenuItem value="En Proceso">En Proceso</MenuItem>
                <MenuItem value="Con Resultados">Con Resultados</MenuItem>
                <MenuItem value="Cancelado">Cancelado</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={6} md={2}> {/* Ajustado para dos columnas en sm y md */}
            <Button
              variant="contained"
              startIcon={<FilterList />}
              onClick={handleApplyFilters}
              fullWidth // Ocupa todo el ancho disponible
              color="primary"
            >
              Aplicar
            </Button>
          </Grid>
          <Grid item xs={6} sm={6} md={2}> {/* Ajustado para dos columnas en sm y md */}
            <Button
              variant="outlined"
              startIcon={<ClearAll />}
              onClick={handleClearFilters}
              fullWidth // Ocupa todo el ancho disponible
              color="secondary"
            >
              Limpiar
            </Button>
          </Grid>
        </Grid>
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<ReportIcon />}
              onClick={handleOpenReportMenu}
              color="info" // Un color distintivo para reportes
            >
              Reportes
            </Button>
            <Menu
                anchorEl={anchorElReport}
                open={openReportMenu}
                onClose={handleCloseReportMenu}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                <MenuItem onClick={generatePdfReport}>
                    <PdfIcon sx={{ mr: 1 }} /> Descargar PDF
                </MenuItem>
                <MenuItem onClick={exportToExcel}>
                    <ExcelIcon sx={{ mr: 1 }} /> Exportar a Excel
                </MenuItem>
            </Menu>
        </Box>
      </Paper>

      {/* Tabla de Exámenes */}
      <Paper elevation={3} sx={{ borderRadius: 3 }}>
        <TableContainer sx={{ maxHeight: 600, overflowX: 'auto' }}> {/* Permite scroll horizontal en pantallas pequeñas */}
          <Table stickyHeader aria-label="exam list table">
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.primary.main }}> {/* Usa el color primario del tema */}
                <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 100 }}>ID Examen</TableCell> {/* minWidth para responsividad */}
                <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 150 }}>Paciente</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 200 }}>Examen</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 120 }}>Tipo</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 150 }}>Fecha/Hora</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 150 }}>Médico Solicitante</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 120 }}>Estado</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 180 }}>Acciones</TableCell> {/* Ancho mínimo para acciones */}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredExams.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((exam) => (
                <TableRow key={exam.id} hover>
                  <TableCell>{exam.id}</TableCell>
                  <TableCell>{exam.patient}</TableCell>
                  <TableCell>{exam.exam}</TableCell>
                  <TableCell>{exam.type}</TableCell>
                  <TableCell>{exam.dateTime}</TableCell>
                  <TableCell>{exam.doctor}</TableCell>
                  <TableCell>
                    <Chip label={exam.status} sx={getStatusColor(exam.status)} size="small" />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleViewDetails(exam.id)} size="small" color="info" aria-label="Ver detalles">
                      <Visibility fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => handleEdit(exam.id)} size="small" color="primary" aria-label="Editar">
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => handleUploadResults(exam.id)} size="small" color="success" aria-label="Cargar resultados">
                      <UploadFile fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => handleCancel(exam.id)} size="small" color="error" aria-label="Cancelar">
                      <Cancel fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {filteredExams.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="subtitle1" color="text.secondary">
                      No se encontraron exámenes que coincidan con los filtros.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredExams.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
          }
        />
      </Paper>

      {/* Botón Flotante para añadir nuevo examen */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 30,
          right: 30,
          backgroundColor: 'primary.main',
          '&:hover': { backgroundColor: 'primary.dark' },
        }}
        onClick={() => console.log('Abrir modal para crear nuevo examen')}
      >
        <Add />
      </Fab>
    </Box>
  );
};

export default ExamList;
