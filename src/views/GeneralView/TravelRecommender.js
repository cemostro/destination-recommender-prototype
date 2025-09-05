import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/App.css";
import { Row, Col } from "react-bootstrap";
import Map from "../MapView/Map";
import Preferences from "../PreferencesView/Preferences";
import { Results } from "../ResultsView/Results";
import { Tooltip } from 'react-tooltip'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons'
import IntroModal from "./IntroModal";
import { Modal } from "react-bootstrap";


const TravelRecommender = () => {
  const [activeResult, setActiveResult] = useState(0);
  const [leftColumnOpen, setLeftColumnOpen] = useState(true);
  const [rightColumnOpen, setRightColumnOpen] = useState(true);
  const [showIntroModal, setShowIntroModal] = useState(true);

  return (
    <div className="App">
      <Row style={{ height: "100%" }}>
        {leftColumnOpen && (
          <Col style={{ paddingRight: 0 }} className="left-column">
            <Preferences />
          </Col>
        )}
        <Col md={5 + (leftColumnOpen ? 0 : 3) + (rightColumnOpen ? 0 : 3)} style={{ padding: 0 }} className="map-column">
          <div style={{ display: "grid", gridTemplateColumns: "10px 1fr 10px", height: "100%" }}>
            <div className="expand-bar" onClick={() => setLeftColumnOpen(oldState => !oldState)}>
              <FontAwesomeIcon icon={leftColumnOpen ? faAngleLeft : faAngleRight} />
            </div>
            <Map key={`map-${leftColumnOpen}-${rightColumnOpen}`} setActiveResult={setActiveResult} />
            <div className="expand-bar" onClick={() => setRightColumnOpen(oldState => !oldState)}>
              <FontAwesomeIcon icon={rightColumnOpen ? faAngleRight : faAngleLeft} />
            </div>
          </div>
        </Col>
        {rightColumnOpen && (
          <Col className='right-column'>
            <Results activeResult={activeResult} setShowIntroModal={setShowIntroModal} />
          </Col>
        )}
      </Row>
      <Modal show={showIntroModal} onHide={() => setShowIntroModal(false)} centered size="xl">
        <IntroModal
          onClose={() => setShowIntroModal(false)}
        />
      </Modal>
      <Tooltip id="prio-switch-tooltip" style={{ width: "300px", zIndex: 99999 }} />
      <Tooltip id="additional-info-tooltip" style={{ width: "300px", zIndex: 99999 }} place="bottom" />
      <Tooltip id="barchart-tooltip" style={{ width: "300px", zIndex: 99999 }} place="bottom" />

    </div>
  );
};

export default TravelRecommender;
