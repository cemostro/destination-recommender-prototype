import React from 'react';
import "../../../styles/NumericControls.css";

export default function NumericControls({ position, onSetPosition }) {
  const handleChange = (axis, value) => {
    const clamped = Math.max(-1, Math.min(1, parseFloat(value)));
    onSetPosition({
      ...position,
      [axis]: clamped,
    });
  };

  // TODO convert following number inputs to string inputs

  return (
    <div className="numeric-controls">
      {/* Popularity Slider */}
      <div className="control-group">
        <label>
          Popularity (← Lesser-Known &nbsp;&nbsp;|&nbsp;&nbsp; Popular →)
        </label>
        <div className="input-row">
          <input
            type="range"
            min={-1}
            max={1}
            step={0.01}
            value={position.x}
            onChange={(e) => handleChange('x', e.target.value)}
          />
          <input
            type="number"
            min={-1}
            max={1}
            step={0.01}
            value={position.x.toFixed(2)}
            onChange={(e) => handleChange('x', e.target.value)}
            className="weight-input"
          />
        </div>
      </div>

      {/* Activity Level Slider */}
      <div className="control-group">
        <label>
          Personalization (← Diverse &nbsp;&nbsp;|&nbsp;&nbsp; Personalized →)
        </label>
        <div className="input-row">
          <input
            type="range"
            min={-1}
            max={1}
            step={0.01}
            value={position.y}
            onChange={(e) => handleChange('y', e.target.value)}
          />
          
          <input
            type="number"
            min={-1}
            max={1}
            step={0.01}
            value={position.y.toFixed(2)}
            onChange={(e) => handleChange('y', e.target.value)}
            className="weight-input"
          />
        </div>
      </div>
    </div>
  );
}
