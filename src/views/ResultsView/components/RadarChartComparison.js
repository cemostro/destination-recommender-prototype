import React, { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import useTravelRecommenderStore from "../../../store/travelRecommenderStore";
import { COLORS } from '../../../data/constantData';
import "../../../styles/RadarChartComparison.css";

export const RadarChartComparison = ({ scores }) => {

    const canvasRef = useRef(null);
    const svgRef = useRef(null);
    const width = 300;
    const height = 300;
    const radius = 100;
    const centerX = width / 2;
    const centerY = height / 2;

    const { userData } = useTravelRecommenderStore();
    const getUserData = (attrName) => {
        var key = attrName.charAt(0).toUpperCase() + attrName.slice(1);
        return userData.Attributes[key];
    };

    const attributes = useMemo(() => {
        return scores.filter((entry) => getUserData(entry.name).weight !== 0);
    }, [scores, userData.Attributes]);

    const attributeNames = useMemo(() => {
        return attributes.map(attr => attr.name);
    }, [attributes]);

    const destValues = useMemo(() => {
        return attributes.map(attr => attr.value);
    }, [attributes]);

    const userValues = useMemo(() => {
        return attributes.map(attr => getUserData(attr.name).score);
    }, [attributes, userData.Attributes]);

    const overlapValues = useMemo(() => {
        return attributes.map(attr => {
            const userScore = getUserData(attr.name).score;
            const destScore = attr.value;
            return Math.min(userScore, destScore);
        });
    }, [attributes, userData.Attributes]);


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
        // ctx.fillStyle = '#f0f0f0';
        // ctx.fillRect(0, 0, width, height);

        // Calculate points for user and destination
        const userPoints = attributeNames.map((_, i) => {
            const angle = (i / attributeNames.length) * 2 * Math.PI - Math.PI / 2;
            const r = (userValues[i] / 100) * radius;
            return {
                x: centerX + r * Math.cos(angle),
                y: centerY + r * Math.sin(angle),
                color: d3.color(COLORS[i % COLORS.length]).copy({ opacity: 0.01 }),
                value: userValues[i],
                angle
            };
        });

        const destPoints = attributeNames.map((_, i) => {
            const angle = (i / attributeNames.length) * 2 * Math.PI - Math.PI / 2;
            const r = (destValues[i] / 100) * radius;
            return {
                x: centerX + r * Math.cos(angle),
                y: centerY + r * Math.sin(angle),
                color: d3.color('#808080'),
                value: destValues[i],
                angle
            };
        });

        const overlapPoints = attributeNames.map((_, i) => {
            const angle = (i / attributeNames.length) * 2 * Math.PI - Math.PI / 2;
            const r = (overlapValues[i] / 100) * radius;
            return {
                x: centerX + r * Math.cos(angle),
                y: centerY + r * Math.sin(angle),
                color: d3.color(COLORS[i % COLORS.length]),
                value: overlapValues[i],
                angle
            };
        });

        // Draw destination polygon (gray base)
        ctx.beginPath();
        destPoints.forEach((point, i) => {
            ctx[i === 0 ? 'moveTo' : 'lineTo'](point.x, point.y);
        });
        ctx.closePath();
        // 808080 with 25% opacity
        ctx.fillStyle = d3.color('#808080').copy({ opacity: 0.25 }).toString();
        ctx.fill();

        // Draw user polygon with 25% opacity colors
        attributeNames.forEach((_, i) => {
            const userPoint = userPoints[i];
            const prevUserPoint = userPoints[i === 0 ? userPoints.length - 1 : i - 1];
            const nextUserPoint = userPoints[i === userPoints.length - 1 ? 0 : i + 1];
            const destPoint = destPoints[i];
            const prevDestPoint = destPoints[i === 0 ? destPoints.length - 1 : i - 1];
            const nextDestPoint = destPoints[i === destPoints.length - 1 ? 0 : i + 1];
            const overlapPoint = overlapPoints[i];
            const prevOverlapPoint = overlapPoints[i === 0 ? overlapPoints.length - 1 : i - 1];
            const nextOverlapPoint = overlapPoints[i === overlapPoints.length - 1 ? 0 : i + 1];

            const halfwayUserPrev = {
                x: (prevUserPoint.x + userPoint.x) / 2,
                y: (prevUserPoint.y + userPoint.y) / 2,
                color: d3.interpolateRgb(prevUserPoint.color, userPoint.color)(0.5)
            };
            const halfwayUserNext = {
                x: (userPoint.x + nextUserPoint.x) / 2,
                y: (userPoint.y + nextUserPoint.y) / 2,
                color: d3.interpolateRgb(userPoint.color, nextUserPoint.color)(0.5)
            };

            const quadPoints = [
                { x: centerX, y: centerY, color: d3.color('rgba(255, 255, 255, 1)') }, // Center
                halfwayUserPrev, // Halfway to prev
                { x: userPoint.x, y: userPoint.y, color: userPoint.color }, // Vertex
                halfwayUserNext // Halfway to next
            ];

            // Draw quadrilateral
            ctx.beginPath();
            ctx.moveTo(quadPoints[0].x, quadPoints[0].y);
            quadPoints.forEach((p, j) => {
                if (j > 0) ctx.lineTo(p.x, p.y);
            });
            ctx.closePath();

            // Gradient from center to maximum axis position
            const maxVertexX = centerX + radius * Math.cos(userPoint.angle);
            const maxVertexY = centerY + radius * Math.sin(userPoint.angle);
            const gradient = ctx.createLinearGradient(
                quadPoints[0].x, quadPoints[0].y, // Center
                maxVertexX, maxVertexY // Maximum axis position (radius 200)
            );
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            gradient.addColorStop(1, userPoint.color.toString());

            ctx.fillStyle = gradient;
            ctx.fill();

            // Draw overlap gradient - should be solid fill, no white gradient in middle
            const halfwayOverlapPrev = {
                x: (prevOverlapPoint.x + overlapPoint.x) / 2,
                y: (prevOverlapPoint.y + overlapPoint.y) / 2,
                color: d3.interpolateRgb(prevOverlapPoint.color, overlapPoint.color)(0.5)
            };
            const halfwayOverlapNext = {
                x: (overlapPoint.x + nextOverlapPoint.x) / 2,
                y: (overlapPoint.y + nextOverlapPoint.y) / 2,
                color: d3.interpolateRgb(overlapPoint.color, nextOverlapPoint.color)(0.5)
            };
            const overlapQuadPoints = [
                { x: centerX, y: centerY }, // Center
                halfwayOverlapPrev, // Halfway to prev
                { x: overlapPoint.x, y: overlapPoint.y}, // Vertex
                halfwayOverlapNext // Halfway to next
            ];
            ctx.beginPath();
            ctx.moveTo(overlapQuadPoints[0].x, overlapQuadPoints[0].y);
            overlapQuadPoints.forEach((p, j) => {
                if (j > 0) ctx.lineTo(p.x, p.y);
            }
            );
            ctx.closePath();
            ctx.fillStyle = overlapPoint.color.toString();
            ctx.fill();
            
        });

        // Draw borders
        // Destination polygon border (solid gray)
        ctx.beginPath();
        destPoints.forEach((point, i) => {
            ctx[i === 0 ? 'moveTo' : 'lineTo'](point.x, point.y);
        });
        ctx.closePath();
        ctx.strokeStyle = '#808080';
        ctx.lineWidth = 2;
        ctx.setLineDash([]); // Solid line
        ctx.stroke();

        // User polygon border (dashed, colored)
        ctx.beginPath();
        userPoints.forEach((point, i) => {
            ctx[i === 0 ? 'moveTo' : 'lineTo'](point.x, point.y);
        });
        ctx.closePath();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]); // Dashed line
        ctx.stroke();


        // SVG elements (grid, axes, labels)
        svg.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', width)
            .attr('height', height)
            .attr('fill', 'none');

        [0.2, 0.4, 0.6, 0.8, 1].forEach((scale) => {
            svg.append('path')
                .attr('d', () => {
                    const points = attributeNames.map((_, i) => {
                        const angle = (i / attributeNames.length) * 2 * Math.PI - Math.PI / 2;
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

        attributeNames.forEach((_, i) => {
            const angle = (i / attributeNames.length) * 2 * Math.PI - Math.PI / 2;
            const x = centerX + 1.25 * radius * Math.cos(angle);
            const y = centerY + 1.1 * radius * Math.sin(angle);
            svg.append('text')
                .attr('x', x)
                .attr('y', y)
                .attr('text-anchor', 'middle')
                .attr('dy', '0.35em')
                .attr('fill', '#333333')
                .attr('font-size', 14)
                .attr('font-family', 'Inter', 'sans-serif')
                .text(attributeNames[i]);
        });

    }, [userValues, destValues, attributeNames]);

    return (
        <div className="radar-chart-comparison-container">
            <canvas ref={canvasRef} width={300} height={300} style={{ position: 'absolute' }} />
            <svg ref={svgRef} style={{ position: 'absolute' }}></svg>
        </div>
    );
}
