import React, { useEffect, useState } from 'react';
import { fetchUsers } from '../services/userService';
import { useNavigate } from 'react-router-dom';
import { FaBuilding } from 'react-icons/fa';
import { motion } from 'framer-motion';

import { PRIMARY_RED, PRIMARY_BLACK, WHITE, API_BASE_URL, getImageUrl } from '../constants';

const BASE_URL = API_BASE_URL;

// פונקציה ליצירת ראשי תיבות
const getInitials = (fullName) => {
  if (!fullName) return '';
  const names = fullName.split(' ');
  if (names.length >= 2) {
    return (names[0][0] + names[1][0]).toUpperCase();
  }
  return fullName.substring(0, 2).toUpperCase();
};

// פונקציה ליצירת צבע רנדומלי לראשי תיבות
const getRandomColor = (name) => {
  const colors = [
    '#e53e3e', '#dd6b20', '#d69e2e', '#38a169', '#319795', 
    '#3182ce', '#553c9a', '#b83291', '#97266d', '#742a2a'
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

const CompanyTeam = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // אנימציות
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  useEffect(() => {
    fetchUsers()
      .then((data) => {
        console.log('Company team data:', data);
        setUsers(data);
        setFilteredUsers(data);
      })
      .catch((error) => {
        console.error('Error fetching users:', error);
        setUsers([]);
        setFilteredUsers([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // חיפוש וסינון
  useEffect(() => {
    if (!searchTerm) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.department?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#f8f9fa', 
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: PRIMARY_RED }}>טוען צוות החברה...</h2>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      style={{ 
        minHeight: '100vh', 
        background: '#f8f9fa', 
        padding: '20px',
        direction: 'rtl'
      }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div 
        style={{ 
          background: WHITE, 
          borderRadius: '18px', 
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)', 
          padding: '24px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
        variants={itemVariants}
      >
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleBack}
            style={{
              background: 'transparent',
              border: `2px solid ${PRIMARY_RED}`,
              color: PRIMARY_RED,
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontWeight: '500'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = PRIMARY_RED;
              e.target.style.color = WHITE;
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = PRIMARY_RED;
            }}
          >
            ← חזור
          </button>
          
          <button
            onClick={() => navigate('/organizational-chart')}
            style={{
              background: PRIMARY_RED,
              border: `2px solid ${PRIMARY_RED}`,
              color: WHITE,
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#a02615';
              e.target.style.borderColor = '#a02615';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = PRIMARY_RED;
              e.target.style.borderColor = PRIMARY_RED;
            }}
          >
            <FaBuilding /> מבנה ארגוני
          </button>
        </div>
        
        <h1 style={{ 
          color: PRIMARY_RED, 
          margin: 0, 
          fontSize: '2rem',
          fontWeight: 'bold'
        }}>
          צוות החברה
        </h1>
        
        <div style={{ width: '80px' }}></div> {/* Spacer for centering */}
      </motion.div>

      {/* Search Bar */}
      <motion.div 
        style={{ 
          background: WHITE, 
          borderRadius: '18px', 
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)', 
          padding: '20px',
          marginBottom: '24px'
        }}
        variants={itemVariants}
      >
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          maxWidth: '400px',
          margin: '0 auto'
        }}>
          <span style={{ fontSize: '1.2rem' }}>🔍</span>
          <input
            type="text"
            placeholder="חפש חבר צוות..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              padding: '12px 16px',
              border: `2px solid #e2e8f0`,
              borderRadius: '25px',
              fontSize: '1rem',
              outline: 'none',
              transition: 'border-color 0.2s',
              direction: 'rtl'
            }}
            onFocus={(e) => e.target.style.borderColor = PRIMARY_RED}
            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '1.2rem',
                cursor: 'pointer',
                color: '#666',
                padding: '4px'
              }}
            >
              ✕
            </button>
          )}
        </div>
        {searchTerm && (
          <p style={{ 
            textAlign: 'center', 
            margin: '12px 0 0 0', 
            color: '#666',
            fontSize: '0.9rem'
          }}>
            נמצאו {filteredUsers.length} חברי צוות
          </p>
        )}
      </motion.div>

      {/* Team Grid */}
      <motion.div 
        style={{ 
          background: WHITE, 
          borderRadius: '18px', 
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)', 
          padding: '32px'
        }}
        variants={itemVariants}
      >
        {filteredUsers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <h3 style={{ color: PRIMARY_BLACK }}>
              {searchTerm ? 'לא נמצאו תוצאות לחיפוש' : 'לא נמצאו חברי צוות להצגה'}
            </h3>
            <p style={{ color: '#666' }}>
              {searchTerm ? 'נסה לחפש במילים אחרות' : 'אין משתמשים רשומים במערכת'}
            </p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '24px',
            justifyContent: 'center'
          }}>
            {filteredUsers.map((user, index) => (
              <motion.div 
                key={user.id} 
                style={{
                  background: WHITE,
                  borderRadius: '16px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                  padding: '24px',
                  textAlign: 'center',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer',
                  border: `1px solid #f0f0f0`
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ 
                  y: -4,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Profile Image */}
                <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                  {user.profile_image ? (
                    <img
                      src={getImageUrl(user.profile_image)}
                      alt={user.full_name}
                      style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: `4px solid ${PRIMARY_RED}`,
                        boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
                      }}
                      onError={(e) => {
                        console.error('Image failed to load:', getImageUrl(user.profile_image));
                        if (e.target) {
                          e.target.style.display = 'none';
                          if (e.target.nextSibling) {
                            e.target.nextSibling.style.display = 'flex';
                          }
                        }
                      }}
                    />
                  ) : null}
                  
                  {/* Fallback initials */}
                  {(!user.profile_image || user.profile_image === '') && (
                    <div style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: '50%',
                      backgroundColor: getRandomColor(user.full_name),
                      color: WHITE,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2.5rem',
                      fontWeight: 'bold',
                      border: `4px solid ${PRIMARY_RED}`,
                      boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                      margin: '0 auto'
                    }}>
                      {getInitials(user.full_name)}
                    </div>
                  )}
                </div>

                {/* Name */}
                <h3 style={{
                  color: PRIMARY_BLACK,
                  fontSize: '1.3rem',
                  fontWeight: 'bold',
                  margin: '0 0 8px 0',
                  lineHeight: '1.2'
                }}>
                  {user.full_name}
                </h3>


                {/* Email */}
                {user.email && (
                  <p style={{
                    color: PRIMARY_RED,
                    fontSize: '0.9rem',
                    margin: '0 0 8px 0',
                    fontWeight: '400'
                  }}>
                    {user.email}
                  </p>
                )}

                {/* Department */}
                {user.department && (
                  <p style={{
                    color: '#888',
                    fontSize: '0.85rem',
                    margin: '0 0 8px 0',
                    fontWeight: '400'
                  }}>
                    מחלקה: {user.department}
                  </p>
                )}

                {/* Manager */}
                {user.manager_id && (
                  <p style={{
                    color: '#888',
                    fontSize: '0.85rem',
                    margin: '0 0 8px 0',
                    fontWeight: '400'
                  }}>
                    מנהל: {user.manager_id}
                  </p>
                )}

                {/* Created Date */}
                {user.createdAt && (
                  <p style={{
                    color: '#aaa',
                    fontSize: '0.8rem',
                    margin: '0 0 8px 0',
                    fontWeight: '400'
                  }}>
                    הצטרף: {new Date(user.createdAt).toLocaleDateString('he-IL')}
                  </p>
                )}

                {/* Last Updated */}
                {user.updatedAt && (
                  <p style={{
                    color: '#aaa',
                    fontSize: '0.8rem',
                    margin: '0 0 16px 0',
                    fontWeight: '400'
                  }}>
                    עודכן: {new Date(user.updatedAt).toLocaleDateString('he-IL')}
                  </p>
                )}

                {/* Contact Icons */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '12px',
                  marginTop: '16px'
                }}>
                  {/* Email */}
                  {user.email && (
                    <div 
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: PRIMARY_RED,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#a02615'}
                      onMouseLeave={(e) => e.target.style.background = PRIMARY_RED}
                      onClick={() => window.open(`mailto:${user.email}`, '_blank')}
                      title={`שלח אימייל ל-${user.full_name}`}
                    >
                      <span style={{ color: WHITE, fontSize: '1rem' }}>✉</span>
                    </div>
                  )}

                  {/* Phone */}
                  {user.phone && (
                    <div 
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: PRIMARY_RED,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#a02615'}
                      onMouseLeave={(e) => e.target.style.background = PRIMARY_RED}
                      onClick={() => window.open(`tel:${user.phone}`, '_blank')}
                      title={`התקשר ל-${user.full_name}`}
                    >
                      <span style={{ color: WHITE, fontSize: '1rem' }}>📞</span>
                    </div>
                  )}

                  {/* LinkedIn */}
                  {user.linkedin && (
                    <div 
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: PRIMARY_RED,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#a02615'}
                      onMouseLeave={(e) => e.target.style.background = PRIMARY_RED}
                      onClick={() => window.open(user.linkedin, '_blank')}
                      title={`LinkedIn של ${user.full_name}`}
                    >
                      <span style={{ color: WHITE, fontSize: '0.9rem', fontWeight: 'bold' }}>in</span>
                    </div>
                  )}

                  {/* Website */}
                  {user.website && (
                    <div 
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: PRIMARY_RED,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#a02615'}
                      onMouseLeave={(e) => e.target.style.background = PRIMARY_RED}
                      onClick={() => window.open(user.website, '_blank')}
                      title={`אתר של ${user.full_name}`}
                    >
                      <span style={{ color: WHITE, fontSize: '1rem' }}>🌐</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default CompanyTeam; 