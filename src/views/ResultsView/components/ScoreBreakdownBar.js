import React from "react";
import '../../../styles/ScoreBreakdownBar.css';

export const ScoreBreakdownBar = ({ scores }) => {
    // Normalize weights for width percentages
    const weights = { ...scores.weights }
    console.log("ScoreBreakdownBar weights:", weights);
    const useFiltered = weights.dissimilarity === 0;
    const usePopularity = weights.novelty === 0;
    const individualScores = { ...scores.individualScores };

    const segments = [
        {
            label: useFiltered ? "Personalized" : "Dissimilarity",
            color: "#3498db",
            widthPercent: (useFiltered ? weights.filtered : weights.dissimilarity) * 100,
            score: useFiltered ? individualScores.preference : individualScores.dissimilarity,
        },
        {
            label: usePopularity ? "Popularity" : "Novelty",
            color: "#e67e22",
            widthPercent: (usePopularity ? weights.popularity : weights.novelty) * 100,
            score: usePopularity ? individualScores.popularity : individualScores.novelty,
        },
        // {
        //   label: "Diversity (ILD)",
        //   color: "#2ecc71",
        //   widthPercent: (weights.diversity / totalWeight) * 100,
        //   score: individualScores.diversity,
        // },
    ];

    return (
        <div className="score-bar-container">
            <div className="score-bar">
                {segments.filter((seg) => seg.widthPercent > 0)
                    .map((seg, idx) => (
                        <div
                            key={idx}
                            className="score-bar-segment"
                            style={{
                                width: `${seg.widthPercent}%`,
                                backgroundColor: seg.color,
                            }}
                        >
                            <span className="segment-label">
                                {seg.label}: {seg.score.toFixed(2)}
                            </span>
                        </div>
                    ))}
            </div>
        </div>
    );
};

