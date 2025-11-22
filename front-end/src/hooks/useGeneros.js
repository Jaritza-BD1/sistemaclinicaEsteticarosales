import { useEffect, useState } from 'react';
import api from '../services/api';

export default function useGeneros() {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    api.get('/generos')
      .then((res) => {
        if (!mounted) return;
        const payload = res?.data;
        const list = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [];
        const opts = list.map(g => ({ value: g.atr_id_genero || g.id, label: g.atr_genero || g.name || '' }));
        setOptions(opts.filter(o => o.value != null));
      })
      .catch((err) => {
        if (!mounted) return;
        console.error('useGeneros error:', err);
        setError(err.customMessage || err.message || 'Error cargando géneros');
      })
      .finally(() => mounted && setLoading(false));

    return () => { mounted = false; };
  }, []);

  return { options, loading, error };
}
