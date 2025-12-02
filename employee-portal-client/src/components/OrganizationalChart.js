import React, { useEffect, useState, useRef } from 'react';
import { Container, Row, Col, Card, Badge, Spinner, Alert, Button } from 'react-bootstrap';
import { FaUsers, FaBuilding, FaUserTie, FaUser, FaChevronDown, FaChevronUp, FaDownload } from 'react-icons/fa';

import { PRIMARY_RED, PRIMARY_BLACK, API_BASE_URL, getImageUrl } from '../constants';

const BASE_URL = API_BASE_URL;

// פונקציה ליצירת ראשי תיבות
const getInitials = (fullName) => {
  if (!fullName) return '';
  const names = fullName.split(' ');
  if (names.length >= 2) {
    return (names[0][0] + names[1][0]).toUpperCase();
  }
  return fullName.substring(0, 2).toUpperCase();
};

// פונקציה ליצירת צבע רנדומלי לראשי תיבות
const getRandomColor = (name) => {
  const colors = [
    '#e53e3e', '#dd6b20', '#d69e2e', '#38a169', '#319795', 
    '#3182ce', '#553c9a', '#b83291', '#97266d', '#742a2a'
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

// פונקציה ליצירת צבע לקווים לפי מנהל
const getLineColor = (managerId, level) => {
  const colors = [
    '#bf2e1a', // אדום ראשי
    '#2563eb', // כחול
    '#059669', // ירוק
    '#7c3aed', // סגול
    '#dc2626', // אדום כהה
    '#1d4ed8', // כחול כהה
    '#047857', // ירוק כהה
    '#6d28d9', // סגול כהה
    '#b91c1c', // אדום
    '#1e40af'  // כחול
  ];
  
  if (level === 0) return PRIMARY_RED; // מנהלים ראשיים - אדום ראשי
  
  const index = managerId % colors.length;
  return colors[index];
};

// פונקציה לבניית עץ ארגוני עם manager_id רנדומלי
const buildOrgTree = (users) => {
  // הוספת manager_id רנדומלי למשתמשים שלא יש להם
  const usersWithManager = users.map(user => {
    if (!user.manager_id && user.role !== 'admin') {
      // בחר מנהל רנדומלי (לא את עצמו)
      const potentialManagers = users.filter(u => u.id !== user.id && u.role === 'admin');
      if (potentialManagers.length > 0) {
        const randomManager = potentialManagers[Math.floor(Math.random() * potentialManagers.length)];
        user.manager_id = randomManager.id;
      }
    }
    return user;
  });

  const userMap = {};
  const rootUsers = [];

  // יצירת מפה של כל המשתמשים
  usersWithManager.forEach(user => {
    userMap[user.id] = { ...user, children: [] };
  });

  // בניית העץ לפי manager_id
  usersWithManager.forEach(user => {
    if (user.manager_id && userMap[user.manager_id]) {
      userMap[user.manager_id].children.push(userMap[user.id]);
    } else {
      rootUsers.push(userMap[user.id]);
    }
  });

  return rootUsers;
};

// קומפוננטת עובד בודד
const EmployeeCard = ({ employee, level = 0, isRoot = false }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = employee.children && employee.children.length > 0;

  return (
    <div className="text-center">
      {/* קו מתחבר מהמנהל - רק אם זה לא שורש */}
      {!isRoot && level > 0 && (
        <div 
          className="mx-auto mb-1" 
          style={{ 
            width: '2px', 
            height: '15px', 
            backgroundColor: getLineColor(employee.manager_id, level),
            borderRadius: '1px'
          }} 
        />
      )}
      
      {/* כרטיס העובד */}
      <Card 
        className="mx-auto shadow-sm border-0" 
        style={{ 
          width: '120px',
          borderRadius: '8px',
          border: `2px solid ${level === 0 ? PRIMARY_RED : '#e2e8f0'}`,
          transition: 'all 0.3s ease',
          background: 'white'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
        }}
      >
        <Card.Body className="p-1">
          {/* תמונת פרופיל או ראשי תיבות */}
          <div className="mb-1" data-name={employee.full_name}>
            {employee.profile_image ? (
              <img
                src={getImageUrl(employee.profile_image)}
                alt={employee.full_name}
                className="rounded-circle mx-auto d-block"
                style={{
                  width: '50px',
                  height: '50px',
                  objectFit: 'cover',
                  border: `2px solid ${level === 0 ? PRIMARY_RED : '#e2e8f0'}`
                }}
                onError={(e) => {
                  console.error('Image failed to load:', getImageUrl(employee.profile_image));
                  if (e.target) {
                    e.target.style.display = 'none';
                  }
                }}
                onLoad={() => {
                  console.log('Image loaded successfully:', getImageUrl(employee.profile_image));
                }}
              />
            ) : (
              <div 
                className="rounded-circle mx-auto d-flex align-items-center justify-content-center"
                style={{
                  width: '50px',
                  height: '50px',
                  backgroundColor: getRandomColor(employee.full_name),
                  color: 'white',
                  fontSize: '1.1rem',
                  fontWeight: 'bold'
                }}
              >
                {getInitials(employee.full_name)}
              </div>
            )}
          </div>
          
          {/* שם העובד */}
          <h6 
            className="fw-bold mb-1" 
            style={{ 
              color: level === 0 ? PRIMARY_RED : PRIMARY_BLACK, 
              fontSize: '0.75rem'
            }}
          >
            {employee.full_name}
          </h6>
          
          {/* תפקיד */}
          <p 
            className="text-muted mb-0" 
            style={{ 
              fontSize: '0.65rem',
              color: '#666'
            }}
          >
            {employee.role === 'admin' ? 'מנהל' : 
             employee.role === 'editor' ? 'עורך' : 'עובד'}
          </p>

          {/* מחלקה אם קיימת */}
          {employee.department && (
            <p className="text-muted mb-0 mt-1" style={{ fontSize: '0.6rem' }}>
              {employee.department}
            </p>
          )}
          
          {/* מספר עובדים תחתיו */}
          {hasChildren && (
            <Badge 
              bg="info" 
              className="mt-1 px-1 py-1"
              style={{ 
                fontSize: '0.6rem',
                borderRadius: '6px',
                backgroundColor: getLineColor(employee.id, level) + ' !important'
              }}
            >
              {employee.children.length} עובדים
            </Badge>
          )}
          
          {/* כפתור הרחבה/כיווץ */}
          {hasChildren && (
            <Button
              variant="outline-secondary"
              size="sm"
              className="mt-1 px-1"
              onClick={() => setIsExpanded(!isExpanded)}
              style={{ 
                borderRadius: '10px',
                fontSize: '0.6rem',
                borderColor: getLineColor(employee.id, level),
                color: getLineColor(employee.id, level)
              }}
            >
              {isExpanded ? 'הסתר' : 'הצג'}
            </Button>
          )}
        </Card.Body>
      </Card>

      {/* ילדים (עובדים תחתיו) */}
      {hasChildren && isExpanded && (
        <div className="mt-1">
          {/* קו אופקי מתחבר */}
          <div 
            className="mx-auto mb-1" 
            style={{ 
              /* width: 420px; */
              height: '2px', 
              backgroundColor: getLineColor(employee.id, level),
              borderRadius: '1px'
            }} 
          />
          
          {/* עובדים תחתיו - סידור אופקי כמו בתמונה */}
          <div className="d-flex justify-content-center" style={{ gap: '10px' }}>
                         {employee.children.map((child, index) => (
               <div key={child.id} className="position-relative">
                 {/* קו אנכי מתחבר לכל ילד - מחובר לקו האופקי */}
                 {/* לא מציגים קו אנכי לעובדים בקצוות */}
                 {index > 0 && index < employee.children.length - 1 && (
                   <div 
                     className="position-absolute mx-auto" 
                     style={{ 
                       top: '-15px', // מחובר לקו האופקי
                       left: '50%',
                       transform: 'translateX(-50%)',
                       width: '2px',
                       height: '15px', // גובה מדויק לחיבור
                       backgroundColor: getLineColor(employee.id, level),
                       borderRadius: '1px'
                     }} 
                   />
                 )}
                 <EmployeeCard employee={child} level={level + 1} />
               </div>
             ))}
          </div>
        </div>
      )}
    </div>
  );
};

const OrganizationalChart = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orgTree, setOrgTree] = useState([]);
  const [downloading, setDownloading] = useState(false);
  const chartRef = useRef(null);

  // פונקציה להורדת תמונה של העץ הארגוני
  const downloadChartImage = async () => {
    try {
      setDownloading(true);
      
      // יצירת HTML של העץ הארגוני
      const chartHTML = generateChartHTML();
      
      // יצירת URL לשרת
      const imageUrl = `${API_BASE_URL}/api/organizational-chart/image`;
      
      // שליחת HTML לשרת ב-POST
      const response = await fetch(imageUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}` // אם יש token
        },
        body: JSON.stringify({
          htmlContent: chartHTML
        })
      });
      
      if (!response.ok) {
        throw new Error('שגיאה ביצירת התמונה');
      }
      
      // קבלת התמונה כקובץ
      const blob = await response.blob();
      
      // יצירת קישור להורדה
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `מבנה-ארגוני-${new Date().toLocaleDateString('he-IL')}.png`;
      
      // הורדה אוטומטית
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // ניקוי הזיכרון
      window.URL.revokeObjectURL(url);
      
    } catch (err) {
      console.error('שגיאה בהורדת התמונה:', err);
      alert('שגיאה בהורדת התמונה. נסה שוב.');
    } finally {
      setDownloading(false);
    }
  };

  // פונקציה ליצירת HTML של העץ הארגוני
  const generateChartHTML = () => {
    const generateEmployeeHTML = (employee, level = 0, isRoot = false) => {
      const hasChildren = employee.children && employee.children.length > 0;
      const lineColor = getLineColor(employee.id, level);
      const borderColor = level === 0 ? PRIMARY_RED : '#e2e8f0';
      
      let html = `
        <div style="text-align: center; margin-bottom: 20px;">
      `;
      
      // קו מתחבר מהמנהל
      if (!isRoot && level > 0) {
        html += `
          <div style="
            width: 2px; 
            height: 15px; 
            background-color: ${getLineColor(employee.manager_id, level)};
            border-radius: 1px;
            margin: 0 auto 5px auto;
          "></div>
        `;
      }
      
      // כרטיס העובד
      html += `
        <div style="
          width: 120px;
          border-radius: 8px;
          border: 2px solid ${borderColor};
          background: white;
          padding: 8px;
          margin: 0 auto;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        ">
      `;
      
      // תמונת פרופיל או ראשי תיבות
      if (employee.profile_image) {
        html += `
          <img src="data:image/jpeg;base64,${employee.profile_image}" 
               alt="${employee.full_name}"
               style="
                 width: 50px;
                 height: 50px;
                 border-radius: 50%;
                 object-fit: cover;
                 border: 2px solid ${borderColor};
                 display: block;
                 margin: 0 auto 5px auto;
               "
          />
        `;
      } else {
        const initials = getInitials(employee.full_name);
        const color = getRandomColor(employee.full_name);
        html += `
          <div style="
            width: 50px;
            height: 50px;
            background-color: ${color};
            color: white;
            font-size: 1.1rem;
            font-weight: bold;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 5px auto;
            border: 2px solid ${borderColor};
          ">${initials}</div>
        `;
      }
      
      // שם העובד
      html += `
        <h6 style="
          font-weight: bold; 
          margin: 0 0 5px 0;
          color: ${level === 0 ? PRIMARY_RED : PRIMARY_BLACK};
          font-size: 0.75rem;
        ">${employee.full_name}</h6>
      `;
      
      // תפקיד
      const roleText = employee.role === 'admin' ? 'מנהל' : 
                       employee.role === 'editor' ? 'עורך' : 'עובד';
      html += `
        <p style="
          margin: 0;
          font-size: 0.65rem;
          color: #666;
        ">${roleText}</p>
      `;
      
      // מספר עובדים תחתיו
      if (hasChildren) {
        html += `
          <div style="
            background-color: ${lineColor};
            color: white;
            font-size: 0.6rem;
            border-radius: 6px;
            padding: 2px 6px;
            margin: 5px auto 0 auto;
            display: inline-block;
          ">${employee.children.length} עובדים</div>
        `;
      }
      
      html += `</div>`; // סיום כרטיס
      
      // ילדים (עובדים תחתיו)
      if (hasChildren) {
        html += `
          <div style="margin-top: 10px;">
            <!-- קו אופקי מתחבר -->
            <div style="
              width: ${Math.max(120, (employee.children.length - 1) * 130 + (employee.children.length - 1) * 10)}px;
              height: 2px;
              background-color: ${lineColor};
              border-radius: 1px;
              margin: 0 auto 10px auto;
            "></div>
            
            <!-- עובדים תחתיו - סידור אופקי -->
            <div style="
              display: flex;
              justify-content: center;
              gap: 10px;
            ">
        `;
        
        employee.children.forEach((child, index) => {
          // קו אנכי מתחבר לכל ילד - רק לעובדים באמצע
          if (index > 0 && index < employee.children.length - 1) {
            html += `
              <div style="
                position: relative;
                width: 120px;
              ">
                <div style="
                  position: absolute;
                  top: -15px;
                  left: 50%;
                  transform: translateX(-50%);
                  width: 2px;
                  height: 15px;
                  background-color: ${lineColor};
                  border-radius: 1px;
                "></div>
                ${generateEmployeeHTML(child, level + 1)}
              </div>
            `;
          } else {
            html += `
              <div style="width: 120px;">
                ${generateEmployeeHTML(child, level + 1)}
              </div>
            `;
          }
        });
        
        html += `
              </div>
            </div>
        `;
      }
      
      html += `</div>`;
      return html;
    };
    
    let fullHTML = `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: white;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .title {
            color: ${PRIMARY_BLACK};
            font-weight: bold;
            font-size: 1.5rem;
            margin-bottom: 10px;
          }
          .subtitle {
            color: ${PRIMARY_RED};
            font-weight: bold;
            font-size: 0.9rem;
            border: 2px solid ${PRIMARY_RED};
            border-radius: 10px;
            padding: 5px 10px;
            display: inline-block;
            background: white;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">מבנה ארגוני</div>
          <div class="subtitle">סה"כ ${users.length} עובדים בחברה</div>
        </div>
        <div class="org-chart">
    `;
    
    orgTree.forEach((employee, index) => {
      fullHTML += generateEmployeeHTML(employee, 0, true);
      if (index < orgTree.length - 1) {
        fullHTML += `
          <div style="
            width: 2px;
            height: 20px;
            background-color: ${getLineColor(employee.manager_id, 0)};
            border-radius: 1px;
            margin: 10px auto;
          "></div>
        `;
      }
    });
    
    fullHTML += `
          </div>
        </body>
        </html>
    `;
    
    return fullHTML;
  };

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        console.log('🔄 Loading organizational chart data...');
        
        // המתן לטוקן - לעיתים הטוקן לא מוכן מיד
        let token = localStorage.getItem('authToken');
        let retries = 0;
        const maxRetries = 5;
        
        while (!token && retries < maxRetries) {
          console.log(`⏳ Waiting for auth token... (attempt ${retries + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 500));
          token = localStorage.getItem('authToken');
          retries++;
        }
        
        if (!token) {
          throw new Error('לא נמצא טוקן אימות. אנא התחבר מחדש.');
        }
        
        console.log('🔑 Token found!');
        
        // משתמש ב-API שמחזיר את כל המשתמשים (לא רק עם תמונות)
        const response = await fetch(`${API_BASE_URL}/api/users/team`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('📡 Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ API Error:', errorText);
          throw new Error(`Failed to fetch users: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log('✅ Users loaded successfully:', data.length, 'users');
        setUsers(data);
        const tree = buildOrgTree(data);
        console.log('🌳 Org tree built:', tree.length, 'root nodes');
        setOrgTree(tree);
      } catch (err) {
        setError('שגיאה בטעינת מבנה ארגוני: ' + err.message);
        console.error('❌ Error loading users:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner 
          animation="border" 
          variant="danger" 
          style={{ width: '4rem', height: '4rem' }} 
        />
        <p className="mt-4 fs-4" style={{ color: PRIMARY_BLACK }}>
          טוען מבנה ארגוני...
        </p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="text-center">
          <h4>שגיאה בטעינת המבנה הארגוני</h4>
          <p>{error}</p>
          <Button 
            variant="outline-danger" 
            onClick={() => window.location.reload()}
            size="lg"
          >
            נסה שוב
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-2" dir="rtl" style={{ minHeight: '100vh' }}>
      {/* כותרת ראשית */}
      <Row className="mb-2">
        <Col className="text-center">
          <h4 
            className="mb-0" 
            style={{ 
              color: PRIMARY_BLACK, 
              fontWeight: 'bold',
              fontSize: '1.5rem'
            }}
          >
            מבנה ארגוני
          </h4>
        </Col>
      </Row>

      {/* כותרת */}
      <Row className="mb-2">
        <Col className="text-center">
          <div className="p-1" style={{ 
            borderRadius: '10px',
            border: `2px solid ${PRIMARY_RED}`,
            background: 'white',
            display: 'inline-block'
          }}>
            <h6 
              className="mb-0" 
              style={{ 
                color: PRIMARY_RED, 
                fontWeight: 'bold',
                fontSize: '0.9rem'
              }}
            >
              סה"כ {users.length} עובדים בחברה
            </h6>
          </div>
        </Col>
      </Row>

      {/* כפתור הורדת תמונה */}
      <Row className="mb-3">
        <Col className="text-center">
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Button
              variant="info"
              size="lg"
              onClick={downloadChartImage}
              disabled={downloading}
              className="px-4 py-2"
              style={{
                borderRadius: '15px',
                fontWeight: 'bold',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
              }}
            >
              {downloading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  יוצר תמונה...
                </>
              ) : (
                <>
                  <FaDownload className="me-2" />
                  הורד תמונה מקצועית של המבנה הארגוני
                </>
              )}
            </Button>
            
            <Button
              variant="outline-primary"
              size="lg"
              onClick={() => {
                alert('מעולה! עכשיו התמונות נוצרות בשרת באיכות מקצועית גבוהה. השרת יוצר תמונה מושלמת עם כל הפרטים והתמונות! 🎨✨');
              }}
              className="px-4 py-2"
              style={{
                borderRadius: '15px',
                fontWeight: 'bold',
                borderWidth: '2px'
              }}
            >
              🎨 איך זה עובד עכשיו
            </Button>
          </div>
        </Col>
      </Row>

      {/* המבנה הארגוני - רספונסיבי */}
      <Row className="justify-content-center">
        <Col xl={10} xxl={8}>
          <div ref={chartRef} className="d-flex flex-column align-items-center">
            {orgTree.map((employee, index) => (
              <div key={employee.id} className="w-100 text-center">
                <EmployeeCard employee={employee} isRoot={true} />
                {index < orgTree.length - 1 && (
                  <div 
                    className="mx-auto my-2" 
                    style={{ 
                      width: '2px', 
                      height: '20px', 
                      backgroundColor: getLineColor(orgTree[index].manager_id, 0),
                      borderRadius: '1px'
                    }} 
                  />
                )}
              </div>
            ))}
          </div>
        </Col>
      </Row>

      {/* הוראות שימוש */}
      <Row className="mt-4">
        <Col className="text-center">
          <Card className="border-0 shadow-lg" style={{ 
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)'
          }}>
            <Card.Body className="p-4">
              <h4 className="mb-4" style={{ color: PRIMARY_RED }}>
                איך להשתמש במבנה הארגוני?
              </h4>
              <Row className="g-3">
                <Col lg={3} md={6} className="mb-2">
                  <div className="p-3 bg-light rounded-3 h-100">
                    <h6 style={{ color: PRIMARY_RED }}>🖱️ ניווט</h6>
                    <p className="mb-0 small">לחצו על כפתורי "הצג" כדי לפתוח/לסגור את הצוות</p>
                  </div>
                </Col>
                <Col lg={3} md={6} className="mb-2">
                  <div className="p-3 bg-light rounded-3 h-100">
                    <h6 style={{ color: PRIMARY_RED }}>👥 צוות</h6>
                    <p className="mb-0 small">המספר על כל כרטיס מראה כמה עובדים יש תחת אותו מנהל</p>
                  </div>
                </Col>
                <Col lg={3} md={6} className="mb-2">
                  <div className="p-3 bg-light rounded-3 h-100">
                    <h6 style={{ color: PRIMARY_RED }}>📱 קשרים</h6>
                    <p className="mb-0 small">הקווים האדומים מראים את שרשרת הפיקוד</p>
                  </div>
                </Col>
                <Col lg={3} md={6} className="mb-2">
                  <div className="p-3 bg-light rounded-3 h-100">
                    <h6 style={{ color: PRIMARY_RED }}>🔄 רענון</h6>
                    <p className="mb-0 small">רעננו את הדף כדי לראות שינויים במבנה הארגוני</p>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default OrganizationalChart; 