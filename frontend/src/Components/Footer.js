import React from 'react';
import '../Components/Footer.css';

export default function Footer({ darkMode }) {
  // Define the Quick Links array
  const quickLinks = [
    { name: 'Home', href: '/' },
    { name: 'About Us', href: '/about-us' }, // Example: assuming an '/about-us' route
    { name: 'Contact Us', href: '/contact' }, // Key change: Pointing to the specific '/contact' route
  ];

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
              {/* NOTE: You should ideally replace these placeholders with actual contact data */}
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
              {quickLinks.map((link) => (
                <li key={link.name}>
                  {/* FIX: Removed the nested <a> tags */}
                  <a
                    href={link.href}
                    className="quick-link"
                  >
                    <span className="arrow">→</span> {link.name}
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