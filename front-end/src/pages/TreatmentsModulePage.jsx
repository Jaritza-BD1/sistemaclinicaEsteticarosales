// Dentro de TreatmentsModulePage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Button, Box } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Importar los componentes separados
import TreatmentList from '../Components/treatment/TreatmentList';
import CreateTreatmentModal from '../Components/treatment/CreateTreatmentModal';
import PatientTreatmentDetailModal from '../Components/treatment/PatientTreatmentDetailModal';
import { useTreatment } from '../Components/context/TreatmentContext';
// ... otros imports

function TreatmentsModulePage() {
    const navigate = useNavigate();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isPatientDetailModalOpen, setIsPatientDetailModalOpen] = useState(false);
    const [selectedTreatment, setSelectedTreatment] = useState(null); // Para editar o ver detalles
    const { addTreatment } = useTreatment();

    const handleBack = () => {
        navigate(-1); // Vuelve a la página anterior en el historial
    };

    // ... funciones para abrir/cerrar modales y manejar datos

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={handleBack}
                    sx={{ mr: 2 }}
                >
                    Regresar
                </Button>
                <Typography variant="h4" component="h1" gutterBottom>
                    Módulo de Gestión de Tratamientos
                </Typography>
            </Box>

            {/* Renderizar TreatmentList y pasarle props para abrir modales */}
            <TreatmentList
                onOpenCreateModal={() => setIsCreateModalOpen(true)}
                onOpenPatientDetailModal={(treatment) => {
                    setSelectedTreatment(treatment);
                    setIsPatientDetailModalOpen(true);
                }}
                // ... otras props
            />

            {/* Modales */}
            <CreateTreatmentModal
                open={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSave={async (form) => {
                    try {
                        const created = await addTreatment(form);
                        setIsCreateModalOpen(false);
                        return created;
                    } catch (e) {
                        console.error('Error creating treatment', e);
                        throw e;
                    }
                }}
            />
            <PatientTreatmentDetailModal
                open={isPatientDetailModalOpen}
                onClose={() => setIsPatientDetailModalOpen(false)}
                treatment={selectedTreatment} // Pasar el tratamiento seleccionado
                // ...
            />
        </Container>
    );
}

export default TreatmentsModulePage;