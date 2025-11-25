import React, { useEffect, useState } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Divider, IconButton, CircularProgress } from '@mui/material';
import { format } from 'date-fns';
import { useNotifications } from '../../context/NotificationsContext';
import * as appointmentService from '../../services/appointmentService';
import VisibilityIcon from '@mui/icons-material/Visibility';

export default function HistorialCitas({ limit = 8, onView }) {
  const { notify } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        // Try calling the service with a small limit to get recent appointments
        const res = await appointmentService.fetchAppointments({ limit });
        // Normalize several possible shapes
        let list = [];
        if (!res) list = [];
        else if (Array.isArray(res)) list = res;
        else if (res.data && Array.isArray(res.data)) list = res.data;
        else if (res.data && res.data.data && Array.isArray(res.data.data)) list = res.data.data;
        else if (res.data && res.data.items && Array.isArray(res.data.items)) list = res.data.items;
        else if (res.items && Array.isArray(res.items)) list = res.items;
        else if (res.results && Array.isArray(res.results)) list = res.results;
        else if (res.data && typeof res.data === 'object') {
          // maybe the service returned an object with items inside
          const possible = res.data.items || res.data.data || res.data.results;
          if (Array.isArray(possible)) list = possible;
        }

        if (mounted) setItems(list.slice(0, limit));
      } catch (err) {
        console.error('Error cargando historial de citas', err);
        notify({ message: err?.response?.data?.message || err?.message || 'Error cargando historial de citas', severity: 'error' });
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [limit, notify]);

  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>Últimas citas</Typography>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}><CircularProgress size={20} /></Box>
      ) : (
        <List dense>
          {items.length === 0 ? (
            <Typography variant="body2" color="text.secondary">No hay citas recientes</Typography>
          ) : items.map(item => {
            const id = item?.atr_id_cita || item?.id || item?.appointmentId || item?.id_cita || '';
            const paciente = item?.Patient?.atr_nombre ? `${item.Patient.atr_nombre} ${item.Patient.atr_apellido || ''}`.trim() : (item?.patient?.atr_nombre ? `${item.patient.atr_nombre} ${item.patient.atr_apellido || ''}`.trim() : (item?.atr_nombre || item?.paciente || '-'));
            const medico = item?.Doctor?.atr_nombre ? `${item.Doctor.atr_nombre} ${item.Doctor.atr_apellido || ''}`.trim() : (item?.doctor?.atr_nombre ? `${item.doctor.atr_nombre} ${item.doctor.atr_apellido || ''}`.trim() : (item?.atr_nombre_medico || '-'));
            const fecha = item?.start ? new Date(item.start) : (item?.atr_fecha_cita ? new Date(`${item.atr_fecha_cita} ${item.atr_hora_cita || ''}`) : null);
            return (
              <React.Fragment key={id || Math.random()}>
                <ListItem secondaryAction={onView ? (
                  <IconButton edge="end" aria-label="ver" onClick={() => onView(item)} size="small"><VisibilityIcon fontSize="small" /></IconButton>
                ) : null}>
                  <ListItemText primary={paciente} secondary={`${medico} • ${fecha ? format(fecha, 'dd/MM/yyyy HH:mm') : (item?.atr_hora_cita || '-')}`} />
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            );
          })}
        </List>
      )}
    </Box>
  );
}
