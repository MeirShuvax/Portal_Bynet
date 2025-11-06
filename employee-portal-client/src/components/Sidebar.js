// Sidebar.jsx
import { Nav, Dropdown, Badge } from "react-bootstrap";
import { FaCalendarAlt, FaUsers, FaCogs, FaSignOutAlt, FaTrophy, FaBuilding, FaBook, FaInfoCircle, FaList, FaInfo, FaLink, FaComments, FaCode, FaClipboardList, FaCalendarCheck, FaAward, FaCog, FaChevronLeft, FaPoll } from "react-icons/fa";
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getHonorTypes } from '../services/honorsService';
import filesService from '../services/filesService';
import toastService from '../services/toastService';
import ImageViewer from './ImageViewer';
import logo from '../assets/bynet-logo.png';

const UNREAD_KEY = 'chat_unread_messages';

const Sidebar = () => {
  const [outstandingHonorId, setOutstandingHonorId] = useState(null);
  const [showEthicalCodeDropdown, setShowEthicalCodeDropdown] = useState(false);
  const [imageViewer, setImageViewer] = useState({ isOpen: false, url: '', filename: '' });
  const [unreadCount, setUnreadCount] = useState(0);

  // עדכון ספירת הודעות שלא נקראו
  useEffect(() => {
    const updateUnreadCount = () => {
      const count = parseInt(localStorage.getItem(UNREAD_KEY) || '0', 10);
      setUnreadCount(count);
    };

    // עדכון ראשוני
    updateUnreadCount();

    // עדכון כל 5 שניות
    const interval = setInterval(updateUnreadCount, 5000);

    // עדכון כשהחלון מקבל פוקוס
    window.addEventListener('focus', updateUnreadCount);
    window.addEventListener('storage', updateUnreadCount);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', updateUnreadCount);
      window.removeEventListener('storage', updateUnreadCount);
    };
  }, []);

  useEffect(() => {
    const fetchHonorTypes = async () => {
      try {
        const honorTypes = await getHonorTypes();
        const outstandingType = honorTypes.find(type => type.name === 'מצטיינים');
        if (outstandingType) {
          setOutstandingHonorId(outstandingType.id);
        }
      } catch (error) {
        console.error('Error fetching honor types:', error);
      }
    };

    fetchHonorTypes();
  }, []);

  const handleImageOpen = (url, filename) => {
    setImageViewer({ isOpen: true, url, filename });
  };

  const handleImageClose = () => {
    setImageViewer({ isOpen: false, url: '', filename: '' });
  };

  const handleFileOpen = async (filename, fileType = 'pdf') => {
    try {
      if (fileType === 'image') {
        await filesService.openImage(filename, handleImageOpen);
      } else {
        await filesService.openFile(filename);
      }
    } catch (error) {
      // הודעת השגיאה כבר מוצגת ב-filesService
      console.error('Error in handleFileOpen:', error);
    }
  };

  return (
    <div
      className="sidebar d-none d-md-flex flex-column text-white p-4"
      style={{
        backgroundColor: "#1a202c",
        width: "260px",
        minHeight: "100vh",
        maxHeight: "100vh",
        position: 'fixed',
        top: 0,
        right: 0,
        zIndex: 1000
        // overflowY: "auto"
      }}
      dir="rtl"
    >
      <div className="mb-3 text-center">
        <img src={logo} alt="Logo" style={{ maxWidth: "120px" }} />
      </div>
      <Nav className="flex-column gap-1 text-start">
        <Nav.Link as={Link} to="/" className="text-white d-flex justify-content-start align-items-center gap-2 py-2" style={{fontSize: '1rem', minHeight: '32px', textAlign: 'left', width: '100%'}}>
          <FaCalendarAlt /> דף הבית
        </Nav.Link>
        
        <Nav.Link as={Link} to="/chat" className="text-white d-flex justify-content-start align-items-center gap-2 py-2" style={{fontSize: '1rem', minHeight: '32px', textAlign: 'left', width: '100%', position: 'relative'}}>
          <FaComments /> צ'אט
          {unreadCount > 0 && (
            <Badge 
              bg="danger" 
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '0.7rem',
                padding: '2px 6px',
                borderRadius: '10px',
                animation: 'pulse 2s infinite'
              }}
            >
              {unreadCount}
            </Badge>
          )}
        </Nav.Link>

        <Nav.Link as={Link} to="/important-links" className="text-white d-flex justify-content-start align-items-center gap-2 py-2" style={{fontSize: '1rem', minHeight: '32px', textAlign: 'left', width: '100%'}}>
          <FaLink /> קישורים חשובים
        </Nav.Link>
        
        <Nav.Link 
          className="text-white d-flex justify-content-start align-items-center gap-2 py-2" 
          style={{fontSize: '1rem', minHeight: '32px', textAlign: 'left', width: '100%'}}
          onClick={() => window.open('https://m365.cloud.microsoft/search/people?auth=2&tenantId=b5f3202f-73b3-40a8-a61e-596ab18836ea', '_blank', 'noopener,noreferrer')}
        >
          <FaUsers /> אנשי קשר Microsoft
        </Nav.Link>
        
        <div 
          style={{ position: 'relative' }}
          onMouseEnter={() => setShowEthicalCodeDropdown(true)}
          onMouseLeave={(e) => {
            // רק אם עוזבים את כל האזור (לא רק עוברים לתת-רשימה)
            try {
              if (e.relatedTarget && 
                  e.relatedTarget instanceof Node && 
                  e.currentTarget.contains(e.relatedTarget)) {
                return; // עדיין בתוך האזור
              }
            } catch (error) {
              console.log('Mouse leave error (ignoring):', error);
            }
            setShowEthicalCodeDropdown(false);
          }}
        >
          <Nav.Link 
            className="text-white d-flex justify-content-start align-items-center gap-2 py-2" 
            style={{
              fontSize: '1rem', 
              minHeight: '32px', 
              textAlign: 'left',
              cursor: 'pointer',
              paddingRight: '8px',
              width: '100%'
            }}
            onClick={() => setShowEthicalCodeDropdown(!showEthicalCodeDropdown)}
          >
            <FaInfoCircle /> מידע לעובד
            {/* <span style={{fontSize: '0.7rem', background: '#bf2e1a', color: 'white', padding: '2px 6px', borderRadius: '10px', marginLeft: '8px'}}>בהרצה</span> */}
            <FaChevronLeft style={{fontSize: '0.7rem', marginLeft: 'auto'}} />
          </Nav.Link>
          
          {showEthicalCodeDropdown && (
            <div 
              style={{
                backgroundColor: '#2d3748',
                border: '1px solid #4a5568',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                minWidth: '200px',
                position: 'absolute',
                right: '100%',
                top: '0',
                marginRight: '0px',
                zIndex: 1001,
                paddingTop: '4px',
                paddingBottom: '4px'
              }}
            >
              <button
                onClick={() => handleFileOpen('code_eti.pdf', 'pdf')}
                style={{
                  color: 'white',
                  fontSize: '0.9rem',
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  width: '100%',
                  textAlign: 'right',
                  cursor: 'pointer',
                  display: 'block'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#4a5568'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <FaCode style={{marginLeft: '8px'}} /> קוד האתי
              </button>
              <button
                onClick={() => handleFileOpen('Company_rules.png', 'image')}
                style={{
                  color: 'white',
                  fontSize: '0.9rem',
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  width: '100%',
                  textAlign: 'right',
                  cursor: 'pointer',
                  display: 'block'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#4a5568'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <FaInfoCircle style={{marginLeft: '8px'}} /> כללי החברה
              </button>
              <button
                onClick={() => handleFileOpen('Safety_board.pdf', 'pdf')}
                style={{
                  color: 'white',
                  fontSize: '0.9rem',
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  width: '100%',
                  textAlign: 'right',
                  cursor: 'pointer',
                  display: 'block'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#4a5568'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <FaCalendarCheck style={{marginLeft: '8px'}} /> לוח בטיחות
              </button>
            </div>
          )}
        </div>
        
        
        <Nav.Link className="text-white d-flex justify-content-start align-items-center gap-2 py-2" style={{fontSize: '1rem', minHeight: '32px', textAlign: 'left', width: '100%'}}>
        <FaCalendarAlt />  לוח חופשות
          <span style={{fontSize: '0.7rem', background: '#bf2e1a', color: 'white', padding: '2px 6px', borderRadius: '10px', marginLeft: '8px'}}>בהרצה</span>
        </Nav.Link>

        {outstandingHonorId ? (
          <Nav.Link as={Link} to={`/honors/${outstandingHonorId}`} className="text-white d-flex justify-content-start align-items-center gap-2 py-2" style={{fontSize: '1rem', minHeight: '32px', textAlign: 'left', width: '100%'}}>
            <FaAward /> מצטיינים
          </Nav.Link>
        ) : (
          <Nav.Link className="text-white d-flex justify-content-start align-items-center gap-2 py-2" style={{fontSize: '1rem', minHeight: '32px', textAlign: 'left', width: '100%'}}>
            <FaAward /> מצטיינים
            <span style={{fontSize: '0.7rem', background: '#bf2e1a', color: 'white', padding: '2px 6px', borderRadius: '10px', marginLeft: '8px'}}>בהרצה</span>
          </Nav.Link>
        )}
        
        <Nav.Link as={Link} to="/organizational-chart" className="text-white d-flex justify-content-start align-items-center gap-2 py-2" style={{fontSize: '1rem', minHeight: '32px', textAlign: 'left', width: '100%'}}>
          <FaBuilding /> פוסטים חברה
        </Nav.Link>

        {/* <Nav.Link className="text-white d-flex justify-content-start align-items-center gap-2 py-2" style={{fontSize: '1rem', minHeight: '32px', textAlign: 'left', width: '100%'}}>
          <FaPoll /> סקרים
          <span style={{fontSize: '0.7rem', background: '#bf2e1a', color: 'white', padding: '2px 6px', borderRadius: '10px', marginLeft: '8px'}}>בהרצה</span>
        </Nav.Link> */}

        <Nav.Link as={Link} to="/about" className="text-white d-flex justify-content-start align-items-center gap-2 py-2" style={{fontSize: '1rem', minHeight: '32px', textAlign: 'left', width: '100%'}}>
          <FaInfo /> אודות
        </Nav.Link>
        
        <Nav.Link className="text-white d-flex justify-content-start align-items-center gap-2 py-2" style={{fontSize: '1rem', minHeight: '32px', textAlign: 'left', width: '100%'}}>
          <FaCog /> הגדרות למנהל
          <span style={{fontSize: '0.7rem', background: '#bf2e1a', color: 'white', padding: '2px 6px', borderRadius: '10px', marginLeft: '8px'}}>בהרצה</span>
        </Nav.Link>

      </Nav>

      {/* Image Viewer */}
      {imageViewer.isOpen && (
        <ImageViewer
          imageUrl={imageViewer.url}
          filename={imageViewer.filename}
          onClose={handleImageClose}
        />
      )}
    </div>
  );
};

export default Sidebar;
