import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { FaBars } from 'react-icons/fa';

export default function MainLayout({ user }) {
  const [showSidebar, setShowSidebar] = useState(window.innerWidth >= 768);

  // עדכון אוטומטי של מצב התפריט ב-resize
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setShowSidebar(false);
      else setShowSidebar(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="d-flex flex-column flex-md-row" style={{ minHeight: '100vh', position: 'relative' }}>
      {/* כפתור תפריט במסכים קטנים */}
      <div className="d-md-none p-3 text-end">
        <Button variant="outline-secondary" onClick={() => setShowSidebar(!showSidebar)}>
          <FaBars />
        </Button>
      </div>

      {/* Sidebar מוצג במסכים גדולים תמיד, ובקטנים לפי כפתור */}
      {showSidebar && (
        <div
          className="d-none d-md-block d-flex"
          style={{
            backgroundColor: '#1a202c',
            borderLeft: '1px solid #ccc',
            height: '100vh'
          }}
        >
          <Sidebar />
        </div>
      )}
      {showSidebar && (
        <div
          className="d-md-none"
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            zIndex: 999,
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            display: 'flex',
            justifyContent: 'flex-end',
            backdropFilter: 'blur(1px)'
          }}
          onClick={() => setShowSidebar(false)}
        >
          <div
            style={{
              width: '260px',
              height: '100%',
              backgroundColor: '#1a202c',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar onNavigate={() => setShowSidebar(false)} />
          </div>
        </div>
      )}

      {/* תוכן עיקרי - ממורכז באזור התוכן בלבד */}
      <div 
        className="flex-grow-1 p-4" 
        style={{ 
          marginRight: showSidebar && window.innerWidth >= 768 ? '260px' : 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          minHeight: '100vh',
          backgroundColor: '#f8f9fa'
        }}
      >
        <div style={{
          width: '100%',
          maxWidth: '900px'
        }}>
          <Outlet context={{ user }} />
        </div>
      </div>
    </div>
  );
}
