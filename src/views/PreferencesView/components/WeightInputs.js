import React from 'react';
import "../../../styles/WeightInputs.css";
import { popularityParameters, noveltyParameters, popularityParameterColors, noveltyParameterColors } from '../../../data/constantData';

const WeightInputs = ({ weights, popularityToggleValue, handleWeightChange }) => {

  return (
    <div className="weight-inputs-container">
      {(popularityToggleValue === "popular" ? popularityParameters : noveltyParameters).map((param, i) => (
        <div key={param} className="weight-item">
          <span className="color-dot" style={{ backgroundColor: (popularityToggleValue === "popular" ? popularityParameterColors : noveltyParameterColors)[i] }}></span>
          <label className="weight-label">{param}:</label>
          <input
            type="text"
            value={weights[i].toString()}
            onChange={(e) => handleWeightChange(i, e.target.value)}
            className="weight-input"
            placeholder="0-100"
          />
          <span className="percent-sign">%</span>
        </div>
      ))}
    </div>
  );
};

export default WeightInputs;