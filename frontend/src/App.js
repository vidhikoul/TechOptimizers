import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
// import { useState } from "react";
import { ThemeProvider } from "react-bootstrap";
import Login from './pages/loginPage/Login';
import Registration from './pages/Registration/Register';
import SQLAssistant from './pages/SQLGenerator/SQLGenerator'; // Correct the path for SQLAssistant
import SchemaGenerator from './pages/SchemaGenerator/SchemaGenerator'; // Correct the path for SchemaGenerator
import SQLGenerator from "./pages/SQLGenerator/SQLGenerator.js"; // SQLGenerator route
import Dashboard from "./components/dashboard.js"; // Dashboard route
import Documentation from "./docs/page.js"; // Documentation route
// import DarkModeToggle from "./components/DarkModeToggle"; // Assuming you created this component

import HomePage from "./pages/HomePage"; // HomePage with a SignIn link

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );
  const [darkMode, setDarkMode] = useState(false);
  // const [isDarkMode, setIsDarkMode] = useState(
  //   localStorage.getItem("darkMode") === "true" // Check if dark mode is set in localStorage
  // );

  // Set dark mode in body element
  // useEffect(() => {
  //   if (isDarkMode) {
  //     document.body.classList.add("dark-mode");
  //   } else {
  //     document.body.classList.remove("dark-mode");
  //   }

  //   // Save dark mode state to localStorage
  //   localStorage.setItem("darkMode", isDarkMode);
  // }, [isDarkMode]);


  useEffect(() => {
    localStorage.setItem("isLoggedIn", isLoggedIn);
  }, [isLoggedIn]);

  return (
    // <ThemeProvider data-bs-theme={darkMode ? "dark" : "light"}>
    //   <Container fluid className="p-3 min-vh-100 bg-body">
    //     {/* Navbar with toggle */}
    //     <Navbar bg={darkMode ? "dark" : "light"} variant={darkMode ? "dark" : "light"}>
    //       <Nav className="ms-auto">
    //         <button 
    //           onClick={() => setDarkMode(!darkMode)}
    //           className="btn btn-sm btn-outline-secondary"
    //         >
    //           {darkMode ? "☀️ Light" : "🌙 Dark"}
    //         </button>
    //       </Nav>
    //     </Navbar>
    <Router>
      <main className="main-content">
      {/* <DarkModeToggle isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />{" "} */}

        <Routes>
          {/* Login Route */}
          <Route 
            path="/Login" 
            element={!isLoggedIn ? <Login setIsLoggedIn={setIsLoggedIn} /> : <Navigate to="/SQLGenerator" />} 
          />
          <Route path="/" element={<HomePage />} />

          {/* SQLAssistant Route */}
          <Route 
            path="/SQLGenerator" 
            element={isLoggedIn ? <SQLAssistant setIsLoggedIn={setIsLoggedIn} /> : <Navigate to="/Login" />} 
          />
          
          {/* Registration Route */}
          <Route path="/Registration" element={<Registration />} />

          {/* Schema Generator Route */}
          <Route path="/SchemaGenerator" element={<SchemaGenerator />} />

            {/* Dashboard Route */}
            <Route
            path="/dashboard"
            element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />}
          />

          {/* Documentation Route */}
          <Route path="/docs" element={<Documentation />} />

          {/* Assistant Route */}
          <Route
            path="/assistant"
            element={
              isLoggedIn ? (
                <SQLGenerator setIsLoggedIn={setIsLoggedIn} />
              ) : (
                <Navigate to="/login" />
              )
            }
            />

        </Routes>
      </main>
    </Router>
    // </Container>
    // </ThemeProvider>
  );
}

export default App;
