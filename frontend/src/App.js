import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login from './pages/loginPage/Login';
import Registration from './pages/Registration/Register';
// import Dashboard from './pages/Dashboard/Dashboard'; // Make sure to import Dashboard
import SQLGenerator from './pages/SQLGenerator/SQLGenerator.js'
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );

  useEffect(() => {
    localStorage.setItem("isLoggedIn", isLoggedIn);
  }, [isLoggedIn]);

  return (
    <Router>
      <main className="main-content">
        <Routes>
          {/* Login Route */}
          <Route 
            path="/" 
            element={!isLoggedIn ? <Login setIsLoggedIn={setIsLoggedIn} /> : <Navigate to="/SQLGenerator" />} 
          />

          {/* Dashboard Route */}
          <Route 
            path="/SQLGenerator" 
            element={isLoggedIn ? <SQLGenerator setIsLoggedIn={setIsLoggedIn} /> : <Navigate to="/" />} 
          />
           <Route path="/Registration" element={<Registration />} />

          {/* You can add more routes if needed */}
        </Routes>
      </main>
    </Router>
  );
}

export default App;
