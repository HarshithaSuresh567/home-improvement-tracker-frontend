// src/pages/NotFound.jsx
import React from "react";
import { Link } from "react-router-dom";
import "../styles/global.css";

const NotFound = () => {
  return (
    <div className="notfound-container">
      <h1>404</h1>
      <p>Oops! The page you are looking for does not exist.</p>
      <Link to="/dashboard">
        <button>Go to Dashboard</button>
      </Link>
    </div>
  );
};

export default NotFound;