import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Components/Navbar.css';

export default function Navbar({ darkMode, toggleDarkMode }) {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavigation = (path) => {
    setIsMobileMenuOpen(false);
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
    <>
      <nav className={`navbar ${darkMode ? 'dark-mode' : ''}`}>
        <div className="navbar-content">
          <button className="navbar-mobile-toggle" onClick={() => setIsMobileMenuOpen(true)}>
            &#9776;
          </button>
          
          <div className="navbar-logo" onClick={() => handleNavigation('home')}>
            <span className="navbar-logo-text creative-logo">VoxVision</span>
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

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setIsMobileMenuOpen(false)}>
          <div className={`mobile-drawer ${darkMode ? 'dark-mode' : ''}`} onClick={(e) => e.stopPropagation()}>
            <button className="mobile-drawer-close" aria-label="Close menu" onClick={() => setIsMobileMenuOpen(false)}>
              &times;
            </button>
            <ul className="mobile-drawer-links">
              <li>
                <a href="#home" role="button" onClick={(e) => { e.preventDefault(); handleNavigation('home'); }} className="navbar-link">Home</a>
              </li>
              <li>
                <a href="#about" role="button" onClick={(e) => { e.preventDefault(); handleNavigation('about'); }} className="navbar-link">About us</a>
              </li>
              <li>
                <a href="#contact" role="button" onClick={(e) => { e.preventDefault(); handleNavigation('contact'); }} className="navbar-link">Contact us</a>
              </li>
              <li>
                <a href="#login" role="button" onClick={(e) => { e.preventDefault(); handleNavigation('login'); }} className="navbar-link">Login/Register</a>
              </li>
            </ul>
          </div>
        </div>
      )}
    </>
  );
}