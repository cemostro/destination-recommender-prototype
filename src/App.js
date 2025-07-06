import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/App.css";
import TravelRecommender from "./views/GeneralView/TravelRecommender";
import LoadCountriesTask from "./tasks/LoadCountriesTask";
import LoadCountriesFromCSV from "./tasks/LoadCountriesFromCSV";
import Loading from "./views/GeneralView/Loading";
import useTravelRecommenderStore from "./store/travelRecommenderStore";

const App = () => {
  const [fileRetrievedCSV, setFileRetrievedCSV] = useState([]);
  const { countries, setCountries, setResults, userData } = useTravelRecommenderStore();

  const loadFromCSV = () => {
    const loadCountriesTask = new LoadCountriesFromCSV();
    loadCountriesTask.load(setFileRetrievedCSV);
  };
  const calculateScores = () => {
    if (fileRetrievedCSV.length > 0) {
      const loadCountriesTask = new LoadCountriesFromCSV();
      loadCountriesTask.processCountries(
        fileRetrievedCSV,
        userData,
        setCountries,
        setResults
      );
    }
  };
  useEffect(loadFromCSV, []);
  useEffect(calculateScores, [userData, fileRetrievedCSV, setCountries, setResults]);

  return (
    <div style={{ height: "100vh" }}>
      {countries.length === 0 ? (
        <Loading />
      ) : (
        <TravelRecommender/>
      )}
    </div>
  );
};

export default App;
