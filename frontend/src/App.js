import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import Login from './pages/loginPage/Login';
import Registration from './pages/Registration/Register';
import SQLAssistant from './pages/SQLGenerator/SQLGenerator'; // Correct the path for SQLAssistant
import SchemaGenerator from './pages/SchemaGenerator/SchemaGenerator'; // Correct the path for SchemaGenerator

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

          {/* SQLAssistant Route */}
          <Route 
            path="/SQLGenerator" 
            element={isLoggedIn ? <SQLAssistant setIsLoggedIn={setIsLoggedIn} /> : <Navigate to="/" />} 
          />
          
          {/* Registration Route */}
          <Route path="/Registration" element={<Registration />} />

          {/* Schema Generator Route */}
          <Route path="/SchemaGenerator" element={<SchemaGenerator />} />

        </Routes>
      </main>
    </Router>
  );
}

export default App;
