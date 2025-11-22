import { useEffect, useState } from 'react';
import api from '../services/api';

export default function useEspecialidades() {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    // Usar la instancia axios `api` para aprovechar interceptores (Authorization, manejo de errores)
    api.get('/especialidades')
      .then((res) => {
        if (!mounted) return;
        // ResponseService wraps results as { success, message, data }
        const payload = res?.data;
        const list = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [];
        const opts = list.map(e => ({ id: e.atr_id_especialidad || e.id || e.atr_id || e.value || null, name: e.atr_especialidad || e.atr_nombre || e.name || e.label || '' }));
        setOptions(opts.filter(o => o.id != null));
      })
      .catch((err) => {
        if (!mounted) return;
        console.error('useEspecialidades error:', err);
        // Priorizar customMessage que puede establecer el interceptor
        const msg = err.customMessage || err.message || 'Error al cargar especialidades';
        setError(msg);
      })
      .finally(() => mounted && setLoading(false));

    return () => { mounted = false; };
  }, []);

  return { options, loading, error };
}
