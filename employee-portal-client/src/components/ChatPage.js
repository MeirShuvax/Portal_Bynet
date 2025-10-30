import React, { useEffect, useState, useRef } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import { fetchMessages, sendMessage } from '../services/chatService';
import { PRIMARY_RED } from '../constants';

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

  const load = async () => {
    try {
      const data = await fetchMessages(0);
      setMessages(data);
    } catch (e) {
      console.error('Failed to load chat messages:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // refresh every 30 seconds while component is mounted
    intervalRef.current = setInterval(load, 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      const saved = await sendMessage(content.trim());
      setContent('');
      // prepend newest
      setMessages((prev) => [saved, ...prev].slice(0, 30));
    } catch (e) {
      console.error('Failed to send message:', e);
    }
  };

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <h4 className="mb-3">צ'אט</h4>
          <Card className="mb-3" style={{ maxHeight: 480, overflowY: 'auto' }}>
            <Card.Body>
              {loading ? (
                <div>טוען…</div>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className="mb-2">
                    <div style={{ fontWeight: '600', fontSize: 13 }}>
                      {m.sender?.full_name || 'משתמש'}
                    </div>
                    <div style={{ whiteSpace: 'pre-wrap' }}>{m.content}</div>
                    <div style={{ fontSize: 11, color: '#666' }}>{new Date(m.created_at || m.createdAt).toLocaleString('he-IL')}</div>
                    <hr className="my-2" />
                  </div>
                ))
              )}
            </Card.Body>
          </Card>

          <Form onSubmit={onSubmit} className="d-flex gap-2">
            <Form.Control
              placeholder="כתוב הודעה…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <Button type="submit" style={{ backgroundColor: PRIMARY_RED, borderColor: PRIMARY_RED }}>
              שלח
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default ChatPage;


