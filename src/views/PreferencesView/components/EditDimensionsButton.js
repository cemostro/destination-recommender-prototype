import React, { useState } from 'react';
import "../../../styles/EditDimensionsButton.css";
import EditDimensionsPopup from './EditDimensionsPopup';
import useTravelRecommenderStore from '../../../store/travelRecommenderStore';
import { Modal } from 'react-bootstrap';

const EditDimensionsButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="edit-dimensions-container">
      <button className="edit-dimensions-button" onClick={() => setIsOpen(true)}>
        Edit Dimensions
      </button>
      <Modal show={isOpen} onHide={() => setIsOpen(false)} centered>
        <EditDimensionsPopup
          onClose={() => setIsOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default EditDimensionsButton;