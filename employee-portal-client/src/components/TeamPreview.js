import React, { useEffect, useState, useRef } from 'react';
import { fetchUsers } from '../services/userService';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import { motion } from 'framer-motion';
import 'swiper/css';
import './TeamPreview.css';

import { PRIMARY_RED, PRIMARY_BLACK, WHITE, getImageUrl } from '../constants';

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

const TeamPreview = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // אנימציות
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  useEffect(() => {
    fetchUsers()
      .then((data) => {
        console.log('Users data from server:', data);
        setUsers(data);
      })
      .catch((error) => {
        console.error('Error fetching users:', error);
        setUsers([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="team-loading">
        <h4 style={{ color: PRIMARY_RED }}>צוות החברה</h4>
        <p>טוען...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="team-empty">
        <h4 style={{ color: PRIMARY_RED }}>צוות החברה</h4>
        <p>לא נמצאו משתמשים להצגה.</p>
      </div>
    );
  }

  const handleViewAll = () => {
    navigate('/company-team');
  };

  return (
    <motion.div 
      className="team-preview-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* כותרת */}
      <motion.h4 
        className="team-preview-title"
        variants={itemVariants}
      >
        צוות החברה
      </motion.h4>
      
      {/* Swiper לתמונות */}
      <motion.div 
        className="team-swiper-container"
        variants={itemVariants}
      >
        <Swiper
          modules={[Autoplay]}
          spaceBetween={12}
          slidesPerView={3}
          centeredSlides={false}
          autoplay={{
            delay: 1800,
            disableOnInteraction: false,
          }}
          loop={users.length > 3}
          breakpoints={{
            320: {
              slidesPerView: 3,
              spaceBetween: 8
            },
            768: {
              slidesPerView: 3,
              spaceBetween: 10
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 12
            }
          }}
        >
          {users.map((user) => (
            <SwiperSlide key={user.id}>
              <div className="team-member-simple">
                {user.profile_image ? (
                  <img
                    src={getImageUrl(user.profile_image)}
                    alt={user.full_name}
                    className="team-member-image-simple"
                    onError={(e) => {
                      console.error('❌ TeamPreview image failed to load:', getImageUrl(user.profile_image));
                      console.error('❌ User:', user.full_name, 'Profile image:', user.profile_image);
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) {
                        e.target.nextSibling.style.display = 'flex';
                      }
                    }}
                    onLoad={() => {
                      console.log('✅ TeamPreview image loaded successfully:', user.full_name);
                    }}
                  />
                ) : (
                  <div 
                    className="team-member-initials-simple"
                    style={{ backgroundColor: getRandomColor(user.full_name) }}
                  >
                    {getInitials(user.full_name)}
                  </div>
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </motion.div>
      
      {/* כפתור ראה הכל */}
      <motion.button
        onClick={handleViewAll}
        className="view-all-button-simple"
        variants={itemVariants}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        ראה הכל
      </motion.button>
    </motion.div>
  );
};

export default TeamPreview; 