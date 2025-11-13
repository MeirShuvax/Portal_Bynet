import React, { useState, useEffect } from 'react';
import { Row, Col, Spinner, Alert } from 'react-bootstrap';
import { getHonorTypes, getHonorsByType } from '../services/honorsService';
import HonorCard from './HonorCard';

const HonorCardsList = () => {
  const [honorTypes, setHonorTypes] = useState([]);
  const [honorsPeople, setHonorsPeople] = useState({}); // { [honorTypeId]: [people] }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHonorTypesAndPeople = async () => {
      try {
        const types = await getHonorTypes();
        setHonorTypes(types);
        // טען לכל סוג הוקרה את האנשים
        const peopleMap = {};
        await Promise.all(types.map(async (type) => {
          try {
            const includeExpired = (type.name || '').trim() === 'מצטיינים';
            let honors = await getHonorsByType(type.id, { includeExpired });
            if (!includeExpired) {
              honors = honors.filter((h) => h.isActive);
            }
            const filteredHonors = honors.filter((h) => String(h.honors_type_id) === String(type.id));
            // שלוף את המשתמשים מתוך honors עם honorType
            peopleMap[type.id] = filteredHonors.map(h => ({
              ...h.user,
              name: h.user.full_name,
              honorType: h.honorsType || type,
              honorId: h.id,
              date: h.createdAt,
              description: h.description,
              isActive: h.isActive,
              displayUntil: h.display_until
            }));
            console.log(`HonorCardsList type ${type.id} (${type.name}) people:`, peopleMap[type.id]);
          } catch (e) {
            peopleMap[type.id] = [];
          }
        }));
        setHonorsPeople(peopleMap);
      } catch (err) {
        setError('שגיאה בטעינת סוגי ההוקרות.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHonorTypesAndPeople();
  }, []);

  if (loading) {
    return <div className="text-center"><Spinner animation="border" /></div>;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <Row xs={1} md={2} className="g-4">
      {honorTypes.map(honorType => (
        <Col key={honorType.id}>
          <HonorCard honorType={honorType} people={honorsPeople[honorType.id] || []} />
        </Col>
      ))}
    </Row>
  );
};

export default HonorCardsList; 