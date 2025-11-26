import React, { useEffect, useMemo, useState } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Modal,
  Form,
  Spinner
} from 'react-bootstrap';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { FaLink, FaPlus, FaEdit, FaTrash, FaLock, FaSyncAlt, FaArrowRight } from 'react-icons/fa';
import { getAllLinks, createLink, updateLink, deleteLink } from '../services/importantLinksService';

const DEFAULT_LINK = {
  title: '',
  url: '',
  description: ''
};

const AdminLinksPage = () => {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_LINK);
  const [selectedLinkId, setSelectedLinkId] = useState(null);

  const isAdmin = useMemo(() => user && user.role === 'admin', [user]);

  const loadLinks = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAllLinks();
      setLinks(data);
    } catch (err) {
      console.error('Failed to load links:', err);
      setError(err.message || 'שגיאה בטעינת קישורים');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadLinks();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  const handleCloseModal = () => {
    setShowModal(false);
    setIsEdit(false);
    setSelectedLinkId(null);
    setFormData(DEFAULT_LINK);
    setError('');
  };

  const handleOpenCreate = () => {
    setIsEdit(false);
    setSelectedLinkId(null);
    setFormData(DEFAULT_LINK);
    setShowModal(true);
  };

  const handleOpenEdit = (link) => {
    setIsEdit(true);
    setSelectedLinkId(link.id);
    setFormData({
      title: link.title || '',
      url: link.url || '',
      description: link.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק את הקישור?')) {
      return;
    }
    try {
      await deleteLink(id);
      setLinks((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      console.error('Failed to delete link:', err);
      setError(err.message || 'שגיאה במחיקת קישור');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.url) {
      setError('כותרת וכתובת URL הן שדות חובה');
      return;
    }

    try {
      setSaving(true);
      setError('');

      if (isEdit && selectedLinkId) {
        const updated = await updateLink(selectedLinkId, formData);
        setLinks((prev) => prev.map((l) => (l.id === selectedLinkId ? updated : l)));
      } else {
        const created = await createLink(formData);
        setLinks((prev) => [created, ...prev]);
      }

      handleCloseModal();
    } catch (err) {
      console.error('Failed to save link:', err);
      setError(err.message || 'שגיאה בשמירת קישור');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <Container className="py-4" dir="rtl">
        <div className="text-center py-5">
          <Spinner animation="border" variant="danger" />
          <p className="mt-2 text-muted">טוען פרטי משתמש...</p>
        </div>
      </Container>
    );
  }

  if (!isAdmin) {
    return (
      <Container className="py-4" dir="rtl">
        <Row className="justify-content-center">
          <Col md={8}>
            <Card className="shadow-sm">
              <Card.Body className="text-center py-5">
                <FaLock size={48} className="mb-3" style={{ color: '#bf2e1a' }} />
                <h3 style={{ color: '#bf2e1a' }}>אין הרשאות מנהל</h3>
                <p className="text-muted">
                  דף זה זמין רק למנהלי מערכת הפורטל. אם אתה סבור שיש לך הרשאות כאלה, פנה למנהל מערכת הפורטל (לא למנהלי החברה).
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="py-4" dir="rtl">
      <Row className="justify-content-center mb-4">
        <Col md={12} lg={10}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h2 style={{ color: '#bf2e1a' }}>
                <FaLink className="me-2" />
                ניהול קישורים חשובים
              </h2>
              <p className="text-muted mb-0">
                הוסף, ערוך ומחק קישורים שמופיעים בדף הקישורים החשובים של הפורטל
              </p>
            </div>
            <div>
              <Button
                variant="outline-secondary"
                className="me-2"
                onClick={() => navigate('/admin/settings')}
              >
                <FaArrowRight className="me-1" />
                חזור להגדרות
              </Button>
              <Button
                variant="outline-secondary"
                className="me-2"
                onClick={loadLinks}
                disabled={loading}
              >
                <FaSyncAlt className="me-1" />
                רענן
              </Button>
              <Button
                variant="primary"
                style={{ backgroundColor: '#bf2e1a', borderColor: '#bf2e1a' }}
                onClick={handleOpenCreate}
              >
                <FaPlus className="me-1" />
                הוסף קישור
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      <Row className="justify-content-center">
        <Col md={12} lg={10}>
          {error && (
            <div className="alert alert-danger mb-3" role="alert">
              {error}
            </div>
          )}

          <Card className="shadow-sm">
            <Card.Body className="p-0">
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="danger" />
                  <p className="mt-2 text-muted">טוען קישורים...</p>
                </div>
              ) : links.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <p>אין קישורים להצגה.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover className="mb-0">
                    <thead style={{ backgroundColor: '#f8f9fa' }}>
                      <tr>
                        <th style={{ width: '20%', padding: '14px 12px' }}>כותרת</th>
                        <th style={{ width: '30%', padding: '14px 12px' }}>כתובת URL</th>
                        <th style={{ width: '30%', padding: '14px 12px' }}>תיאור</th>
                        <th style={{ width: '20%', padding: '14px 12px', textAlign: 'center' }}>פעולות</th>
                      </tr>
                    </thead>
                    <tbody>
                      {links.map((link) => (
                        <tr key={link.id} style={{ borderBottom: '1px solid #e9ecef' }}>
                          <td style={{ padding: '16px 12px', verticalAlign: 'middle' }}>
                            <div style={{ fontWeight: '600', color: '#1a202c', fontSize: '15px' }}>
                              {link.title}
                            </div>
                          </td>
                          <td style={{ padding: '16px 12px', verticalAlign: 'middle' }}>
                            <a 
                              href={link.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ 
                                color: '#0d6efd', 
                                textDecoration: 'none',
                                fontSize: '14px',
                                wordBreak: 'break-all'
                              }}
                              onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                              onMouseOut={(e) => e.target.style.textDecoration = 'none'}
                            >
                              {link.url.length > 60 ? link.url.substring(0, 60) + '...' : link.url}
                            </a>
                          </td>
                          <td style={{ padding: '16px 12px', verticalAlign: 'middle' }}>
                            {link.description ? (
                              <span style={{ color: '#495057', fontSize: '14px' }}>
                                {link.description.length > 50 
                                  ? link.description.substring(0, 50) + '...' 
                                  : link.description}
                              </span>
                            ) : (
                              <span style={{ color: '#adb5bd', fontStyle: 'italic', fontSize: '13px' }}>
                                ללא תיאור
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '16px 12px', verticalAlign: 'middle', textAlign: 'center' }}>
                            <div className="d-flex justify-content-center gap-2">
                              <Button
                                variant="light"
                                size="sm"
                                onClick={() => handleOpenEdit(link)}
                                title="ערוך קישור"
                                style={{
                                  padding: '6px 12px',
                                  border: '1px solid #dee2e6',
                                  color: '#495057',
                                  backgroundColor: 'white',
                                  fontSize: '14px'
                                }}
                              >
                                <FaEdit className="me-1" />
                                ערוך
                              </Button>
                              <Button
                                variant="light"
                                size="sm"
                                onClick={() => handleDelete(link.id)}
                                title="מחק קישור"
                                style={{
                                  padding: '6px 12px',
                                  border: '1px solid #dee2e6',
                                  color: '#dc3545',
                                  backgroundColor: 'white',
                                  fontSize: '14px'
                                }}
                              >
                                <FaTrash className="me-1" />
                                מחק
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showModal} onHide={handleCloseModal} size="lg" dir="rtl">
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #bf2e1a' }}>
            <Modal.Title style={{ color: '#bf2e1a', fontWeight: 'bold' }}>
              <FaLink className="me-2" />
              {isEdit ? 'עדכון קישור' : 'הוספת קישור חדש'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ padding: '24px' }}>
            {error && (
              <div className="alert alert-danger mb-3" role="alert">
                {error}
              </div>
            )}
            
            <Form.Group className="mb-4">
              <Form.Label style={{ fontWeight: '600', color: '#495057' }}>
                📌 כותרת *
              </Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                style={{ padding: '10px', fontSize: '15px' }}
                placeholder="לדוגמה: אנשי קשר Microsoft 365"
              />
              <Form.Text className="text-muted" style={{ fontSize: '13px' }}>
                שם הקישור שיוצג למשתמשים
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label style={{ fontWeight: '600', color: '#495057' }}>
                🔗 כתובת URL *
              </Form.Label>
              <Form.Control
                type="url"
                name="url"
                value={formData.url}
                onChange={handleChange}
                required
                style={{ padding: '10px', fontSize: '15px' }}
                placeholder="https://example.com"
              />
              <Form.Text className="text-muted" style={{ fontSize: '13px' }}>
                כתובת מלאה של הקישור (חייבת להתחיל ב-http:// או https://)
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label style={{ fontWeight: '600', color: '#495057' }}>
                📝 תיאור (אופציונלי)
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="תיאור קצר של הקישור - מה המשתמשים ימצאו בו..."
                style={{ padding: '10px', fontSize: '15px' }}
              />
              <Form.Text className="text-muted" style={{ fontSize: '13px' }}>
                הסבר קצר שיעזור למשתמשים להבין למה הקישור מיועד
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer style={{ padding: '16px 24px' }}>
            <Button 
              variant="secondary" 
              onClick={handleCloseModal}
              style={{ padding: '8px 20px' }}
            >
              ביטול
            </Button>
            <Button
              type="submit"
              variant="primary"
              style={{ 
                backgroundColor: '#bf2e1a', 
                borderColor: '#bf2e1a',
                padding: '8px 20px',
                fontWeight: '600'
              }}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  שומר...
                </>
              ) : (
                isEdit ? '✓ עדכן קישור' : '✓ צור קישור'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default AdminLinksPage;

