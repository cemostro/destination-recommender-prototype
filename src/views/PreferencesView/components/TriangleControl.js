import React, { useRef, useState, useEffect } from "react";
import "../../../styles/TriangleControl.css";
import { parameters, parameterColors } from "../../../data/constantData";

const TriangleControl = ({ weights, setWeights }) => {
  const containerRef = useRef(null);
  const [size, setSize] = useState(300);
  const [point, setPoint] = useState({ x: 0, y: 0 });

  // Resize observer for responsiveness
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      setSize(entry.contentRect.width);
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Triangle geometry based on size
  const triangleSize = size * 0.4;
  const centerX = size / 2;
  const centerY = size / 2;
  const vertices = [
    { x: centerX, y: centerY - triangleSize, color: parameterColors[0] },
    { x: centerX - (triangleSize * Math.sqrt(3)) / 2, y: centerY + triangleSize / 2, color: parameterColors[1] },
    { x: centerX + (triangleSize * Math.sqrt(3)) / 2, y: centerY + triangleSize / 2, color: parameterColors[2] },
  ];

  // Convert a point to weights
  const pointToWeights = (px, py) => {
    const [A, B, C] = vertices;
    const denom = (B.y - C.y) * (A.x - C.x) + (C.x - B.x) * (A.y - C.y);
    const w0 = ((B.y - C.y) * (px - C.x) + (C.x - B.x) * (py - C.y)) / denom;
    const w1 = ((C.y - A.y) * (px - C.x) + (A.x - C.x) * (py - C.y)) / denom;
    const w2 = 1 - w0 - w1;
    return [Math.max(0, w0), Math.max(0, w1), Math.max(0, w2)];
  };

  // Handle drag
  const handleMove = (e) => {
    const { left, top } = containerRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    const w = pointToWeights(x, y);
    const sum = w.reduce((a, b) => a + b, 0);
    const normalized = w.map((v) => (v / sum) * 100);
    setPoint({ x, y });
    setWeights(normalized);
  };

  // Initialize point from weights
  useEffect(() => {
    console.log("Weights changed:", weights);
    console.log("Size changed:", size);
    const px = vertices[0].x * (weights[0] / 100) +
      vertices[1].x * (weights[1] / 100) +
      vertices[2].x * (weights[2] / 100);
    const py = vertices[0].y * (weights[0] / 100) +
      vertices[1].y * (weights[1] / 100) +
      vertices[2].y * (weights[2] / 100);
    setPoint({ x: px, y: py });
    console.log("Point set to:", { x: px, y: py });
  }, [weights, size]); // re-init if size changes

  return (
    <div ref={containerRef} className="triangle-control-container">
      <svg width={size} height={size} onMouseDown={(e) => handleMove(e)} onMouseMove={(e) => e.buttons && handleMove(e)}>
        {/* Triangle */}
        <polygon
          points={vertices.map(v => `${v.x},${v.y}`).join(" ")}
          fill="none"
          stroke="#666"
          strokeWidth="2"
        />

        {/* Axes */}
        {vertices.map((v, i) => (
          <line key={i} x1={centerX} y1={centerY} x2={v.x} y2={v.y} stroke="#999" strokeWidth="1" />
        ))}

        {/* Labels */}
        {vertices.map((v, i) => (
          <text
            key={i}
            x={i === 1 ? v.x - 30 : i === 2 ? v.x + 30 : v.x}
            y={i === 0 ? v.y - 15 : v.y + 10}
            fill="#fff"
            fontSize={12}
            textAnchor="middle"
          >
            {parameters[i]}
          </text>
        ))}

        {/* Draggable Point */}
        <circle
          cx={point.x}
          cy={point.y}
          r={6}
          fill="#fff"
          stroke="#000"
          strokeWidth="1"
          style={{ cursor: "pointer" }}
        />
      </svg>

    </div>
  );
};

export default TriangleControl;
