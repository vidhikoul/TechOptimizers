import React from 'react';
import { Toast } from 'react-bootstrap';

const ToastNotification = ({ showToast, toastMessage, setShowToast }) => {
  return (
    <Toast 
      show={showToast} 
      onClose={() => setShowToast(false)} 
      delay={3000} 
      autohide
      style={{ position: 'fixed', bottom: '20px', right: '20px' }}
    >
      <Toast.Body>{toastMessage}</Toast.Body>
    </Toast>
  );
};

export default ToastNotification;
