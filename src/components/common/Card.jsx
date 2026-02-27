// src/components/common/Card.jsx
import React from "react";
import "../../styles/global.css";

const Card = ({ title, value }) => {
  return (
    <div className="card">
      <h3 className="card-title">{title}</h3>
      <p className="card-value">{value}</p>
    </div>
  );
};

export default Card;