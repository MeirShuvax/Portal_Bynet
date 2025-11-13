import React, { useState, useEffect, useMemo } from 'react';
import { Spinner } from 'react-bootstrap';
import { getMe } from '../services/apiService';
import bynetLogo from '../assets/bynet-logo.png';
import { PRIMARY_RED, PRIMARY_BLACK, getImageUrl } from '../constants';
import ImageComponent from './ImageComponent';

const resolveImageSrc = (candidate) => {
  if (!candidate) {
    return null;
  }

  if (typeof candidate === 'string' && (candidate.startsWith('http') || candidate.startsWith('/static/'))) {
    return candidate;
  }

  return getImageUrl(candidate);
};

const UserCard = ({ name, image, date, honorType, user: propUser }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (name || image || date || honorType) {
      setUser({
        full_name: name,
        profile_image: image,
        date,
        honorType,
      });
      setLoading(false);
      return;
    }

    if (propUser) {
      setUser(propUser);
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        setLoading(true);
        const data = await getMe();
        setUser(data.user);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [name, image, date, honorType, propUser]);

  const displayUser = useMemo(() => {
    return {
      email: 'עובד בינת',
      ...(propUser || {}),
      ...(user || {}),
    };
  }, [propUser, user]);

  const displayName = displayUser.full_name || displayUser.name || name || 'משתמש אורח';
  const displayEmail =
    displayUser.email || displayUser.title || (displayUser.honorType && displayUser.honorType.name) || 'עובד בינת';

  const primaryImage =
    image || displayUser.profile_image || displayUser.profileImage || displayUser.image || displayUser.avatarUrl;
  const imageSrc = resolveImageSrc(primaryImage);

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
          src={imageSrc}
          fallbackSrc={bynetLogo}
          roundedCircle
          style={{
            width: '38px',
            height: '38px',
            objectFit: 'cover',
          }}
          alt={displayName}
        />
      </div>
      <div className="text-end ms-3" style={{ maxWidth: '220px' }}>
        <h6 className="fw-bold mb-0" style={{ fontSize: '0.9rem' }}>
          {displayName}
        </h6>
        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
          {displayEmail}
        </div>
        {displayUser.description && (
          <div className="mt-1" style={{ fontSize: '0.75rem', color: '#4a5568', whiteSpace: 'pre-wrap' }}>
            {displayUser.description}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserCard;