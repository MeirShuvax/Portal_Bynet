import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';

const WelcomeBanner = ({ imageUrl }) => {
    const { user } = useOutletContext();
    const today = new Date();
    const dateStr = today.toLocaleDateString('he-IL', { year: 'numeric', month: 'long', day: 'numeric' });
    
    // קבלת שם המשתמש
    const userName = user?.name || user?.full_name || 'עובד יקר';
    
    // הודעת ברוכים הבאים אישית
    const welcomeMessage = `ברוך הבא, ${userName}!`;
    
    // מידע על המערכת החדשה
    const systemInfo = "🌟 פורטל העובדים המחובר של בינת - מקום אחד לכל המידע, החדשות והחיבורים שלך!";
    
    return (
        <motion.div 
            className="welcome-banner-container"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{
                background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
                borderRadius: '15px',
                padding: '1rem 1.5rem',
                margin: '0 auto',
                width: '100%',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Background Pattern */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle at 20% 80%, rgba(191, 46, 26, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(26, 32, 44, 0.05) 0%, transparent 50%)',
                pointerEvents: 'none'
            }} />
            
            <motion.div 
                className="welcome-banner-content"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                style={{ position: 'relative', zIndex: 1 }}
            >
                <div className="row align-items-center gy-2 gy-md-0 g-0 w-100">
                    <div className="col-12 col-md-6 px-3 px-md-4" style={{ textAlign: 'center', minWidth: 0 }}>
                        <motion.div 
                            className="welcome-banner-date"
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.4 }}
                            style={{
                                fontSize: '0.8rem',
                                color: '#e2e8f0',
                                marginBottom: '0.3rem',
                                fontWeight: '500'
                            }}
                        >
                            {dateStr}
                        </motion.div>
                        
                        <motion.h2 
                            className="welcome-banner-title"
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                            style={{
                                fontSize: '1.2rem',
                                fontWeight: '700',
                                color: '#ffffff',
                                marginBottom: '0.5rem',
                                lineHeight: '1.2'
                            }}
                        >
                            {welcomeMessage}
                        </motion.h2>
                        
                        <motion.div 
                            className="welcome-banner-subtitle"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.4 }}
                            style={{
                                fontSize: '0.8rem',
                                color: '#cbd5e0',
                                marginBottom: '0.5rem',
                                lineHeight: '1.3',
                                maxWidth: '500px',
                                margin: '0 auto'
                            }}
                        >
                            {systemInfo}
                        </motion.div>
                    </div>
                    <div className="d-none d-md-block col-md-3" />
                    <div className="col-12 col-md-3 d-flex justify-content-md-end justify-content-center align-items-center mt-2 mt-md-0 pt-md-3">
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.4 }}
                        >
                            <a
                                href="https://bynetdcs.co.il"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    color: '#cbd5e0',
                                    fontSize: '0.8rem',
                                    textDecoration: 'underline',
                                    textDecorationColor: '#fff',
                                    textDecorationThickness: '1px',
                                    textUnderlineOffset: '4px',
                                    fontWeight: 600,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.35rem'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = '#fff';
                                    e.currentTarget.style.textDecorationColor = '#fff';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = '#cbd5e0';
                                    e.currentTarget.style.textDecorationColor = '#fff';
                                }}
                            >
                                מעבר לאתר Bynet Data Centers
                                <span style={{ fontSize: '0.7rem' }}>↗</span>
                            </a>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
            
            {/* Subtle sparkle effect */}
            <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                width: '4px',
                height: '4px',
                background: '#bf2e1a',
                borderRadius: '50%',
                animation: 'sparkle 2s ease-in-out infinite'
            }} />
            <div style={{
                position: 'absolute',
                bottom: '30px',
                left: '30px',
                width: '3px',
                height: '3px',
                background: '#1a202c',
                borderRadius: '50%',
                animation: 'sparkle 2s ease-in-out infinite 0.5s'
            }} />
        </motion.div>
    );
};

export default WelcomeBanner;