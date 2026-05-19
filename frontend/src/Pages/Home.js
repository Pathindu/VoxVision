import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import '../Components/Home.css';

export default function Home({ darkMode, toggleDarkMode }) {
  const [activeSection, setActiveSection] = useState('home');
  const navigate = useNavigate();

  const handleUpload = () => {
    navigate('/upload');
  };

  const handleCapture = () => {
    navigate('/capture');
  };

  const handleOrder = () => {
    navigate('/order');
  };

  return (
    <>
    <div className={`home-container ${darkMode ? 'dark-mode' : ''}`}>
      {/* Navigation */}
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-flex">
            {/* Left Column - Slogan */}
            <div className="hero-left">
              <div className="hero-slogan-card">
                <div className="hero-slogan-content">
                  <h2 className="slogan-heading">
                    Redefining How<br />We Navigate.
                  </h2>
                  <p className="slogan-subheading">
                    <i>*Because reading belongs to everyone.*</i>
                  </p>
                  
                  <div className="slogan-actions">
                    <button onClick={handleOrder} className="slogan-btn primary-btn">
                      <span className="btn-icon">🏷️</span> Order Your Smart Tags
                    </button>
                    <button className="slogan-btn outline-btn">
                      <span className="btn-icon">🤍</span> Support the Mission
                    </button>
                  </div>
                  
                  <p className="slogan-description">
                    <strong>Voice &amp; Accessibility: The future is audible.</strong>
                    <br />
                    Access detailed product info, expiry dates, and<br />
                    usage instructions simply by tapping.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Brand & Actions */}
            <div className="hero-right">
              <img src="/voxvision-logo.png" alt="VoxVision Logo" className="hero-logo" />
              <h1 className="hero-title">
                Smart Cash & Document Reader
              </h1>
              <p className="hero-subtitle">
                Empowering Independence Through Technology
              </p>

              <div className="button-group">
                <button
                  onClick={handleUpload}
                  className="btn btn-upload"
                >
                  <span className="btn-icon">📁</span> Upload
                </button>
                <button
                  onClick={handleCapture}
                  className="btn btn-capture"
                >
                  <span className="btn-icon">📷</span> Capture
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-content">
          <h2 className="features-title">
            What We Offer
          </h2>

          <div className="feature-grid">
            {[
              {
                icon: '💵',
                title: 'Cash Reader',
                description: 'Identify currency notes instantly with high accuracy',
                cardClass: 'feature-card-1'
              },
              {
                icon: '📄',
                title: 'Document Reader',
                description: 'Read text aloud from any printed document',
                cardClass: 'feature-card-2'
              },
              {
                icon: '🎯',
                title: 'Voice Guide',
                description: 'Real-time camera alignment assistance',
                cardClass: 'feature-card-3'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className={`feature-card ${feature.cardClass}`}
                role="button"
                tabIndex="0"
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>

{/* Footer */}
    <Footer darkMode={darkMode} />
    </>
  );
}