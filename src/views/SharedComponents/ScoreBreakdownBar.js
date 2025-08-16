import React from "react";
import '../../styles/ScoreBreakdownBar.css';
import useTravelRecommenderStore from "../../store/travelRecommenderStore";
import { popularityParameters, noveltyParameters, popularityParameterColors, noveltyParameterColors } from '../../data/constantData';

const abbreviations = {
    'Personalized': 'Pers',
    'Popular Spots': 'Pop',
    'Less Popular Spots': 'LP',
    'List Diversity': 'Div',
};

export const ScoreBreakdownBar = ({ scores, displayLegend }) => {
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
            weight: weights.personalization,
            score: individualScores.personalization,
            widthPercent: weights.personalization * individualScores.personalization,
        },
        {
            label: parameters[1],
            color: parameterColors[1],
            weight: weights.popularity,
            score: individualScores.popularity,
            widthPercent: weights.popularity * individualScores.popularity,
        },
        {
            label: parameters[2],
            color: parameterColors[2],
            weight: weights.ild,
            score: individualScores.ild,
            widthPercent: weights.ild * individualScores.ild,
        },
    ];

    const remainingWidth = 100 - segments.reduce((sum, seg) => sum + seg.widthPercent, 0);
    if (remainingWidth > 0) {
        segments.push({
            label: 'Remaining',
            color: '#d3d3d3',
            widthPercent: remainingWidth,
        });
    }

    return (
        <div className="score-bar-container">
            <div
                className="score-bar"
            >
                {segments.filter(seg => seg.widthPercent > 0).map((seg, idx) => {
                    const showFullLabel = seg.widthPercent > 50;
                    const labelText = seg.score
                        ? (showFullLabel
                            ? `${seg.label}: ${seg.score.toFixed(2)}`
                            : `${abbreviations[seg.label]}: ${seg.score.toFixed(2)}`)
                        : '';

                    return (
                        <div
                            key={idx}
                            className="score-bar-segment"
                            style={{
                                width: `${seg.widthPercent}%`,
                                backgroundColor: seg.color,
                                transition: 'width 0.5s ease',
                            }}
                            title={seg.score ? `${seg.label} score: ${seg.score.toFixed(2)}/100` : undefined}
                        >
                            <span className="segment-label">{labelText}</span>
                        </div>
                    );
                })}

            </div>
            {displayLegend && (
                <div className="score-bar-legend">
                    {segments
                        .filter(seg => seg.weight > 0)
                        .map((seg, idx) => (
                            <div key={idx} className="legend-item">
                                <span
                                    className="legend-color-box"
                                    style={{ backgroundColor: seg.color }}
                                />
                                <span className="legend-label">{seg.label}</span>:&nbsp;
                                <span className="legend-score">{seg.score.toFixed(2)}</span>
                            </div>
                        ))}
                </div>
            )}

        </div>
    );
};

