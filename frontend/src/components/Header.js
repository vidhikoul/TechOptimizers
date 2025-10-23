// src/components/Header.js
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Database, User, LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/auth-context';

// Reusable components
const NavItem = ({ path, text, darkMode }) => (
  <li className="nav-item">
    <Link 
      className={`nav-link ${darkMode ? 'text-light' : 'text-dark'}`}
      to={path}
      style={{
        transition: 'all 0.3s ease',
        fontWeight: 500
      }}
    >
      {text}
    </Link>
  </li>
);

const DropdownItem = ({ path, text }) => (
  <li>
    <Link 
      className="dropdown-item text-light hover-glow"
      to={path}
      style={{
        transition: 'all 0.2s ease',
        background: 'transparent'
      }}
    >
      {text}
    </Link>
  </li>
);

export function Header() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [darkMode, setDarkMode] = React.useState(true);

  // Style definitions
  const darkHeaderStyle = {
    background: 'linear-gradient(145deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5), inset 0 -3px 10px rgba(156, 39, 176, 0.3)',
    borderBottom: '1px solid rgba(156, 39, 176, 0.2)',
    backdropFilter: 'blur(5px)',
    zIndex: 1030
  };

  const button3DStyle = {
    boxShadow: '0 4px 15px rgba(156, 39, 176, 0.6), inset 0 1px 1px rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    transform: 'translateY(0)',
    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
  };

  const dropdown3DStyle = {
    background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
    boxShadow: '0 10px 25px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.05)',
    border: '1px solid rgba(156, 39, 176, 0.2)',
    borderRadius: '12px'
  };

  // Toggle theme
  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.body.setAttribute('data-bs-theme', newMode ? 'dark' : 'light');
  };

  if (auth.isLoading) {
    return (
      <header className="fixed-top" style={darkHeaderStyle}>
        <div className="container-fluid">
          <div className="d-flex align-items-center py-2">
            <Database className="h-5 w-5 mr-2 text-purple-300" />
            <span className="text-white fw-bold neon-text">TechOptimizers</span>
            <div className="ms-auto">
              <div className="spinner-border text-purple-300" role="status" />
            </div>
          </div>
        </div>
      </header>
    );
  }

  const { user, isAuthenticated, logout } = auth;

  return (
    <header className="navbar navbar-expand-lg fixed-top" style={darkHeaderStyle}>
      <div className="container-fluid">
        <Link to="/" className="navbar-brand d-flex align-items-center">
          <Database className="h-5 w-5 mr-2 text-purple-300 glow-icon" />
          <span className="text-white fw-bold neon-text">TechOptimizers</span>
        </Link>

        <button 
          className="navbar-toggler" 
          type="button" 
          style={{
            border: '1px solid rgba(156, 39, 176, 0.4)',
            boxShadow: '0 0 10px rgba(156, 39, 176, 0.3)'
          }}
        >
          <span className="navbar-toggler-icon" style={{filter: 'brightness(2)'}}></span>
        </button>

        <div className="collapse navbar-collapse">
          <ul className="navbar-nav me-auto">
            <NavItem path="/" text="Home" darkMode={darkMode} />
            {isAuthenticated && (
              <>
                <NavItem path="/dashboard" text="Dashboard" darkMode={darkMode} />
                <NavItem path="/assistant" text="SQL Assistant" darkMode={darkMode} />
              </>
            )}
          </ul>

          <ul className="navbar-nav align-items-center">
            <li className="nav-item me-3">
              <button 
                onClick={toggleTheme}
                className="btn rounded-circle p-2"
                style={{
                  ...button3DStyle,
                  background: 'linear-gradient(145deg, #6a11cb 0%, #2575fc 100%)',
                  width: '40px',
                  height: '40px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0) scale(1)'}
              >
                {darkMode ? (
                  <Sun className="h-5 w-5 text-yellow-300 glow-icon" />
                ) : (
                  <Moon className="h-5 w-5 text-indigo-200 glow-icon" />
                )}
              </button>
            </li>

            {isAuthenticated ? (
              <li className="nav-item dropdown">
                <button 
                  className="btn rounded-pill px-3 py-1 d-flex align-items-center"
                  style={{
                    ...button3DStyle,
                    background: 'linear-gradient(145deg, #6a11cb 0%, #2575fc 100%)'
                  }}
                >
                  <User className="h-4 w-4 mr-2 text-white glow-icon" />
                  <span className="text-white">{user?.name || "User"}</span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end" style={dropdown3DStyle}>
                  <DropdownItem path="/profile" text="Profile" />
                  <DropdownItem path="/settings" text="Settings" />
                  <li><hr className="dropdown-divider my-2" style={{borderColor: 'rgba(156, 39, 176, 0.2)'}}/></li>
                  <li>
                    <button 
                      className="dropdown-item d-flex align-items-center text-danger"
                      onClick={() => {
                        logout();
                        navigate('/login');
                      }}
                      style={{transition: 'all 0.2s ease'}}
                    >
                      <LogOut className="h-4 w-4 mr-2 glow-icon" />
                      Logout
                    </button>
                  </li>
                </ul>
              </li>
            ) : (
              <>
                <li className="nav-item me-2">
                  <Link to="/login">
                    <button 
                      className="btn rounded-pill px-3 py-1"
                      style={{
                        ...button3DStyle,
                        background: 'linear-gradient(145deg, #4facfe 0%, #00f2fe 100%)',
                        color: '#111'
                      }}
                    >
                      Sign In
                    </button>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/Registration">
                    <button 
                      className="btn rounded-pill px-3 py-1"
                      style={{
                        ...button3DStyle,
                        background: 'linear-gradient(145deg, #a1c4fd 0%, #c2e9fb 100%)',
                        color: '#111'
                      }}
                    >
                      Sign Up
                    </button>
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