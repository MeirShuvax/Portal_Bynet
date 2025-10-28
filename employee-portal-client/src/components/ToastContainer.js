import React, { useState, useEffect } from 'react';
import Toast from './Toast';
import toastService from '../services/toastService';

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToastsChange = (newToasts) => {
      console.log('🎯 ToastContainer received toasts:', newToasts.length);
      setToasts(newToasts);
    };

    console.log('🎧 ToastContainer adding listener');
    toastService.addListener(handleToastsChange);

    return () => {
      console.log('🎧 ToastContainer removing listener');
      toastService.removeListener(handleToastsChange);
    };
  }, []);

  const handleToastClose = (toastId) => {
    toastService.remove(toastId);
  };

  return (
    <div style={{ position: 'relative' }}>
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{
            position: 'fixed',
            bottom: `${20 + (index * 80)}px`,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10000 - index
          }}
        >
          <Toast
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            isVisible={true}
            onClose={() => handleToastClose(toast.id)}
          />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
