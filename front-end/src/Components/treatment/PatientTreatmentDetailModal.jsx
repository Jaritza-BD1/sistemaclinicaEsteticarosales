import React, { useEffect, useState, useCallback } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, List, ListItem, ListItemText, Divider, TextField, Snackbar, Alert } from '@mui/material';
import api from '../../services/api';

const PatientTreatmentDetailModal = ({ open, onClose, treatment }) => {
	const t = treatment || {};
	const [procedures, setProcedures] = useState([]);
	const [loading, setLoading] = useState(false);
	const [newProcName, setNewProcName] = useState('');
	const [newProcType, setNewProcType] = useState('ESTETICO');
	const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

	const fetchProcedures = useCallback(async () => {
		if (!t?.id && !t?.atr_id_tratamiento) return setProcedures([]);
		const tid = t.id || t.atr_id_tratamiento;
		setLoading(true);
		try {
			const resp = await api.get(`/treatments/${tid}/procedures`);
			setProcedures(resp.data || []);
		} catch (e) {
			console.error('Error fetching procedures', e);
			setProcedures([]);
		} finally {
			setLoading(false);
		}
	}, [t]);

	useEffect(() => {
		if (open) fetchProcedures();
	}, [open, fetchProcedures]);

	const handleCreateProcedure = async () => {
		const tid = t.id || t.atr_id_tratamiento;
		if (!tid || !newProcName) return;
		try {
			setNotification({ open: true, message: 'Creando procedimiento...', severity: 'info' });
			await api.post(`/treatments/${tid}/procedures`, { atr_procedimiento_nombre: newProcName, atr_procedimiento_tipo: newProcType });
			setNewProcName('');
			setNewProcType('ESTETICO');
			setNotification({ open: true, message: 'Procedimiento creado', severity: 'success' });
			fetchProcedures();
		} catch (e) {
			console.error('Error creating procedure', e);
			const message = e?.response?.data?.message || e?.message || 'Error al crear procedimiento';
			setNotification({ open: true, message, severity: 'error' });
		}
	};

	return (
		<Dialog open={!!open} onClose={onClose} maxWidth="md" fullWidth>
			<DialogTitle>Detalles del Tratamiento</DialogTitle>
			<DialogContent dividers>
				<Box sx={{ mb: 2 }}>
					<Typography variant="h6">{t.name || t.nombre_tratamiento || 'Sin título'}</Typography>
					{t.descripcion && <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{t.descripcion}</Typography>}
				</Box>

				<Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
					<Typography><strong>Especialidad:</strong> {t.especialidad || '-'}</Typography>
					<Typography><strong>Costo:</strong> {t.costo ? `L. ${t.costo}` : '-'}</Typography>
					<Typography><strong>Duración:</strong> {t.duracion ? `${t.duracion} min` : '-'}</Typography>
					<Typography><strong>Estado:</strong> {t.estado || '-'}</Typography>
				</Box>

				<Divider sx={{ my: 2 }} />

				<Typography variant="h6">Procedimientos</Typography>
				{loading ? (
					<Typography>Loading...</Typography>
				) : procedures.length === 0 ? (
					<Typography sx={{ mt: 1 }}>No hay procedimientos registrados.</Typography>
				) : (
					<List>
						{procedures.map(p => (
							<ListItem key={p.atr_id_procedimiento || p.id} divider>
								<ListItemText primary={p.atr_procedimiento_nombre || p.name} secondary={p.atr_procedimiento_tipo || ''} />
							</ListItem>
						))}
					</List>
				)}

				<Box sx={{ mt: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
					<TextField label="Nombre del procedimiento" value={newProcName} onChange={(e) => setNewProcName(e.target.value)} size="small" />
					<TextField label="Tipo" value={newProcType} onChange={(e) => setNewProcType(e.target.value)} size="small" />
					<Button variant="contained" onClick={handleCreateProcedure}>Agregar Procedimiento</Button>
				</Box>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Cerrar</Button>
			</DialogActions>

			<Snackbar
				open={notification.open}
				autoHideDuration={4000}
				onClose={() => setNotification(prev => ({ ...prev, open: false }))}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
			>
				<Alert onClose={() => setNotification(prev => ({ ...prev, open: false }))} severity={notification.severity} sx={{ borderRadius: 2 }}>
					{notification.message}
				</Alert>
			</Snackbar>
		</Dialog>
	);
};

export default PatientTreatmentDetailModal;
