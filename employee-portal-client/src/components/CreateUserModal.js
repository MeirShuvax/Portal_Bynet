import React, { useState } from 'react';
import { createUserWithImage } from '../services/userService';

const PRIMARY_RED = '#bf2e1a';
const PRIMARY_BLACK = '#1a202c';
const WHITE = '#fff';

const CreateUserModal = ({ isOpen, onClose, onUserCreated }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'viewer',
    manager_id: '',
    birth_date: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      
      // יצירת תצוגה מקדימה
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // בדיקות ולידציה
      if (!formData.full_name || !formData.email || !formData.password) {
        throw new Error('שדות חובה: שם מלא, אימייל וסיסמה');
      }

      const userData = {
        ...formData,
        manager_id: formData.manager_id || null,
        birth_date: formData.birth_date || null
      };

      const newUser = await createUserWithImage(userData, imageFile);
      
      console.log('✅ User created successfully:', newUser);
      
      // איפוס הטופס
      setFormData({
        full_name: '',
        email: '',
        password: '',
        role: 'viewer',
        manager_id: '',
        birth_date: ''
      });
      setImageFile(null);
      setPreviewUrl(null);
      
      // קריאה לפונקציה שמטפלת במשתמש החדש
      if (onUserCreated) {
        onUserCreated(newUser);
      }
      
      onClose();
    } catch (error) {
      console.error('❌ Error creating user:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: WHITE,
        borderRadius: 12,
        padding: 24,
        width: '90%',
        maxWidth: 500,
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ color: PRIMARY_RED, margin: 0 }}>הוספת משתמש חדש</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: PRIMARY_BLACK
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, color: PRIMARY_BLACK }}>
              שם מלא *
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: 8,
                border: '1px solid #ddd',
                borderRadius: 4,
                fontSize: '1rem'
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, color: PRIMARY_BLACK }}>
              אימייל *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: 8,
                border: '1px solid #ddd',
                borderRadius: 4,
                fontSize: '1rem'
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, color: PRIMARY_BLACK }}>
              סיסמה *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: 8,
                border: '1px solid #ddd',
                borderRadius: 4,
                fontSize: '1rem'
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, color: PRIMARY_BLACK }}>
              תפקיד
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: 8,
                border: '1px solid #ddd',
                borderRadius: 4,
                fontSize: '1rem'
              }}
            >
              <option value="viewer">צופה</option>
              <option value="editor">עורך</option>
              <option value="admin">מנהל</option>
            </select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, color: PRIMARY_BLACK }}>
              תאריך לידה
            </label>
            <input
              type="date"
              name="birth_date"
              value={formData.birth_date}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: 8,
                border: '1px solid #ddd',
                borderRadius: 4,
                fontSize: '1rem'
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, color: PRIMARY_BLACK }}>
              תמונת פרופיל
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{
                width: '100%',
                padding: 8,
                border: '1px solid #ddd',
                borderRadius: 4,
                fontSize: '1rem'
              }}
            />
            {previewUrl && (
              <div style={{ marginTop: 8 }}>
                <img
                  src={previewUrl}
                  alt="תצוגה מקדימה"
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: `2px solid ${PRIMARY_RED}`
                  }}
                />
              </div>
            )}
          </div>

          {error && (
            <div style={{
              color: 'red',
              marginBottom: 16,
              padding: 8,
              backgroundColor: '#ffebee',
              borderRadius: 4
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                border: `1px solid ${PRIMARY_BLACK}`,
                borderRadius: 4,
                background: 'white',
                color: PRIMARY_BLACK,
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              ביטול
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: 4,
                background: loading ? '#ccc' : PRIMARY_RED,
                color: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '1rem'
              }}
            >
              {loading ? 'יוצר...' : 'צור משתמש'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal; 