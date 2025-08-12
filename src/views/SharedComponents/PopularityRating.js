import React from "react";

export const PopularityRating = ({ popularity }) => {
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