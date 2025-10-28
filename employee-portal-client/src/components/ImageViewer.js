import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaDownload, FaExpand, FaCompress } from 'react-icons/fa';
import { PRIMARY_RED, PRIMARY_BLACK, WHITE } from '../constants';

const ImageViewer = ({ imageUrl, onClose, filename }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // ניקוי blob URL כשהקומפוננטה נסגרת
  React.useEffect(() => {
    return () => {
      if (imageUrl && imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename || 'image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}
        onClick={onClose}
      >
        {/* Controls */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            display: 'flex',
            gap: '10px',
            zIndex: 10000
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleDownload}
            style={{
              background: PRIMARY_RED,
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: WHITE,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = '#a02615'}
            onMouseLeave={(e) => e.target.style.background = PRIMARY_RED}
            title="הורד תמונה"
          >
            <FaDownload />
          </button>
          
          <button
            onClick={toggleFullscreen}
            style={{
              background: PRIMARY_RED,
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: WHITE,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = '#a02615'}
            onMouseLeave={(e) => e.target.style.background = PRIMARY_RED}
            title={isFullscreen ? "צמצם" : "הרחב"}
          >
            {isFullscreen ? <FaCompress /> : <FaExpand />}
          </button>
          
          <button
            onClick={onClose}
            style={{
              background: PRIMARY_RED,
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: WHITE,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = '#a02615'}
            onMouseLeave={(e) => e.target.style.background = PRIMARY_RED}
            title="סגור"
          >
            <FaTimes />
          </button>
        </motion.div>

        {/* Image Container */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          style={{
            maxWidth: isFullscreen ? '100vw' : '90vw',
            maxHeight: isFullscreen ? '100vh' : '90vh',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {isLoading && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: WHITE,
                fontSize: '1.2rem'
              }}
            >
              טוען תמונה...
            </div>
          )}
          
          <img
            src={imageUrl}
            alt={filename || 'תמונה'}
            onLoad={handleImageLoad}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              borderRadius: '8px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
              opacity: isLoading ? 0 : 1,
              transition: 'opacity 0.3s'
            }}
          />
        </motion.div>

        {/* Filename */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: WHITE,
            fontSize: '1rem',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: '8px 16px',
            borderRadius: '20px',
            backdropFilter: 'blur(10px)'
          }}
        >
          {filename || 'תמונה'}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ImageViewer;
