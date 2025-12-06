import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import '../Components/Home.css';

export default function Home() {
  const [activeSection, setActiveSection] = useState('home');
  const navigate = useNavigate();

  const handleUpload = () => {
    navigate('/upload');
  };

  const handleCapture = () => {
    navigate('/capture');
  };

  return (
    <>
    <div className="home-container">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-grid">
            {/* Left Side - Description */}
            <div className="hero-left">
              <div className="description-box">
                <p className="description-text">
                  Our <span className="highlight">Smart Cash & Document Reader</span> is a revolutionary web application designed specifically for visually impaired individuals. Using advanced OCR technology and intelligent voice guidance, we help users independently read printed documents and identify currency notes.
                </p>
              </div>
            </div>

            {/* Right Side - Main Content */}
            <div className="hero-right">
              <div className="phone-icon">📱</div>
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
    <Footer/>
    </>
  );
}