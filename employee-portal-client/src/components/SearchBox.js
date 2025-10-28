import React, { useState } from 'react';
import ChatBotModal from './ChatBotModal';
import { FaComments } from 'react-icons/fa';
import { Button } from 'react-bootstrap';
import { PRIMARY_RED } from '../constants';

const SearchBox = () => {
  const [showChat, setShowChat] = useState(false);
  return (
    <div 
    style={{ position: 'relative', minHeight: '56px'}}>
      {/* <p className="text-muted" style={{ margin: 0, fontSize: "0.9rem" }}>
        כאן נמצא ה-SearchBox. זהו אזור החיפוש הראשי של הפורטל, כאן המשתמשים יכולים להקליד ולחפש מידע.
      </p> */}
      <Button
        className="rounded-pill d-flex align-items-center gap-2 shadow"
        style={{
          fontSize: "1rem",
          padding: "0.5rem 1.2rem",
          backgroundColor: PRIMARY_RED,
          borderColor: PRIMARY_RED,
          // position: "absolute",
          top: 0,
          left: 0,
          zIndex: 10
        }}
        onClick={() => setShowChat(true)}
        title="דבר עם הבינה"
      >
        <span>דבר עם הבינה</span>
        <FaComments size={18} />
      </Button>
      <ChatBotModal show={showChat} onHide={() => setShowChat(false)} />
    </div>
  );
};

export default SearchBox; 