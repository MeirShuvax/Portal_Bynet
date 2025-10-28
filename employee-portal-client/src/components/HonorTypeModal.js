import React from 'react';
import { Modal } from 'react-bootstrap';
import UserCard from './UserCard';
import WishesModal from './WishesModal';

const HonorTypeModal = ({ show, onHide, people, title }) => {

  console.log('HonorTypeModal received props:', { show, onHide, people, title });

  // קביעת גודל המודל דינמית
  let modalSize = 'lg';
  if (people.length === 1) modalSize = undefined;
  else if (people.length > 4) modalSize = 'xl';

  return (
    <Modal show={show} onHide={onHide} centered size={modalSize}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {people.length === 1 ? (
          <div className="d-flex flex-column align-items-center justify-content-center">
            <div style={{ width: '100%', maxWidth: 320 }}>
              <UserCard
                name={people[0].name}
                image={people[0].image}
                date={people[0].date}
                honorType={people[0].honorType}
              />
            </div>
            <div className="mt-3 w-100" style={{ maxWidth: 400 }}>
              <WishesModal
                show={true}
                onHide={() => {}}
                honorId={people[0].honorId}
                userName={people[0].name}
                isInline
              />
            </div>
          </div>
        ) : (
          <div className="row g-3">
            {people.map((person, idx) => (
              <div className="col-12 col-md-6 col-lg-4" key={person.honorId || person.id}>
                <div>
                  <UserCard
                    name={person.name}
                    image={person.image}
                    date={person.date}
                    honorType={person.honorType}
                  />
                </div>
                <div className="mt-2">
                  <WishesModal
                    show={true}
                    onHide={() => {}}
                    honorId={person.honorId}
                    userName={person.name}
                    isInline
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default HonorTypeModal; 