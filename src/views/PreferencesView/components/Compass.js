import React, { useRef, useState, useEffect } from "react";
import "../../../styles/Compass.css";


const Compass = ({ position, setPosition }) => {
    const svgRef = useRef(null);
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
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        const newPos = computePosition(e.clientX, e.clientY);
        setPosition(newPos);
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
                {/* Circle background */}
                <circle cx="50%" cy="50%" r="50%" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1" />

                <path d="M128,128 L128,0 A128,128 0 0,1 256,128 Z" fill="orange" opacity="0.08" />
                <path d="M128,128 L256,128 A128,128 0 0,1 128,256 Z" fill="red" opacity="0.08" />
                <path d="M128,128 L128,256 A128,128 0 0,1 0,128 Z" fill="blue" opacity="0.08" />
                <path d="M128,128 L0,128 A128,128 0 0,1 128,0 Z" fill="green" opacity="0.08" />

                {/* Compass rose ticks */}
                {[...Array(16)].map((_, i) => {
                    const angle = (i * Math.PI) / 8; // 16 directions
                    const x1 = 50 + Math.cos(angle) * 45;
                    const y1 = 50 + Math.sin(angle) * 45;
                    const x2 = 50 + Math.cos(angle) * 50;
                    const y2 = 50 + Math.sin(angle) * 50;
                    return (
                        <line
                            key={i}
                            x1={`${x1}%`}
                            y1={`${y1}%`}
                            x2={`${x2}%`}
                            y2={`${y2}%`}
                            stroke="#666"
                            strokeWidth={i % 4 === 0 ? 2 : 1} // Thicker for cardinal
                        />
                    );
                })}

                {/* Direction labels (N, E, S, W) */}
                <text x="50%" y="10%" textAnchor="middle" fontSize="10" fill="#444" className="direction-label">N</text>
                <text x="90%" y="52%" textAnchor="middle" fontSize="10" fill="#444" className="direction-label">E</text>
                <text x="50%" y="93%" textAnchor="middle" fontSize="10" fill="#444" className="direction-label">S</text>
                <text x="10%" y="52%" textAnchor="middle" fontSize="10" fill="#444" className="direction-label">W</text>

                {/* Stylized needle */}
                <polygon
                    points={(() => {
                        const cx = 128;
                        const cy = 128;
                        const dx = position.x * 128; // controls needle length
                        const dy = -position.y * 128; // invert Y for screen space

                        const tipX = cx + dx;
                        const tipY = cy + dy;

                        const baseOffset = 4; // width of needle base
                        const perpX = -dy;
                        const perpY = dx;
                        const mag = Math.sqrt(perpX * perpX + perpY * perpY);
                        const normX = (perpX / mag) * baseOffset;
                        const normY = (perpY / mag) * baseOffset;

                        const base1X = cx + normX;
                        const base1Y = cy + normY;
                        const base2X = cx - normX;
                        const base2Y = cy - normY;

                        return `${tipX},${tipY} ${base1X},${base1Y} ${base2X},${base2Y}`;
                    })()}
                />
            </svg>
            <div className="label top">
                🧗 Adventurous
                <div className="sublabel">Hiking, challenge</div>
            </div>

            <div className="label bottom">
                🏖️ Relaxing
                <div className="sublabel">Beach, slow travel</div>
            </div>

            <div className="label left">
                🔍 Hidden Gems
                <div className="sublabel">Off-the-map spots</div>
            </div>

            <div className="label right">
                🏙️ Popular
                <div className="sublabel">Famous places</div>
            </div>
        </div>
    );
};

export default Compass;