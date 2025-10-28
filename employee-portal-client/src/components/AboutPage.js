import React from 'react';
import { Container, Row, Col, Card, Badge } from 'react-bootstrap';

const PRIMARY_RED = '#bf2e1a';
const PRIMARY_BLACK = '#1a202c';
const WHITE = '#fff';

const AboutPage = () => {
  return (
    <Container className="py-5" dir="rtl">
      {/* Header Section */}
      <Row className="mb-5">
        <Col className="text-center">
          <h1 style={{ color: PRIMARY_RED, fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            ברוכים הבאים לפורטל העובדים
          </h1>
          <p style={{ color: PRIMARY_BLACK, fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto' }}>
            הפורטל המרכזי של משפחת בינת דאטה סנטרס - מקום לחיבור, שיתוף וצמיחה משותפת
          </p>
        </Col>
      </Row>

      {/* Company Section */}
      <Row className="mb-5">
        <Col lg={6} className="mb-4">
          <Card style={{ border: 'none', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', height: '100%' }}>
            <Card.Body className="p-4">
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  backgroundColor: PRIMARY_RED, 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  margin: '0 auto 1rem auto',
                  color: WHITE,
                  fontSize: '2rem',
                  fontWeight: 'bold'
                }}>
                  🏢
                </div>
                <h3 style={{ color: PRIMARY_RED, fontWeight: 'bold' }}>על החברה</h3>
              </div>
              <p style={{ color: PRIMARY_BLACK, lineHeight: '1.8', textAlign: 'justify' }}>
                <strong>בינת דאטה סנטרס</strong> היא חברה מובילה בתחום התקשורת והטכנולוגיה בישראל. 
                מאז הקמתה, החברה מתמחה בפיתוח פתרונות מתקדמים לתשתיות תקשורת, 
                מרכזי נתונים וטכנולוגיות ענן מתקדמות.
              </p>
              <p style={{ color: PRIMARY_BLACK, lineHeight: '1.8', textAlign: 'justify' }}>
                אנו מאמינים בכוחו של הצוות המקצועי שלנו - אנשים מוכשרים, יצירתיים ומחויבים 
                שמביאים עימם ידע, ניסיון ותשוקה לחדשנות. יחד אנו בונים את העתיד הדיגיטלי של ישראל.
              </p>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6} className="mb-4">
          <Card style={{ border: 'none', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', height: '100%' }}>
            <Card.Body className="p-4">
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  backgroundColor: PRIMARY_RED, 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  margin: '0 auto 1rem auto',
                  color: WHITE,
                  fontSize: '2rem',
                  fontWeight: 'bold'
                }}>
                  🌐
                </div>
                <h3 style={{ color: PRIMARY_RED, fontWeight: 'bold' }}>על הפורטל</h3>
              </div>
              <p style={{ color: PRIMARY_BLACK, lineHeight: '1.8', textAlign: 'justify' }}>
                פורטל העובדים שלנו הוא המרכז הדיגיטלי של משפחת בינת. כאן אתם יכולים:
              </p>
              <ul style={{ color: PRIMARY_BLACK, lineHeight: '1.8', paddingRight: '1.5rem' }}>
                <li>לחלוק חדשות ועדכונים חשובים</li>
                <li>לחגוג ימי הולדת והישגים של עמיתים</li>
                <li>להשתתף בצ'אט חי ולשתף רעיונות</li>
                <li>לצפות בתמונות השבוע ואירועי החברה</li>
                <li>להתחבר עם עמיתים ולבנות קשרים מקצועיים</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Mission & Values */}
      <Row className="mb-5">
        <Col className="text-center">
          <Card style={{ border: 'none', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', backgroundColor: '#f8f9fa' }}>
            <Card.Body className="p-5">
              <h2 style={{ color: PRIMARY_RED, fontWeight: 'bold', marginBottom: '2rem' }}>המשימה שלנו</h2>
              <p style={{ color: PRIMARY_BLACK, fontSize: '1.1rem', lineHeight: '1.8', maxWidth: '900px', margin: '0 auto 2rem auto' }}>
                לפתח ולספק פתרונות טכנולוגיים מתקדמים שיאפשרו ללקוחותינו לצמוח ולהתפתח 
                בעולם הדיגיטלי המתפתח, תוך שמירה על ערכי המקצועיות, החדשנות והמחויבות לאיכות.
              </p>
              
              <Row className="mt-4">
                <Col md={3} className="mb-3">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      width: '60px', 
                      height: '60px', 
                      backgroundColor: PRIMARY_RED, 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      margin: '0 auto 1rem auto',
                      color: WHITE,
                      fontSize: '1.5rem'
                    }}>
                      💡
                    </div>
                    <h5 style={{ color: PRIMARY_BLACK, fontWeight: 'bold' }}>חדשנות</h5>
                    <p style={{ color: PRIMARY_BLACK, fontSize: '0.9rem' }}>פיתוח פתרונות מתקדמים</p>
                  </div>
                </Col>
                <Col md={3} className="mb-3">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      width: '60px', 
                      height: '60px', 
                      backgroundColor: PRIMARY_RED, 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      margin: '0 auto 1rem auto',
                      color: WHITE,
                      fontSize: '1.5rem'
                    }}>
                      🤝
                    </div>
                    <h5 style={{ color: PRIMARY_BLACK, fontWeight: 'bold' }}>שיתוף פעולה</h5>
                    <p style={{ color: PRIMARY_BLACK, fontSize: '0.9rem' }}>עבודת צוות ומחויבות הדדית</p>
                  </div>
                </Col>
                <Col md={3} className="mb-3">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      width: '60px', 
                      height: '60px', 
                      backgroundColor: PRIMARY_RED, 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      margin: '0 auto 1rem auto',
                      color: WHITE,
                      fontSize: '1.5rem'
                    }}>
                      🎯
                    </div>
                    <h5 style={{ color: PRIMARY_BLACK, fontWeight: 'bold' }}>מצוינות</h5>
                    <p style={{ color: PRIMARY_BLACK, fontSize: '0.9rem' }}>איכות ומקצועיות בכל פרויקט</p>
                  </div>
                </Col>
                <Col md={3} className="mb-3">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      width: '60px', 
                      height: '60px', 
                      backgroundColor: PRIMARY_RED, 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      margin: '0 auto 1rem auto',
                      color: WHITE,
                      fontSize: '1.5rem'
                    }}>
                      🌱
                    </div>
                    <h5 style={{ color: PRIMARY_BLACK, fontWeight: 'bold' }}>צמיחה</h5>
                    <p style={{ color: PRIMARY_BLACK, fontSize: '0.9rem' }}>התפתחות מתמדת ולמידה</p>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Call to Action */}
      <Row className="mb-5">
        <Col className="text-center">
          <Card style={{ 
            border: 'none', 
            borderRadius: '20px', 
            background: `linear-gradient(135deg, ${PRIMARY_RED} 0%, #a02615 100%)`,
            color: WHITE,
            boxShadow: '0 8px 30px rgba(191, 46, 26, 0.3)'
          }}>
            <Card.Body className="p-5">
              <h2 style={{ fontWeight: 'bold', marginBottom: '1.5rem' }}>הצטרפו אלינו!</h2>
              <p style={{ fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '2rem', maxWidth: '800px', margin: '0 auto 2rem auto' }}>
                הפורטל שלנו הוא יותר מאתר - זהו מרחב דיגיטלי שמחבר בין כל חברי הצוות שלנו. 
                כל פוסט, כל תמונה, כל איחול תורם לבניית קהילה חזקה ומלוכדת.
              </p>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <Badge bg="light" text="dark" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                  📸 שתפו תמונות מהמשרד
                </Badge>
                <Badge bg="light" text="dark" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                  🎉 ברכו עמיתים ליום הולדת
                </Badge>
                <Badge bg="light" text="dark" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                  💬 השתתפו בצ'אט החי
                </Badge>
                <Badge bg="light" text="dark" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                  🚀 שתפו רעיונות חדשים
                </Badge>
              </div>
              
              <p style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: '0' }}>
                יחד נבנה קהילה דיגיטלית חזקה ומחוברת! 🌟
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Contact Info */}
      <Row>
        <Col className="text-center">
          <Card style={{ border: 'none', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <Card.Body className="p-4">
              <h4 style={{ color: PRIMARY_RED, fontWeight: 'bold', marginBottom: '1rem' }}>צריכים עזרה?</h4>
              <p style={{ color: PRIMARY_BLACK, margin: '0 0 1rem 0' }}>
                צוות הפיתוח שלנו זמין תמיד לעזור ולשפר את החוויה שלכם בפורטל. 
                אל תהססו לפנות אלינו עם רעיונות, בקשות או דיווח על בעיות.
              </p>
              
              <div style={{ 
                backgroundColor: '#f8f9fa', 
                borderRadius: '15px', 
                padding: '1.5rem', 
                marginTop: '1rem',
                border: `2px solid ${PRIMARY_RED}`
              }}>
                <h5 style={{ color: PRIMARY_RED, fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  👨‍💻 מפתח הפורטל
                </h5>
                <p style={{ color: PRIMARY_BLACK, margin: '0 0 0.5rem 0', fontWeight: '500' }}>
                  <strong>מאיר שובקס</strong> - מפתח Full-Stack ומעצב UX/UI
                </p>
                <p style={{ color: PRIMARY_BLACK, margin: '0 0 1rem 0', fontSize: '0.95rem' }}>
                  אחראי על פיתוח ועיצוב הפורטל, תמיכה טכנית ושיפורים מתמידים
                </p>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.5rem' }}>
                  <Badge bg="primary" style={{ fontSize: '0.9rem', padding: '0.4rem 0.8rem' }}>
                    📧 meir.shuvax@bynetdcs.co.il
                  </Badge>
                  <Badge bg="success" style={{ fontSize: '0.9rem', padding: '0.4rem 0.8rem' }}>
                    💬 צ'אט פנימי
                  </Badge>
                  <Badge bg="info" style={{ fontSize: '0.9rem', padding: '0.4rem 0.8rem' }}>
                    🐛 דיווח באגים
                  </Badge>
                </div>
                
                <p style={{ color: PRIMARY_BLACK, margin: '1rem 0 0 0', fontSize: '0.9rem', fontStyle: 'italic' }}>
                  "אני כאן כדי להפוך את הפורטל לחוויה הטובה ביותר עבורכם! 🚀"
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AboutPage; 