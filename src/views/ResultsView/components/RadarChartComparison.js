import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import useTravelRecommenderStore from "../../../store/travelRecommenderStore";
import { COLORS } from '../../../data/constantData';

export const RadarChartComparison = ({ scores }) => {

    const svgRef = useRef(null);
    const width = 300;
    const height = 300;
    const radius = 120;
    const centerX = width / 2;
    const centerY = height / 2;

    const { userData } = useTravelRecommenderStore();
    const getUserData = (attrName) => {
        var key = attrName.charAt(0).toUpperCase() + attrName.slice(1);
        return userData.Attributes[key];
    };
    const attributes = scores.filter((entry) => getUserData(entry.name).weight !== 0)
    const attributeNames = attributes.map(attr => attr.name);

    const destValues = attributes.map(attr => attr.value);
    const userValues = attributes.map(attr => getUserData(attr.name).score);


    useEffect(() => {
        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', `0 0 ${width} ${height}`)
            .attr('preserveAspectRatio', 'xMidYMid meet');

        const angles = d3.range(0, 2 * Math.PI, 2 * Math.PI / scores.filter((entry) => getUserData(entry.name).weight !== 0).length);

        // Clear previous content
        svg.selectAll('*').remove();

        // Background
        svg.append('rect')
            .attr('width', width)
            .attr('height', height)
            .attr('fill', '#f0f0f0');

        // Draw axes
        svg.selectAll('.axis')
            .data(angles)
            .enter()
            .append('line')
            .attr('class', 'axis')
            .attr('x1', centerX)
            .attr('y1', centerY)
            .attr('x2', (d) => centerX + radius * Math.cos(d))
            .attr('y2', (d) => centerY + radius * Math.sin(d))
            .attr('stroke', '#ccc')
            .attr('stroke-width', 1);

        // Draw concentric circles
        const levels = 5;
        for (let i = 1; i <= levels; i++) {
            svg.append('circle')
                .attr('cx', centerX)
                .attr('cy', centerY)
                .attr('r', (radius / levels) * i)
                .attr('fill', 'none')
                .attr('stroke', '#ccc')
                .attr('stroke-width', 0.5);
        }

        // Prepare data
        const attributes = scores.filter((entry) => getUserData(entry.name).weight !== 0)
        const attributeNames = attributes.map(attr => attr.name);

        const destValues = attributes.map(attr => attr.value);
        const userValues = attributes.map(attr => getUserData(attr.name).score);

        // Function to compute coordinates
        const getCoordinates = (values) =>
            values.map((value, i) => ({
                x: centerX + (value / 100) * radius * Math.cos(angles[i] - Math.PI / 2),
                y: centerY + (value / 100) * radius * Math.sin(angles[i] - Math.PI / 2),
            }));

        const userCoords = getCoordinates(userValues);
        const destCoords = getCoordinates(destValues);

        // User data polygon (25% opacity)
        svg.append('path')
            .datum(userCoords)
            .attr('fill', 'none') // Filled later with pattern for overlap
            .attr('stroke', 'black')
            .attr('stroke-width', 1)
            .attr('d', d3.line()
                .x(d => d.x)
                .y(d => d.y)
                .curve(d3.curveLinearClosed)(userCoords));

        // Destination data polygon (gray)
        svg.append('path')
            .datum(destCoords)
            .attr('fill', '#808080')
            .attr('fill-opacity', 0.3)
            .attr('stroke', '#666')
            .attr('stroke-width', 1)
            .attr('d', d3.line()
                .x(d => d.x)
                .y(d => d.y)
                .curve(d3.curveLinearClosed)(destCoords));

        // Create pattern for overlap (using user colors at 100% opacity)
        svg.selectAll('.overlap-pattern')
            .data(attributeNames)
            .enter()
            .append('pattern')
            .attr('id', d => `pattern-${d}`)
            .attr('patternUnits', 'userSpaceOnUse')
            .attr('width', width)
            .attr('height', height)
            .append('rect')
            .attr('width', width)
            .attr('height', height)
        // .attr('fill', d => topics[d]);

        // Compute overlap coordinates
        const overlapCoords = userCoords.map((userPoint, i) => {
            const destPoint = destCoords[i];
            const minX = Math.max(userPoint.x, destPoint.x);
            const maxX = Math.min(userPoint.x, destPoint.x);
            const minY = Math.max(userPoint.y, destPoint.y);
            const maxY = Math.min(userPoint.y, destPoint.y);
            return {
                x: (minX + maxX) / 2,
                y: (minY + maxY) / 2,
            };
        });

        // Overlap polygon (using pattern for topic colors at 100% opacity)
        svg.append('path')
            .datum(overlapCoords)
            .attr('fill', 'url(#pattern-Culture)') // Default to first topic, will be masked
            .attr('opacity', 1)
            .attr('stroke', 'none')
            .attr('d', d3.line()
                .x(d => d.x)
                .y(d => d.y)
                .curve(d3.curveLinearClosed)(overlapCoords));

        // Mask overlap with correct topic colors based on max overlap
        const maxOverlapIndices = userCoords.map((userPoint, i) => {
            const userVal = userValues[i];
            const destVal = destValues[i];
            return userVal >= destVal ? i : -1; // Index of topic with max value at each point
        });

        // Apply mask or adjust fill dynamically (simplified approach)
        svg.selectAll('.overlap-path')
            .data([overlapCoords])
            .enter()
            .append('path')
            .attr('class', 'overlap-path')
            .attr('d', d3.line()
                .x(d => d.x)
                .y(d => d.y)
                .curve(d3.curveLinearClosed))
            .attr('fill', () => {
                const dominantTopic = attributeNames[maxOverlapIndices.findIndex(i => i !== -1)];
                return `url(#pattern-${dominantTopic})`;
            })
            .attr('opacity', 1)
            .attr('stroke', 'none');

        // Labels
        svg.selectAll('.label')
            .data(attributeNames)
            .enter()
            .append('text')
            .attr('class', 'label')
            .attr('x', (d, i) => centerX + 1.1 * radius * Math.cos(angles[i] - Math.PI / 2))
            .attr('y', (d, i) => centerY + 1.1 * radius * Math.sin(angles[i] - Math.PI / 2))
            .attr('text-anchor', 'middle')
            .attr('dy', '0.35em')
            .attr('fill', '#333')
            .text(d => d);

    }, [userData, scores]);

    return (
        <svg ref={svgRef}></svg>
    );
}
