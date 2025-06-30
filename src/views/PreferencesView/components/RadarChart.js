import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import "../../../styles/RadarChart.css";
import useTravelRecommenderStore from "../../../store/travelRecommenderStore";
import { COLORS } from '../../../data/constantData';

const RadarChart = () => {
    const { userData, setUserData } = useTravelRecommenderStore();

    const canvasRef = useRef(null);
    const svgRef = useRef(null);
    const width = 500;
    const height = 500;
    const radius = 190;
    const centerX = width / 2;
    const centerY = height / 2;

    const onChange = (attrName, value) => {
        setUserData({
            ...userData,
            Attributes: {
                ...userData.Attributes,
                [attrName]: {
                    ...userData.Attributes[attrName],
                    score: value,
                },
            },
        });
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height);

        // Clear previous content
        ctx.clearRect(0, 0, width, height);
        svg.selectAll('*').remove();

        // Background
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, width, height);

        const attributes = Object.keys(userData.Attributes);
        const values = attributes.map(attr => userData.Attributes[attr].score);

        // Calculate vertex points
        const points = attributes.map((_, i) => {
            const angle = (i / attributes.length) * 2 * Math.PI - Math.PI / 2;
            const r = (values[i] / 100) * radius;
            return {
                x: centerX + r * Math.cos(angle),
                y: centerY + r * Math.sin(angle),
                color: d3.color(COLORS[i % COLORS.length]), // Use color from COLORS array
                value: values[i],
                angle // Store angle for drag constraint
            };
        });

        // Render quadrilaterals for each attribute
        attributes.forEach((_, i) => {
            const current = points[i];
            const prev = points[i === 0 ? points.length - 1 : i - 1];
            const next = points[i === points.length - 1 ? 0 : i + 1];

            // Calculate halfway points by interpolating x and y
            const halfwayPrev = {
                x: (prev.x + current.x) / 2,
                y: (prev.y + current.y) / 2,
                color: d3.interpolateRgb(prev.color, current.color)(0.5)
            };
            const halfwayNext = {
                x: (current.x + next.x) / 2,
                y: (current.y + next.y) / 2,
                color: d3.interpolateRgb(current.color, next.color)(0.5)
            };

            const quadPoints = [
                { x: centerX, y: centerY, color: d3.color('rgba(255, 255, 255, 1)') }, // Center
                halfwayPrev, // Halfway to prev
                { x: current.x, y: current.y, color: current.color }, // Vertex
                halfwayNext // Halfway to next
            ];

            // Draw quadrilateral
            ctx.beginPath();
            ctx.moveTo(quadPoints[0].x, quadPoints[0].y);
            quadPoints.forEach((p, j) => {
                if (j > 0) ctx.lineTo(p.x, p.y);
            });
            ctx.closePath();

            // Gradient from center to maximum axis position
            const maxVertexX = centerX + radius * Math.cos(current.angle);
            const maxVertexY = centerY + radius * Math.sin(current.angle);
            const gradient = ctx.createLinearGradient(
                quadPoints[0].x, quadPoints[0].y, // Center
                maxVertexX, maxVertexY // Maximum axis position (radius 200)
            );
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            gradient.addColorStop(1, current.color.toString());

            ctx.fillStyle = gradient;
            ctx.fill();
        });

        // SVG elements (axes, vertices, labels)
        svg.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', width)
            .attr('height', height)
            .attr('fill', 'none');

        // Grid lines
        [0.2, 0.4, 0.6, 0.8, 1].forEach((scale) => {
            svg.append('path')
                .attr('d', () => {
                    const points = attributes.map((_, i) => {
                        const angle = (i / attributes.length) * 2 * Math.PI - Math.PI / 2;
                        const r = scale * radius;
                        const x = centerX + r * Math.cos(angle);
                        const y = centerY + r * Math.sin(angle);
                        return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
                    });
                    return points.join(' ') + ' Z';
                })
                .attr('stroke', '#CCCCCC')
                .attr('stroke-width', 1)
                .attr('fill', 'none');
        });

        // Axes
        attributes.forEach((_, i) => {
            const angle = (i / attributes.length) * 2 * Math.PI - Math.PI / 2;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            svg.append('line')
                .attr('x1', centerX)
                .attr('y1', centerY)
                .attr('x2', x)
                .attr('y2', y)
                .attr('stroke', '#666666')
                .attr('stroke-width', 1);
        });

        // Vertices with drag behavior
        const vertices = svg.selectAll('.vertex')
            .data(points)
            .enter()
            .append('circle')
            .attr('class', 'vertex')
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('r', 5)
            .attr('fill', '#00A0FF')
            .attr('stroke', '#fff')
            .attr('stroke-width', 1)
            .call(d3.drag()
                .on('drag', function (event, d) {
                    // Project drag position onto the axis
                    const dx = event.x - centerX;
                    const dy = event.y - centerY;
                    // Calculate projection onto axis (cosine similarity)
                    const cosTheta = Math.cos(d.angle);
                    const sinTheta = Math.sin(d.angle);
                    const projection = dx * cosTheta + dy * sinTheta; // Scalar projection
                    // Convert projection to radius (0 to 200)
                    const r = Math.max(0, Math.min(radius, projection));
                    // Map radius to value (0 to 100)
                    const newValue = Math.round((r / radius) * 100);
                    // Update values state
                    const attributeIndex = attributes.indexOf(attributes[points.indexOf(d)]);
                    const attributeName = attributes[attributeIndex];
                    onChange(attributeName, newValue);
                })
            );

        // Labels
        attributes.forEach((attr, i) => {
            const angle = (i / attributes.length) * 2 * Math.PI - Math.PI / 2;
            const x = centerX + 1.2 * radius * Math.cos(angle) + 20;
            const y = centerY + 1.1 * radius * Math.sin(angle);
            svg.append('text')
                .attr('x', x)
                .attr('y', y)
                .attr('text-anchor', 'end')
                .attr('dy', '0.35em')
                .attr('fill', '#333333')
                .attr('font-size', 14)
                .attr('font-family', "'Inter', sans-serif")
                .text(attr);
        });

        // Click handler (for clicking canvas, not vertices)
        svg.on('click', (event) => {
            // Only trigger if not clicking a vertex
            if (!event.target.classList.contains('vertex')) {
                const [x, y] = d3.pointer(event);
                const radiusClicked = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
                const maxRadius = radius;
                const angle = Math.atan2(y - centerY, x - centerX) + Math.PI / 2 + Math.PI / attributes.length;
                const normalizedAngle = angle < 0 ? angle + 2 * Math.PI : angle;
                const index = Math.floor((normalizedAngle / (2 * Math.PI)) * attributes.length) % attributes.length;
                const value = Math.min(Math.max((radiusClicked / maxRadius) * 100, 0), 100);

                const attributeName = attributes[index];
                onChange(attributeName, value);
            }
        });
    }, [userData]);

    return (
        <div className="radar-chart-container">
            <canvas ref={canvasRef} width={500} height={500} style={{ position: 'absolute' }} />
            <svg ref={svgRef} style={{ position: 'absolute' }}></svg>
        </div>
    );

};

export default RadarChart;