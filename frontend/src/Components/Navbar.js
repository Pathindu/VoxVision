import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../Components/Navbar.css';

export default function Navbar({ darkMode, toggleDarkMode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, isCaregiver, user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const go = (path) => { 
    navigate(path); 
    setIsMobileMenuOpen(false); 
  };

  const handleLogout = () => { 
    logout(); 
    navigate('/'); 
    setIsMobileMenuOpen(false); 
  };

  return (
    <>
      <nav className={`navbar ${darkMode ? 'dark-mode' : ''}`} role="navigation" aria-label="Main navigation">
        <div className="navbar-content">

          {/* Logo */}
          <div className="navbar-logo" onClick={() => go('/')} role="link" aria-label="Go to VoxVision home">
            <span className="navbar-logo-icon">👁️</span>
            <span className="navbar-logo-text">VoxVision</span>
          </div>

          <button
            className="navbar-mobile-toggle"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={isMobileMenuOpen}
          >
            &#9776;
          </button>

          <div className="navbar-right">
            <ul className="navbar-links" role="menubar" aria-label="Site navigation">
              <li role="none">
                <a href="/" onClick={(e) => { e.preventDefault(); go('/'); }} className={`navbar-link${isActive('/') ? ' active' : ''}`} role="menuitem">Home</a>
              </li>
              <li role="none">
                <a href="/about" onClick={(e) => { e.preventDefault(); go('/about'); }} className={`navbar-link${isActive('/about') ? ' active' : ''}`} role="menuitem">About us</a>
              </li>
              <li role="none">
                <a href="/team" onClick={(e) => { e.preventDefault(); go('/team'); }} className={`navbar-link${isActive('/team') ? ' active' : ''}`} role="menuitem">Our Team</a>
              </li>
              <li role="none">
                <a href="/store" onClick={(e) => { e.preventDefault(); go('/store'); }} className={`navbar-link${isActive('/store') ? ' active' : ''}`} role="menuitem">Store</a>
              </li>
              <li role="none">
                <a href="/order" onClick={(e) => { e.preventDefault(); go('/order'); }} className={`navbar-link${isActive('/order') ? ' active' : ''}`} role="menuitem">Order</a>
              </li>
              {isCaregiver && (
                <li role="none">
                  <a href="/tags" onClick={(e) => { e.preventDefault(); go('/tags'); }} className={`navbar-link${isActive('/tags') ? ' active' : ''}`} role="menuitem">My Tags</a>
                </li>
              )}
              <li role="none">
                <a href="/contact" onClick={(e) => { e.preventDefault(); go('/contact'); }} className={`navbar-link${isActive('/contact') ? ' active' : ''}`} role="menuitem">Contact</a>
              </li>

              {isLoggedIn ? (
                <>
                  <li role="none">
                    <span className="navbar-link" style={{ color: '#6d28d9', fontWeight: '600', cursor: 'default' }} role="menuitem">
                      👤 {user?.username}
                    </span>
                  </li>
                  <li role="none">
                    <a href="/logout" onClick={(e) => { e.preventDefault(); handleLogout(); }} className="navbar-link" role="menuitem">
                      Logout
                    </a>
                  </li>
                </>
              ) : (
                <li role="none">
                  <a href="/login" onClick={(e) => { e.preventDefault(); go('/login'); }} className={`navbar-link${isActive('/login') ? ' active' : ''}`} role="menuitem">
                    Login / Register
                  </a>
                </li>
              )}
            </ul>

            {/* Action Buttons — Support Us first, dark mode toggle on the right */}
            <div className="navbar-actions">
              <a
                href="/donate"
                className="navbar-donate-btn"
                aria-label="Support our mission by donating"
                onClick={(e) => { e.preventDefault(); go('/donate'); }}
              >
                <span className="support-text">Support Us</span>
              </a>

              <button className="dark-mode-toggle" onClick={toggleDarkMode} aria-label="Toggle dark mode">
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
              <button className="dark-mode-toggle mobile-header-toggle" onClick={toggleDarkMode} aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
                <span className="toggle-icon">{darkMode ? '☀️' : '🌙'}</span>
              </button>
              <button className="mobile-drawer-close" aria-label="Close menu" onClick={() => setIsMobileMenuOpen(false)}>
                &times;
              </button>
            </div>
            <ul className="mobile-drawer-links">
              <li><a href="/" onClick={(e) => { e.preventDefault(); go('/'); }} className={`navbar-link${isActive('/') ? ' active' : ''}`}>Home</a></li>
              <li><a href="/about" onClick={(e) => { e.preventDefault(); go('/about'); }} className={`navbar-link${isActive('/about') ? ' active' : ''}`}>About us</a></li>
              <li><a href="/team" onClick={(e) => { e.preventDefault(); go('/team'); }} className={`navbar-link${isActive('/team') ? ' active' : ''}`}>Our Team</a></li>
              <li><a href="/store" onClick={(e) => { e.preventDefault(); go('/store'); }} className={`navbar-link${isActive('/store') ? ' active' : ''}`}>Store</a></li>
              <li><a href="/order" onClick={(e) => { e.preventDefault(); go('/order'); }} className={`navbar-link${isActive('/order') ? ' active' : ''}`}>Order</a></li>
              {isCaregiver && (
                <li><a href="/tags" onClick={(e) => { e.preventDefault(); go('/tags'); }} className={`navbar-link${isActive('/tags') ? ' active' : ''}`}>My Tags</a></li>
              )}
              <li><a href="/contact" onClick={(e) => { e.preventDefault(); go('/contact'); }} className={`navbar-link${isActive('/contact') ? ' active' : ''}`}>Contact</a></li>
              
              {isLoggedIn ? (
                <>
                  <li>
                    <span className="navbar-link" style={{ color: '#6d28d9', fontWeight: '600', cursor: 'default' }}>
                      👤 {user?.username}
                    </span>
                  </li>
                  <li>
                    <a href="/logout" onClick={(e) => { e.preventDefault(); handleLogout(); }} className="navbar-link">
                      Logout
                    </a>
                  </li>
                </>
              ) : (
                <li>
                  <a href="/login" onClick={(e) => { e.preventDefault(); go('/login'); }} className={`navbar-link${isActive('/login') ? ' active' : ''}`}>
                    Login / Register
                  </a>
                </li>
              )}
              
              <li>
                <a
                  href="/donate"
                  className="navbar-link mobile-support-link"
                  aria-label="Support our mission by donating"
                  onClick={(e) => { e.preventDefault(); go('/donate'); }}
                >
                  Support Us
                </a>
              </li>
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
