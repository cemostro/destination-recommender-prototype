import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import "../../../styles/TriangleControl.css";
import { popularityParameters, noveltyParameters, popularityParameterColors, noveltyParameterColors } from '../../../data/constantData';

const TriangleControl = ({ weights, popularityToggleValue, setWeights, setSelectedPreset }) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const svgRef = useRef(null);
  const [size, setSize] = useState(undefined);
  const [point, setPoint] = useState({ x: 0, y: 0 }); // internal point

  const updateWeightsFromPoint = useCallback((x, y) => {
    if (!size) return;
    const { width, height, triangleSize } = size;
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
    setWeights(newWeights.map(w => Math.round(w * 10) / 10));
    setSelectedPreset("custom");
  }, [size, setWeights, setSelectedPreset]);

  const updatePointFromWeights = useCallback((newWeights) => {
    if (!size) return;
    const { width, height, triangleSize } = size;
    const centerX = width / 2, centerY = height / 2;
    const v0 = { x: centerX, y: centerY - triangleSize };
    const v1 = { x: centerX - triangleSize * Math.sqrt(3) / 2, y: centerY + triangleSize / 2 };
    const v2 = { x: centerX + triangleSize * Math.sqrt(3) / 2, y: centerY + triangleSize / 2 };
    const normalized = newWeights.map(w => w / 100);
    const x = normalized[0] * v0.x + normalized[1] * v1.x + normalized[2] * v2.x;
    const y = normalized[0] * v0.y + normalized[1] * v1.y + normalized[2] * v2.y;
    setPoint({ x, y });
  }, [size]);

  useEffect(() => {
    if (!weights) return;
    updatePointFromWeights(weights);
  }, [weights, updatePointFromWeights]);

  // Watch size changes
  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width: originalWidth, height: originalHeight } = entry.contentRect;
        const width = Math.round(originalWidth);
        const height = Math.round(originalHeight);
        setSize({ width, height, triangleSize: Math.min(width, height) * 0.4 });
      }
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Initialize point to center when size changes
  useEffect(() => {
    if (size) {
      const { width, height, triangleSize } = size;
      const centerX = width / 2;
      const centerY = height / 2;
      setPoint({ x: centerX, y: centerY - triangleSize });
    }
  }, [size]);

  useEffect(() => {
    if (!size) return;
    const { width, height, triangleSize } = size;

    const centerX = width / 2;
    const centerY = height / 2;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    ctx.clearRect(0, 0, width, height);
    svg.selectAll('*').remove();

    // background gradient
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, width, height);

    const parameters = popularityToggleValue === "popular" ? popularityParameters : noveltyParameters;
    const parameterColors = popularityToggleValue === "popular" ? popularityParameterColors : noveltyParameterColors;

    const vertices = [
      { x: centerX, y: centerY - triangleSize, color: d3.color(parameterColors[0]) },
      { x: centerX - triangleSize * Math.sqrt(3) / 2, y: centerY + triangleSize / 2, color: d3.color(parameterColors[1]) },
      { x: centerX + triangleSize * Math.sqrt(3) / 2, y: centerY + triangleSize / 2, color: d3.color(parameterColors[2]) }
    ];

    const centerVertex = { x: centerX, y: centerY, color: d3.color('rgb(255, 255, 255)') };
    const imageData = ctx.createImageData(width, height);

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const denom = (vertices[1].y - vertices[2].y) * (vertices[0].x - vertices[2].x) +
          (vertices[2].x - vertices[1].x) * (vertices[0].y - vertices[2].y);
        const w0 = ((vertices[1].y - vertices[2].y) * (x - vertices[2].x) +
          (vertices[2].x - vertices[1].x) * (y - vertices[2].y)) / denom;
        const w1 = ((vertices[2].y - vertices[0].y) * (x - vertices[2].x) +
          (vertices[0].x - vertices[2].x) * (y - vertices[2].y)) / denom;
        const w2 = 1 - w0 - w1;

        if (w0 >= 0 && w1 >= 0 && w2 >= 0) {
          const dx = x - centerX;
          const dy = y - centerY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const maxDistance = triangleSize;
          const centerInfluence = Math.max(0, 1 - distance / maxDistance);

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

    const [w0, w1, w2] = weights.map(w => w * 0.01);
    const dx = point.x - centerX;
    const dy = point.y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxDistance = triangleSize;
    const centerInfluence = Math.max(0, 1 - distance / maxDistance);

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
          const denom = (vertices[1].y - vertices[2].y) * (vertices[0].x - vertices[2].x) +
            (vertices[2].x - vertices[1].x) * (vertices[0].y - vertices[2].y);
          const w0 = ((vertices[1].y - vertices[2].y) * (x - vertices[2].x) +
            (vertices[2].x - vertices[1].x) * (y - vertices[2].y)) / denom;
          const w1 = ((vertices[2].y - vertices[0].y) * (x - vertices[2].x) +
            (vertices[0].x - vertices[2].x) * (y - vertices[2].y)) / denom;
          const w2 = 1 - w0 - w1;
          if (w0 < 0 || w1 < 0 || w2 < 0) {
            const weightsRaw = [w0, w1, w2].map(w => Math.max(0, w));
            const total = weightsRaw.reduce((a, b) => a + b, 0);
            const normalized = total > 0 ? weightsRaw.map(w => w / total) : [1 / 3, 1 / 3, 1 / 3];
            x = normalized[0] * vertices[0].x + normalized[1] * vertices[1].x + normalized[2] * vertices[2].x;
            y = normalized[0] * vertices[0].y + normalized[1] * vertices[1].y + normalized[2] * vertices[2].y;
          }
          setPoint({ x, y });
          updateWeightsFromPoint(x, y);
        })
      );

    parameters.forEach((param, i) => {
      const angle = (i / 3) * 2 * Math.PI - Math.PI / 2;
      let x = centerX + 1.2 * triangleSize * -Math.cos(angle);
      if (i === 1) x += 20;
      else if (i === 2) x -= 20;
      const y = centerY + 1.2 * triangleSize * Math.sin(angle);
      svg.append('text')
        .attr('x', x)
        .attr('y', y)
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('font-size', 12)
        .attr('fill', '#ffffff')
        .attr('font-family', "'Inter', sans-serif")
        .attr('cursor', 'default')
        .text(param);
    });

    svg.on('click', (event) => {
      if (!event.target.classList.contains('control-point')) {
        let [x, y] = d3.pointer(event);

        const denom = (vertices[1].y - vertices[2].y) * (vertices[0].x - vertices[2].x) +
          (vertices[2].x - vertices[1].x) * (vertices[0].y - vertices[2].y);
        const w0 = ((vertices[1].y - vertices[2].y) * (x - vertices[2].x) +
          (vertices[2].x - vertices[1].x) * (y - vertices[2].y)) / denom;
        const w1 = ((vertices[2].y - vertices[0].y) * (x - vertices[2].x) +
          (vertices[0].x - vertices[2].x) * (y - vertices[2].y)) / denom;
        const w2 = 1 - w0 - w1;
        if (w0 < 0 || w1 < 0 || w2 < 0) {
          return;
          // const weightsRaw = [w0, w1, w2].map(w => Math.max(0, w));
          // const total = weightsRaw.reduce((a, b) => a + b, 0);
          // const normalized = total > 0 ? weightsRaw.map(w => w / total) : [1 / 3, 1 / 3, 1 / 3];
          // x = normalized[0] * vertices[0].x + normalized[1] * vertices[1].x + normalized[2] * vertices[2].x;
          // y = normalized[0] * vertices[0].y + normalized[1] * vertices[1].y + normalized[2] * vertices[2].y;
        }
        setPoint({ x, y });
        updateWeightsFromPoint(x, y);
      }
    });
  }, [point, weights, size, updateWeightsFromPoint, popularityToggleValue]);

  return (
    <div ref={containerRef} className="triangle-control-container">
      {size && (
        <>
          <canvas ref={canvasRef} width={size.width} height={size.height} />
          <svg ref={svgRef}></svg>
        </>
      )}
    </div>
  );
};

export default TriangleControl;
