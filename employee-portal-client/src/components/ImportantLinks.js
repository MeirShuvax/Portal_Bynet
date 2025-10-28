import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert, Modal } from 'react-bootstrap';
import { FaLink, FaCopy, FaExternalLinkAlt, FaGlobe, FaSearch, FaPlus } from 'react-icons/fa';
import { PRIMARY_RED, PRIMARY_BLACK, API_BASE_URL } from '../constants';
import { apiCall } from '../services/apiService';

const ImportantLinks = () => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedLink, setSelectedLink] = useState(null);
  const [copiedLink, setCopiedLink] = useState(null);

  // שליפת הקישורים מהשרת
  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/system-contents/links');
      setLinks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // העתקת קישור
  const copyToClipboard = async (url, linkId) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(linkId);
      setTimeout(() => setCopiedLink(null), 2000);
    } catch (err) {
      console.error('שגיאה בהעתקה:', err);
    }
  };

  // פתיחת קישור
  const openLink = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // קבלת favicon
  const getFaviconUrl = (url) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return null;
    }
  };

  // סינון קישורים
  const filteredLinks = links.filter(link =>
    link.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    link.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" style={{ color: PRIMARY_RED }} />
          <p className="mt-3">טוען קישורים...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>שגיאה!</Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={fetchLinks}>
            נסה שוב
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4" dir="rtl">
      {/* כותרת */}
      <Row className="mb-4">
        <Col>
          <div className="text-center">
            <h2 className="mb-3" style={{ color: PRIMARY_RED, fontWeight: '600' }}>
              <FaLink className="me-2" />
              קישורים חשובים
            </h2>
            <p className="text-muted mb-0" style={{ fontSize: '0.95rem' }}>
              גישה מהירה לכל מה שאתה צריך
            </p>
          </div>
        </Col>
      </Row>

      {/* חיפוש */}
      <Row className="mb-3">
        <Col md={5} className="mx-auto">
          <div className="position-relative">
            <FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" style={{ fontSize: '0.9rem' }} />
            <input
              type="text"
              className="form-control ps-4"
              placeholder="חפש קישור..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                borderRadius: '20px',
                fontSize: '0.9rem',
                padding: '8px 16px 8px 40px',
                border: '1px solid #e9ecef'
              }}
            />
          </div>
        </Col>
      </Row>

      {/* רשימת קישורים */}
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          {filteredLinks.length === 0 ? (
            <div className="text-center py-4">
              <FaLink size={48} className="text-muted mb-3" />
              <h5 className="text-muted">לא נמצאו קישורים</h5>
              <p className="text-muted small">
                {searchTerm ? 'לא נמצאו קישורים התואמים לחיפוש' : 'אין קישורים זמינים כרגע'}
              </p>
            </div>
          ) : (
            <div className="links-container">
              {filteredLinks.map((link, index) => (
                <div key={link.id} className="link-item">
                  <div className="d-flex align-items-center">
                    {/* לוגו/Favicon */}
                    <div className="link-favicon me-3">
                      {getFaviconUrl(link.url) ? (
                        <img
                          src={getFaviconUrl(link.url)}
                          alt="Favicon"
                          className="favicon-img"
                          onError={(e) => { 
                            if (e.target) {
                              e.target.style.display = 'none';
                              if (e.target.nextSibling) {
                                e.target.nextSibling.style.display = 'flex';
                              }
                            }
                          }}
                        />
                      ) : null}
                      <div 
                        className="favicon-fallback" 
                        style={{ display: getFaviconUrl(link.url) ? 'none' : 'flex' }}
                      >
                        <FaLink size={14} />
                      </div>
                    </div>
                    
                    {/* תוכן הקישור */}
                    <div className="link-content flex-grow-1">
                      <h6 className="link-title mb-1">{link.title || 'קישור ללא כותרת'}</h6>
                      <p className="link-domain text-muted mb-0 small">{new URL(link.url).hostname}</p>
                    </div>
                    
                    {/* כפתורי פעולה */}
                    <div className="link-actions">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => copyToClipboard(link.url, link.id)}
                        className={`copy-btn ${copiedLink === link.id ? 'copy-success' : ''}`}
                        style={{ 
                          padding: '4px 8px',
                          fontSize: '0.75rem',
                          minWidth: '60px'
                        }}
                      >
                        <FaCopy size={12} />
                        {copiedLink === link.id ? 'הועתק!' : 'העתק'}
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => openLink(link.url)}
                        className="open-btn"
                        style={{ 
                          backgroundColor: PRIMARY_RED, 
                          borderColor: PRIMARY_RED,
                          padding: '4px 8px',
                          fontSize: '0.75rem',
                          minWidth: '70px'
                        }}
                      >
                        <FaExternalLinkAlt size={12} />
                        פתח
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Col>
      </Row>

      {/* מודל לפרטים נוספים */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaLink className="me-2" />
            {selectedLink?.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedLink && (
            <div>
              <p><strong>כתובת:</strong> {selectedLink.url}</p>
              {selectedLink.description && (
                <p><strong>תיאור:</strong> {selectedLink.description}</p>
              )}
              <p><strong>נוצר:</strong> {new Date(selectedLink.createdAt).toLocaleDateString('he-IL')}</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            סגור
          </Button>
          {selectedLink && (
            <Button
              variant="primary"
              onClick={() => openLink(selectedLink.url)}
            >
              <FaExternalLinkAlt className="me-2" />
              פתח קישור
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ImportantLinks;

// CSS לעיצוב רגוע וקומפקטי
const styles = `
  .links-container {
    background: #f8f9fa;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }

  .link-item {
    background: white;
    border-radius: 8px;
    padding: 12px 16px;
    margin-bottom: 8px;
    border: 1px solid #e9ecef;
    transition: all 0.2s ease;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  }

  .link-item:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    border-color: #bf2e1a;
  }

  .link-item:last-child {
    margin-bottom: 0;
  }

  .link-favicon {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f1f3f4;
    flex-shrink: 0;
  }

  .favicon-img {
    width: 20px;
    height: 20px;
    border-radius: 4px;
  }

  .favicon-fallback {
    color: #6c757d;
    font-size: 14px;
  }

  .link-content {
    min-width: 0;
  }

  .link-title {
    font-size: 0.95rem;
    font-weight: 600;
    color: #2c3e50;
    margin: 0;
    line-height: 1.3;
  }

  .link-domain {
    font-size: 0.8rem;
    color: #6c757d;
    margin: 0;
    line-height: 1.2;
  }

  .link-actions {
    display: flex;
    gap: 6px;
    flex-shrink: 0;
  }

  .copy-btn, .open-btn {
    border-radius: 6px;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .copy-btn:hover {
    background-color: #6c757d;
    border-color: #6c757d;
    color: white;
  }

  .copy-success {
    background-color: #28a745 !important;
    border-color: #28a745 !important;
    color: white !important;
  }

  .open-btn:hover {
    background-color: #a02615 !important;
    border-color: #a02615 !important;
    transform: translateY(-1px);
  }

  /* רספונסיבי */
  @media (max-width: 768px) {
    .links-container {
      padding: 12px;
    }
    
    .link-item {
      padding: 10px 12px;
    }
    
    .link-favicon {
      width: 28px;
      height: 28px;
    }
    
    .favicon-img {
      width: 18px;
      height: 18px;
    }
    
    .link-title {
      font-size: 0.9rem;
    }
    
    .link-domain {
      font-size: 0.75rem;
    }
    
    .link-actions {
      gap: 4px;
    }
    
    .copy-btn, .open-btn {
      padding: 3px 6px !important;
      font-size: 0.7rem !important;
      min-width: 50px !important;
    }
  }
`;

// הוספת ה-CSS לדף
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
