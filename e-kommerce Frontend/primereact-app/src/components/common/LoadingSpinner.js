import React from 'react';
import { ProgressSpinner } from 'primereact/progressspinner';

const LoadingSpinner = ({ size = '50px', message = 'Yükleniyor...' }) => {
  return (
    <div className="loading-container">
      <ProgressSpinner 
        style={{ width: size, height: size }} 
        strokeWidth="4" 
        animationDuration=".5s"
      />
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;