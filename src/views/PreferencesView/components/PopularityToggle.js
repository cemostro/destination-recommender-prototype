import React from "react";
import "../../../styles/PopularityToggle.css";

export default function PopularityToggle({ value, onChange }) {

    return (
        <div className="popularity-toggle">
            <button
                className={`toggle-option ${value === "popular" ? "active" : ""}`}
                onClick={() => onChange("popular")}
            >
                Prioritize Popular
            </button>
            <button
                className={`toggle-option ${value === "hidden" ? "active" : ""}`}
                onClick={() => onChange("hidden")}
            >
                Prioritize Less Popular
            </button>
        </div>
    );
}
