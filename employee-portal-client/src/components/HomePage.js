import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import SearchBox from './SearchBox';
import UserCard from './UserCard';
import WelcomeBanner from './WelcomeBanner';
import PhotoOfWeek from './PhotoOfWeek';
import HonorCardsList from './HonorCardsList';
import TeamPreview from './TeamPreview';
import LiveUpdates from './LiveUpdates';
import ChatBotModal from './ChatBotModal';

export default function HomePage() {
  const { user } = useOutletContext();
  console.log('HomePage received user:', user);

  // אנימציות
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Container fluid className="px-4 pb-4" dir="rtl">
          {/* Row 1: Search + User */}
          <motion.div variants={itemVariants}>
            <Row className="align-items-center">
              <Col md={4} className="">
                {/* Empty column for spacing */}
              </Col>
              <Col md={4} className="p-1 d-flex justify-content-center">
                <SearchBox />
              </Col>
              <Col md={4} className="p-1">
                <UserCard user={user} />
              </Col>
            </Row>
          </motion.div>
          {/* Row 2: Welcome */}
          <motion.div variants={itemVariants}>
            <Row className="mb-3">
              <Col md={12}>
                <WelcomeBanner />
              </Col>
            </Row>
          </motion.div>
          
          {/* Row 3: Complex Layout */}
          <motion.div variants={itemVariants}>
            <Row className="mb-4">
              <Col md={9} style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }} className="no-scrollbar">
                <Row className="mb-4">
                  <Col md={12} className="mb-4">
                    <PhotoOfWeek />
                  </Col>
                  <Col md={12} className="text-center">
                    <LiveUpdates compact={true} />
                  </Col>
                </Row>
                <HonorCardsList />
              </Col>
              <Col md={3}>
                <Row className="mb-4">
                  <Col md={12} className="text-center">
                    <TeamPreview />
                  </Col>
                </Row>
                <Row>
                  {/* <Col md={12} className="text-center">
                    <LiveUpdates compact={true} />
                  </Col> */}
                </Row>
              </Col>
            </Row>
          </motion.div>
          
          <ChatBotModal />
      </Container>
    </motion.div>
  );
}
