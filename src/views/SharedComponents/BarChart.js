import React from "react";
import "../../styles/App.css";

export const BarChart = ({ score, benchmark, color, showBenchmark }) => {
  const getText = () => {
    if (showBenchmark) {
      let diff = score.value - benchmark;
      let total = 100 - Math.abs(diff);
      if (diff === 0) {
        return (
          "The " +
          score.name +
          " of this country has the score " +
          score.value +
          " which is equal to your preference. So the " +
          score.name +
          " is 100% matching."
        );
      } else if (diff > 0) {
        return (
          "The " +
          score.name +
          " of this country has the score " +
          score.value +
          " which is " +
          Math.abs(diff) +
          "% more than what you prefer. So the " +
          score.name +
          " is " +
          total +
          "%(100-" +
          Math.abs(diff) +
          ") matching."
        );
      } else {
        return (
          "The " +
          score.name +
          " of this country has the score " +
          score.value +
          " which is " +
          Math.abs(diff) +
          "% less than what you prefer. So the " +
          score.name +
          " is " +
          total +
          "%(100-" +
          Math.abs(diff) +
          ") matching."
        );
      }
    } else {
      return (
        "The " +
        score.name +
        " of this country has the score " +
        score.value +
        "/100."
      );
    }
  };
  return (
    <div
      className="bar-chart"
      style={{
        height: "15px",
        width: "100%",
        position: "relative",
        border: "solid 1px #868686",
      }}
      data-tooltip-id="barchart-tooltip"
      data-tooltip-content={getText()}
    >

      <div
        style={{
          height: "13px",
          width: `calc(100% * (${score.value} / 100))`,
          backgroundColor: color,
          position: "absolute",
          left: "0",
        }}
      ></div>
      {showBenchmark && (
        <span
          style={{
            width: "5px",
            height: "15px",
            borderLeft: "solid 1px #fff",
            borderRight: "solid 1px #fff",
            backgroundColor: "#282c34",
            position: "absolute",
            left: `calc(100% * (${benchmark} / 100))`,
          }}
        ></span>
      )}
    </div>
  );
};
