import React, { useState, useEffect } from 'react';
import authService from '../services/authService';
import { PRIMARY_RED, PRIMARY_BLACK, WHITE } from '../constants';
import bynetLogo from '../assets/bynet-logo.png';

const LoginPage = ({ onLoginSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is already authenticated
    checkExistingAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const checkExistingAuth = async () => {
    try {
      const isAuth = await authService.isAuthenticated();
      if (isAuth) {
        const userData = authService.getCurrentUser();
        onLoginSuccess(userData);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    }
  };

  const handleMicrosoftLogin = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Login with Microsoft and authenticate with our server
      const userData = await authService.login();
      
      // Notify parent component
      onLoginSuccess(userData);
      
    } catch (error) {
      console.error('Login failed:', error);
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: `linear-gradient(135deg, ${PRIMARY_BLACK} 0%, #2d3748 100%)`,
      fontFamily: 'Arial, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 80%, rgba(191, 46, 26, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(26, 32, 44, 0.1) 0%, transparent 50%)',
        pointerEvents: 'none'
      }} />
      
      <div style={{
        backgroundColor: WHITE,
        padding: '2rem 2rem',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
        textAlign: 'center',
        maxWidth: '380px',
        width: '100%',
        position: 'relative',
        zIndex: 1,
        border: `2px solid ${PRIMARY_RED}`
      }}>
        {/* Logo Section */}
        <div style={{ marginBottom: '2rem' }}>
          {/* Bynet Logo */}
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            backgroundColor: PRIMARY_BLACK,
            padding: '8px',
            boxShadow: `0 6px 16px rgba(191, 46, 26, 0.3)`,
            border: `2px solid ${PRIMARY_RED}`
          }}>
            <img 
              src={bynetLogo} 
              alt="Bynet Logo" 
              style={{
                width: '60px',
                height: '60px',
                objectFit: 'contain'
              }}
              onError={(e) => {
                // Fallback to text if image fails to load
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<div style="font-size: 2rem; font-weight: bold; color: #bf2e1a;">B</div>';
              }}
            />
          </div>
          
          <h1 style={{ 
            color: PRIMARY_BLACK, 
            marginBottom: '0.5rem',
            fontSize: '1.8rem',
            fontWeight: 'bold',
            letterSpacing: '0.5px'
          }}>
            פורטל החברה
          </h1>
          
          <h2 style={{
            color: PRIMARY_RED,
            marginBottom: '0.5rem',
            fontSize: '1rem',
            fontWeight: '600',
            letterSpacing: '0.3px'
          }}>
            Employee Portal
          </h2>
          
          <p style={{ 
            color: '#666', 
            fontSize: '1rem',
            margin: 0,
            fontWeight: '500'
          }}>
            התחבר עם חשבון Microsoft שלך
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fee',
            color: '#c53030',
            padding: '1rem',
            borderRadius: '4px',
            marginBottom: '1rem',
            border: '1px solid #feb2b2'
          }}>
            {error}
          </div>
        )}

        <button
          onClick={handleMicrosoftLogin}
          disabled={isLoading}
          style={{
            backgroundColor: '#0078d4',
            color: WHITE,
            border: 'none',
            padding: '16px 32px',
            borderRadius: '25px',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            opacity: isLoading ? 0.7 : 1,
            transition: 'all 0.3s ease',
            boxShadow: '0 8px 20px rgba(0, 120, 212, 0.3)',
            letterSpacing: '0.3px'
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 12px 25px rgba(0, 120, 212, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading) {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 8px 20px rgba(0, 120, 212, 0.3)';
            }
          }}
        >
          {isLoading ? (
            <>
              <div style={{
                width: '20px',
                height: '20px',
                border: '3px solid #ffffff',
                borderTop: '3px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              מתחבר...
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"/>
              </svg>
              התחבר עם Microsoft
            </>
          )}
        </button>

        <div style={{
          marginTop: '2rem',
          padding: '1.5rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '15px',
          fontSize: '0.9rem',
          color: '#666',
          border: `1px solid #e9ecef`,
          fontWeight: '500'
        }}>
          <div style={{ 
            color: PRIMARY_RED, 
            fontWeight: 'bold', 
            marginBottom: '0.5rem',
            fontSize: '1rem'
          }}>
            עובדי חברה בלבד
          </div>
          התחבר עם חשבון Microsoft הארגוני שלך
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
