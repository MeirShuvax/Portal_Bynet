import React, { useEffect, useState, useRef } from 'react';
import { Container, Row, Col, Form, Button, Card, Dropdown, Spinner, Badge } from 'react-bootstrap';
import { fetchMessages, sendMessage } from '../services/chatService';
import { PRIMARY_RED, PRIMARY_BLACK, WHITE } from '../constants';
import { FaPaperPlane, FaCopy, FaTrash, FaEllipsisV, FaCheckDouble } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import authService from '../services/authService';

const UNREAD_KEY = 'chat_unread_messages';
const LAST_READ_KEY = 'chat_last_read_time';

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showMenu, setShowMenu] = useState(null);
  const [unreadMessageIds, setUnreadMessageIds] = useState(new Set());
  const intervalRef = useRef(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const hasScrolledRef = useRef(false);

  // טעינת משתמש נוכחי
  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
  }, []);

  // טעינת הודעות
  const load = async () => {
    try {
      const data = await fetchMessages(0);
      // הפוך את הסדר - הודעות חדשות למטה (כמו וואטסאפ)
      const reversedData = [...data].reverse();
      setMessages(reversedData);
      
      // עדכון ספירת הודעות שלא נקראו
      updateUnreadCount(reversedData);
      
      // גלילה למטה להודעות חדשות
      setTimeout(() => {
        scrollToUnread();
      }, 100);
    } catch (e) {
      console.error('Failed to load chat messages:', e);
    } finally {
      setLoading(false);
    }
  };

  // עדכון ספירת הודעות שלא נקראו
  // הלוגיקה: שומרים ב-localStorage את זמן הקריאה האחרון
  // כל הודעה שנוצרה אחרי הזמן הזה ולא של המשתמש הנוכחי = לא נקראה
  const updateUnreadCount = (newMessages) => {
    const lastReadTime = localStorage.getItem(LAST_READ_KEY);
    const currentUser = authService.getCurrentUser();
    
    if (!lastReadTime) {
      // אם זו הפעם הראשונה, סמן הכל כנקרא אחרי 3 שניות
      setTimeout(() => {
        if (newMessages.length > 0) {
          // שמור את זמן ההודעה האחרונה (הכי חדשה - למטה)
          const latestTime = new Date(newMessages[newMessages.length - 1].created_at || newMessages[newMessages.length - 1].createdAt).getTime();
          localStorage.setItem(LAST_READ_KEY, latestTime.toString());
        }
      }, 3000);
      setUnreadCount(0);
      setUnreadMessageIds(new Set());
      return;
    }

    // מצא הודעות חדשות שלא של המשתמש הנוכחי
    // הודעות חדשות = נוצרו אחרי זמן הקריאה האחרון
    const unread = newMessages.filter(msg => {
      const msgTime = new Date(msg.created_at || msg.createdAt).getTime();
      const isNew = msgTime > parseInt(lastReadTime);
      const isNotMine = !isMyMessage(msg);
      return isNew && isNotMine;
    });

    const unreadIds = new Set(unread.map(msg => msg.id));
    setUnreadMessageIds(unreadIds);
    setUnreadCount(unread.length);
    localStorage.setItem(UNREAD_KEY, unread.length.toString());
  };

  // סימון הודעות כנקראות - רק כשהמשתמש באמת רואה את ההודעות
  const markAsRead = () => {
    if (messages.length > 0) {
      // שמור את זמן ההודעה האחרונה (הכי חדשה - למטה)
      const latestTime = new Date(messages[messages.length - 1].created_at || messages[messages.length - 1].createdAt).getTime();
      localStorage.setItem(LAST_READ_KEY, latestTime.toString());
      localStorage.setItem(UNREAD_KEY, '0');
      setUnreadCount(0);
      setUnreadMessageIds(new Set());
    }
  };

  useEffect(() => {
    load();
    // refresh every 10 seconds while component is mounted
    intervalRef.current = setInterval(load, 10000);
    
    // סמן כנקרא אחרי 2 שניות (המשתמש רואה את ההודעות)
    const markReadTimeout = setTimeout(() => {
      markAsRead();
    }, 2000);
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      clearTimeout(markReadTimeout);
    };
  }, []);

  // גלילה למטה להודעות חדשות
  const scrollToUnread = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      hasScrolledRef.current = true;
      // סמן כנקרא אחרי גלילה
      setTimeout(() => markAsRead(), 1000);
    }
  };

  // גלילה למטה כשמוסיפים הודעה חדשה
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollToUnread();
      }, 100);
    }
  }, [messages.length]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || sending) return;
    
    setSending(true);
    try {
      const saved = await sendMessage(content.trim());
      setContent('');
      // הוסף למטה (הודעות חדשות למטה)
      setMessages((prev) => [...prev, saved].slice(-50));
      setTimeout(() => scrollToUnread(), 100);
    } catch (e) {
      console.error('Failed to send message:', e);
    } finally {
      setSending(false);
    }
  };

  // העתקת הודעה
  const copyMessage = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // אפשר להוסיף toast כאן
      console.log('הודעה הועתקה');
    });
  };

  // מחיקת הודעה מקומית (רק מהממשק)
  const deleteMessageLocal = (messageId) => {
    setMessages((prev) => prev.filter(msg => msg.id !== messageId));
    setShowMenu(null);
  };

  // פורמט תאריך יפה
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'עכשיו';
    if (minutes < 60) return `לפני ${minutes} דקות`;
    if (hours < 24) return `לפני ${hours} שעות`;
    if (days < 7) return `לפני ${days} ימים`;
    
    return date.toLocaleDateString('he-IL', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isMyMessage = (message) => {
    return currentUser && (
      message.sender?.email === currentUser.email ||
      message.sender?.id === currentUser.id ||
      message.user_id === currentUser.id
    );
  };

  return (
    <Container className="py-3 py-md-4" dir="rtl">
      <Row className="justify-content-center">
        <Col xs={12} sm={11} md={10} lg={8} xl={7}>
          {/* Header */}
          <div className="d-flex align-items-center justify-content-between mb-3 p-2 p-md-3 rounded" style={{ background: `linear-gradient(135deg, ${PRIMARY_BLACK} 0%, #2d3748 100%)` }}>
            <h5 className="mb-0 text-white fw-semibold">💬 צ'אט צוות</h5>
            {unreadCount > 0 && (
              <Badge bg="danger" className="ms-2">
                {unreadCount} חדשות
              </Badge>
            )}
          </div>

          {/* Messages Card */}
          <Card className="mb-3 shadow-sm" ref={chatContainerRef}>
            <Card.Body className="p-2 p-md-3" style={{ maxHeight: '500px', overflowY: 'auto', minHeight: '300px' }}>
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="danger" />
                  <p className="mt-2 text-muted small">טוען הודעות...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <p className="mb-0">אין הודעות עדיין. התחל את השיחה! 👋</p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {(() => {
                    // מצא את האינדקס של ההודעה הראשונה שלא נקראה
                    let firstUnreadIndex = -1;
                    for (let i = 0; i < messages.length; i++) {
                      if (unreadMessageIds.has(messages[i].id)) {
                        firstUnreadIndex = i;
                        break;
                      }
                    }
                    
                    return messages.map((m, idx) => {
                      const isMine = isMyMessage(m);
                      const isUnread = unreadMessageIds.has(m.id);
                      const showUnreadDivider = idx === firstUnreadIndex && unreadCount > 0;
                      
                      return (
                        <React.Fragment key={m.id}>
                          {/* קו "הודעות שלא נקראו" כמו וואטסאפ */}
                          {showUnreadDivider && (
                            <div className="d-flex align-items-center my-2">
                              <hr className="flex-grow-1 my-0" style={{ borderColor: '#ffc107', borderWidth: '1px' }} />
                              <span className="px-2 small text-muted fw-semibold" style={{ fontSize: '0.75rem', color: '#ffc107' }}>
                                הודעות שלא נקראו
                              </span>
                              <hr className="flex-grow-1 my-0" style={{ borderColor: '#ffc107', borderWidth: '1px' }} />
                            </div>
                          )}
                          
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.02 }}
                            className={`d-flex ${isMine ? 'justify-content-end' : 'justify-content-start'}`}
                          >
                        <div
                          className={`rounded p-2 px-3 shadow-sm position-relative ${isUnread ? 'border-start border-warning border-3' : ''}`}
                          style={{
                            maxWidth: '75%',
                            minWidth: '150px',
                            background: isMine 
                              ? `linear-gradient(135deg, ${PRIMARY_RED} 0%, #a02615 100%)`
                              : (isUnread ? '#fff3cd' : '#f0f0f0'),
                            color: isMine ? WHITE : PRIMARY_BLACK,
                            borderRadius: isMine ? '12px 12px 0 12px' : '12px 12px 12px 0',
                          }}
                        >
                          {/* Message Header */}
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <small className="fw-semibold" style={{ fontSize: '0.75rem' }}>
                              {isMine ? 'אתה' : (m.sender?.full_name || 'משתמש')}
                            </small>
                            <small className="ms-2 opacity-75" style={{ fontSize: '0.7rem' }}>
                              {formatDate(m.created_at || m.createdAt)}
                            </small>
                          </div>
                          
                          {/* Message Content */}
                          <div className="mb-1" style={{ fontSize: '0.85rem', lineHeight: '1.4', whiteSpace: 'pre-wrap' }}>
                            {m.content}
                          </div>
                          
                          {/* Message Actions */}
                          <div className="d-flex align-items-center justify-content-end gap-1 opacity-0" style={{ transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}>
                            {isMine && <FaCheckDouble size={10} className="opacity-75" />}
                            <Dropdown show={showMenu === m.id} onToggle={() => setShowMenu(showMenu === m.id ? null : m.id)}>
                              <Dropdown.Toggle 
                                variant="link" 
                                className="p-0 text-decoration-none"
                                style={{ 
                                  color: 'inherit',
                                  opacity: 0.7,
                                  fontSize: '0.8rem'
                                }}
                              >
                                <FaEllipsisV />
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                <Dropdown.Item onClick={() => copyMessage(m.content)}>
                                  <FaCopy className="me-2" /> העתק
                                </Dropdown.Item>
                                {isMine && (
                                  <Dropdown.Item onClick={() => deleteMessageLocal(m.id)} className="text-danger">
                                    <FaTrash className="me-2" /> מחק
                                  </Dropdown.Item>
                                )}
                              </Dropdown.Menu>
                            </Dropdown>
                          </div>
                        </div>
                      </motion.div>
                      </React.Fragment>
                    );
                  })})()}
                </div>
              )}
              <div ref={messagesEndRef} />
            </Card.Body>
          </Card>

          {/* Input Form */}
          <Form onSubmit={onSubmit}>
            <div className="input-group">
              <Form.Control
                type="text"
                placeholder="כתוב הודעה..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    onSubmit(e);
                  }
                }}
                disabled={sending}
                className="rounded-pill"
                dir="rtl"
                style={{ fontSize: '0.9rem' }}
              />
              <Button
                type="submit"
                disabled={!content.trim() || sending}
                className="rounded-circle"
                style={{ 
                  backgroundColor: PRIMARY_RED, 
                  borderColor: PRIMARY_RED,
                  width: '40px',
                  height: '40px',
                  padding: 0
                }}
              >
                {sending ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  <FaPaperPlane />
                )}
              </Button>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default ChatPage;


