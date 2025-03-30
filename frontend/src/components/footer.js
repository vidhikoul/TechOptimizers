// src/components/Footer.js
import React from "react";

const Footer = () => {
  return (
    <footer className="bg-dark text-white py-4">
      <div className="container text-center">
        <div className="d-flex justify-content-center gap-2">
          <span>TechOptimizers</span>
        </div>
        <p className="text-muted mt-2">
          © 2024 TechOptimizers. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
