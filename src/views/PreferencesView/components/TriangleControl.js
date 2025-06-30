import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import "../../../styles/TriangleControl.css";
import { parameters, parameterColors } from '../../../data/constantData';

const TriangleControl = ({ weights, setWeights, point, setPoint }) => {
  const [hoveredParameter, setHoveredParameter] = useState(null);
  const canvasRef = useRef(null);
  const svgRef = useRef(null);
  const width = 400;
  const height = 370;
  const triangleSize = 140;
  const centerX = width / 2;
  const centerY = height / 2;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    ctx.clearRect(0, 0, width, height);
    svg.selectAll('*').remove();

    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, width, height);

    const vertices = [{ x: centerX, y: centerY - triangleSize, color: d3.color(parameterColors[0]) }, { x: centerX - triangleSize * Math.sqrt(3) / 2, y: centerY + triangleSize / 2, color: d3.color(parameterColors[1]) }, { x: centerX + triangleSize * Math.sqrt(3) / 2, y: centerY + triangleSize / 2, color: d3.color(parameterColors[2]) }];
    const centerVertex = { x: centerX, y: centerY, color: d3.color('rgb(255, 255, 255)') }; // White center point
    const imageData = ctx.createImageData(width, height);
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const denom = (vertices[1].y - vertices[2].y) * (vertices[0].x - vertices[2].x) + (vertices[2].x - vertices[1].x) * (vertices[0].y - vertices[2].y);
        const w0 = ((vertices[1].y - vertices[2].y) * (x - vertices[2].x) + (vertices[2].x - vertices[1].x) * (y - vertices[2].y)) / denom;
        const w1 = ((vertices[2].y - vertices[0].y) * (x - vertices[2].x) + (vertices[0].x - vertices[2].x) * (y - vertices[2].y)) / denom;
        const w2 = 1 - w0 - w1;
        if (w0 >= 0 && w1 >= 0 && w2 >= 0) {
          // Calculate distance from the center
          const dx = x - centerX;
          const dy = y - centerY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const maxDistance = triangleSize; // Approximate max distance to an edge
          const centerInfluence = Math.max(0, 1 - distance / maxDistance); // Fade white from center to edges

          // Interpolate colors with center influence
          const r = Math.round(
            (w0 * vertices[0].color.r + w1 * vertices[1].color.r + w2 * vertices[2].color.r) * (1 - centerInfluence) +
            centerVertex.color.r * centerInfluence
          );
          const g = Math.round(
            (w0 * vertices[0].color.g + w1 * vertices[1].color.g + w2 * vertices[2].color.g) * (1 - centerInfluence) +
            centerVertex.color.g * centerInfluence
          );
          const b = Math.round(
            (w0 * vertices[0].color.b + w1 * vertices[1].color.b + w2 * vertices[2].color.b) * (1 - centerInfluence) +
            centerVertex.color.b * centerInfluence
          );
          const index = (y * width + x) * 4;
          imageData.data[index] = r;
          imageData.data[index + 1] = g;
          imageData.data[index + 2] = b;
          imageData.data[index + 3] = 255;
        }
      }
    }
    ctx.putImageData(imageData, 0, 0);
    svg.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'none');

    svg.append('path')
      .attr('d', () => {
        const outlinePoints = vertices.map(v => `${v.x},${v.y}`);
        return `M ${outlinePoints.join(' L ')} Z`;
      })
      .attr('stroke', '#666666')
      .attr('stroke-width', 2)
      .attr('fill', 'none');

    vertices.forEach(v => {
      svg.append('line')
        .attr('x1', centerX)
        .attr('y1', centerY)
        .attr('x2', v.x)
        .attr('y2', v.y)
        .attr('stroke', '#666666')
        .attr('stroke-width', 1);
    });

    svg.append('defs')
      .append('filter')
      .attr('id', 'shadow')
      .append('feDropShadow')
      .attr('dx', 0)
      .attr('dy', 0)
      .attr('stdDeviation', 2)
      .attr('flood-color', '#000000')
      .attr('flood-opacity', 0.5);

    // Calculate fill color for the control circle using weights
    const [w0, w1, w2] = weights.map(w => w * 0.01);
    const dx = point.x - centerX;
    const dy = point.y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxDistance = triangleSize;
    const centerInfluence = Math.max(0, 1 - distance / maxDistance); // Fade white from center to edges

    const baseR = Math.round(w0 * vertices[0].color.r + w1 * vertices[1].color.r + w2 * vertices[2].color.r);
    const baseG = Math.round(w0 * vertices[0].color.g + w1 * vertices[1].color.g + w2 * vertices[2].color.g);
    const baseB = Math.round(w0 * vertices[0].color.b + w1 * vertices[1].color.b + w2 * vertices[2].color.b);

    const fillR = Math.round(baseR * (1 - centerInfluence) + centerVertex.color.r * centerInfluence);
    const fillG = Math.round(baseG * (1 - centerInfluence) + centerVertex.color.g * centerInfluence);
    const fillB = Math.round(baseB * (1 - centerInfluence) + centerVertex.color.b * centerInfluence);
    const fillColor = `rgb(${fillR}, ${fillG}, ${fillB})`;

    svg.append('circle')
      .attr('class', 'control-point')
      .attr('cx', point.x)
      .attr('cy', point.y)
      .attr('r', 6)
      .attr('fill', fillColor)
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .attr('filter', 'url(#shadow)')
      .call(d3.drag()
        .on('drag', function (event) {
          let x = event.x;
          let y = event.y;
          const denom = (vertices[1].y - vertices[2].y) * (vertices[0].x - vertices[2].x) + (vertices[2].x - vertices[1].x) * (vertices[0].y - vertices[2].y);
          const w0 = ((vertices[1].y - vertices[2].y) * (x - vertices[2].x) + (vertices[2].x - vertices[1].x) * (y - vertices[2].y)) / denom;
          const w1 = ((vertices[2].y - vertices[0].y) * (x - vertices[2].x) + (vertices[0].x - vertices[2].x) * (y - vertices[2].y)) / denom;
          const w2 = 1 - w0 - w1;
          if (w0 < 0 || w1 < 0 || w2 < 0) {
            const weightsRaw = [w0, w1, w2].map(w => Math.max(0, w));
            const total = weightsRaw.reduce((a, b) => a + b, 0);
            const normalized = total > 0 ? weightsRaw.map(w => w / total) : [1 / 3, 1 / 3, 1 / 3];
            x = normalized[0] * vertices[0].x + normalized[1] * vertices[1].x + normalized[2] * vertices[2].x;
            y = normalized[0] * vertices[0].y + normalized[1] * vertices[1].y + normalized[2] * vertices[2].y;
          }
          setPoint(x, y);
        })
      );

    parameters.forEach((param, i) => {
      const angle = (i / 3) * 2 * Math.PI - Math.PI / 2;
      let x = centerX + 1.2 * triangleSize * -Math.cos(angle);
      if (i === 1) {
        x += 20; // Adjust for right parameter
      } else if (i === 2) {
        x -= 20; // Adjust for left parameter
      }
      const y = centerY + 1.2 * triangleSize * Math.sin(angle);
      svg.append('text')
        .attr('x', x)
        .attr('y', y)
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('font-size', 12)
        .attr('fill', '#ffffff')
        .attr('font-family', "'Inter', sans-serif")
        .text(param);
    });

    svg.on('click', (event) => {
      if (!event.target.classList.contains('control-point')) {
        let [x, y] = d3.pointer(event);
        const denom = (vertices[1].y - vertices[2].y) * (vertices[0].x - vertices[2].x) + (vertices[2].x - vertices[1].x) * (vertices[0].y - vertices[2].y);
        const w0 = ((vertices[1].y - vertices[2].y) * (x - vertices[2].x) + (vertices[2].x - vertices[1].x) * (y - vertices[2].y)) / denom;
        const w1 = ((vertices[2].y - vertices[0].y) * (x - vertices[2].x) + (vertices[0].x - vertices[2].x) * (y - vertices[2].y)) / denom;
        const w2 = 1 - w0 - w1;
        if (w0 < 0 || w1 < 0 || w2 < 0) {
          const weightsRaw = [w0, w1, w2].map(w => Math.max(0, w));
          const total = weightsRaw.reduce((a, b) => a + b, 0);
          const normalized = total > 0 ? weightsRaw.map(w => w / total) : [1 / 3, 1 / 3, 1 / 3];
          x = normalized[0] * vertices[0].x + normalized[1] * vertices[1].x + normalized[2] * vertices[2].x;
          y = normalized[0] * vertices[0].y + normalized[1] * vertices[1].y + normalized[2] * vertices[2].y;
        }
        setPoint(x, y);
      }
    });
  }, [point, weights, setPoint]);

  return (
    <div className="triangle-control-container">
      <canvas ref={canvasRef} width={400} height={300} style={{ position: 'absolute', top: 0, left: 0 }} />
      <svg ref={svgRef} style={{ position: 'absolute', top: 0, left: 0 }}></svg>
    </div>
  );
};

export default TriangleControl;