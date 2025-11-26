import React, { useEffect, useMemo, useState } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Modal,
  Form,
  Spinner,
  Badge
} from 'react-bootstrap';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  FaUserPlus,
  FaEdit,
  FaTrash,
  FaLock,
  FaUsers,
  FaSyncAlt,
  FaArrowRight
} from 'react-icons/fa';
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser
} from '../services/userService';

const DEFAULT_NEW_USER = {
  full_name: '',
  email: '',
  password: '',
  role: 'viewer',
  manager_id: ''
};

const AdminUsersPage = () => {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_NEW_USER);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const isAdmin = user && user.role === 'admin';

  // כל המשתמשים יכולים להיות מנהלים (בוסים)
  const managerOptions = useMemo(
    () => users,
    [users]
  );

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
      setError(err.message || 'שגיאה בטעינת משתמשים');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  const handleCloseModal = () => {
    setShowModal(false);
    setIsEdit(false);
    setSelectedUserId(null);
    setFormData(DEFAULT_NEW_USER);
    setError('');
  };

  const handleOpenCreate = () => {
    setIsEdit(false);
    setSelectedUserId(null);
    setFormData(DEFAULT_NEW_USER);
    setShowModal(true);
  };

  const handleOpenEdit = (userToEdit) => {
    setIsEdit(true);
    setSelectedUserId(userToEdit.id);
    setFormData({
      full_name: userToEdit.full_name || '',
      email: userToEdit.email || '',
      password: '',
      role: userToEdit.role || 'viewer',
      manager_id: userToEdit.manager_id || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק את המשתמש?')) {
      return;
    }
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error('Failed to delete user:', err);
      setError(err.message || 'שגיאה במחיקת משתמש');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.full_name || !formData.email) {
      setError('שם מלא ודוא״ל הם שדות חובה');
      return;
    }
    if (!isEdit && !formData.password) {
      setError('יש להזין סיסמה למשתמש חדש');
      return;
    }

    try {
      setSaving(true);
      setError('');

      if (isEdit && selectedUserId) {
        const updated = await updateUser(selectedUserId, formData);
        setUsers((prev) =>
          prev.map((u) => (u.id === selectedUserId ? updated : u))
        );
      } else {
        const created = await createUser(formData);
        setUsers((prev) => [created, ...prev]);
      }

      handleCloseModal();
    } catch (err) {
      console.error('Failed to save user:', err);
      setError(err.message || 'שגיאה בשמירת נתוני משתמש');
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
                <FaUsers className="me-2" />
                ניהול משתמשים
              </h2>
              <p className="text-muted mb-0">
                רשימת כל משתמשי הפורטל עם אפשרויות להוספה, עדכון ומחיקה
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
                onClick={loadUsers}
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
                <FaUserPlus className="me-1" />
                הוסף משתמש
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
                  <p className="mt-2 text-muted">טוען משתמשים...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <p>אין משתמשים להצגה.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover className="mb-0">
                    <thead style={{ backgroundColor: '#f8f9fa' }}>
                      <tr>
                        <th style={{ width: '25%', padding: '14px 12px' }}>שם מלא</th>
                        <th style={{ width: '25%', padding: '14px 12px' }}>דוא״ל</th>
                        <th style={{ width: '15%', padding: '14px 12px' }}>מנהל</th>
                        <th style={{ width: '12%', padding: '14px 12px', textAlign: 'center' }}>תפקיד</th>
                        <th style={{ width: '23%', padding: '14px 12px', textAlign: 'center' }}>פעולות</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} style={{ borderBottom: '1px solid #e9ecef' }}>
                          <td style={{ padding: '16px 12px', verticalAlign: 'middle' }}>
                            <div style={{ fontWeight: '600', color: '#1a202c', fontSize: '15px' }}>
                              {u.full_name}
                            </div>
                          </td>
                          <td style={{ padding: '16px 12px', verticalAlign: 'middle', fontSize: '14px', color: '#6c757d' }}>
                            {u.email}
                          </td>
                          <td style={{ padding: '16px 12px', verticalAlign: 'middle', fontSize: '14px', color: '#495057' }}>
                            {u.manager_id
                              ? users.find((mgr) => mgr.id === u.manager_id)?.full_name || '—'
                              : <span style={{ color: '#adb5bd', fontStyle: 'italic' }}>ללא מנהל</span>}
                          </td>
                          <td style={{ padding: '16px 12px', verticalAlign: 'middle', textAlign: 'center' }}>
                            <span 
                              style={{ 
                                display: 'inline-block',
                                backgroundColor: u.role === 'admin' ? '#bf2e1a' : u.role === 'editor' ? '#0d6efd' : '#6c757d',
                                color: 'white',
                                fontSize: '12px',
                                fontWeight: '500',
                                padding: '4px 12px',
                                borderRadius: '12px'
                              }}
                            >
                              {u.role === 'admin' ? 'מנהל' : u.role === 'editor' ? 'עורך' : 'צופה'}
                            </span>
                          </td>
                          <td style={{ padding: '16px 12px', verticalAlign: 'middle', textAlign: 'center' }}>
                            <div className="d-flex justify-content-center gap-2">
                              <Button
                                variant="light"
                                size="sm"
                                onClick={() => handleOpenEdit(u)}
                                title="ערוך משתמש"
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
                                onClick={() => handleDelete(u.id)}
                                disabled={u.id === user.id}
                                title={u.id === user.id ? 'לא ניתן למחוק משתמש מחובר' : 'מחק משתמש'}
                                style={{
                                  padding: '6px 12px',
                                  border: '1px solid #dee2e6',
                                  color: u.id === user.id ? '#adb5bd' : '#dc3545',
                                  backgroundColor: 'white',
                                  fontSize: '14px',
                                  opacity: u.id === user.id ? 0.5 : 1
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
              <FaUserPlus className="me-2" />
              {isEdit ? 'עדכון משתמש' : 'הוספת משתמש חדש'}
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
                👤 שם מלא *
              </Form.Label>
              <Form.Control
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
                style={{ padding: '10px', fontSize: '15px' }}
                placeholder="לדוגמה: דוד כהן"
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label style={{ fontWeight: '600', color: '#495057' }}>
                📧 דוא״ל *
              </Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isEdit}
                style={{ padding: '10px', fontSize: '15px' }}
                placeholder="david.cohen@bynetdcs.co.il"
              />
              {isEdit && (
                <Form.Text className="text-muted" style={{ fontSize: '13px' }}>
                  לא ניתן לשנות כתובת דוא״ל של משתמש קיים
                </Form.Text>
              )}
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label style={{ fontWeight: '600', color: '#495057' }}>
                🔒 סיסמה {isEdit ? '(אופציונלי)' : '*'}
              </Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required={!isEdit}
                style={{ padding: '10px', fontSize: '15px' }}
                placeholder={isEdit ? 'השאר ריק כדי לא לשנות' : 'סיסמה זמנית'}
              />
              <Form.Text className="text-muted" style={{ fontSize: '13px' }}>
                {isEdit ? 'השאר ריק אם אין צורך לשנות את הסיסמה' : 'המשתמש יוכל לשנות את הסיסמה בהתחברות הראשונה'}
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label style={{ fontWeight: '600', color: '#495057' }}>
                👔 מנהל ישיר (בוס)
              </Form.Label>
              <Form.Select
                name="manager_id"
                value={formData.manager_id || ''}
                onChange={handleChange}
                style={{ padding: '10px', fontSize: '15px' }}
              >
                <option value="">ללא מנהל</option>
                {managerOptions
                  .filter(m => !isEdit || m.id !== selectedUserId) // לא להציג את המשתמש עצמו כמנהל
                  .map((manager) => (
                    <option key={manager.id} value={manager.id}>
                      {manager.full_name} ({manager.email})
                    </option>
                  ))}
              </Form.Select>
              <Form.Text className="text-muted" style={{ fontSize: '13px' }}>
                בחר את המנהל הישיר של העובד בחברה (לא קשור להרשאות בפורטל)
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label style={{ fontWeight: '600', color: '#495057' }}>
                🔐 תפקיד בפורטל *
              </Form.Label>
              <Form.Select
                name="role"
                value={formData.role}
                onChange={handleChange}
                style={{ padding: '10px', fontSize: '15px' }}
              >
                <option value="viewer">צופה - צפייה בלבד</option>
                <option value="editor">עורך - צפייה ועריכה</option>
                <option value="admin">מנהל - הרשאות מלאות</option>
              </Form.Select>
              <Form.Text className="text-muted" style={{ fontSize: '13px' }}>
                תפקיד בפורטל קובע את ההרשאות במערכת (שונה ממנהל ישיר בחברה)
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
                isEdit ? '✓ עדכן משתמש' : '✓ צור משתמש'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default AdminUsersPage;

