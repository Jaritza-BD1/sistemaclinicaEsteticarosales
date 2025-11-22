import React from 'react';
import { useLocation } from 'react-router-dom';
import AppointmentList from '../Components/appointments/AppointmentList';
import CitasAgendarPage from './CitasAgendarPage';
import { motion, AnimatePresence } from 'framer-motion';

const pageVariant = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export default function CitasPage() {
  const location = useLocation();
  const pathname = location.pathname || '';
  const isModal = location.state && location.state.modal;

  const isAgendarPath = pathname.includes('/agendar');

  return (
    <AnimatePresence mode="wait">
      {isAgendarPath && !isModal ? (
        <motion.div key="agendar" variants={pageVariant} initial="initial" animate="animate" exit="exit">
          <CitasAgendarPage />
        </motion.div>
      ) : (
        <motion.div key="list" variants={pageVariant} initial="initial" animate="animate" exit="exit">
          <AppointmentList />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
