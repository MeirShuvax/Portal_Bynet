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
import { useOutletContext } from 'react-router-dom';
import {
  FaUserPlus,
  FaEdit,
  FaTrash,
  FaLock,
  FaUsers,
  FaSyncAlt
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
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_NEW_USER);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const isAdmin = user && user.role === 'admin';

  const adminOptions = useMemo(
    () => users.filter((u) => u.role === 'admin'),
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
      <Row className="justify-content-between align-items-center mb-4">
        <Col md={6}>
          <h2 style={{ color: '#bf2e1a' }}>
            <FaUsers className="ms-2" />
            ניהול משתמשים
          </h2>
          <p className="text-muted">
            רשימת כל משתמשי הפורטל עם אפשרויות להוספה, עדכון ומחיקה.
          </p>
        </Col>
        <Col md={6} className="text-md-end text-center mt-3 mt-md-0">
          <Button
            variant="outline-secondary"
            className="ms-2"
            onClick={loadUsers}
            disabled={loading}
          >
            <FaSyncAlt className="ms-2" />
            רענן
          </Button>
          <Button
            variant="primary"
            style={{ backgroundColor: '#bf2e1a', borderColor: '#bf2e1a' }}
            onClick={handleOpenCreate}
          >
            <FaUserPlus className="ms-2" />
            הוסף משתמש
          </Button>
        </Col>
      </Row>

      {error && (
        <Row className="mb-3">
          <Col>
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          </Col>
        </Row>
      )}

      <Row>
        <Col>
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
                  <Table striped hover className="mb-0">
                    <thead style={{ backgroundColor: '#f8f9fa' }}>
                      <tr>
                        <th>שם מלא</th>
                        <th>דוא״ל</th>
                        <th>תפקיד</th>
                        <th>מנהל</th>
                        <th className="text-center">פעולות</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id}>
                          <td>{u.full_name}</td>
                          <td>{u.email}</td>
                          <td>
                            <Badge bg={
                              u.role === 'admin' ? 'danger'
                                : u.role === 'editor' ? 'primary'
                                : 'secondary'
                            }>
                              {u.role === 'admin' ? 'מנהל'
                                : u.role === 'editor' ? 'עורך'
                                : 'צופה'}
                            </Badge>
                          </td>
                          <td>
                            {u.manager_id
                              ? users.find((mgr) => mgr.id === u.manager_id)?.full_name || '—'
                              : u.role === 'admin' ? '—' : 'לא הוגדר'}
                          </td>
                          <td className="text-center">
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              className="ms-2"
                              onClick={() => handleOpenEdit(u)}
                            >
                              <FaEdit className="ms-1" />
                              ערוך
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(u.id)}
                              disabled={u.id === user.id}
                              title={u.id === user.id ? 'לא ניתן למחוק משתמש מחובר' : ''}
                            >
                              <FaTrash className="ms-1" />
                              מחק
                            </Button>
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

      <Modal show={showModal} onHide={handleCloseModal} centered dir="rtl">
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>
              {isEdit ? 'עדכון משתמש' : 'הוספת משתמש חדש'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>שם מלא</Form.Label>
              <Form.Control
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>דוא״ל</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isEdit}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>סיסמה {isEdit ? '(רק אם רוצים לעדכן)' : ''}</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={isEdit ? 'השאר ריק כדי לא לשנות' : 'סיסמה זמנית'}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>תפקיד</Form.Label>
              <Form.Select
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="viewer">צופה</option>
                <option value="editor">עורך</option>
                <option value="admin">מנהל</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>מנהל (למשתמשים שאינם מנהלים)</Form.Label>
              <Form.Select
                name="manager_id"
                value={formData.manager_id || ''}
                onChange={handleChange}
                disabled={formData.role === 'admin'}
              >
                <option value="">ללא</option>
                {adminOptions.map((admin) => (
                  <option key={admin.id} value={admin.id}>
                    {admin.full_name} ({admin.email})
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">
                אם לא תבחר מנהל, המערכת תשייך מנהל באופן אוטומטי.
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              ביטול
            </Button>
            <Button
              type="submit"
              variant="primary"
              style={{ backgroundColor: '#bf2e1a', borderColor: '#bf2e1a' }}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Spinner animation="border" size="sm" className="ms-2" />
                  שומר...
                </>
              ) : (
                'שמור'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default AdminUsersPage;

