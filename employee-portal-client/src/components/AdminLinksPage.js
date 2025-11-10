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
import { useOutletContext } from 'react-router-dom';
import { FaLink, FaPlus, FaEdit, FaTrash, FaLock, FaSyncAlt } from 'react-icons/fa';
import { getAllLinks, createLink, updateLink, deleteLink } from '../services/importantLinksService';

const DEFAULT_LINK = {
  title: '',
  url: '',
  description: ''
};

const AdminLinksPage = () => {
  const { user } = useOutletContext();
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
                  דף זה זמין רק למנהלים. אם אתה מנהל ואתה רואה הודעה זו, אנא פנה למנהל המערכת.
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
            <FaLink className="ms-2" />
            ניהול קישורים חשובים
          </h2>
          <p className="text-muted">
            הוסף, ערוך ומחק קישורים שמופיעים בדף הקישורים החשובים של הפורטל.
          </p>
        </Col>
        <Col md={6} className="text-md-end text-center mt-3 mt-md-0">
          <Button variant="outline-secondary" className="ms-2" onClick={loadLinks} disabled={loading}>
            <FaSyncAlt className="ms-2" />
            רענן
          </Button>
          <Button
            variant="primary"
            style={{ backgroundColor: '#bf2e1a', borderColor: '#bf2e1a' }}
            onClick={handleOpenCreate}
          >
            <FaPlus className="ms-2" />
            הוסף קישור
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
                  <p className="mt-2 text-muted">טוען קישורים...</p>
                </div>
              ) : links.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <p>אין קישורים להצגה.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table striped hover className="mb-0">
                    <thead style={{ backgroundColor: '#f8f9fa' }}>
                      <tr>
                        <th>כותרת</th>
                        <th>כתובת URL</th>
                        <th>תיאור</th>
                        <th className="text-center">פעולות</th>
                      </tr>
                    </thead>
                    <tbody>
                      {links.map((link) => (
                        <tr key={link.id}>
                          <td>{link.title}</td>
                          <td>
                            <a href={link.url} target="_blank" rel="noopener noreferrer">
                              {link.url}
                            </a>
                          </td>
                          <td>{link.description}</td>
                          <td className="text-center">
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              className="ms-2"
                              onClick={() => handleOpenEdit(link)}
                            >
                              <FaEdit className="ms-1" />
                              ערוך
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(link.id)}
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
            <Modal.Title>{isEdit ? 'עדכון קישור' : 'הוספת קישור חדש'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>כותרת</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>כתובת URL</Form.Label>
              <Form.Control
                type="url"
                name="url"
                value={formData.url}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>תיאור</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="תיאור קצר של הקישור (אופציונלי)"
              />
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

export default AdminLinksPage;

