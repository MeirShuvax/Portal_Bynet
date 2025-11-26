import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Modal, Form, Alert } from 'react-bootstrap';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { FaBullhorn, FaPlus, FaEdit, FaTrash, FaLock, FaArrowRight } from 'react-icons/fa';
import updatesService from '../services/updatesService';
import toastService from '../services/toastService';

const AdminUpdatesPage = () => {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    expiry_date: '',
    content: ''
  });

  const isAdmin = user && user.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      loadUpdates();
    }
  }, [isAdmin]);

  const loadUpdates = async () => {
    try {
      setLoading(true);
      const data = await updatesService.getAllUpdates();
      setUpdates(data);
    } catch (error) {
      console.error('Error loading updates:', error);
      toastService.error('שגיאה בטעינת העדכונים');
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (update = null) => {
    if (update) {
      setEditingUpdate(update);
      setFormData({
        title: update.title,
        date: new Date(update.date).toISOString().split('T')[0],
        expiry_date: new Date(update.expiry_date).toISOString().split('T')[0],
        content: update.content
      });
    } else {
      setEditingUpdate(null);
      setFormData({
        title: '',
        date: new Date().toISOString().split('T')[0],
        expiry_date: '',
        content: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUpdate(null);
    setFormData({
      title: '',
      date: new Date().toISOString().split('T')[0],
      expiry_date: '',
      content: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.expiry_date || !formData.content) {
      toastService.error('נא למלא את כל השדות');
      return;
    }

    try {
      if (editingUpdate) {
        await updatesService.updateUpdate(editingUpdate.id, formData);
        toastService.success('העדכון עודכן בהצלחה');
      } else {
        await updatesService.createUpdate(formData);
        toastService.success('העדכון נוסף בהצלחה');
      }
      handleCloseModal();
      loadUpdates();
    } catch (error) {
      console.error('Error saving update:', error);
      toastService.error('שגיאה בשמירת העדכון');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק עדכון זה?')) {
      try {
        await updatesService.deleteUpdate(id);
        toastService.success('העדכון נמחק בהצלחה');
        loadUpdates();
      } catch (error) {
        console.error('Error deleting update:', error);
        toastService.error('שגיאה במחיקת העדכון');
      }
    }
  };

  const isExpired = (expiryDate) => {
    return new Date(expiryDate) < new Date();
  };

  if (!user) {
    return (
      <Container className="py-4" dir="rtl">
        <div className="text-center py-5">
          <FaLock size={48} className="mb-3" style={{ color: '#bf2e1a' }} />
          <p className="text-muted">טוען פרטי משתמש...</p>
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
                <p className="text-muted mb-3">
                  דף זה זמין רק למנהלי מערכת הפורטל.
                </p>
                <Button variant="outline-primary" onClick={() => navigate('/')}>
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
      <Row className="justify-content-center mb-4">
        <Col md={12} lg={10}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h2 style={{ color: '#bf2e1a' }}>
                <FaBullhorn className="me-2" />
                ניהול עדכונים
              </h2>
              <p className="text-muted mb-0">
                צור, ערוך ומחק עדכונים והודעות המוצגים בפורטל
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
                variant="primary"
                style={{ backgroundColor: '#bf2e1a', borderColor: '#bf2e1a' }}
                onClick={() => handleShowModal()}
              >
                <FaPlus className="me-1" />
                הוסף עדכון חדש
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      <Row className="justify-content-center">
        <Col md={12} lg={10}>
          <Card className="shadow-sm">
            <Card.Body>
              {loading ? (
                <div className="text-center py-5">
                  <p className="text-muted">טוען עדכונים...</p>
                </div>
              ) : updates.length === 0 ? (
                <div className="text-center py-5">
                  <FaBullhorn size={48} className="mb-3 text-muted" />
                  <p className="text-muted">אין עדכונים במערכת</p>
                  <Button
                    variant="primary"
                    style={{ backgroundColor: '#bf2e1a', borderColor: '#bf2e1a' }}
                    onClick={() => handleShowModal()}
                  >
                    <FaPlus className="me-1" />
                    הוסף עדכון ראשון
                  </Button>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover className="mb-0">
                    <thead style={{ backgroundColor: '#f8f9fa' }}>
                      <tr>
                        <th style={{ width: '25%', padding: '14px 12px' }}>כותרת</th>
                        <th style={{ width: '12%', padding: '14px 12px' }}>תאריך</th>
                        <th style={{ width: '12%', padding: '14px 12px' }}>תפוגה</th>
                        <th style={{ width: '18%', padding: '14px 12px' }}>עודכן על ידי</th>
                        <th style={{ width: '13%', padding: '14px 12px', textAlign: 'center' }}>סטטוס</th>
                        <th style={{ width: '20%', padding: '14px 12px', textAlign: 'center' }}>פעולות</th>
                      </tr>
                    </thead>
                    <tbody>
                      {updates.map((update) => (
                        <tr key={update.id} style={{ borderBottom: '1px solid #e9ecef' }}>
                          <td style={{ padding: '16px 12px', verticalAlign: 'middle' }}>
                            <div style={{ fontWeight: '600', color: '#1a202c', fontSize: '15px' }}>
                              {update.title}
                            </div>
                          </td>
                          <td style={{ padding: '16px 12px', verticalAlign: 'middle', fontSize: '14px', color: '#6c757d' }}>
                            {new Date(update.date).toLocaleDateString('he-IL', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </td>
                          <td style={{ padding: '16px 12px', verticalAlign: 'middle', fontSize: '14px', color: '#6c757d' }}>
                            {new Date(update.expiry_date).toLocaleDateString('he-IL', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </td>
                          <td style={{ padding: '16px 12px', verticalAlign: 'middle', fontSize: '14px', color: '#495057' }}>
                            {update.user?.full_name || 'לא ידוע'}
                          </td>
                          <td style={{ padding: '16px 12px', verticalAlign: 'middle', textAlign: 'center' }}>
                            {isExpired(update.expiry_date) ? (
                              <span 
                                style={{ 
                                  display: 'inline-block',
                                  backgroundColor: '#6c757d',
                                  color: 'white',
                                  fontSize: '12px',
                                  fontWeight: '500',
                                  padding: '4px 12px',
                                  borderRadius: '12px'
                                }}
                              >
                                פג תוקף
                              </span>
                            ) : (
                              <span 
                                style={{ 
                                  display: 'inline-block',
                                  backgroundColor: '#28a745',
                                  color: 'white',
                                  fontSize: '12px',
                                  fontWeight: '500',
                                  padding: '4px 12px',
                                  borderRadius: '12px'
                                }}
                              >
                                פעיל
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '16px 12px', verticalAlign: 'middle', textAlign: 'center' }}>
                            <div className="d-flex justify-content-center gap-2">
                              <Button
                                variant="light"
                                size="sm"
                                onClick={() => handleShowModal(update)}
                                title="ערוך עדכון"
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
                                onClick={() => handleDelete(update.id)}
                                title="מחק עדכון"
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

      {/* Modal for Create/Edit */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" dir="rtl">
        <Modal.Header closeButton style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #bf2e1a' }}>
          <Modal.Title style={{ color: '#bf2e1a', fontWeight: 'bold' }}>
            <FaBullhorn className="me-2" />
            {editingUpdate ? 'עריכת עדכון' : 'הוספת עדכון חדש'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>כותרת *</Form.Label>
              <Form.Control
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="הכנס כותרת לעדכון"
                required
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>תאריך *</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>תאריך תפוגה *</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                    required
                  />
                  <Form.Text className="text-muted">
                    העדכון יוצג עד תאריך זה
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>תוכן *</Form.Label>
              <Form.Control
                as="textarea"
                rows={6}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="הכנס את תוכן העדכון"
                required
              />
              <Form.Text className="text-muted">
                ניתן להשתמש בשורות חדשות לעיצוב הטקסט
              </Form.Text>
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={handleCloseModal}>
                ביטול
              </Button>
              <Button
                type="submit"
                variant="primary"
                style={{ backgroundColor: '#bf2e1a', borderColor: '#bf2e1a' }}
              >
                {editingUpdate ? 'עדכן' : 'צור עדכון'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default AdminUpdatesPage;

