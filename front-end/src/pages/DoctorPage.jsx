import React, { useState } from 'react';
import DoctorModule from '../Components/doctors/DoctorModule';
import HistorialConsultas from '../Components/consultations/HistorialConsultas';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Box } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function DoctorPage() {
		const [histExpanded, setHistExpanded] = useState(false);

		return (
				<div>
						<DoctorModule />

						<Box sx={{ mt: 3 }}>
							<Accordion expanded={histExpanded} onChange={() => setHistExpanded(prev => !prev)}>
								<AccordionSummary expandIcon={<ExpandMoreIcon />}>
									<Typography variant="subtitle1">Historial de Consultas</Typography>
								</AccordionSummary>
								<AccordionDetails>
									{histExpanded && <HistorialConsultas />}
								</AccordionDetails>
							</Accordion>
						</Box>
				</div>
		);
}
