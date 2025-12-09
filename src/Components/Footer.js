import React from 'react';
import '../Components/Footer.css';

export default function Footer({ darkMode }) {
  return (
    <footer className={`footer ${darkMode ? 'dark-mode' : ''}`}>
      <div className="footer-content">
        <div className="footer-grid">
          {/* Contact Us Section */}
          <div className="footer-contact">
            <h3 className="footer-heading">Contact Us</h3>
            <p className="footer-text">
              We're here to help! Reach out to us for any questions, support, or feedback about our Smart Reader application.
            </p>
            
            <div className="contact-icons">
              {['📧', '📞', '📍', '🌐'].map((icon, index) => (
                <div
                  key={index}
                  className="contact-icon"
                >
                  <span>{icon}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links Section */}
                <div className="footer-links">
                <h3 className="footer-heading">Quick Links</h3>
                <ul className="quick-links">
                  {['Home', 'About Us', 'Contact Us'].map((link) => (
                  <li key={link}>
                    <a
                    href={link === 'Home' ? '/' : `#${link.toLowerCase().replace(/\s+/g, '-')}`}
                    className="quick-link"
                    >
                    <span className="arrow">→</span> {link}
                    </a>
                  </li>
                  ))}
                </ul>
                </div>
              </div>

              {/* Footer Bottom */}
        <div className="footer-bottom">
          <p className="copyright">&copy; 2025 Smart Cash & Document Reader. All rights reserved.</p>
          <p className="university">University of Kelaniya</p>
        </div>
      </div>
    </footer>
  );
}