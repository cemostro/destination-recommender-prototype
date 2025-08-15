import React from "react";
import Attribute from "./Attribute";
import * as myConstant from "../../../data/constantData";
import useTravelRecommenderStore from "../../../store/travelRecommenderStore";

export const CustomizationContainer = () => {
  const { userData } = useTravelRecommenderStore();
  return (
    <div>
      <p style={{ textAlign: "start", fontSize: "small" }}>
        Rate the topics according to their importance to you:
      </p>
      {Object.keys(userData.Attributes).map((item, index) => (
        <div
          style={{
            border: "1px solid #336273",
            borderRadius: "100",
            color: "#fff",
            textAlign: "left",
            padding: "0 5px",
            margin: "5px 0 0 0",
            height: "40px",
            alignItems: "center",
          }}
          key={index}
        >
          <Attribute attrName={item} sliderColor={userData.Attributes[item].weight === 0 ? "#808080" : myConstant.COLORS[index % myConstant.COLORS.length]} />
        </div>
      ))}
    </div>
  );
};
