import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../Components/Navbar.css';

export default function Navbar({ darkMode, toggleDarkMode }) {
  const navigate = useNavigate();
  const { isLoggedIn, isCaregiver, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const go = (path) => { navigate(path); setMenuOpen(false); };

  const handleLogout = () => { logout(); navigate('/'); setMenuOpen(false); };

  return (
    <nav className={`navbar ${darkMode ? 'dark-mode' : ''}`}>
      <div className="navbar-content">

        {/* Logo */}
        <div className="navbar-logo" onClick={() => go('/')}>
          <span className="navbar-logo-icon">👁️</span>
          <span className="navbar-logo-text">VoxVision</span>
        </div>

        <div className="navbar-right">
          <ul className="navbar-links">
            <li><a href="/" onClick={(e) => { e.preventDefault(); go('/'); }} className="navbar-link">Home</a></li>
            <li><a href="/store" onClick={(e) => { e.preventDefault(); go('/store'); }} className="navbar-link">Store</a></li>
            {isCaregiver && (
              <li><a href="/tags" onClick={(e) => { e.preventDefault(); go('/tags'); }} className="navbar-link">My Tags</a></li>
            )}
            <li><a href="/contact" onClick={(e) => { e.preventDefault(); go('/contact'); }} className="navbar-link">Contact</a></li>

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
                <a href="/login" onClick={(e) => { e.preventDefault(); go('/login'); }} className="navbar-link">
                  Login / Register
                </a>
              </li>
            )}
          </ul>

          <button className="dark-mode-toggle" onClick={toggleDarkMode} aria-label="Toggle dark mode">
            <span className="toggle-icon">{darkMode ? '☀️' : '🌙'}</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
