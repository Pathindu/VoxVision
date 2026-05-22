import React from 'react';
import './Footer.css';

export default function Footer({ darkMode }) {
  // Define the Quick Links array
  const quickLinks = [
    { name: 'Home', href: '/' },
    { name: 'About Us', href: '/about' },
    { name: 'Our Team', href: '/team' },
    { name: 'Contact Us', href: '/contact' },
    { name: 'Order Now', href: '/order' },
  ];

  const contactIcons = [
    {
      id: 'email',
      svg: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>,
      label: "Email",
      href: "mailto:contact@smartreader.com"
    },
    {
      id: 'phone',
      svg: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>,
      label: "Phone",
      href: "tel:+15551234567"
    },
    {
      id: 'location',
      svg: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>,
      label: "Location",
      href: "https://maps.app.goo.gl/XDtvJXaA4XLghwWBA",
      target: "_blank"
    },
    {
      id: 'web',
      svg: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>,
      label: "Website",
      href: "/"
    }
  ];

  return (
    <footer className={`footer ${darkMode ? 'dark-mode' : ''}`}>
      <div className="footer-content">
        <div className="footer-grid">

          {/* Column 1: Brand */}
          <div className="footer-brand">
            <h2 className="footer-logo">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="brand-svg">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              <span>VoxVision</span>
            </h2>
            <p className="footer-tagline">
              Empowering visual independence with intelligent document and currency analysis.
            </p>
          </div>

          {/* Column 2: Quick Links Section */}
          <div className="footer-links">
            <h3 className="footer-heading">Quick Links</h3>
            <ul className="quick-links">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="quick-link"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact Us Section */}
          <div className="footer-contact">
            <h3 className="footer-heading">Contact Us</h3>

            <div className="contact-icons">
              {contactIcons.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  target={item.target || "_self"}
                  rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
                  className="contact-icon"
                  aria-label={item.label}
                >
                  {item.svg}
                </a>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="copyright-text">
            &copy; 2026 VoxVision. All rights reserved.
          </div>
          <div className="legal-links">
            <a
              href="https://gist.github.com/Sewmina-as/c4c895c356ce93bed8421de1f124e808"
              target="_blank"
              rel="noopener noreferrer"
              className="legal-link"
            >
              Privacy Policy
            </a>
            <a
              href="https://gist.github.com/Sewmina-as/fba828dcabad99c001d798ba4a130b73"
              target="_blank"
              rel="noopener noreferrer"
              className="legal-link"
            >
              Terms & Conditions
            </a>
            <a
              href="https://gist.github.com/Sewmina-as/a7a7959d570e3c4a4bdcab64e691a87c"
              target="_blank"
              rel="noopener noreferrer"
              className="legal-link"
            >
              Refund Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
