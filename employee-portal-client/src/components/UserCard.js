import React, { useState, useEffect } from 'react';
import { Spinner } from 'react-bootstrap';
import { getMe } from '../services/apiService';
import bynetLogo from '../assets/bynet-logo.png';
import { PRIMARY_RED, PRIMARY_BLACK, getImageUrl } from '../constants';
import ImageComponent from './ImageComponent';

const UserCard = ({ name, image, date, honorType, user: propUser }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  console.log('UserCard received props:', { name, image, date, honorType, propUser });
  console.log('UserCard current user state:', user);

  useEffect(() => {
    // אם יש פרמטרים ישירים, השתמש בהם
    if (name || image || date || honorType) {
      setUser({
        name: name,
        full_name: name,
        profile_image: image,
        date: date,
        honorType: honorType
      });
      setLoading(false);
      return;
    }

    // אם יש user prop (מ-HonorCarouselPage), השתמש בו
    if (propUser) {
      console.log('UserCard setting user from propUser:', propUser);
      console.log('UserCard propUser.profile_image:', propUser.profile_image);
      setUser(propUser);
      setLoading(false);
      return;
    }

    // אחרת, נסה לטעון משתמש נוכחי
    const fetchUser = async () => {
      try {
        setLoading(true);
        const data = await getMe();
        setUser(data.user);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [name, image, date, honorType, propUser]);

  const defaultUser = {
    name: 'משתמש אורח',
    email: 'עובד בינת',
    profileImage: bynetLogo,
  };

  const displayUser = user || propUser || defaultUser;
  console.log('UserCard displayUser:', displayUser);
  console.log('UserCard propUser:', propUser);
  console.log('UserCard profile_image path:', displayUser.profileImage || displayUser.profile_image);

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-end p-2" style={{ minHeight: '44px' }}>
        <Spinner animation="border" size="sm" />
      </div>
    );
  }

  return (
    <div className="d-flex align-items-center justify-content-end p-2">
      <div
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          border: `2px solid ${PRIMARY_RED}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: PRIMARY_BLACK,
        }}
      >
        <ImageComponent
          src={getImageUrl(displayUser.profileImage || displayUser.profile_image)}
          fallbackSrc={bynetLogo}
          roundedCircle
          style={{
            width: '38px',
            height: '38px',
            objectFit: 'cover',
          }}
          alt={displayUser.name || displayUser.full_name}
        />
      </div>
      <div className="text-end ms-3">
        <h6 className="fw-bold mb-0" style={{ fontSize: '0.9rem' }}>
          {displayUser.name || displayUser.full_name}
        </h6>
        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
          {displayUser.email || displayUser.title || (displayUser.honorType && displayUser.honorType.name) || 'עובד בינת'}
        </div>
      </div>
    </div>
  );
};

export default UserCard;