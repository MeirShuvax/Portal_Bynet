import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { fetchImages, uploadImage, deleteImage } from '../services/systemContentService';
import { PRIMARY_RED, PRIMARY_BLACK, WHITE, getImageUrl } from '../constants';
import { FaUpload, FaTrash, FaImage, FaLock } from 'react-icons/fa';

const ImageUploadPage = () => {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [preview, setPreview] = useState(null);

  // בדיקת הרשאות - רק מנהלים יכולים לגשת
  useEffect(() => {
    console.log('🔍 ImageUploadPage - User:', user);
    console.log('🔍 ImageUploadPage - User role:', user?.role, 'Type:', typeof user?.role);
    console.log('🔍 ImageUploadPage - Is admin?', user?.role === 'admin');
    
    if (!user) {
      setLoading(true);
      return;
    }
    
    if (user.role !== 'admin') {
      console.log('❌ ImageUploadPage - User is not admin. Role:', user.role);
      setError('אין לך הרשאות לגשת לדף זה. רק מנהלים יכולים להעלות תמונות.');
      setLoading(false);
      // אפשר גם להעביר לדף הבית
      // navigate('/');
    } else {
      console.log('✅ ImageUploadPage - User is admin, loading images');
      loadImages();
    }
  }, [user, navigate]);

  const loadImages = async () => {
    try {
      setLoading(true);
      const data = await fetchImages();
      setImages(data);
    } catch (err) {
      setError('שגיאה בטעינת תמונות: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/')) {
        setError('רק קבצי תמונה מותרים');
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('הקובץ גדול מדי (מקסימום 5MB)');
        return;
      }
      setFile(selectedFile);
      setError('');
      
      // יצירת תצוגה מקדימה
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('אנא בחר תמונה');
      return;
    }

    try {
      setUploading(true);
      setError('');
      setSuccess('');
      
      await uploadImage(file, title, description);
      setSuccess('תמונה הועלתה בהצלחה!');
      setFile(null);
      setTitle('');
      setDescription('');
      setPreview(null);
      document.getElementById('file-input').value = '';
      
      // רענון רשימת התמונות
      await loadImages();
    } catch (err) {
      setError('שגיאה בהעלאת תמונה: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק את התמונה?')) {
      return;
    }

    try {
      await deleteImage(id);
      setSuccess('תמונה נמחקה בהצלחה!');
      await loadImages();
    } catch (err) {
      setError('שגיאה במחיקת תמונה: ' + err.message);
    }
  };

  // אם המשתמש לא מנהל, הצג הודעת שגיאה
  if (!user) {
    return (
      <Container className="py-4" dir="rtl">
        <div className="text-center py-5">
          <Spinner animation="border" variant="danger" />
          <p className="mt-2 text-muted">טוען...</p>
        </div>
      </Container>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <Container className="py-4" dir="rtl">
        <Row className="justify-content-center">
          <Col md={8}>
            <Card className="shadow-sm">
              <Card.Body className="text-center py-5">
                <FaLock size={48} className="mb-3" style={{ color: PRIMARY_RED }} />
                <h3 style={{ color: PRIMARY_RED }}>אין הרשאות מנהל</h3>
                <p className="text-muted mb-3">
                  דף זה זמין רק למנהלי מערכת הפורטל. אם אתה סבור שיש לך הרשאות כאלה, פנה למנהל מערכת הפורטל (לא למנהלי החברה).
                </p>
                <p className="text-muted small mb-4">
                  אם אתה חושב שזה שגיאה, בדוק את הרשאות המשתמש שלך במערכת.
                </p>
                <Button
                  variant="outline-primary"
                  onClick={() => navigate('/')}
                  style={{ marginTop: '1rem' }}
                >
                  חזור לדף הבית
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="py-4" dir="rtl">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <h2 className="mb-4" style={{ color: PRIMARY_RED }}>📸 ניהול תמונות - תמונת השבוע</h2>

          {/* טופס העלאה */}
          <Card className="mb-4 shadow-sm">
            <Card.Header style={{ background: `linear-gradient(135deg, ${PRIMARY_BLACK} 0%, #2d3748 100%)`, color: WHITE }}>
              <h5 className="mb-0">העלאת תמונה חדשה</h5>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
              {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>בחר תמונה</Form.Label>
                  <Form.Control
                    id="file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={uploading}
                  />
                  {preview && (
                    <div className="mt-3 text-center">
                      <img
                        src={preview}
                        alt="תצוגה מקדימה"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '200px',
                          borderRadius: '8px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                      />
                    </div>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>כותרת</Form.Label>
                  <Form.Control
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="כותרת התמונה"
                    disabled={uploading}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>תיאור</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="תיאור התמונה"
                    disabled={uploading}
                  />
                </Form.Group>

                <Button
                  type="submit"
                  disabled={!file || uploading}
                  style={{
                    backgroundColor: PRIMARY_RED,
                    borderColor: PRIMARY_RED
                  }}
                >
                  {uploading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      מעלה...
                    </>
                  ) : (
                    <>
                      <FaUpload className="me-2" />
                      העלה תמונה
                    </>
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>

          {/* רשימת תמונות קיימות */}
          <Card className="shadow-sm">
            <Card.Header style={{ background: `linear-gradient(135deg, ${PRIMARY_BLACK} 0%, #2d3748 100%)`, color: WHITE }}>
              <h5 className="mb-0">תמונות קיימות ({images.length})</h5>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="danger" />
                  <p className="mt-2 text-muted">טוען תמונות...</p>
                </div>
              ) : images.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <FaImage size={48} className="mb-3 opacity-50" />
                  <p>אין תמונות להצגה</p>
                </div>
              ) : (
                <Row>
                  {images.map((img) => (
                    <Col md={6} lg={4} key={img.id} className="mb-3">
                      <Card className="h-100">
                        <div style={{ position: 'relative', paddingTop: '75%', overflow: 'hidden' }}>
                          <img
                            src={getImageUrl(img.url)}
                            alt={img.title || 'תמונה'}
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        </div>
                        <Card.Body>
                          <Card.Title style={{ fontSize: '1rem', color: PRIMARY_RED }}>
                            {img.title || 'ללא כותרת'}
                          </Card.Title>
                          {img.description && (
                            <Card.Text style={{ fontSize: '0.85rem', color: '#666' }}>
                              {img.description}
                            </Card.Text>
                          )}
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(img.id)}
                            className="w-100"
                          >
                            <FaTrash className="me-2" />
                            מחק
                          </Button>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ImageUploadPage;

