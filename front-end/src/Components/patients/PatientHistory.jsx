import React, { useEffect, useState } from 'react';
import { Button, Box } from '@mui/material';
import usePatients from '../../hooks/usePatients';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logoSvg from '../../logo.svg';

const TABS = ['citas', 'consultas', 'examenes', 'tratamientos'];

export default function PatientHistory({ patientId: propPatientId }) {
  const [tab, setTab] = useState('citas');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const {
    history,
    loading,
    error,
    loadHistory,
    clearHist
  } = usePatients();

  useEffect(() => {
    const idToLoad = propPatientId || undefined;
    if (idToLoad) {
      loadHistory(idToLoad, { appointments_page: page, appointments_limit: pageSize, consultations_page: 1, consultations_limit: 10, treatments_page:1, treatments_limit:10, orders_page:1, orders_limit:10 });
    }
    return () => { clearHist(); };
  }, [propPatientId, loadHistory, page, clearHist]);

  const meta = history?.meta;

  const generatePdf = async (title, headers, rows, fileSuffix = '') => {
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
          doc.text(title, margin + imgWidth + 12, logoY + 18);
          doc.setFontSize(10);
          doc.setFont(undefined, 'normal');
          doc.text(`Generado: ${new Date().toLocaleString()}`, margin + imgWidth + 12, logoY + 36);

          const startY = logoY + imgHeight + 12;
          doc.autoTable({
            startY,
            head: [headers],
            body: rows,
            styles: { fontSize: 10 },
            didDrawPage: () => drawClinicHeader()
          });

          const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : startY + 80;
          doc.setFontSize(9);
          doc.text('Documento generado desde la aplicación.', margin, finalY);
          doc.save(`${title.replace(/\s+/g,'_').toLowerCase()}_${Date.now()}${fileSuffix}.pdf`);
        } catch (err) {
          console.error('Error creando PDF', err);
        }
      };

      img.onerror = (e) => { console.error('Error cargando logo para PDF', e); };
    } catch (err) {
      console.error('Error generando PDF', err);
    }
  };

  return (
    <div className="patient-history">
      <h3>Historial del paciente</h3>
      {loading && <div>Loading...</div>}
      {error && <div className="error">{error}</div>}
      {!history && !loading && <div>No hay historial disponible.</div>}

      {history && (
        <div>
          <div className="history-header">
            <strong>{history.patient?.atr_nombre} {history.patient?.atr_apellido}</strong>
            <div>Expediente: {history.expediente?.numero}</div>
          </div>

          <div className="tabs">
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)} className={tab === t ? 'active' : ''}>
                {t}
                {meta?.counts && (
                  <span className="count"> {meta.counts[t === 'citas' ? 'appointments' : t === 'consultas' ? 'consultations' : t === 'examenes' ? 'orders' : 'treatments'] || 0}</span>
                )}
              </button>
            ))}
          </div>

          <div className="tab-content">
            {tab === 'citas' && (
              <div>
                <Box sx={{ mb: 2 }}>
                  <Button variant="outlined" onClick={() => {
                    const headers = ['Fecha', 'Hora', 'Motivo', 'Médico', 'Lugar'];
                    const rows = (history.citas || []).map(c => {
                      const doctor = c.medico || c.doctor || {};
                      const doctorName = doctor.atr_nombre || doctor.nombre || doctor.atr_nombre_medico || c.atr_nombre_medico || '-';
                      const lugar = c.atr_lugar || (c.lugar && (c.lugar.atr_nombre || c.lugar.nombre)) || '-';
                      return [c.atr_fecha_cita || '-', c.atr_hora_cita || '-', c.atr_motivo_cita || '-', doctorName, lugar];
                    });
                    generatePdf('Citas', headers, rows, '_citas');
                  }}>Generar reporte</Button>
                </Box>
                {(history.citas || []).map(c => (
                  <div key={c.atr_id_cita} className="item">
                    <div>{c.atr_fecha_cita} {c.atr_hora_cita}</div>
                    <div>{c.atr_motivo_cita}</div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'consultas' && (
              <div>
                <Box sx={{ mb: 2 }}>
                  <Button variant="outlined" onClick={() => {
                    const headers = ['Fecha', 'Diagnóstico', 'Tratamientos', 'Médico', 'Siguiente Visita'];
                    const rows = (history.historialConsulta || []).map(c => {
                      const doctor = c.medico || c.doctor || {};
                      const doctorName = doctor.atr_nombre || doctor.nombre || doctor.atr_nombre_medico || c.atr_nombre_medico || '-';
                      const siguiente = c.atr_sig_visit_dia ? new Date(c.atr_sig_visit_dia).toLocaleString() : '-';
                      return [c.atr_fecha_consulta || '-', c.atr_diagnostico || '-', (c.tratamientos || []).length || 0, doctorName, siguiente];
                    });
                    generatePdf('Consultas', headers, rows, '_consultas');
                  }}>Generar reporte</Button>
                </Box>
                {(history.historialConsulta || []).map(c => (
                  <div key={c.atr_id_consulta} className="item">
                    <div>{c.atr_fecha_consulta}</div>
                    <div>Diagnóstico: {c.atr_diagnostico}</div>
                    <div>Tratamientos: {(c.tratamientos || []).length}</div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'examenes' && (
              <div>
                <Box sx={{ mb: 2 }}>
                  <Button variant="outlined" onClick={() => {
                    const headers = ['Orden', 'Fecha', 'Resultados disponibles', 'Resultado', 'Solicitado por'];
                    const rows = (history.examenes || []).map(o => {
                      const resultado = o.atr_resultados || o.resultados || '-';
                      const solicitante = o.medico || o.solicitado_por || o.doctor || {};
                      const solicitanteName = (solicitante.atr_nombre || solicitante.nombre || solicitante.atr_nombre_medico) || '-';
                      return [o.atr_id_orden_exa || '-', o.atr_fecha_solicitud || '-', o.atr_resultados_disponibles ? 'Sí' : 'No', resultado, solicitanteName];
                    });
                    generatePdf('Exámenes', headers, rows, '_examenes');
                  }}>Generar reporte</Button>
                </Box>
                {(history.examenes || []).map(o => (
                  <div key={o.atr_id_orden_exa} className="item">
                    <div>Orden: {o.atr_id_orden_exa} - {o.atr_fecha_solicitud}</div>
                    <div>Resultados disponibles: {o.atr_resultados_disponibles ? 'Sí' : 'No'}</div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'tratamientos' && (
              <div>
                <Box sx={{ mb: 2 }}>
                  <Button variant="outlined" onClick={() => {
                    const headers = ['Inicio', 'Fin', 'Diagnóstico', 'Sesiones totales', 'Producto'];
                    const rows = (history.tratamientos || []).map(t => {
                      const sesiones = t.atr_numero_sesiones || t.numero_sesiones || '-';
                      const producto = (t.Producto && (t.Producto.atr_nombre_producto || t.Producto.nombre)) || t.atr_producto_nombre || '-';
                      return [t.atr_fecha_inicio || '-', t.atr_fecha_fin || 'En curso', t.atr_diagnostico || '-', sesiones, producto];
                    });
                    generatePdf('Tratamientos', headers, rows, '_tratamientos');
                  }}>Generar reporte</Button>
                </Box>
                {(history.tratamientos || []).map(t => (
                  <div key={t.atr_id_tratamiento} className="item">
                    <div>{t.atr_fecha_inicio} → {t.atr_fecha_fin || 'En curso'}</div>
                    <div>{t.atr_diagnostico}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pagination">
            <button onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</button>
            <span>Page {page}</span>
            <button onClick={() => setPage(p => p + 1)}>Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
