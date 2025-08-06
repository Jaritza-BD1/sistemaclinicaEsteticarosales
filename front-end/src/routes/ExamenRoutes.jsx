import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CreateExam from '../Components/exams/CreateExam';
import ExamList from '../Components/exams/ExamList';
import ExamResult from '../Components/exams/ExamResults';

export default function ExamenRoutes() {
  return (
    <Routes>
      <Route path="crear" element={<CreateExam />} />
      <Route path="lista" element={<ExamList />} />
      <Route path="resultados" element={<ExamResult />} />
    </Routes>
  );
}
