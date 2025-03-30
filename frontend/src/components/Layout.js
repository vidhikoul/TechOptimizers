// src/components/Layout.js

import React from "react";
import { Header } from "./Header"; // Import the Header component
import Footer from "./footer.js"; // Import the Footer component (assuming you've created it)

export default function Layout({ children }) {
  return (
    <>
      {/* Fixed Header */}
      <Header />

      {/* Main content area */}
      <div style={{ marginTop: "64px" }}>
        {/* The children represent the content of your page */}
        {children}
      </div>

      {/* Footer (if you have it) */}
      <Footer />
    </>
  );
}
