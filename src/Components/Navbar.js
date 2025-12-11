import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../Components/Navbar.css';

export default function Navbar({ darkMode, toggleDarkMode }) {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    if (path === 'home') {
      navigate('/');
    } else if (path === 'login') {
      navigate('/login');
    } else if (path === 'contact') {
      navigate('/contact');
    } else {
      // Handle other navigation items
      alert(`Navigating to ${path}`);
    }
  };

  return (
    <nav className={`navbar ${darkMode ? 'dark-mode' : ''}`}>
      <div className="navbar-content">
        <div className="navbar-logo" onClick={() => handleNavigation('home')}>
          <span className="navbar-logo-icon">💡</span>
          <span className="navbar-logo-text">Logo & Name</span>
        </div>
        
        <div className="navbar-right">
          <ul className="navbar-links">
            <li>
              <a 
                href="#home" 
                onClick={(e) => { e.preventDefault(); handleNavigation('home'); }}
                className="navbar-link"
              >
                Home
              </a>
            </li>
            <li>
              <a 
                href="#about" 
                onClick={(e) => { e.preventDefault(); handleNavigation('about'); }}
                className="navbar-link"
              >
                About us
              </a>
            </li>
            <li>
              <a 
                href="#contact" 
                onClick={(e) => { e.preventDefault(); handleNavigation('contact'); }}
                className="navbar-link"
              >
                Contact us
              </a>
            </li>
            <li>
              <a 
                href="#login" 
                onClick={(e) => { e.preventDefault(); handleNavigation('login'); }}
                className="navbar-link"
              >
                Login/Register
              </a>
            </li>
          </ul>

          {/* Dark Mode Toggle Button */}
          <button className="dark-mode-toggle" onClick={toggleDarkMode}>
            <span className="toggle-icon">{darkMode ? '☀️' : '🌙'}</span>
          </button>
        </div>
      </div>
    </nav>
  );
}