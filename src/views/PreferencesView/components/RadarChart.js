import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import "../../../styles/RadarChart.css";
import useTravelRecommenderStore from "../../../store/travelRecommenderStore";
import { COLORS } from '../../../data/constantData';
import { debounce } from "lodash";

const RadarChart = () => {
    const { userData, setUserData } = useTravelRecommenderStore();

    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const svgRef = useRef(null);

    const [dimensions, setDimensions] = useState({ width: 600, height: 500 });

    // Track container resize
    useEffect(() => {
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                const { width, height } = entry.contentRect;
                setDimensions({ width, height });
            }
        });

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    const width = dimensions.width;
    const height = dimensions.height;
    const radius = Math.min(width, height) * 0.38;
    const centerX = width / 2;
    const centerY = height / 2;

    const [attributeValues, setAttributeValues] = useState(
        () => Object.fromEntries(
            Object.entries(userData.Attributes).map(([key, { score }]) => [key, score])
        )
    );

    const includedAttributes = useMemo(() => {
        return Object.keys(userData.Attributes).filter(
            attr => userData.Attributes[attr].weight > 0
        );
    }, [userData.Attributes]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const updateUserData = useCallback(
        debounce((newAttributes) => {
            setUserData({ ...userData, Attributes: newAttributes });
        }, 500),
        [setUserData]
    );

    const handleIncludedAttributesChange = useCallback((newAttributes) => {
        const updatedAttributes = Object.fromEntries(
            Object.entries(userData.Attributes).map(([attr, data]) => [
                attr,
                {
                    ...data,
                    weight: newAttributes.includes(attr) ? 1 : 0
                }
            ])
        );
        updateUserData(updatedAttributes);
    }, [userData, updateUserData]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const svg = d3.select(svgRef.current);

        // Set actual resolution
        canvas.width = width;
        canvas.height = height;
        svg.attr('width', width).attr('height', height);

        ctx.clearRect(0, 0, width, height);
        svg.selectAll('*').remove();

        const attributes = Object.keys(attributeValues).filter(attr => includedAttributes.includes(attr));
        const values = attributes.map(attr => attributeValues[attr]);

        const points = attributes.map((_, i) => {
            const angle = (i / attributes.length) * 2 * Math.PI - Math.PI / 2;
            const r = (values[i] / 100) * radius;
            return {
                x: centerX + r * Math.cos(angle),
                y: centerY + r * Math.sin(angle),
                color: d3.color(COLORS[i % COLORS.length]),
                value: values[i],
                angle
            };
        });

        attributes.forEach((_, i) => {
            const current = points[i];
            const prev = points[i === 0 ? points.length - 1 : i - 1];
            const next = points[i === points.length - 1 ? 0 : i + 1];

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
                { x: centerX, y: centerY, color: d3.color('rgba(255, 255, 255, 1)') },
                halfwayPrev,
                { x: current.x, y: current.y, color: current.color },
                halfwayNext
            ];

            ctx.beginPath();
            ctx.moveTo(quadPoints[0].x, quadPoints[0].y);
            quadPoints.forEach((p, j) => {
                if (j > 0) ctx.lineTo(p.x, p.y);
            });
            ctx.closePath();

            const maxVertexX = centerX + radius * Math.cos(current.angle);
            const maxVertexY = centerY + radius * Math.sin(current.angle);
            const gradient = ctx.createLinearGradient(
                quadPoints[0].x, quadPoints[0].y,
                maxVertexX, maxVertexY
            );
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            gradient.addColorStop(1, current.color.toString());

            ctx.fillStyle = gradient;
            ctx.fill();
        });

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

        svg.selectAll('.vertex')
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
                    const dx = event.x - centerX;
                    const dy = event.y - centerY;
                    const cosTheta = Math.cos(d.angle);
                    const sinTheta = Math.sin(d.angle);
                    const projection = dx * cosTheta + dy * sinTheta;
                    const r = Math.max(0, Math.min(radius, projection));
                    const newValue = Math.round((r / radius) * 100);
                    const attributeIndex = attributes.indexOf(attributes[points.indexOf(d)]);
                    const attributeName = attributes[attributeIndex];
                    setAttributeValues(prev => ({
                        ...prev,
                        [attributeName]: newValue
                    }));
                    updateUserData({ ...userData.Attributes, [attributeName]: { ...userData.Attributes[attributeName], score: newValue } });
                })
            );

        attributes.forEach((attr, i) => {
            const angle = (i / attributes.length) * 2 * Math.PI - Math.PI / 2;
            console.log(`Attribute: ${attr}, Angle: ${angle}`);
            const x = centerX + 1.1 * radius * Math.cos(angle);
            const y = centerY + 1.1 * radius * Math.sin(angle);
            const isMiddle = Math.abs(Math.abs(angle) - Math.PI / 2) < 0.1;
            const textAlign = isMiddle ? 'middle' : (angle < -Math.PI / 2 || angle > Math.PI / 2 ? 'end' : 'start');
            console.log("attribute:", attr, "x:", x, "y:", y, "textAlign:", textAlign);
            svg.append('text')
                .attr('x', x)
                .attr('y', y)
                .attr('text-anchor', textAlign)
                .attr('dy', '0.35em')
                .attr('fill', '#ffffff')
                .attr('font-size', Math.max(12, radius * 0.08))
                .attr('font-family', "'Inter', sans-serif")
                .attr('cursor', 'pointer')
                .text(attr)
                .on('dblclick', () => {
                    if (includedAttributes.length > 3) {
                        handleIncludedAttributesChange(includedAttributes.filter(a => a !== attr));
                    }
                });
        });

        svg.on('click', (event) => {
            const target = event.target;
            if (!target.classList.contains('vertex') && target.tagName !== 'text') {
                const [x, y] = d3.pointer(event);
                const distanceFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
                if (distanceFromCenter <= radius) {
                    const radiusClicked = distanceFromCenter;
                    const maxRadius = radius;
                    const angle = Math.atan2(y - centerY, x - centerX) + Math.PI / 2 + Math.PI / attributes.length;
                    const normalizedAngle = angle < 0 ? angle + 2 * Math.PI : angle;
                    const index = Math.floor((normalizedAngle / (2 * Math.PI)) * attributes.length) % attributes.length;
                    const value = Math.min(Math.max((radiusClicked / maxRadius) * 100, 0), 100);
                    const attributeName = attributes[index];
                    setAttributeValues(prev => ({
                        ...prev,
                        [attributeName]: Math.round(value)
                    }));
                    updateUserData({ ...userData.Attributes, [attributeName]: { ...userData.Attributes[attributeName], score: Math.round(value) } });
                }
            }
        });
    }, [attributeValues, userData, includedAttributes, updateUserData, width, height]);

    return (
        <div ref={containerRef} className="radar-chart-container">
            <canvas ref={canvasRef} />
            <svg ref={svgRef}></svg>
        </div>
    );
};

export default RadarChart;
