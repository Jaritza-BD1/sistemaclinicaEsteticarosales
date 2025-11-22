import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CreateExam from '../Components/exams/CreateExam';
import ExamList from '../Components/exams/ExamList';
import ExamResult from '../Components/exams/ExamResults';
import ExamenPage from '../pages/ExamenPage';

export default function ExamenRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ExamenPage />}>
        <Route path="crear" element={<CreateExam />} />
        <Route path="lista" element={<ExamList />} />
        <Route path="resultados" element={<ExamResult />} />
        {/* Default index -> lista */}
        <Route index element={<ExamList />} />
      </Route>
    </Routes>
  );
}
