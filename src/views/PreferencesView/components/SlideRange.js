import React, { useState, useCallback } from "react";
import useTravelRecommenderStore from "../../../store/travelRecommenderStore";
import "../../../styles/SlideRange.css";
import { debounce } from "lodash";

const SlideRange = ({ attrName, sliderColor }) => {
  const { userData, setUserData } = useTravelRecommenderStore();

  const [sliderProgress, setSliderProgress] = useState(userData.Attributes[attrName].score);
  const [value, setValue] = useState(userData.Attributes[attrName].score);

  const onChange = (value) => {
    setUserData({
      ...userData,
      Attributes: {
        ...userData.Attributes,
        [attrName]: {
          ...userData.Attributes[attrName],
          score: value,
        },
      },
    });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onChangeDebounced = useCallback(debounce(onChange, 500), [userData]);

  return (
    <form style={{ width: "100%", display: "flex" }}>
      <input
        id={`slider-${attrName}`}
        className={"slideRange"}
        style={{
          '--slider-color': hexToRgb(sliderColor),
          '--slider-progress': `${sliderProgress}%`,
        }}
        type="range"
        step={25}
        value={value}
        onChange={(e) => {
          setSliderProgress(e.target.valueAsNumber);
          setValue(e.target.valueAsNumber);
          onChangeDebounced(e.target.valueAsNumber);
        }}
      ></input>
    </form>
  );
};

export default SlideRange;

function hexToRgb(hex) {
  let c;
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    c = hex.substring(1).split('');
    if (c.length === 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c = '0x' + c.join('');
    return `${(c >> 16) & 255}, ${(c >> 8) & 255}, ${c & 255}`;
  }
  throw new Error('Bad Hex');
}
