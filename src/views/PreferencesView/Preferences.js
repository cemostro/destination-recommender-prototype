import React, { useState } from "react";
import "../../styles/App.css";
import Budget from "./components/Budget";
import { CustomizationContainer } from "./components/CustomizationContainer";
import { PresetTypesContainer } from "./components/PresetTypesContainer";
import { Tabs, Tab, Row, Col } from "react-bootstrap";
import AdditionalInfo from "./components/AdditionalInfo";
import TravelMonths from "./components/TravelMonths";
import useTravelRecommenderStore from "../../store/travelRecommenderStore";
import PresetSelect from "./components/PresetSelect";

const Preferences = () => {
  const { userData, setUserData } = useTravelRecommenderStore();
  const [selectedJourneyStyle, setSelectedJourneyStyle] = useState('');
  const [key, setKey] = useState('advanced');

  return (
    <div style={{ height: "100%", overflowY: "auto", overflowX: "hidden", paddingRight: "5px" }}>
      <p style={{ textAlign: "left", paddingTop: "10px", fontWeight: "700", fontSize: "1.1em" }}>DestiRec - Travel Destination Recommender System</p>
      <hr />
      <Row className="content-row">
        <Col xs={6} style={{ borderRight: "1px solid rgba(255, 255, 255, 0.25)" }}>
          <p style={{ textAlign: "left" }}>Craft your travel taste map:</p>
          <div className="taste-map-placeholder">
            <p>[Travel Taste Map Component Will Go Here]</p>
          </div>
          <div className="settings-button-placeholder">
            <p>[Settings Button Will Go Here]</p>
          </div>
        </Col>
        <Col xs={6} className="right-column">
          <p style={{ textAlign: "left" }}>Choose your journey style:</p>
          <div className="journey-style-placeholder-1">
            <PresetSelect
              value={selectedJourneyStyle}
              onChange={(e) => setSelectedJourneyStyle(e)}
            />
          </div>
          <div className="journey-style-placeholder-2">
            <p>[Journey Style Component 2 Will Go Here]</p>
          </div>
          <div className="journey-style-placeholder-3">
            <p>[Journey Style Component 3 Will Go Here]</p>
          </div>
        </Col>
      </Row>

      {/* <div style={{ padding: "10px 0" }}>
        <Budget />
      </div>
      <div>
        <AdditionalInfo />
      </div>
      <div>
        <TravelMonths />
      </div>
      <div style={{ padding: "10px 0" }}>
        <Tabs
          activeKey={key}
          id="mode"
          onSelect={(k) => { setKey(k); setUserData({ ...userData, PresetType: [] }); }}
          className="mb-3"
        >
          <Tab eventKey="novice" title="Presets (Novice)">
            <PresetTypesContainer />
          </Tab>
          <Tab eventKey="advanced" title="Advanced Preferences">
            <CustomizationContainer />
          </Tab>
        </Tabs>

      </div> */}
      <hr />
      <p style={{ textAlign: "left", fontSize: "0.8em" }}>(c) Asal Nesar Noubari, Cem Nasit Sarica and Wolfgang Wörndl (Technical University of Munich)</p>
    </div >
  );
};

export default Preferences;
