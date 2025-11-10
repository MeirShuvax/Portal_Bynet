import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FaHandshake, FaTimes } from 'react-icons/fa';

const PortalIntroModal = ({ show, onClose }) => {
  return (
    <Modal
      centered
      show={show}
      onHide={onClose}
      backdrop="static"
      keyboard={false}
      dir="rtl"
    >
      <Modal.Header
        className="d-flex align-items-center justify-content-between"
        style={{ borderBottom: '1px solid #f1f1f1' }}
      >
        <Modal.Title className="d-flex align-items-center gap-2">
          <FaHandshake style={{ color: '#bf2e1a' }} />
          ברוכים הבאים לפורטל העובדים
        </Modal.Title>
        <button
          type="button"
          onClick={onClose}
          aria-label="סגור הודעת היכרות"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#6c757d',
            fontSize: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            margin: 0,
            lineHeight: 1
          }}
        >
          <FaTimes />
        </button>
      </Modal.Header>
      <Modal.Body>
        <p className="mb-3" style={{ fontSize: '1rem', lineHeight: 1.6 }}>
          הפורטל מרכז את קהילת העובדים של בינת – מקום משותף לחיבורים אישיים,
          שליחת איחולים, עדכונים מקצועיים ושיתוף בחדשות החשובות של החברה.
        </p>
        <p className="mb-0 text-muted" style={{ fontSize: '0.95rem' }}>
          נשמח שכל אחד ואחת מכם יוסיפו את הקול האישי שלהם: ברכה, סיפור קצר,
          טיפ מקצועי או עדכון שמשמח את הצוות. ביחד אנחנו מייצרים מרחב חי ודינמי
          שמחזק את הקשר בין כולנו.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="primary"
          style={{ backgroundColor: '#bf2e1a', borderColor: '#bf2e1a' }}
          onClick={onClose}
        >
          הבנתי, נמשיך לעבוד 😊
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PortalIntroModal;

