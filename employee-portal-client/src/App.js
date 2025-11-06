import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/custom.css";
import "./App.css";
import { Container, Row, Col, Button } from "react-bootstrap";
import Sidebar from "./components/Sidebar";
import MainRouter from './routers/main_router';
import LoginPage from './components/LoginPage';
import ToastContainer from './components/ToastContainer';
import authService from './services/authService';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [skipAuth, setSkipAuth] = useState(false); // Temporary bypass

  useEffect(() => {
    checkAuthentication();
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
      } else {
        console.warn('⚠️ Fresh user data missing role, using provided data');
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (apiError) {
      console.error('❌ Failed to fetch user from API after login, using provided data:', apiError);
      // Fallback to provided user data if API fails
      setUser(userData);
      setIsAuthenticated(true);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout failed:', error);
      // Force logout even if Microsoft logout fails
      authService.clearStoredAuth();
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Temporary bypass function for testing
  const handleSkipAuth = () => {
    setSkipAuth(true);
    setIsAuthenticated(true);
    setUser({
      id: 1,
      email: 'test@bynet.co.il',
      name: 'Test User',
      role: 'admin'
    });
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

  if (!isAuthenticated && !skipAuth) {
    return (
      <>
        <LoginPage onLoginSuccess={handleLoginSuccess} />
        {/* Temporary bypass button - REMOVE IN PRODUCTION */}
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 9999
        }}>
          <Button 
            variant="outline-danger"
            size="sm"
            onClick={handleSkipAuth}
            style={{
              fontSize: '0.75rem',
              padding: '5px 10px'
            }}
          >
            ⚠️ Skip Auth (Dev Only)
          </Button>
        </div>
      </>
    );
  }

  return (
    <Router>
      <MainRouter user={user} />
      <ToastContainer />
    </Router>
  );
}

export default App;
