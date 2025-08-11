import React, { useState, useEffect } from "react";
import "../../../styles/App.css";
import { DetailScores } from "./DetailScores";
import { NoviceScores } from "./NoviceScores";
import { PieChartComponent } from "./PieChartComponent";
import { TravelMonthsComponent } from "./TravelMonthsComponent";
import { RadarChartComparison } from "./RadarChartComparison";
import { ScoreBreakdownBar } from "./ScoreBreakdownBar";
import useTravelRecommenderStore from "../../../store/travelRecommenderStore";

const StarRating = ({ popularity }) => {
  const totalStars = 5;
  const filledStars = Math.round((popularity / 100) * totalStars);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span >Destination Popularity:</span>
      <div style={{ display: 'inline-flex', gap: 2 }}>
        {[...Array(totalStars)].map((_, i) => (
          <span
            key={i}
            style={{
              color: i < filledStars ? '#FFC107' : '#ccc',
              fontSize: 18,
              userSelect: 'none',
            }}
          >
            ★
          </span>
        ))}
      </div>
    </div>
  );
};


const ResultInfo = ({ country, label }) => {
  const userData = useTravelRecommenderStore((state) => state.userData);
  console.log(country)
  const [scores, setScores] = useState([]);
  const loadData = () => {
    let s;
    if (userData.PresetType.length === 0) {
      s = Object.keys(country.scores.attr)?.map((key) => ({
        name: key,
        value: country.scores.attr[key].score,
        weight: country.scores.attr[key].weight,
      }));
    } else {
      s = userData.PresetType.map((key) => ({
        name: key.toLowerCase(),
        value: country.qualifications[key.toLowerCase()],
        weight: 1,
      }));
    }
    setScores(s);
  };
  useEffect(loadData, [country, userData.PresetType]);

  const budgetLevelToText = (budgetLevel) => {
    if (budgetLevel < 40) {
      return "Low";
    } else if (budgetLevel < 80) {
      return "Medium";
    } else {
      return "High";
    }
  }

  return (
    <div className="white-theme">
      <PieChartComponent
        scores={scores}
        label={label}
        countryName={country.country}
        region={country.region}
      />
      {/* <p style={{ paddingTop: "10px" }}>
        {`Budget Level: ${(country.budgetLevel / 10).toFixed(0)} (${budgetLevelToText(country.budgetLevel)}), your Preference: ${(userData.Budget / 10).toFixed(0)} (${budgetLevelToText(userData.Budget)})`}
      </p> */}
      <div
        style={{
          paddingTop: "10px",
          width: "fit-content",
          margin: "10px auto 0 auto",
          textAlign: "center",
        }}
      >
        <StarRating popularity={country.popularity} />
      </div>
      <hr />
      {/* <TravelMonthsComponent countryName={country.region} travelMonths={country.travelMonths} />
      <hr /> */}
      {userData.PreferenceMode === 'radar' ? (
        <>
          <p style={{ fontSize: "x-small" }}>
            Scores of {country.region} based on your preferences: (The gray outline shows the score of the attribute for {country.region} and the dashed outline shows your preferences)
          </p>
          <RadarChartComparison
            scores={Object.keys(country.qualifications)?.map((key) => ({
              name: key,
              value: country.qualifications[key],
            }))}
          />
        </>
      ) : userData.PreferenceMode === 'slider' ? (
        <>
          <p style={{ fontSize: "x-small" }}>
            Scores of {country.region} based on your preferences: (The bar
            demonstrates the score of the given attribute for {country.region} and
            the black line shows your preference - hover on the bars for more
            details)
          </p>
          <DetailScores
            scores={Object.keys(country.qualifications)?.map((key) => ({
              name: key,
              value: country.qualifications[key],
            }))}
          />
        </>
      ) : (
        <>
          <p style={{ fontSize: "x-small" }}>
            Scores of {country.region} based on your preset types: (The bar
            demonstrates the score of the given attribute for {country.region}.)
          </p>
          <NoviceScores
            scores={Object.keys(country.qualifications)?.map((key) => ({
              name: key,
              value: country.qualifications[key],
            }))}
          />
        </>
      )}
      <hr />

      <ScoreBreakdownBar scores={country.scores} />

      <hr />
      <p>Overall score: {country.scores.totalScore}/100</p>
    </div>
  );
};

export default ResultInfo;
