import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
  Chip,
  Alert
} from '@mui/material';
import api from '../services/api';

const PatientHistoryPanel = ({ patientId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (patientId) {
      loadHistory();
    }
  }, [patientId]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/consultations?patientId=${patientId}`);
      setHistory(res.data.data);
    } catch (err) {
      setError('Error cargando historial del paciente');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Card><CardContent>Cargando historial...</CardContent></Card>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Historial Médico del Paciente</Typography>
        <Divider sx={{ mb: 2 }} />

        {history.length === 0 ? (
          <Typography color="textSecondary">No hay consultas previas registradas</Typography>
        ) : (
          <List>
            {history.map((item, index) => (
              <React.Fragment key={item.atr_id_consulta || index}>
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary={
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle1">
                          Consulta del {item.atr_fecha_consulta}
                        </Typography>
                        <Chip
                          label={item.appointment?.EstadoCita?.atr_nombre_estado || 'Finalizada'}
                          size="small"
                          color="success"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          <strong>Síntomas:</strong> {item.atr_sintomas_paciente || 'No especificados'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          <strong>Diagnóstico:</strong> {item.atr_diagnostico || 'No especificado'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          <strong>Observaciones:</strong> {item.atr_observaciones || 'Ninguna'}
                        </Typography>
                        {(item.atr_peso || item.atr_altura || item.atr_temperatura) && (
                          <Typography variant="body2" color="textSecondary">
                            <strong>Signos Vitales:</strong>
                            {item.atr_peso && ` Peso: ${item.atr_peso}kg`}
                            {item.atr_altura && ` Altura: ${item.atr_altura}cm`}
                            {item.atr_temperatura && ` Temp: ${item.atr_temperatura}°C`}
                          </Typography>
                        )}
                        {item.ordenesExamen && item.ordenesExamen.length > 0 && (
                          <Typography variant="body2" color="textSecondary">
                            <strong>Exámenes:</strong> {item.ordenesExamen.length} orden(es)
                          </Typography>
                        )}
                        {item.recetas && item.recetas.length > 0 && (
                          <Typography variant="body2" color="textSecondary">
                            <strong>Recetas:</strong> {item.recetas.length} receta(s)
                          </Typography>
                        )}
                        {item.tratamientos && item.tratamientos.length > 0 && (
                          <Typography variant="body2" color="textSecondary">
                            <strong>Tratamientos:</strong> {item.tratamientos.length} tratamiento(s)
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                {index < history.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientHistoryPanel;