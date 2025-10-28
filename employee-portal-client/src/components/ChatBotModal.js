import React, { useState, useRef, useEffect } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import { FaPaperPlane } from 'react-icons/fa';
import { sendBotMessage } from '../services/Bot_AI';
import { PRIMARY_RED } from '../constants';

const chatBubbleUser = {
  alignSelf: 'flex-end',
  background: '#e3f2fd',
  color: '#222',
  borderRadius: '18px 18px 0 18px',
  padding: '8px 16px',
  margin: '4px 0',
  maxWidth: '80%',
  textAlign: 'right',
};
const chatBubbleBot = {
  alignSelf: 'flex-start',
  background: '#fff',
  color: '#222',
  borderRadius: '18px 18px 18px 0',
  padding: '8px 16px',
  margin: '4px 0',
  maxWidth: '80%',
  border: '1px solid #eee',
  textAlign: 'right',
};

export default function ChatBotModal({ show, onHide }) {
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'שלום! איך אפשר לעזור?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (show && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, show]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const userMsg = { from: 'user', text: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await sendBotMessage(input);
      setMessages((msgs) => [...msgs, { from: 'bot', text: res.response || 'לא התקבלה תשובה מהשרת.' }]);
    } catch (err) {
      setMessages((msgs) => [...msgs, { from: 'bot', text: err.message || 'אירעה שגיאה בשליחת הבקשה.' }]);
    }
    setLoading(false);
  };

  return (
    <Modal
        show={show}
        onHide={onHide}
        centered
        dir="rtl"
        contentClassName="p-0"
        style={{ zIndex: 2000 }}
      >
        <Modal.Header closeButton className="justify-content-between" style={{ background: PRIMARY_RED, color: 'white', borderBottom: 0 }}>
          <Modal.Title style={{ fontWeight: 700, fontSize: '1.2rem' }}>צ'אט עם הבינה</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: '#f8f9fa', minHeight: 320, maxHeight: 400, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={msg.from === 'user' ? chatBubbleUser : chatBubbleBot}
              dir="rtl"
            >
              {msg.text.split('\n').map((line, i) => <div key={i}>{line}</div>)}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </Modal.Body>
        <Modal.Footer className="justify-content-between" style={{ background: '#f8f9fa', borderTop: 0 }}>
          <Form onSubmit={handleSend} className="w-100 d-flex gap-2">
            <Form.Control
              type="text"
              placeholder="הקלד שאלה..."
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading}
              autoFocus
              style={{ direction: 'rtl', fontSize: '1rem' }}
            />
            <Button 
              type="submit" 
              style={{ backgroundColor: PRIMARY_RED, borderColor: PRIMARY_RED, minWidth: 48 }} 
              disabled={loading || !input.trim()}
            >
              {loading ? <Spinner animation="border" size="sm" /> : <FaPaperPlane />}
            </Button>
          </Form>
        </Modal.Footer>
      </Modal>
  );
} 