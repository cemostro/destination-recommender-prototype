import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";

const IntroModal = ({ show, onClose }) => {
  const [page, setPage] = useState(0);

  const pages = [
    {
      title: "Welcome to the Destination Recommender!",
      content: (
        <div style={{ color: "white" }}>
          <p style={{ fontSize: "1.1rem", lineHeight: "1.6" }}>
            To get started, first adjust your <strong>topic preferences</strong> in the
            left panel. You can set values for topics such as{" "}
            <em>Nature</em>, <em>Beach</em>, and <em>Culinary</em>.
          </p>
          <p style={{ fontSize: "1.1rem", lineHeight: "1.6" }}>
            Explore the two different interfaces to adjust your preferences:
            the <strong>Preference Sliders</strong> and the{" "}
            <strong>Travel Taste Map</strong>.
            Both interfaces also let you <strong>remove dimensions</strong> that
            are irrelevant to you, so you can focus on what matters most.
          </p>

          <div className="d-flex justify-content-center align-items-start mt-2 mb-2">
            <div style={{ textAlign: "center", flex: 1, margin: "0 0.1rem" }}>
              <img
                src={process.env.PUBLIC_URL + "/images/preferencesliders.png"}
                alt="Preference Sliders"
                style={{
                  width: "100%",
                  maxWidth: "400px",
                  borderRadius: "12px",
                  border: "2px solid white",
                  marginBottom: "0.75rem",
                }}
              />
              <p style={{ margin: 0, fontSize: "1rem" }}>Preference Sliders</p>
            </div>

            <div style={{ textAlign: "center", flex: 1, margin: "0 0.1rem" }}>
              <img
                src={process.env.PUBLIC_URL + "/images/tastemap.png"}
                alt="Travel Taste Map"
                style={{
                  width: "100%",
                  maxWidth: "400px",
                  borderRadius: "12px",
                  border: "2px solid white",
                  marginBottom: "0.75rem",
                }}
              />
              <p style={{ margin: 0, fontSize: "1rem" }}>Travel Taste Map</p>
            </div>
          </div>

          <p style={{ fontSize: "1.1rem", lineHeight: "1.6" }}>
            After your adjustments, you can either view your{" "}
            <strong>personalized recommendation results</strong>,
            or move on to <strong>adjusting the recommendation settings</strong>.
          </p>
        </div>
      ),
    },
    {
      title: "Adjusting Recommendation Settings",
      content: (
        <div style={{ color: "white" }}>
          <p style={{ fontSize: "1.1rem", lineHeight: "1.6" }}>
            Once you’ve set your topic preferences, you can fine-tune <strong>how the
              recommendations are generated</strong>. There are three different ways to
            control the algorithm:
          </p>

          {/* Three control options */}
          <div className="d-flex justify-content-center align-items-center mt-4">
            <div style={{ textAlign: "center", flex: 1, margin: "0 0.5rem" }}>
              <img
                src={process.env.PUBLIC_URL + "/images/preset-strategies.png"}
                alt="Preset Strategies Dropdown"
                style={{
                  width: "100%",
                  maxWidth: "320px",
                  borderRadius: "12px",
                  border: "2px solid white",
                  marginBottom: "0.75rem",
                }}
              />
              <p style={{ margin: 0, fontSize: "1rem" }}>Preset Strategies</p>
            </div>

            <div style={{ textAlign: "center", flex: 1, margin: "0 0.5rem" }}>
              <img
                src={process.env.PUBLIC_URL + "/images/triangle-chart.png"}
                alt="Triangle Strategy Chart"
                style={{
                  width: "100%",
                  maxWidth: "350px",
                  borderRadius: "12px",
                  border: "2px solid white",
                  marginBottom: "0.75rem",
                }}
              />
              <p style={{ margin: 0, fontSize: "1rem" }}>
                Triangle Chart
              </p>
            </div>

            <div style={{ textAlign: "center", flex: 1, margin: "0 0.5rem" }}>
              <img
                src={process.env.PUBLIC_URL + "/images/manual-weights.png"}
                alt="Manual Weight Input"
                style={{
                  width: "100%",
                  maxWidth: "350px",
                  borderRadius: "12px",
                  border: "2px solid white",
                  marginBottom: "0.75rem",
                }}
              />
              <p style={{ margin: 0, fontSize: "1rem" }}>Manual Weight Input</p>
            </div>
          </div>

          {/* Popularity toggle */}
          <p
            style={{
              fontSize: "1.1rem",
              lineHeight: "1.6",
              marginTop: "2rem",
            }}
          >
            Prefer the popular spots, or want to discover the lesser-known places?
            Use the <strong>Popularity Toggle</strong> to switch the strategy — this
            will update both the triangle chart and the manual weight inputs.
          </p>

          <div className="d-flex justify-content-center mt-3">
            <div style={{ textAlign: "center" }}>
              <img
                src={process.env.PUBLIC_URL + "/images/popularity-toggle.png"}
                alt="Popularity Toggle"
                style={{
                  width: "100%",
                  maxWidth: "350px",
                  borderRadius: "12px",
                  border: "1px solid white",
                  marginBottom: "0.75rem",
                }}
              />
              <p style={{ margin: 0, fontSize: "1rem" }}>Popularity Toggle</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Exploring Your Results",
      content: (
        <div style={{ color: "white" }}>
          <p style={{ fontSize: "1.1rem", lineHeight: "1.6" }}>
            See an overview of your results in the{" "}
            <strong>interactive map</strong> in the center panel, and dive deeper
            into your <strong>top recommendations</strong> within the right panel.
          </p>

          <p style={{ fontSize: "1.1rem", lineHeight: "1.6" }}>
            Check out how the topic preference match between your inputs and the
            destinations looks in the{" "}
            <strong>bar charts</strong> (if you used the preference sliders) and
            the <strong>comparison radar chart</strong> (if you used the travel
            taste map).
          </p>

          <div className="d-flex justify-content-between align-items-center mt-1 mb-2">
            <div style={{ textAlign: "center", flex: 1, margin: "0 0.25rem" }}>
              <img
                src={process.env.PUBLIC_URL + "/images/bar-charts.png"}
                alt="Topic Match Bar Charts"
                style={{
                  width: "100%",
                  maxWidth: "350px",
                  borderRadius: "12px",
                  border: "2px solid white",
                  marginBottom: "0.75rem",
                }}
              />
              <p style={{ margin: 0, fontSize: "1rem" }}>Bar Charts</p>
            </div>

            <div style={{ textAlign: "center", flex: 1, margin: "0 0.25rem" }}>
              <img
                src={process.env.PUBLIC_URL + "/images/comparison-radar-chart.png"}
                alt="Comparison Radar Chart"
                style={{
                  width: "100%",
                  maxWidth: "350px",
                  borderRadius: "12px",
                  border: "2px solid white",
                  marginBottom: "0.75rem",
                }}
              />
              <p style={{ margin: 0, fontSize: "1rem" }}>Radar Chart</p>
            </div>
          </div>

          <p style={{ fontSize: "1.1rem", lineHeight: "1.6" }}>
            Finally, review the <strong>score breakdown bar</strong> to see how the different recommendation strategies contributed to each destination’s final score.
          </p>

          <div className="d-flex justify-content-center mt-3">
            <div style={{ textAlign: "center" }}>
              <img
                src={process.env.PUBLIC_URL + "/images/score-breakdown-bar.png"}
                alt="Score Breakdown Bar"
                style={{
                  width: "100%",
                  maxWidth: "600px",
                  borderRadius: "12px",
                  border: "2px solid white",
                  marginBottom: "0.75rem",
                }}
              />
              <p style={{ margin: 0, fontSize: "1rem" }}>Score Breakdown Bar</p>
            </div>
          </div>
          <p style={{ fontSize: "1.1rem", lineHeight: "1.6", marginTop: "1.5rem" }}>
            That’s it, have fun exploring the Destination Recommender!
            You can always view this introduction again by clicking the{" "}
            <strong>question mark</strong> in the top right corner.
          </p>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (page < pages.length - 1) {
      setPage(page + 1);
    } else {
      onClose();
    }
  };

  const handleBack = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  return (
    <>
      <Modal.Header
        closeButton
        style={{ backgroundColor: "#193D4B", borderBottom: "none" }}
      >
        <Modal.Title style={{ color: "white" }}>
          {pages[page].title}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body
        style={{
          backgroundColor: "#193D4B",
          maxHeight: "70vh",
          overflowY: "auto",
        }}
      >
        {pages[page].content}
      </Modal.Body>

      <Modal.Footer
        style={{ backgroundColor: "#193D4B", borderTop: "none" }}
      >
        {page > 0 && (
          <Button variant="secondary" onClick={handleBack}>
            Back
          </Button>
        )}
        <Button variant="primary" onClick={handleNext}>
          {page < pages.length - 1 ? "Next" : "Finish"}
        </Button>
      </Modal.Footer>
    </>
  );
};

export default IntroModal;
