import React from 'react';
import "../../../styles/WeightInputs.css";
import { parameters, parameterColors } from '../../../data/constantData';

const WeightInputs = ({ weights, handleWeightChange }) => {

  return (
    <div className="weight-inputs-container">
      {parameters.map((param, i) => (
        <div key={param} className="weight-item">
          <span className="color-dot" style={{ backgroundColor: parameterColors[i] }}></span>
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