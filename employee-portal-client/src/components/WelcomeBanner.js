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
                className="welcome-banner-content text-center"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                style={{ position: 'relative', zIndex: 1 }}
            >
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
                        margin: '0 auto 0.5rem'
                    }}
                >
                    {systemInfo}
                </motion.div>
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