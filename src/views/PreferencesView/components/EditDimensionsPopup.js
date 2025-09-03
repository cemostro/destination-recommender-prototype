import React, { useState, useEffect } from 'react';
import useTravelRecommenderStore from '../../../store/travelRecommenderStore';
import { Modal, Form, Button } from 'react-bootstrap';

const EditDimensionsPopup = ({ onClose }) => {
    const { userData, setUserData } = useTravelRecommenderStore();
    const [includedAttributes, setIncludedAttributes] = useState([]);

    useEffect(() => {
        // Initialize with current included attributes based on weight > 0
        const initialIncludedAttrs = Object.keys(userData.Attributes).filter(
            attr => userData.Attributes[attr].weight > 0
        );
        setIncludedAttributes(initialIncludedAttrs);
    }, [userData.Attributes]);

    const handleSave = () => {
        if (includedAttributes.length > 3) {
            const updatedAttributes = Object.fromEntries(
                Object.entries(userData.Attributes).map(([attr, data]) => [
                    attr,
                    {
                        ...data,
                        weight: includedAttributes.includes(attr) ? 1 : 0
                    }
                ])
            );
            setUserData({ ...userData, Attributes: updatedAttributes });
            onClose();
        } else {
            alert('At least 3 attributes must be included.');
        }
    };

    const handleCheckboxChange = (attr) => {
        setIncludedAttributes(prev =>
            prev.includes(attr) ? prev.filter(a => a !== attr) : [...prev, attr]
        );
    };

    return (
        <>
            <Modal.Header closeButton style={{ backgroundColor: '#193D4B', borderBottom: 'none' }}>
                <Modal.Title style={{ color: 'white' }}>Edit Dimensions</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ backgroundColor: '#193D4B', maxHeight: '70vh', overflowY: 'auto' }}>
                <p style={{ color: 'white', fontSize: '1.1rem' }}>
                    Choose which dimensions influence your recommendations:
                </p>
                <Form>
                    {Object.keys(userData.Attributes).map((attr) => (
                        <Form.Check
                            key={attr}
                            type="checkbox"
                            id={`checkbox-${attr}`}
                            label={attr}
                            checked={includedAttributes.includes(attr)}
                            onChange={() => handleCheckboxChange(attr)}
                            style={{ color: 'white' }}
                            className="mb-2"
                        />
                    ))}
                </Form>
                <p style={{ color: 'white' }}>Tip: Dimensions can also be removed by double clicking on the labels around the chart.</p>

            </Modal.Body>
            <Modal.Footer style={{ backgroundColor: '#193D4B', borderTop: 'none' }}>
                <Button variant="secondary" onClick={onClose}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleSave}>
                    Save
                </Button>
            </Modal.Footer>
        </>
    );
};

export default EditDimensionsPopup;