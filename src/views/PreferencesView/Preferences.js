import React, { useState, useCallback } from "react";
import "../../styles/App.css";
import { debounce } from "lodash";
import Budget from "./components/Budget";
import { CustomizationContainer } from "./components/CustomizationContainer";
import { PresetTypesContainer } from "./components/PresetTypesContainer";
import { Tabs, Tab, Row, Col } from "react-bootstrap";
import AdditionalInfo from "./components/AdditionalInfo";
import TravelMonths from "./components/TravelMonths";
import useTravelRecommenderStore from "../../store/travelRecommenderStore";
import PresetSelect from "./components/PresetSelect";
// import PresetSelectCompass from "./components/PresetSelectCompass";
import TriangleControl from "./components/TriangleControl";
import WeightInputs from "./components/WeightInputs";
import RadarChart from "./components/RadarChart";
import EditDimensionsButton from "./components/EditDimensionsButton";
// import Compass from "./components/Compass";
// import NumericControls from "./components/NumericControls";


const presets = [
  { value: 'balanced', weights: [33.3, 33.3, 33.4] },
  { value: 'personalized', weights: [100, 0, 0] },
  { value: 'explorer', weights: [30, 0, 70] },
  { value: 'classic', weights: [30, 70, 0] },
];

// const presets = [
//   { value: 'personalized', weights: { x: 0, y: 0 } },
//   { value: 'adventurous-hidden', weights: { x: -0.7, y: 0.7 } },
//   { value: 'adventurous-popular', weights: { x: 0.7, y: 0.7 } },
//   { value: 'relaxing-popular', weights: { x: 0.7, y: -0.7 } },
//   { value: 'relaxing-hidden', weights: { x: -0.7, y: -0.7 } },
// ];

const Preferences = () => {
  const { userData, setUserData } = useTravelRecommenderStore();
  const [selectedPreset, setSelectedPreset] = useState('personalized');
  const [key, setKey] = useState(userData.PreferenceMode || 'radar');

  const [algorithmWeights, setAlgorithmWeights] = useState([100, 0, 0]);
  // const [position, setPosition] = useState(userData.CompassPosition || { x: 0, y: 0 });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateUserData = useCallback(
    debounce((position) => {
      setUserData({ ...userData, CompassPosition: position });
    }, 500),
    [userData]
  );

  // const handlePositionChange = (newPosition) => {
  //   setPosition(newPosition);
  //   updateUserData(newPosition);
  //   setSelectedPreset('custom');
  // };


  const handlePresetChange = (presetName) => {
    setSelectedPreset(presetName);
    // if (presetName !== 'custom') {
    //   const preset = presets.find(p => p.value === presetName);
    //   if (preset) {
    //     setPosition(preset.weights);
    //     updateUserData(preset.weights);
    //   }
    // }
    if (presetName !== 'custom') {
      const preset = presets.find(p => p.value === presetName);
      if (preset) {
        const newWeights = [...preset.weights];
        setAlgorithmWeights(newWeights);
      }
    }
  };

  const handleManualWeightChange = (index, value) => {
    const newValue = Math.max(0, Math.min(100, parseFloat(value) || 0));
    setAlgorithmWeights(prev => {
      const newWeights = [...prev];
      newWeights[index] = newValue;
      const otherIndices = [0, 1, 2].filter(i => i !== index);
      const remaining = 100 - newValue;
      const sumOthers = prev[otherIndices[0]] + prev[otherIndices[1]];
      if (sumOthers > 0) {
        newWeights[otherIndices[0]] = (prev[otherIndices[0]] / sumOthers) * remaining;
        newWeights[otherIndices[1]] = (prev[otherIndices[1]] / sumOthers) * remaining;
      } else {
        newWeights[otherIndices[0]] = remaining / 2;
        newWeights[otherIndices[1]] = remaining / 2;
      }
      const total = newWeights.reduce((a, b) => a + b, 0);
      newWeights.forEach((_, i) => {
        newWeights[i] = (newWeights[i] / total) * 100;
      });
      const matchingPreset = presets.find(p =>
        p.weights.every((w, i) => Math.abs(w - newWeights[i]) < 0.01)
      );
      setSelectedPreset(matchingPreset ? matchingPreset.name : 'custom');
      return newWeights.map(v => Math.round(v * 100) / 100);
    });
  };

  return (
    <div style={{ height: "100%", overflowY: "auto", overflowX: "hidden", paddingRight: "5px" }}>
      <p style={{ textAlign: "left", paddingTop: "10px", fontWeight: "700", fontSize: "1.1em" }}>DestiRec - Travel Destination Recommender System</p>
      <hr />
      <Row className="content-row">
        <Col xs={6} style={{ borderRight: "1px solid rgba(255, 255, 255, 0.25)" }}>
          <Tabs
            activeKey={key}
            id="mode"
            onSelect={(k) => { setKey(k); setUserData({ ...userData, PreferenceMode: k, PresetType: [] }); }}
            className="mb-3"
          >
            <Tab eventKey="preset" title="Presets">
              <PresetTypesContainer />
            </Tab>
            <Tab eventKey="slider" title="Preference Sliders">
              <CustomizationContainer />
            </Tab>
            <Tab eventKey="radar" title="Taste Map">
              <p style={{ textAlign: "left" }}>Craft your travel taste map:</p>
              <div className="taste-map-placeholder">
                <RadarChart />
              </div>
              <div className="settings-button-placeholder">
                <EditDimensionsButton />
              </div>
            </Tab>
          </Tabs>
        </Col>
        <Col xs={6} className="right-column">
          <p style={{ textAlign: "left" }}>Set your travel compass:</p>
          <div className="journey-style-placeholder-1"  >
            <PresetSelect
              value={selectedPreset}
              onChange={(e) => handlePresetChange(e)}
            // onSurprise={() => {
            //   const randomX = (Math.random() * 2 - 1).toFixed(2);
            //   const randomY = (Math.random() * 2 - 1).toFixed(2);
            //   handlePositionChange({ x: randomX, y: randomY });
            // }}
            // onReset={() => {
            //   setPosition({ x: 0, y: 0 });
            //   setSelectedPreset('personalized');
            //   updateUserData({ x: 0, y: 0 });
            // }}
            />
          </div>
          <div className="journey-style-placeholder-2">
            <TriangleControl
              weights={algorithmWeights}
              setWeights={setAlgorithmWeights}
              setSelectedPreset={setSelectedPreset}
            />
            {/* <Compass position={position} setPosition={handlePositionChange} /> */}
          </div>
          <div className="journey-style-placeholder-3">
            <WeightInputs
              weights={algorithmWeights}
              handleWeightChange={handleManualWeightChange}
            />
            {/* <NumericControls position={position} onSetPosition={handlePositionChange} /> */}
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
      <p style={{ textAlign: "left", fontSize: "0.8em", marginBottom: 0 }}>(c) Asal Nesar Noubari, Cem Nasit Sarica and Wolfgang Wörndl (Technical University of Munich)</p>
      <p style={{ textAlign: "left", fontSize: "0.8em" }}>Icons made by Freepik, monkik from www.flaticon.com</p>
    </div >
  );
};

export default Preferences;
