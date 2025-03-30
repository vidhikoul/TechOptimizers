// src/components/Header.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Database, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/auth-context';

export function Header() {
  const navigate = useNavigate();
  const auth = useAuth();
  
  // Handle loading state
  if (auth.isLoading) {
    return (
      <header className="navbar navbar-expand-lg navbar-light bg-light fixed-top">
        <div className="container-fluid">
          <Link to="/" className="navbar-brand">
            <Database className="h-4 w-4 mr-2" />
            <span>TechOptimizers</span>
          </Link>
          <div className="ms-auto">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </header>
    );
  }

  const { user, isAuthenticated, logout } = auth;

  return (
    <header className="navbar navbar-expand-lg navbar-light bg-light fixed-top">
      <div className="container-fluid">
        <Link to="/" className="navbar-brand">
          <Database className="h-4 w-4 mr-2" />
          <span>TechOptimizers</span>
        </Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>
            {isAuthenticated && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/dashboard">Dashboard</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/assistant">SQL Assistant</Link>
                </li>
              </>
            )}
          </ul>

          <ul className="navbar-nav">
            {isAuthenticated ? (
              <li className="nav-item dropdown">
                <button className="btn btn-link nav-link dropdown-toggle" data-bs-toggle="dropdown">
                  <User className="h-4 w-4 mr-1" />
                  {user?.name || "User"}
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li><Link className="dropdown-item" to="/profile">Profile</Link></li>
                  <li><Link className="dropdown-item" to="/settings">Settings</Link></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button 
                      className="dropdown-item text-danger"
                      onClick={() => {
                        logout();
                        navigate('/login');
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-1" />
                      Logout
                    </button>
                  </li>
                </ul>
              </li>
            ) : (
              <>
                <li className="nav-item">
                  <Link to="/login" className="nav-link">
                    <button className="btn btn-outline-primary">Sign In</button>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/Registration" className="nav-link">
                    <button className="btn btn-primary">Sign Up</button>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </header>
  );
}