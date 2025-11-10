import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/custom.css";
import "./App.css";
import MainRouter from './routers/main_router';
import LoginPage from './components/LoginPage';
import ToastContainer from './components/ToastContainer';
import PortalIntroModal from './components/PortalIntroModal';
import authService from './services/authService';
import bynetLogo from './assets/bynet-logo.png';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPortalIntro, setShowPortalIntro] = useState(false);

  useEffect(() => {
    checkAuthentication();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      const hasSeenIntro = sessionStorage.getItem('portal_intro_shown');
      if (!hasSeenIntro) {
        setShowPortalIntro(true);
      }
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    document.title = 'פורטל העובדים | בינת';
    let favicon = document.querySelector("link[rel*='icon']");
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.setAttribute('rel', 'icon');
      document.head.appendChild(favicon);
    }
    favicon.setAttribute('type', 'image/png');
    favicon.setAttribute('href', bynetLogo);
  }, []);

  const checkAuthentication = async () => {
    try {
      // Check if we're coming back from a Microsoft redirect
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('code') || urlParams.get('state')) {
        console.log('🔄 Detected Microsoft redirect response, processing...');
        // Give MSAL a moment to process the redirect
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      const isAuth = await authService.isAuthenticated();
      if (isAuth) {
        // Get user from API to get the actual role from database
        try {
          const { getMe } = await import('./services/apiService');
          const userData = await getMe();
          console.log('✅ User data from API (getMe):', userData);
          console.log('✅ User role:', userData?.role, 'Type:', typeof userData?.role);
          
          // Ensure we have the user data
          if (userData && userData.role) {
            setUser(userData);
            setIsAuthenticated(true);
            // Also update stored user data
            authService.storeUser(userData);
          } else {
            console.warn('⚠️ User data missing role, using stored user');
            const storedUser = authService.getCurrentUser();
            setUser(storedUser);
            setIsAuthenticated(true);
          }
        } catch (apiError) {
          console.error('❌ Failed to fetch user from API, using stored user:', apiError);
          // Fallback to stored user if API fails
          const userData = authService.getCurrentUser();
          console.log('📦 Using stored user data:', userData);
          setUser(userData);
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = async (userData) => {
    // After login, fetch fresh user data from API to get actual role
    try {
      const { getMe } = await import('./services/apiService');
      const freshUserData = await getMe();
      console.log('✅ Fresh user data after login (getMe):', freshUserData);
      console.log('✅ Fresh user role:', freshUserData?.role, 'Type:', typeof freshUserData?.role);
      
      if (freshUserData && freshUserData.role) {
        setUser(freshUserData);
        setIsAuthenticated(true);
        // Also update stored user data
        authService.storeUser(freshUserData);
        sessionStorage.removeItem('portal_intro_shown');
        setShowPortalIntro(true);
      } else {
        console.warn('⚠️ Fresh user data missing role, using provided data');
        setUser(userData);
        setIsAuthenticated(true);
        sessionStorage.removeItem('portal_intro_shown');
        setShowPortalIntro(true);
      }
    } catch (apiError) {
      console.error('❌ Failed to fetch user from API after login, using provided data:', apiError);
      // Fallback to provided user data if API fails
      setUser(userData);
      setIsAuthenticated(true);
      sessionStorage.removeItem('portal_intro_shown');
      setShowPortalIntro(true);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      sessionStorage.removeItem('portal_intro_shown');
      setShowPortalIntro(false);
    } catch (error) {
      console.error('Logout failed:', error);
      // Force logout even if Microsoft logout fails
      authService.clearStoredAuth();
      setUser(null);
      setIsAuthenticated(false);
      sessionStorage.removeItem('portal_intro_shown');
      setShowPortalIntro(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{
          textAlign: 'center',
          color: '#1a202c'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #bf2e1a',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p>Loading...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <LoginPage onLoginSuccess={handleLoginSuccess} />
    );
  }

  return (
    <Router>
      <MainRouter user={user} />
      <ToastContainer />
      <PortalIntroModal
        show={showPortalIntro}
        onClose={() => {
          sessionStorage.setItem('portal_intro_shown', 'true');
          setShowPortalIntro(false);
        }}
      />
    </Router>
  );
}

export default App;
