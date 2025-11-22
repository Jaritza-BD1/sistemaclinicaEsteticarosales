import React, { useEffect, useState } from 'react';
import usePatients from '../../hooks/usePatients';
import { useParams } from 'react-router-dom';

const TABS = ['citas', 'consultas', 'examenes', 'tratamientos'];

export default function PatientHistory() {
  const { id } = useParams();
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
    loadHistory(id, { appointments_page: page, appointments_limit: pageSize, consultations_page: 1, consultations_limit: 10, treatments_page:1, treatments_limit:10, orders_page:1, orders_limit:10 });
    return () => { clearHist(); };
  }, [id, loadHistory, page, clearHist]);

  const meta = history?.meta;

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
