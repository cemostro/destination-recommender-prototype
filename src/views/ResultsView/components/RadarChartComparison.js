import React, { useEffect, useRef, useMemo, useState, useLayoutEffect } from 'react';
import * as d3 from 'd3';
import useTravelRecommenderStore from "../../../store/travelRecommenderStore";
import { COLORS } from '../../../data/constantData';
import '../../../styles/RadarChartComparison.css';

const LegendItem = ({ color, dashed, label }) => {
    return (
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 6, cursor: 'default' }}>
            <svg width="24" height="16" style={{ marginRight: 8 }}>
                <line
                    x1="0" y1="8" x2="24" y2="8"
                    stroke={color}
                    strokeWidth="3"
                    strokeDasharray={dashed ? "6,6" : "0"}
                />
            </svg>
            <span>{label}</span>
        </div>
    );
};

export const RadarChartComparison = ({ scores }) => {
    const canvasRef = useRef(null);
    const svgRef = useRef(null);
    const containerRef = useRef(null);
    const { userData } = useTravelRecommenderStore();

    const [dimensions, setDimensions] = useState({ width: 300, height: 300 });
    const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, text: "" });

    useLayoutEffect(() => {
        if (!containerRef.current) return;

        const observer = new ResizeObserver(entries => {
            for (let entry of entries) {
                const { width, height } = entry.contentRect;
                setDimensions({ width, height });
            }
        });

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    const { width, height } = dimensions;
    const radius = Math.min(width, height) * 0.32;
    const centerX = width / 2;
    const centerY = height / 2;

    const getUserData = (attrName) => {
        const key = attrName.charAt(0).toUpperCase() + attrName.slice(1);
        return userData.Attributes[key];
    };

    const attributes = useMemo(() => {
        return scores.filter((entry) => getUserData(entry.name).weight !== 0);
    }, [scores, userData.Attributes]);

    const attributeNames = useMemo(() => {
        return attributes.map(attr => attr.name.charAt(0).toUpperCase() + attr.name.slice(1));
    }, [attributes]);

    const userValues = useMemo(() => attributes.map(attr => getUserData(attr.name).score), [attributes, userData.Attributes]);
    const destValues = useMemo(() => attributes.map(attr => attr.value), [attributes]);
    const overlapValues = useMemo(() => attributes.map(attr => Math.min(getUserData(attr.name).score, attr.value)), [attributes, userData.Attributes]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const svg = d3.select(svgRef.current).attr('width', width).attr('height', height);

        ctx.clearRect(0, 0, width, height);
        svg.selectAll('*').remove();

        const calcPoints = (values) => attributeNames.map((_, i) => {
            const angle = (i / attributeNames.length) * 2 * Math.PI - Math.PI / 2;
            const r = (values[i] / 100) * radius;
            return {
                x: centerX + r * Math.cos(angle),
                y: centerY + r * Math.sin(angle),
                angle,
                color: d3.color(COLORS[i % COLORS.length])
            };
        });

        const userPoints = calcPoints(userValues);
        const destPoints = calcPoints(destValues);
        const overlapPoints = calcPoints(overlapValues);

        const drawPolygon = (points, color, dashed = false) => {
            ctx.beginPath();
            points.forEach((p, i) => ctx[i === 0 ? 'moveTo' : 'lineTo'](p.x, p.y));
            ctx.closePath();
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.setLineDash(dashed ? [5, 5] : []);
            ctx.stroke();
        };

        const fillPolygon = (points, fillStyle) => {
            ctx.beginPath();
            points.forEach((p, i) => ctx[i === 0 ? 'moveTo' : 'lineTo'](p.x, p.y));
            ctx.closePath();
            ctx.fillStyle = fillStyle;
            ctx.fill();
        };

        userPoints.map(p => {
            p.color = p.color.copy({ opacity: 0.3 });
            return p;
        }).forEach((p, i) => {
            const prev = userPoints[(i - 1 + userPoints.length) % userPoints.length];
            const next = userPoints[(i + 1) % userPoints.length];
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo((prev.x + p.x) / 2, (prev.y + p.y) / 2);
            ctx.lineTo(p.x, p.y);
            ctx.lineTo((p.x + next.x) / 2, (p.y + next.y) / 2);
            ctx.closePath();
            ctx.fillStyle = p.color.toString();
            ctx.fill();
        });

        fillPolygon(destPoints, d3.color('#808080').copy({ opacity: 0.25 }).toString());
        overlapPoints.forEach((p, i) => {
            const prev = overlapPoints[(i - 1 + overlapPoints.length) % overlapPoints.length];
            const next = overlapPoints[(i + 1) % overlapPoints.length];
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo((prev.x + p.x) / 2, (prev.y + p.y) / 2);
            ctx.lineTo(p.x, p.y);
            ctx.lineTo((p.x + next.x) / 2, (p.y + next.y) / 2);
            ctx.closePath();
            ctx.fillStyle = p.color.toString();
            ctx.fill();
        });


        drawPolygon(destPoints, '#808080');
        drawPolygon(userPoints, '#ffffff', true);

        [0.25, 0.5, 0.75, 1].forEach(scale => {
            svg.append('path')
                .attr('d', attributeNames.map((_, i) => {
                    const angle = (i / attributeNames.length) * 2 * Math.PI - Math.PI / 2;
                    const r = scale * radius;
                    const x = centerX + r * Math.cos(angle);
                    const y = centerY + r * Math.sin(angle);
                    return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
                }).join(' ') + ' Z')
                .attr('stroke', '#CCC')
                .attr('stroke-width', 1)
                .attr('fill', 'none');
        });

        attributeNames.forEach((name, i) => {
            const angle = (i / attributeNames.length) * 2 * Math.PI - Math.PI / 2;
            const x = centerX + 1.1 * radius * Math.cos(angle);
            const y = centerY + 1.1 * radius * Math.sin(angle);
            const epsilon = 0.01;
            const isMiddle = Math.abs(Math.abs(angle) - Math.PI / 2) < epsilon;
            const align = isMiddle ? 'middle' : (angle < -Math.PI / 2 || angle > Math.PI / 2 ? 'end' : 'start');

            svg.append('text')
                .attr('x', x)
                .attr('y', y)
                .attr('text-anchor', align)
                .attr('dy', '0.35em')
                .attr('fill', '#ffffff')
                .attr('font-size', Math.max(10, radius * 0.08))
                .attr('font-family', "'Inter', sans-serif")
                .text(name);
        });

        // Mouse hover tooltip logic
        const handleMouseMove = (event) => {
            const rect = canvasRef.current.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;

            let nearestAxis = null;
            let minDistance = Infinity;

            attributeNames.forEach((name, i) => {
                const angle = (i / attributeNames.length) * 2 * Math.PI - Math.PI / 2;
                const axisEndX = centerX + radius * Math.cos(angle);
                const axisEndY = centerY + radius * Math.sin(angle);

                const dx = axisEndX - centerX;
                const dy = axisEndY - centerY;
                const t = Math.max(0, Math.min(1, ((mouseX - centerX) * dx + (mouseY - centerY) * dy) / (dx*dx + dy*dy)));
                const projX = centerX + t * dx;
                const projY = centerY + t * dy;
                const dist = Math.hypot(mouseX - projX, mouseY - projY);

                if (dist < minDistance) {
                    minDistance = dist;
                    nearestAxis = { name, x: projX, y: projY, index: i };
                }
            });

            if (nearestAxis && minDistance < 20) {
                setTooltip({
                    visible: true,
                    x: event.clientX,
                    y: event.clientY,
                    text: `${nearestAxis.name}: Placeholder tooltip`
                });
            } else {
                setTooltip((t) => ({ ...t, visible: false }));
            }
        };

        const container = containerRef.current;
        container.addEventListener("mousemove", handleMouseMove);
        container.addEventListener("mouseleave", () => setTooltip(t => ({ ...t, visible: false })));

        return () => {
            container.removeEventListener("mousemove", handleMouseMove);
        };

    }, [userValues, destValues, attributeNames, dimensions]);

    return (
        <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'center', gap: 0 }}>
            <div className="radar-chart-comparison-container" ref={containerRef} style={{ flexShrink: 0 }}>
                <canvas ref={canvasRef} width={width} height={height} style={{ position: 'absolute' }} />
                <svg ref={svgRef} style={{ position: 'absolute' }}></svg>
            </div>

            <div style={{ color: '#fff', fontFamily: "'Inter', sans-serif", fontSize: Math.max(10, radius * 0.08), marginTop: 40 }}>
                <LegendItem color="#ffffff" dashed label="Your Preferences" />
                <LegendItem color="#808080" dashed={false} label="Destination Value" />
            </div>

            {tooltip.visible && (
                <div
                    style={{
                        position: "fixed",
                        left: tooltip.x + 10,
                        top: tooltip.y + 10,
                        background: "rgba(0,0,0,0.8)",
                        color: "#fff",
                        padding: "6px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        pointerEvents: "none",
                        zIndex: 1000
                    }}
                >
                    {tooltip.text}
                </div>
            )}
        </div>
    );
};
