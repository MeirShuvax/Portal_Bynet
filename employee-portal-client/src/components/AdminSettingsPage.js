import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { FaImages, FaUsersCog, FaLock, FaLink } from 'react-icons/fa';

const AdminSettingsPage = () => {
  const { user } = useOutletContext();
  const navigate = useNavigate();

  const isAdmin = user && user.role === 'admin';

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
                  דף זה זמין רק למנהלים. אם אתה מנהל ואתה רואה הודעה זו, אנא פנה למנהל המערכת.
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
        <Col md={10} lg={8}>
          <h2 className="mb-3" style={{ color: '#bf2e1a' }}>⚙️ הגדרות מנהל</h2>
          <p className="text-muted">
            נווט לכלי הניהול המרכזיים של הפורטל.
          </p>
        </Col>
      </Row>

      <Row className="justify-content-center" xs={1} md={2} lg={2}>
        <Col className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Body className="d-flex flex-column align-items-center text-center">
              <FaImages size={48} className="mb-3" style={{ color: '#bf2e1a' }} />
              <h4 className="mb-2">ניהול תמונות</h4>
              <p className="text-muted mb-4">
                העלאה, עדכון ומחיקה של תמונות עבור &quot;תמונת השבוע&quot; וכלל התכנים הוויזואליים.
              </p>
              <Button
                variant="primary"
                style={{ backgroundColor: '#bf2e1a', borderColor: '#bf2e1a' }}
                onClick={() => navigate('/upload-images')}
              >
                עבור לניהול תמונות
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Body className="d-flex flex-column align-items-center text-center">
              <FaUsersCog size={48} className="mb-3" style={{ color: '#1a202c' }} />
              <h4 className="mb-2">ניהול משתמשים</h4>
              <p className="text-muted mb-4">
                צפייה, הוספה, עדכון ומחיקה של משתמשי המערכת, כולל הגדרת הרשאות ותפקידים.
              </p>
              <Button
                variant="outline-dark"
                onClick={() => navigate('/admin/users')}
              >
                עבור לניהול משתמשים
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Body className="d-flex flex-column align-items-center text-center">
              <FaLink size={48} className="mb-3" style={{ color: '#1a202c' }} />
              <h4 className="mb-2">ניהול קישורים חשובים</h4>
              <p className="text-muted mb-4">
                הוסף, ערוך ומחק קישורים המוצגים בדף הקישורים החשובים של הפורטל.
              </p>
              <Button
                variant="outline-dark"
                onClick={() => navigate('/admin/links')}
              >
                עבור לניהול קישורים
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminSettingsPage;

