import React from 'react';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import '../Components/Contact.css';

export default function ContactUs({ darkMode, toggleDarkMode }) {
  // Utility to parse, encode, and enforce absolute URLs securely
  const buildSecureUrl = (rawUrl) => {
    if (!rawUrl || typeof rawUrl !== 'string') return '#';
    try {
      let urlString = rawUrl.trim();
      if (!urlString.startsWith('http://') && !urlString.startsWith('https://')) {
        urlString = `https://${urlString}`;
      }
      urlString = urlString.replace(/\/{2,}$/, '/');
      if (urlString.endsWith('/')) {
        urlString = urlString.slice(0, -1);
      }
      const url = new URL(urlString);
      return url.toString();
    } catch (error) {
      console.error('Invalid URL format:', error);
      return '#';
    }
  };

  return (
    <div className={`contact-page-wrapper ${darkMode ? 'dark-mode' : 'light-theme'}`}>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <main className="contact-container">
        <div className="contact-content">
          {/* Header Section */}
          <header className="contact-header">
            <h1 className="contact-title">Contact Us</h1>
            <p className="contact-subtitle">
              Get in touch with our team for any inquiries or support
            </p>
          </header>

          {/* Contact Information Section */}
          <section className="contact-info-section">
            <div className="contact-info-grid">
              <a
                href="mailto:contact@smartreader.com"
                aria-label="Email Us at contact@smartreader.com"
                className="info-card info-card-link"
              >
                <div className="info-icon">📧</div>
                <h3>Email Us</h3>
                <p>contact@smartreader.com</p>
              </a>
              <a
                href="tel:+15551234567"
                aria-label="Call Us at +1 (555) 123-4567"
                className="info-card info-card-link"
              >
                <div className="info-icon">📞</div>
                <h3>Call Us</h3>
                <p>+1 (555) 123-4567</p>
              </a>
              <a
                href={buildSecureUrl("https://maps.app.goo.gl/XDtvJXaA4XLghwWBA//")}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit Us: Open University of Kelaniya location in Google Maps"
                className="info-card info-card-link"
              >
                <div className="info-icon">📍</div>
                <h3>Visit Us</h3>
                <p>University of Kelaniya, Sri Lanka</p>
              </a>
            </div>
          </section>
        </div>
      </main>

      <Footer darkMode={darkMode} />
    </div>
  );
}