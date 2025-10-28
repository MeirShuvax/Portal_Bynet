import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes, FaSpinner } from 'react-icons/fa';
import { PRIMARY_RED, PRIMARY_BLACK, WHITE } from '../constants';

const Toast = ({ 
  message, 
  type = 'info', 
  duration = 4000, 
  onClose, 
  isVisible = false 
}) => {
  const [show, setShow] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(() => onClose && onClose(), 300); // Wait for animation
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => onClose && onClose(), 300);
  };

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: <FaCheckCircle />,
          bgColor: '#10b981',
          borderColor: '#059669',
          textColor: WHITE
        };
      case 'error':
        return {
          icon: <FaExclamationTriangle />,
          bgColor: PRIMARY_RED,
          borderColor: '#a02615',
          textColor: WHITE
        };
      case 'warning':
        return {
          icon: <FaExclamationTriangle />,
          bgColor: '#f59e0b',
          borderColor: '#d97706',
          textColor: WHITE
        };
      case 'loading':
        return {
          icon: <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />,
          bgColor: '#6366f1',
          borderColor: '#4f46e5',
          textColor: WHITE
        };
      default:
        return {
          icon: <FaInfoCircle />,
          bgColor: '#3b82f6',
          borderColor: '#2563eb',
          textColor: WHITE
        };
    }
  };

  const config = getToastConfig();

  return (
    <>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <AnimatePresence>
        {show && (
          <motion.div
          initial={{ y: 100, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 100, opacity: 0, scale: 0.8 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30 
          }}
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10000,
            minWidth: '300px',
            maxWidth: '500px',
            backgroundColor: config.bgColor,
            border: `2px solid ${config.borderColor}`,
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backdropFilter: 'blur(10px)'
          }}
        >
          {/* Icon */}
          <div style={{
            fontSize: '1.2rem',
            color: config.textColor,
            flexShrink: 0
          }}>
            {config.icon}
          </div>

          {/* Message */}
          <div style={{
            flex: 1,
            color: config.textColor,
            fontSize: '0.95rem',
            fontWeight: '500',
            lineHeight: '1.4'
          }}>
            {message}
          </div>

          {/* Close Button - רק אם זה לא loading */}
          {type !== 'loading' && (
            <button
              onClick={handleClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: config.textColor,
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.2s',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              <FaTimes size={12} />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
};

export default Toast;
