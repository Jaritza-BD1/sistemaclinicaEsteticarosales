// src/components/appointments/AppointmentPendingPaymentList.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarExport,
} from '@mui/x-data-grid';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Alert,
  Snackbar,
  Chip,
  IconButton,
} from '@mui/material';
import {
  Payment as PaymentIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logoSvg from '../../logo.svg';
import { payAppointmentThunk } from '../../redux/appointments/appointmentsSlice';
import ViewAppointments from './ViewAppointments';

const AppointmentPendingPaymentList = ({ appointments, onPay, SelectedComponent, onView }) => {
  const dispatch = useDispatch();
  const { paymentStatus, paymentError } = useSelector((state) => state.appointments);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [paymentData, setPaymentData] = useState({
    paymentMethod: 'cash',
    amount: '',
    reference: '',
    notes: ''
  });
  const [openModal, setOpenModal] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const [viewAppointment, setViewAppointment] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const handlePayClick = (appointment) => {
    setSelectedAppointment(appointment);
    setPaymentData({
      paymentMethod: 'cash',
      amount: appointment.amount || '',
      reference: '',
      notes: ''
    });
    setOpenModal(true);
  };

  const handleViewClick = (appointment) => {
    // open modal with appointment details
    setViewAppointment(appointment);
    setViewModalOpen(true);
    if (onView) {
      try { onView(appointment); } catch (e) { console.error('onView error', e); }
    }
  };

  const handleGenerateReport = async () => {
    try {
      const svgText = await fetch(logoSvg).then(r => r.text());
      const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();
      img.src = url;

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const desiredHeight = 72;
          const scale = desiredHeight / img.height;
          canvas.width = img.width * scale;
          canvas.height = desiredHeight;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const imgData = canvas.toDataURL('image/png');
          URL.revokeObjectURL(url);

          const doc = new jsPDF({ unit: 'pt', format: 'a4' });
          const margin = 40;
          const headerHeight = 48;
          const pageWidth = doc.internal.pageSize.getWidth();

          const drawClinicHeader = () => {
            doc.setFillColor(186, 110, 143);
            doc.rect(0, 0, pageWidth, headerHeight, 'F');
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(255, 255, 255);
            doc.text('Clínica Estética Rosales', margin, headerHeight - 14);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(0, 0, 0);
          };

          drawClinicHeader();

          const imgProps = doc.getImageProperties(imgData);
          const imgWidth = 72;
          const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
          const logoY = headerHeight + 6;
          doc.addImage(imgData, 'PNG', margin, logoY, imgWidth, imgHeight);

          doc.setFontSize(16);
          doc.setFont(undefined, 'bold');
          doc.text('Citas Pendientes de Pago', margin + imgWidth + 12, logoY + 18);
          doc.setFontSize(10);
          doc.setFont(undefined, 'normal');
          doc.text(`Generado: ${new Date().toLocaleString()}`, margin + imgWidth + 12, logoY + 36);

          const startY = logoY + imgHeight + 12;
          const rows = (appointments || []).map(a => {
            const paciente = a.paciente || {};
            const medico = a.medico || {};
            return [
              paciente.nombreCompleto || paciente.atr_nombre || '-',
              medico.nombreCompleto || medico.atr_nombre || '-',
              a.atr_fecha_cita ? new Date(a.atr_fecha_cita).toLocaleDateString() : '-',
              a.atr_hora_cita || '-',
              a.tipoCitaDescripcion || '-',
              a.atr_motivo_cita || '-',
              a.amount != null ? String(a.amount) : (a.atr_monto || '-')
            ];
          });

          doc.autoTable({
            startY,
            head: [['Paciente','Médico','Fecha','Hora','Tipo','Motivo','Monto']],
            body: rows,
            styles: { fontSize: 10 },
            didDrawPage: () => drawClinicHeader()
          });

          const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : startY + 80;
          doc.setFontSize(9);
          doc.text('Documento generado desde la aplicación.', margin, finalY);
          doc.save(`citas_pendientes_${Date.now()}.pdf`);
        } catch (err) {
          console.error('Error creando PDF de citas', err);
        }
      };

      img.onerror = (e) => { console.error('Error cargando logo para PDF', e); };
    } catch (err) {
      console.error('Error generando reporte', err);
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedAppointment(null);
    setPaymentData({
      paymentMethod: 'cash',
      amount: '',
      reference: '',
      notes: ''
    });
  };

  const handlePaymentSubmit = async () => {
    if (!selectedAppointment) return;

    try {
      await dispatch(payAppointmentThunk({
        appointmentId: selectedAppointment.atr_id_cita,
        paymentData: {
          ...paymentData,
          amount: parseFloat(paymentData.amount)
        }
      }));

      setSnackbar({
        open: true,
        message: 'Pago procesado exitosamente',
        severity: 'success'
      });

      handleCloseModal();

      // Llamar al callback opcional
      if (onPay) {
        onPay(selectedAppointment.atr_id_cita);
      }
    } catch (error) {
      console.error('Error al procesar el pago:', error);
      setSnackbar({
        open: true,
        message: 'Error al procesar el pago: ' + (error.message || 'Error desconocido'),
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const columns = [
    {
      field: 'paciente',
      headerName: 'Paciente',
      width: 200,
      valueGetter: (params) => params.row.paciente?.nombreCompleto || 'N/A'
    },
    {
      field: 'medico',
      headerName: 'Médico',
      width: 200,
      valueGetter: (params) => params.row.medico?.nombreCompleto || 'N/A'
    },
    {
      field: 'atr_fecha_cita',
      headerName: 'Fecha',
      width: 120,
      valueFormatter: (params) => {
        if (!params.value) return 'N/A';
        return new Date(params.value).toLocaleDateString('es-ES');
      }
    },
    {
      field: 'atr_hora_cita',
      headerName: 'Hora',
      width: 100,
      valueFormatter: (params) => {
        if (!params.value) return 'N/A';
        return params.value;
      }
    },
    {
      field: 'tipoCitaDescripcion',
      headerName: 'Tipo de Cita',
      width: 150,
      valueGetter: (params) => params.row.tipoCitaDescripcion || 'N/A'
    },
    {
      field: 'atr_motivo_cita',
      headerName: 'Motivo',
      width: 200,
      valueGetter: (params) => params.row.atr_motivo_cita || 'N/A'
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<PaymentIcon />}
            onClick={() => handlePayClick(params.row)}
            disabled={paymentStatus === 'loading'}
          >
            Pagar
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            size="small"
            startIcon={<VisibilityIcon />}
            onClick={() => {
              // open local modal; also notify parent if provided
              setViewAppointment(params.row);
              setViewModalOpen(true);
              if (onView) { try { onView(params.row); } catch(e){console.error(e);} }
            }}
          >
            Ver
          </Button>
        </Box>
      )
    }
  ];

  const CustomToolbar = () => (
    <GridToolbarContainer>
      <GridToolbarFilterButton />
      <GridToolbarExport />
      <Button variant="outlined" size="small" sx={{ ml: 1 }} onClick={handleGenerateReport}>Generar Reporte</Button>
    </GridToolbarContainer>
  );

  if (!appointments || appointments.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="textSecondary">
          No hay citas pendientes de pago
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <DataGrid
        rows={appointments}
        columns={columns}
        getRowId={(row) => row.atr_id_cita}
        pageSize={10}
        rowsPerPageOptions={[5, 10, 25]}
        components={{ Toolbar: CustomToolbar }}
        disableSelectionOnClick
        loading={paymentStatus === 'loading'}
      />

      {/* Render seleccionado debajo de la tabla */}
      <ViewAppointments open={viewModalOpen} onClose={() => setViewModalOpen(false)} appointment={viewAppointment} />

      {/* Modal de Pago */}
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Procesar Pago
          <IconButton
            aria-label="close"
            onClick={handleCloseModal}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          {selectedAppointment && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                {selectedAppointment.paciente?.nombreCompleto}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <strong>Médico:</strong> {selectedAppointment.medico?.nombreCompleto}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <strong>Fecha:</strong> {new Date(selectedAppointment.atr_fecha_cita).toLocaleDateString('es-ES')}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <strong>Hora:</strong> {selectedAppointment.atr_hora_cita}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <strong>Tipo:</strong> {selectedAppointment.tipoCitaDescripcion}
              </Typography>
            </Box>
          )}

          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Método de Pago</InputLabel>
              <Select
                value={paymentData.paymentMethod}
                label="Método de Pago"
                onChange={(e) => setPaymentData(prev => ({ ...prev, paymentMethod: e.target.value }))}
              >
                <MenuItem value="cash">Efectivo</MenuItem>
                <MenuItem value="card">Tarjeta</MenuItem>
                <MenuItem value="transfer">Transferencia</MenuItem>
                <MenuItem value="check">Cheque</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Monto"
              type="number"
              value={paymentData.amount}
              onChange={(e) => setPaymentData(prev => ({ ...prev, amount: e.target.value }))}
              InputProps={{
                startAdornment: <Typography>$</Typography>,
              }}
              inputProps={{
                step: "0.01",
                min: "0"
              }}
              required
            />

            <TextField
              fullWidth
              label="Referencia"
              value={paymentData.reference}
              onChange={(e) => setPaymentData(prev => ({ ...prev, reference: e.target.value }))}
              placeholder="Número de referencia (opcional)"
            />

            <TextField
              fullWidth
              label="Notas"
              multiline
              rows={3}
              value={paymentData.notes}
              onChange={(e) => setPaymentData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Notas adicionales (opcional)"
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseModal} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={handlePaymentSubmit}
            variant="contained"
            color="primary"
            disabled={paymentStatus === 'loading' || !paymentData.amount}
          >
            {paymentStatus === 'loading' ? 'Procesando...' : 'Confirmar Pago'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AppointmentPendingPaymentList;