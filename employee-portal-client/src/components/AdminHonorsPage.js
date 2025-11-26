import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Modal, Form, Alert } from 'react-bootstrap';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { FaTrophy, FaPlus, FaEdit, FaTrash, FaLock, FaArrowRight, FaSyncAlt } from 'react-icons/fa';
import { getAllHonors, createHonor, updateHonor, deleteHonor, getHonorTypes } from '../services/honorsService';
import { getAllUsers } from '../services/userService';
import toastService from '../services/toastService';

const AdminHonorsPage = () => {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const [honors, setHonors] = useState([]);
  const [honorTypes, setHonorTypes] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingHonor, setEditingHonor] = useState(null);
  const [formData, setFormData] = useState({
    user_id: '',
    honors_type_id: '',
    display_until: '',
    description: ''
  });

  const isAdmin = user && user.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [honorsData, typesData, usersData] = await Promise.all([
        getAllHonors(),
        getHonorTypes(),
        getAllUsers()
      ]);
      setHonors(honorsData);
      setHonorTypes(typesData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading data:', error);
      toastService.error('שגיאה בטעינת הנתונים');
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (honor = null) => {
    if (honor) {
      setEditingHonor(honor);
      setFormData({
        user_id: honor.user_id,
        honors_type_id: honor.honors_type_id,
        display_until: new Date(honor.display_until).toISOString().split('T')[0],
        description: honor.description || ''
      });
    } else {
      setEditingHonor(null);
      setFormData({
        user_id: '',
        honors_type_id: '',
        display_until: '',
        description: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingHonor(null);
    setFormData({
      user_id: '',
      honors_type_id: '',
      display_until: '',
      description: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.user_id || !formData.honors_type_id || !formData.display_until) {
      toastService.error('נא למלא את כל השדות החובה');
      return;
    }

    try {
      if (editingHonor) {
        await updateHonor(editingHonor.id, formData);
        toastService.success('ההוקרה עודכנה בהצלחה');
      } else {
        await createHonor(formData);
        toastService.success('ההוקרה נוספה בהצלחה');
      }
      handleCloseModal();
      loadData();
    } catch (error) {
      console.error('Error saving honor:', error);
      toastService.error('שגיאה בשמירת ההוקרה');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק הוקרה זו?')) {
      try {
        await deleteHonor(id);
        toastService.success('ההוקרה נמחקה בהצלחה');
        loadData();
      } catch (error) {
        console.error('Error deleting honor:', error);
        toastService.error('שגיאה במחיקת ההוקרה');
      }
    }
  };

  const isExpired = (displayUntil) => {
    return new Date(displayUntil) < new Date();
  };

  const getUserName = (userId) => {
    const foundUser = users.find(u => u.id === userId);
    return foundUser ? foundUser.full_name : 'לא ידוע';
  };

  const getHonorTypeName = (typeId) => {
    const foundType = honorTypes.find(t => t.id === typeId);
    return foundType ? foundType.name : 'לא ידוע';
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
                <FaTrophy className="me-2" />
                ניהול הוקרות
              </h2>
              <p className="text-muted mb-0">
                הוסף, ערוך ומחק הוקרות לעובדים - ימי הולדת, ברוכים הבאים, מצטיינים, ברכות ושמחות
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
                onClick={loadData}
                disabled={loading}
              >
                <FaSyncAlt className="me-1" />
                רענן
              </Button>
              <Button
                variant="primary"
                style={{ backgroundColor: '#bf2e1a', borderColor: '#bf2e1a' }}
                onClick={() => handleShowModal()}
              >
                <FaPlus className="me-1" />
                הוסף הוקרה חדשה
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
                  <p className="text-muted">טוען הוקרות...</p>
                </div>
              ) : honors.length === 0 ? (
                <div className="text-center py-5">
                  <FaTrophy size={48} className="mb-3 text-muted" />
                  <p className="text-muted">אין הוקרות במערכת</p>
                  <Button
                    variant="primary"
                    style={{ backgroundColor: '#bf2e1a', borderColor: '#bf2e1a' }}
                    onClick={() => handleShowModal()}
                  >
                    <FaPlus className="me-1" />
                    הוסף הוקרה ראשונה
                  </Button>
                </div>
              ) : (
                <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead style={{ backgroundColor: '#f8f9fa' }}>
                    <tr>
                      <th style={{ width: '20%' }}>עובד</th>
                      <th style={{ width: '18%' }}>סוג הוקרה</th>
                      <th style={{ width: '15%' }}>תצוגה עד</th>
                      <th style={{ width: '27%' }}>תיאור</th>
                      <th style={{ width: '10%', textAlign: 'center' }}>סטטוס</th>
                      <th style={{ width: '10%', textAlign: 'center' }}>פעולות</th>
                    </tr>
                  </thead>
                  <tbody>
                    {honors.map((honor) => (
                      <tr key={honor.id} style={{ borderBottom: '1px solid #e9ecef' }}>
                        <td style={{ padding: '16px 12px', verticalAlign: 'middle' }}>
                          <div className="d-flex align-items-center">
                            <div 
                              className="rounded-circle d-flex align-items-center justify-content-center me-3"
                              style={{
                                width: '40px',
                                height: '40px',
                                backgroundColor: '#bf2e1a',
                                color: 'white',
                                fontSize: '16px',
                                fontWeight: '600',
                                flexShrink: 0
                              }}
                            >
                              {(honor.user?.full_name || getUserName(honor.user_id)).charAt(0)}
                            </div>
                            <div>
                              <div style={{ fontWeight: '600', color: '#1a202c', fontSize: '15px' }}>
                                {honor.user?.full_name || getUserName(honor.user_id)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px 12px', verticalAlign: 'middle' }}>
                          <span 
                            style={{ 
                              display: 'inline-block',
                              backgroundColor: '#f8f9fa',
                              color: '#495057',
                              fontSize: '13px',
                              fontWeight: '500',
                              padding: '6px 14px',
                              borderRadius: '20px',
                              border: '1px solid #e9ecef'
                            }}
                          >
                            {honor.honorsType?.name || getHonorTypeName(honor.honors_type_id)}
                          </span>
                        </td>
                        <td style={{ padding: '16px 12px', verticalAlign: 'middle', fontSize: '14px', color: '#6c757d' }}>
                          {new Date(honor.display_until).toLocaleDateString('he-IL', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </td>
                        <td style={{ padding: '16px 12px', verticalAlign: 'middle' }}>
                          {honor.description ? (
                            <span title={honor.description} style={{ color: '#495057', fontSize: '14px' }}>
                              {honor.description.length > 35 
                                ? honor.description.substring(0, 35) + '...' 
                                : honor.description}
                            </span>
                          ) : (
                            <span style={{ color: '#adb5bd', fontStyle: 'italic', fontSize: '13px' }}>
                              ללא תיאור
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '16px 12px', verticalAlign: 'middle', textAlign: 'center' }}>
                          {isExpired(honor.display_until) ? (
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
                              onClick={() => handleShowModal(honor)}
                              title="ערוך הוקרה"
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
                              onClick={() => handleDelete(honor.id)}
                              title="מחק הוקרה"
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
            <FaTrophy className="me-2" />
            {editingHonor ? 'עריכת הוקרה' : 'הוספת הוקרה חדשה'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label style={{ fontWeight: '600', color: '#495057' }}>
                👤 עובד *
              </Form.Label>
              <Form.Control
                as="select"
                value={formData.user_id}
                onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                required
                style={{ padding: '10px', fontSize: '15px' }}
              >
                <option value="">בחר עובד...</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name} ({u.email})
                  </option>
                ))}
              </Form.Control>
              <Form.Text className="text-muted" style={{ fontSize: '13px' }}>
                בחר את העובד שמקבל את ההוקרה
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label style={{ fontWeight: '600', color: '#495057' }}>
                🏆 סוג הוקרה *
              </Form.Label>
              <Form.Control
                as="select"
                value={formData.honors_type_id}
                onChange={(e) => setFormData({ ...formData, honors_type_id: e.target.value })}
                required
                style={{ padding: '10px', fontSize: '15px' }}
              >
                <option value="">בחר סוג הוקרה...</option>
                {honorTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </Form.Control>
              <Form.Text className="text-muted" style={{ fontSize: '13px' }}>
                סוגי הוקרות: יום הולדת, ברוכים הבאים, מצטיינים, ברכות ושמחות
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label style={{ fontWeight: '600', color: '#495057' }}>
                📅 תצוגה עד תאריך *
              </Form.Label>
              <Form.Control
                type="date"
                value={formData.display_until}
                onChange={(e) => setFormData({ ...formData, display_until: e.target.value })}
                required
                style={{ padding: '10px', fontSize: '15px' }}
              />
              <Form.Text className="text-muted" style={{ fontSize: '13px' }}>
                ההוקרה תוצג בדף הבית ובקרוסלות עד תאריך זה (כולל)
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label style={{ fontWeight: '600', color: '#495057' }}>
                📝 תיאור (אופציונלי)
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="לדוגמה: מזל טוב ליום ההולדת! 🎉 או נסיך חדש למשפחה 👶"
                style={{ padding: '10px', fontSize: '15px' }}
              />
              <Form.Text className="text-muted" style={{ fontSize: '13px' }}>
                הודעה מיוחדת שתוצג עם ההוקרה (לא חובה)
              </Form.Text>
            </Form.Group>

            <Alert variant="info" className="mb-0" style={{ backgroundColor: '#e7f3ff', borderColor: '#b3d9ff' }}>
              <div style={{ display: 'flex', alignItems: 'start' }}>
                <span style={{ fontSize: '20px', marginLeft: '10px' }}>💡</span>
                <div>
                  <strong>טיפ חשוב:</strong> הוקרות פעילות מופיעות אוטומטית בדף הבית ובקרוסלות המתאימות. 
                  לאחר תאריך התפוגה, ההוקרה נשמרת בארכיון ולא מוצגת יותר.
                </div>
              </div>
            </Alert>

            <div className="d-flex justify-content-end gap-2 mt-4">
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
              >
                {editingHonor ? '✓ עדכן הוקרה' : '✓ צור הוקרה'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default AdminHonorsPage;

