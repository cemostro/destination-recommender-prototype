import React, { useRef, useState, useEffect } from "react";
import "../../../styles/Compass.css";


const Compass = ({ onChange }) => {
  const svgRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const computePosition = (clientX, clientY) => {
    const rect = svgRef.current.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const x = clientX - rect.left - cx;
    const y = clientY - rect.top - cy;
    const r = Math.sqrt(x * x + y * y);
    const maxR = rect.width / 2;

    const clampedR = Math.min(r, maxR);
    const angle = Math.atan2(y, x);
    const clampedX = clampedR * Math.cos(angle);
    const clampedY = clampedR * Math.sin(angle);

    const normX = clampedX / maxR;
    const normY = -clampedY / maxR; // invert Y for top = positive

    return { x: normX, y: normY };
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    const newPos = computePosition(e.clientX, e.clientY);
    setPosition(newPos);
    if (onChange) onChange(newPos);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const newPos = computePosition(e.clientX, e.clientY);
    setPosition(newPos);
    if (onChange) onChange(newPos);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Optional: attach mouseup to window for dragging outside
  useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <div
      className="compass"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseUp}
    >
      <svg ref={svgRef} className="compass-svg">
        <circle cx="50%" cy="50%" r="2" fill="black" />
        <line
          x1="50%"
          y1="50%"
          x2={`${50 + position.x * 50}%`}
          y2={`${50 - position.y * 50}%`}
          stroke="blue"
          strokeWidth="2"
        />
      </svg>
      <div className="label top">Adventurous</div>
      <div className="label bottom">Relaxing</div>
      <div className="label left">Hidden Gem</div>
      <div className="label right">Popular</div>
    </div>
  );
};

export default Compass;