// src/components/ui/button.js
import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";

// A simple Button component using Bootstrap styling
const Button = ({ children, onClick, className = "", variant = "primary" }) => {
  const buttonClasses = `btn btn-${variant} ${className}`;
  return (
    <button className={buttonClasses} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
