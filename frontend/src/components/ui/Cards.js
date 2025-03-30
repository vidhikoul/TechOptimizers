// src/components/ui/Card.js
import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
const Card = ({ children, className = "" }) => (
  <div className={`bg-white shadow-md rounded-lg p-6 ${className}`}>
    {children}
  </div>
);

export default Card;
