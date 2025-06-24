// src/Components/common/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh'
  }}>
    <div>Cargando...</div>
  </div>
);

export const LoadingSpinner2 = ({ fullScreen = false }) => (
  <div className={`flex justify-center items-center ${fullScreen ? 'h-screen' : 'h-full'}`}>
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);
export default LoadingSpinner;