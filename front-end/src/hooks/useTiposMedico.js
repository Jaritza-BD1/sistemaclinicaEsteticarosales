import { useEffect, useState } from 'react';
import api from '../services/api';

export default function useTiposMedico() {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    // Query the maintenance endpoint for TipoMedico directly (avoid using maintenanceService)
    // Note: `api` already has baseURL ending with '/api', so avoid duplicating '/api' in the path.
    api.get('/admin/maintenance/TipoMedico', { params: { page: 1, limit: 1000 } })
      .then((res) => {
        if (!mounted) return;
        const body = res && (res.data || res);
        const payload = (body && body.data) ? body.data : body;
        const list = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [];

        // Normalize each item to include both shapes consumers might expect:
        // - { value, label } (used by some hooks/components)
        // - { id, name } (used by other components)
          // map and coerce id to number (if present) to match form numeric values
          const opts = (Array.isArray(list) ? list : []).map(t => {
            const rawId = t.atr_id_tipo_medico ?? t.id ?? t.value ?? null;
            const id = (rawId !== null && typeof rawId !== 'undefined' && rawId !== '') ? Number(rawId) : null;
            const name = t.atr_nombre_tipo_medico || t.atr_nombre || t.name || t.label || '';
            const creadoPor = t.atr_creado_por ?? t.creado_por ?? null;
            const fechaCreacion = t.atr_fecha_creacion ?? t.fecha_creacion ?? null;
            const modificadoPor = t.atr_modificado_por ?? t.modificado_por ?? null;
            const fechaModificacion = t.atr_fecha_modificacion ?? t.fecha_modificacion ?? null;
            return { id, name, value: id, label: name, creadoPor, fechaCreacion, modificadoPor, fechaModificacion, raw: t };
          });

          // Debug logs to inspect API shape and mapped options
          try {
            // eslint-disable-next-line no-console
            console.log('useTiposMedico: response body =', body);
            // eslint-disable-next-line no-console
            console.log('useTiposMedico: list =', list);
            // eslint-disable-next-line no-console
            console.log('useTiposMedico: mapped opts =', opts);
          } catch (e) {
            // ignore logging errors
          }

          setOptions(opts.filter(o => o.value != null));
      })
      .catch((err) => {
        if (!mounted) return;
        console.error('useTiposMedico error:', err);
        setError(err.customMessage || err.message || 'Error cargando tipos de médico');
      })
      .finally(() => mounted && setLoading(false));

    return () => { mounted = false; };
  }, []);

  return { options, loading, error };
}
