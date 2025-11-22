import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container, Typography, Button, Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import CreateExam from '../Components/exams/CreateExam';
import ExamResult from '../Components/exams/ExamResults';
import { ExamModalProvider, useExamModal } from '../context/ExamModalContext';

function ExamenPageInner() {
  const {
    createOpen,
    resultsOpen,
    currentExamId,
    openCreate,
    openResults,
    closeCreate,
    closeResults
  } = useExamModal();

  return (
    <Container maxWidth="lg" sx={{ mt: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Módulo de Exámenes</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" color="primary" onClick={() => openResults(null)}>
            Ver Resultados (Modal)
          </Button>
          <Button variant="contained" color="primary" onClick={() => openCreate()}>
            Nuevo Examen
          </Button>
        </Box>
      </Box>

      <Box>
        {/* Render child routes: lista, crear, resultados */}
        <Outlet />
      </Box>

      {/* Modal: Crear Examen */}
      <Dialog open={createOpen} onClose={closeCreate} fullWidth maxWidth="xl">
        <DialogTitle sx={{ m: 0, p: 2 }}>
          Nuevo Examen
          <IconButton
            aria-label="close"
            onClick={closeCreate}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <CreateExam />
        </DialogContent>
      </Dialog>

      {/* Modal: Ver/Editar Resultados */}
      <Dialog open={resultsOpen} onClose={closeResults} fullWidth maxWidth="xl">
        <DialogTitle sx={{ m: 0, p: 2 }}>
          Resultados del Examen
          <IconButton
            aria-label="close"
            onClick={closeResults}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <ExamResult examId={currentExamId} />
        </DialogContent>
      </Dialog>
    </Container>
  );
}

export default function ExamenPage() {
  return (
    <ExamModalProvider>
      <ExamenPageInner />
    </ExamModalProvider>
  );
}
