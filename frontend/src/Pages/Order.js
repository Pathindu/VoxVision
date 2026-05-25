import React from 'react';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import '../Components/Order.css';

export default function Order({ darkMode, toggleDarkMode }) {
  return (
    <div className={`order-page-wrapper ${darkMode ? 'dark-mode' : 'light-theme'}`}>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <div className="order-container">
        <main className="order-content">
          <h1 className="order-title">Order Your Smart Tags</h1>
          <p className="order-description">Enhance your accessibility experience with our premium NFC smart tags.</p>

          <div className="order-grid">
            {/* Starter Pack Card */}
            <div className="order-card">
              <div>
                <div className="order-card-icon">🏷️</div>
                <h2 className="order-card-title">Starter Pack</h2>
                <div className="order-card-price">$9.99</div>
                <ul className="order-card-features">
                  <li>5 Smart NFC Tags</li>
                  <li>Custom audio labeling</li>
                  <li>Water-resistant coating</li>
                  <li>Standard adhesive backing</li>
                </ul>
              </div>
              <button className="order-now-btn" onClick={() => alert("Ordering is coming soon! Thank you for your patience.")}>
                Order Now
              </button>
            </div>

            {/* Standard Pack Card */}
            <div className="order-card">
              <div>
                <div className="order-card-icon">📦</div>
                <h2 className="order-card-title">Standard Pack</h2>
                <div className="order-card-price">$24.99</div>
                <ul className="order-card-features">
                  <li>15 Smart NFC Tags</li>
                  <li>Custom audio labeling</li>
                  <li>High-durability design</li>
                  <li>Extra strong adhesive</li>
                  <li>Priority App Syncing</li>
                </ul>
              </div>
              <button className="order-now-btn" onClick={() => alert("Ordering is coming soon! Thank you for your patience.")}>
                Order Now
              </button>
            </div>

            {/* Value Pack Card */}
            <div className="order-card">
              <div>
                <div className="order-card-icon">💎</div>
                <h2 className="order-card-title">Value Pack</h2>
                <div className="order-card-price">$44.99</div>
                <ul className="order-card-features">
                  <li>30 Smart NFC Tags</li>
                  <li>Custom audio labeling</li>
                  <li>Multi-surface durability</li>
                  <li>Tactile orientation rings</li>
                  <li>Lifetime premium updates</li>
                </ul>
              </div>
              <button className="order-now-btn" onClick={() => alert("Ordering is coming soon! Thank you for your patience.")}>
                Order Now
              </button>
            </div>
          </div>
        </main>
      </div>

      <Footer darkMode={darkMode} />
    </div>
  );
}
