import React, { useState, useEffect, useRef } from "react";
import Accordion from "react-bootstrap/Accordion";
import Button from "react-bootstrap/Button";
import "../../styles/App.css";
import ResultInfo from "./components/ResultInfo";
import useTravelRecommenderStore from "../../store/travelRecommenderStore";

export const Results = ({ activeResult, setShowIntroModal }) => {
  const results = useTravelRecommenderStore((state) => state.results);
  const [activeIndex, setActiveIndex] = useState(-1);
  const accordElem = useRef(null);
  useEffect(() => {
    if (results.length > 0) {
      if (activeResult === activeIndex) {
        setActiveIndex(-1);
      } else {
        setActiveIndex(activeResult);
        accordElem.current.scrollIntoView({
          behavior: "smooth",
          block: "end",
          inline: "start",
        });
      }
    }
  }, [activeResult]);
  return (
    <div style={{ padding: "10px 0", height: "100%", overflow: "hidden" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px",
        }}
      >
        <p style={{ textAlign: "left", margin: 0 }}>
          Best destinations for you:
        </p>
        <Button
          variant="outline-light"
          size="sm"
          onClick={() => setShowIntroModal(true)}
          style={{
            borderRadius: "50%",
            width: "28px",
            height: "28px",
            padding: 0,
            lineHeight: "1",
            fontWeight: "bold",
          }}
        >
          ?
        </Button>
      </div>
      {results.length > 0 ? (
        <div style={{ overflowX: "hidden", height: "95%", paddingRight: "5px" }} ref={accordElem}>
          <Accordion activeKey={activeIndex}>
            {results?.map((item, index) => (
              <Accordion.Item eventKey={index} key={index}>
                <Accordion.Header
                  onClick={() => {
                    if (index === activeIndex) {
                      setActiveIndex(-1);
                    } else {
                      setActiveIndex(index);
                      accordElem.current.scrollIntoView({
                        behavior: "smooth",
                        block: "middle",
                        inline: "nearest",
                      });
                    }
                  }}
                >
                  {index + 1}. {item.region}
                </Accordion.Header>
                <Accordion.Body>
                  <ResultInfo
                    country={item}
                    label={index + 1}
                  />
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        </div>
      ) : (
        <div
          style={{
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignContent: "center",
            flexDirection: "column",
          }}
        >
          <p style={{ fontWeight: "bold", color: "red" }}>No results found!</p>
        </div>
      )}
    </div>
  );
};
