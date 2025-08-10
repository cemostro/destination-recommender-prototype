import React from "react";
import '../../../styles/ScoreBreakdownBar.css';
import useTravelRecommenderStore from "../../../store/travelRecommenderStore";
import { popularityParameters, noveltyParameters, popularityParameterColors, noveltyParameterColors } from '../../../data/constantData';

export const ScoreBreakdownBar = ({ scores }) => {
    const popularityToggleValue = useTravelRecommenderStore((state) => state.userData.PopularityToggle);

    const weights = { ...scores.weights }
    const usePopularity = popularityToggleValue === "popular";
    const parameters = usePopularity ? popularityParameters : noveltyParameters;
    const parameterColors = usePopularity ? popularityParameterColors : noveltyParameterColors;
    const individualScores = { ...scores.individualScores };

    const segments = [
        {
            label: parameters[0],
            color: parameterColors[0],
            widthPercent: weights.personalization * 100,
            score: individualScores.personalization,
        },
        {
            label: parameters[1],
            color: parameterColors[1],
            widthPercent: weights.popularity * 100,
            score: individualScores.popularity,
        },
        {
            label: parameters[2],
            color: parameterColors[2],
            widthPercent: weights.ild * 100,
            score: individualScores.ild,
        },
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

