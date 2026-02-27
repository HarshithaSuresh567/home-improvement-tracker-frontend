// src/components/common/Loader.jsx
import React from "react";
import "../../styles/global.css";

const Loader = () => {
  return (
    <div className="loader">
      <div className="spinner"></div>
      <p>Loading...</p>
    </div>
  );
};

export default Loader;