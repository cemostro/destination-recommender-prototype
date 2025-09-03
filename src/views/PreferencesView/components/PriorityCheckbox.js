import React from "react";
import "../../../styles/App.css";
import useTravelRecommenderStore from "../../../store/travelRecommenderStore";

const PriorityCheckbox = ({ attrName }) => {
    const { userData, setUserData } = useTravelRecommenderStore();

    const isChecked = userData.Attributes[attrName].weight === 1;

    const onChange = (e) => {
        setUserData({
            ...userData,
            Attributes: {
                ...userData.Attributes,
                [attrName]: {
                    ...userData.Attributes[attrName],
                    weight: e.target.checked ? 1 : 0,
                },
            },
        });
    };

    return (
        <div
            className="prio-switch"
            data-tooltip-id="prio-switch-tooltip"
            data-tooltip-content="Check to consider this attribute in the score. 
            Uncheck if you don't want this attribute to be included."
        >
            <input
                type="checkbox"
                checked={isChecked}
                onChange={onChange}
                style={{ cursor: "pointer" }}
            />
        </div>
    );
};

export default PriorityCheckbox;
