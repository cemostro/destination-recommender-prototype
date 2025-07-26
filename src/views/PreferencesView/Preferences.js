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
import PresetSelectCompass from "./components/PresetSelectCompass";
import TriangleControl from "./components/TriangleControl";
import WeightInputs from "./components/WeightInputs";
import RadarChart from "./components/RadarChart";
import EditDimensionsButton from "./components/EditDimensionsButton";
import Compass from "./components/Compass";
import NumericControls from "./components/NumericControls";


// const presets = [
//   { value: 'balanced', weights: [33.33, 33.33, 33.34] },
//   { value: 'personalized', weights: [100, 0, 0] },
//   { value: 'explorer', weights: [30, 0, 70] },
//   { value: 'classic', weights: [30, 70, 0] },
// ];

const presets = [
  { value: 'personalized', weights: { x: 0, y: 0 } },
  { value: 'adventurous-hidden', weights: { x: -0.7, y: 0.7 } },
  { value: 'adventurous-popular', weights: { x: 0.7, y: 0.7 } },
  { value: 'relaxing-popular', weights: { x: 0.7, y: -0.7 } },
  { value: 'relaxing-hidden', weights: { x: -0.7, y: -0.7 } },
];

const Preferences = () => {
  const { userData, setUserData } = useTravelRecommenderStore();
  const [selectedPreset, setSelectedPreset] = useState('personalized');
  const [key, setKey] = useState('radar');

  const [algorithmWeights, setAlgorithmWeights] = useState([33.33, 33.33, 33.34]);
  const [point, setPoint] = useState({ x: 200, y: 185 });
  const [position, setPosition] = useState({ x: 0, y: 0 });


  const handlePresetChange = (presetName) => {
    setSelectedPreset(presetName);
    if (presetName !== 'custom') {
      const preset = presets.find(p => p.value === presetName);
      if (preset) {
        setPosition(preset.weights);
      }
    }
    // if (presetName !== 'custom') {
    //   const preset = presets.find(p => p.value === presetName);
    //   if (preset) {
    //     const newWeights = [...preset.weights];
    //     setAlgorithmWeights(newWeights.map(v => Math.round(v * 100) / 100));
    //     updatePointFromWeights(newWeights);
    //   }
    // }
  };

  const handlePositionChange = (newPosition) => {
    setPosition(newPosition);
    setSelectedPreset('custom');
  };

  const updatePointFromWeights = (newWeights) => {
    const width = 400, height = 370, triangleSize = 140;
    const centerX = width / 2, centerY = height / 2;
    const v0 = { x: centerX, y: centerY - triangleSize }; // Personalization
    const v1 = { x: centerX - triangleSize * Math.sqrt(3) / 2, y: centerY + triangleSize / 2 }; // Popularity
    const v2 = { x: centerX + triangleSize * Math.sqrt(3) / 2, y: centerY + triangleSize / 2 }; // Diversity
    const normalized = newWeights.map(w => w / 100);
    const x = normalized[0] * v0.x + normalized[1] * v1.x + normalized[2] * v2.x;
    const y = normalized[0] * v0.y + normalized[1] * v1.y + normalized[2] * v2.y;
    setPoint({ x, y });
  };

  const handleWeightChange = (index, value) => {
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
      updatePointFromWeights(newWeights);
      const matchingPreset = presets.find(p =>
        p.weights.every((w, i) => Math.abs(w - newWeights[i]) < 0.01)
      );
      setSelectedPreset(matchingPreset ? matchingPreset.name : 'custom');
      return newWeights.map(v => Math.round(v * 100) / 100);
    });
  };

  const updateWeightsFromPoint = (x, y) => {
    const width = 400, height = 370, triangleSize = 140;
    const centerX = width / 2, centerY = height / 2;
    const v0 = { x: centerX, y: centerY - triangleSize }; // Personalization
    const v1 = { x: centerX - triangleSize * Math.sqrt(3) / 2, y: centerY + triangleSize / 2 }; // Popularity
    const v2 = { x: centerX + triangleSize * Math.sqrt(3) / 2, y: centerY + triangleSize / 2 }; // Diversity
    const denom = (v1.y - v2.y) * (v0.x - v2.x) + (v2.x - v1.x) * (v0.y - v2.y);
    const w0 = ((v1.y - v2.y) * (x - v2.x) + (v2.x - v1.x) * (y - v2.y)) / denom;
    const w1 = ((v2.y - v0.y) * (x - v2.x) + (v0.x - v2.x) * (y - v2.y)) / denom;
    const w2 = 1 - w0 - w1;
    const weightsRaw = [w0, w1, w2].map(w => Math.max(0, Math.min(1, w)));
    const total = weightsRaw.reduce((a, b) => a + b, 0);
    const newWeights = total > 0 ? weightsRaw.map(w => (w / total) * 100) : [33.33, 33.33, 33.34];
    setAlgorithmWeights(newWeights.map(v => Math.round(v * 100) / 100));
    setSelectedPreset('custom');
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
            onSelect={(k) => { setKey(k); setUserData({ ...userData, PresetType: [] }); }}
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
          <p style={{ textAlign: "left" }}>Choose your journey style:</p>
          <div className="journey-style-placeholder-1" >
            <PresetSelectCompass
              value={selectedPreset}
              onChange={(e) => handlePresetChange(e)}
              onSurprise={() => {
                const randomX = (Math.random() * 2 - 1).toFixed(2);
                const randomY = (Math.random() * 2 - 1).toFixed(2);
                handlePositionChange({ x: randomX, y: randomY });  
              }}
            />
          </div>
          <div className="journey-style-placeholder-2">
            {/* <TriangleControl
              weights={algorithmWeights}
              setWeights={handleWeightChange}
              point={point}
              setPoint={(x, y) => {
                setPoint({ x, y });
                updateWeightsFromPoint(x, y);
              }}
            /> */}
            <Compass position={position} setPosition={handlePositionChange} />
          </div>
          <div className="journey-style-placeholder-3">
            {/* <WeightInputs
              weights={algorithmWeights}
              handleWeightChange={handleWeightChange}
            /> */}
            <NumericControls position={position} onSetPosition={handlePositionChange} />
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
