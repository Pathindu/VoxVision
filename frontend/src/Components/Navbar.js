import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../Components/Navbar.css';

export default function Navbar({ darkMode, toggleDarkMode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleNavigation = (path) => {
    setIsMobileMenuOpen(false);
    if (path === 'home') {
      navigate('/');
    } else if (path === 'login') {
      navigate('/login');
    } else if (path === 'contact') {
      navigate('/contact');
    } else if (path === 'order') {
      navigate('/order');
    } else if (path === 'about') {
      navigate('/about');
    } else if (path === 'team') {
      navigate('/team');
    } else {
      alert(`Navigating to ${path}`);
    }
  };

  return (
    <>
      <nav className={`navbar ${darkMode ? 'dark-mode' : ''}`} role="navigation" aria-label="Main navigation">
        <div className="navbar-content">
          <button
            className="navbar-mobile-toggle"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={isMobileMenuOpen}
          >
            &#9776;
          </button>

          <div className="navbar-logo" onClick={() => handleNavigation('home')} role="link" aria-label="Go to VoxVision home">
            <img src="/voxvision-logo.png" alt="VoxVision Logo" className="navbar-logo-img" />
            <span className="navbar-logo-text creative-logo">VoxVision</span>
          </div>

          <div className="navbar-right">
            <ul className="navbar-links" role="menubar" aria-label="Site navigation">
              <li role="none">
                <a
                  href="#home"
                  onClick={(e) => { e.preventDefault(); handleNavigation('home'); }}
                  className={`navbar-link${isActive('/') ? ' active' : ''}`}
                  data-page="home"
                  role="menuitem"
                  aria-label="Go to Home page"
                  aria-current={isActive('/') ? 'page' : undefined}
                >
                  Home
                </a>
              </li>
              <li role="none">
                <a
                  href="#about"
                  onClick={(e) => { e.preventDefault(); handleNavigation('about'); }}
                  className={`navbar-link${isActive('/about') ? ' active' : ''}`}
                  data-page="about"
                  role="menuitem"
                  aria-label="Go to About us page"
                  aria-current={isActive('/about') ? 'page' : undefined}
                >
                  About us
                </a>
              </li>
              <li role="none">
                <a
                  href="#team"
                  onClick={(e) => { e.preventDefault(); handleNavigation('team'); }}
                  className={`navbar-link${isActive('/team') ? ' active' : ''}`}
                  data-page="team"
                  role="menuitem"
                  aria-label="Go to Our Team page"
                  aria-current={isActive('/team') ? 'page' : undefined}
                >
                  Our Team
                </a>
              </li>
              <li role="none">
                <a
                  href="#contact"
                  onClick={(e) => { e.preventDefault(); handleNavigation('contact'); }}
                  className={`navbar-link${isActive('/contact') ? ' active' : ''}`}
                  data-page="contact"
                  role="menuitem"
                  aria-label="Go to Contact us page"
                  aria-current={isActive('/contact') ? 'page' : undefined}
                >
                  Contact us
                </a>
              </li>
              <li role="none">
                <a
                  href="#order"
                  onClick={(e) => { e.preventDefault(); handleNavigation('order'); }}
                  className={`navbar-link${isActive('/order') ? ' active' : ''}`}
                  data-page="order"
                  role="menuitem"
                  aria-label="Go to Order page"
                  aria-current={isActive('/order') ? 'page' : undefined}
                >
                  Order
                </a>
              </li>
            </ul>

            {/* Action Buttons — Support Us first, dark mode toggle on the right */}
            <div className="navbar-actions">
              <a
                href="/donate"
                className="navbar-donate-btn"
                aria-label="Support our mission by donating"
              >
                <span className="support-text">Support Us</span>
              </a>

              <button
                className="dark-mode-toggle"
                onClick={toggleDarkMode}
                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <span className="toggle-icon">{darkMode ? '☀️' : '🌙'}</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setIsMobileMenuOpen(false)} role="dialog" aria-modal="true" aria-label="Navigation menu">
          <div className={`mobile-drawer ${darkMode ? 'dark-mode' : ''}`} onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <button className="mobile-drawer-close" aria-label="Close menu" onClick={() => setIsMobileMenuOpen(false)}>
                &times;
              </button>
            </div>
            <ul className="mobile-drawer-links">
              <li>
                <a href="#home" role="button" data-page="home" onClick={(e) => { e.preventDefault(); handleNavigation('home'); }} className={`navbar-link${isActive('/') ? ' active' : ''}`} aria-label="Go to Home page" aria-current={isActive('/') ? 'page' : undefined}>Home</a>
              </li>
              <li>
                <a href="#about" role="button" data-page="about" onClick={(e) => { e.preventDefault(); handleNavigation('about'); }} className={`navbar-link${isActive('/about') ? ' active' : ''}`} aria-label="Go to About us page" aria-current={isActive('/about') ? 'page' : undefined}>About us</a>
              </li>
              <li>
                <a href="#team" role="button" data-page="team" onClick={(e) => { e.preventDefault(); handleNavigation('team'); }} className={`navbar-link${isActive('/team') ? ' active' : ''}`} aria-label="Go to Our Team page" aria-current={isActive('/team') ? 'page' : undefined}>Our Team</a>
              </li>
              <li>
                <a href="#contact" role="button" data-page="contact" onClick={(e) => { e.preventDefault(); handleNavigation('contact'); }} className={`navbar-link${isActive('/contact') ? ' active' : ''}`} aria-label="Go to Contact us page" aria-current={isActive('/contact') ? 'page' : undefined}>Contact us</a>
              </li>
              <li>
                <a href="#order" role="button" data-page="order" onClick={(e) => { e.preventDefault(); handleNavigation('order'); }} className={`navbar-link${isActive('/order') ? ' active' : ''}`} aria-label="Go to Order page" aria-current={isActive('/order') ? 'page' : undefined}>Order</a>
              </li>
            </ul>
            <div className="mobile-bottom-actions">
              <a
                href="/donate"
                className="mobile-support-btn"
                aria-label="Support our mission by donating"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="support-text">Support Us</span>
              </a>
              <button className="dark-mode-toggle" onClick={toggleDarkMode} aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
                <span className="toggle-icon">{darkMode ? '☀️' : '🌙'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}