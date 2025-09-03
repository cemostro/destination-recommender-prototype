import React from "react";
import { Row, Col } from "react-bootstrap";
import "../../../styles/App.css";
import SlideRange from "./SlideRange";
// import PrioritySwitch from "./PrioritySwitch";
import PriorityCheckbox from "./PriorityCheckbox";

const Attribute = ({ attrName, sliderColor }) => {
  return (
    <Row
      style={{
        display: "flex",
        alignItems: "center",
        padding: "5px",
        height: "100%",
      }}
    >
      <Col xs={4}>{attrName}</Col>
      <Col xs={7}>
        <SlideRange attrName={attrName} sliderColor={sliderColor} />
      </Col>
      <Col xs={1}>
        <PriorityCheckbox attrName={attrName} />
      </Col>
    </Row>
  );
};

export default Attribute;
