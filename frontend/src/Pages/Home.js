import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import '../Components/Home.css';

export default function Home({ darkMode, toggleDarkMode }) {
  const navigate = useNavigate();

  const handleUpload = () => navigate('/upload');
  const handleCapture = () => navigate('/capture');
  const handleOrder = () => navigate('/order');

  return (
    <>
      {/* Skip-to-main for keyboard / screen-reader users */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <div className={`home-container ${darkMode ? 'dark-mode' : 'light-theme'}`}>
        {/* Ambient glow blobs — decorative only */}
        <div className="ambient-blob ambient-blob-1" aria-hidden="true" role="presentation"></div>
        <div className="ambient-blob ambient-blob-2" aria-hidden="true" role="presentation"></div>
        <div className="ambient-blob ambient-blob-3" aria-hidden="true" role="presentation"></div>

        {/* ── Site Header ──────────────────────────────────── */}
        <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

        {/* ── Main Content ─────────────────────────────────── */}
        <main id="main-content" tabIndex="-1">

          {/* ══════════════════════════════════════════════════
              HERO SECTION — two-column dashboard layout
          ══════════════════════════════════════════════════ */}
          <section className="hero-section" aria-labelledby="hero-heading">
            <div className="hero-content">
              <div className="hero-dashboard">

                {/* ── LEFT COLUMN — Info & Secondary Actions ── */}
                <article
                  className="hero-info-card"
                  aria-label="About VoxVision"
                >
                  <div className="hero-info-inner">
                    <h2 className="info-heading">
                      Redefining How<br />We Navigate
                    </h2>
                    <h3 className="info-subheading">
                      Smart Cash &amp; Document Reader
                    </h3>
                    <p className="info-description">
                      <span className="info-description-highlight">
                        Voice &amp; Accessibility: The future is audible.
                      </span>
                      <span className="info-description-body">
                        Access detailed product info, expiry dates, and usage
                        instructions simply by tapping.
                      </span>
                    </p>
                    <div className="info-actions" role="group" aria-label="Secondary actions">
                      <button
                        onClick={handleOrder}
                        className="slogan-btn primary-btn"
                        aria-label="Order VoxVision Smart Tags"
                        type="button"
                      >
                        <span className="btn-icon" aria-hidden="true">🏷️</span>
                        Order Your Smart Tags
                      </button>
                      <button
                        className="slogan-btn outline-btn"
                        aria-label="Support the VoxVision mission"
                        type="button"
                      >
                        <span className="btn-icon" aria-hidden="true">🤍</span>
                        Support the Mission
                      </button>
                    </div>
                  </div>
                </article>

                {/* ── RIGHT COLUMN — Core App Interface ─────── */}
                <article
                  className="hero-app-card"
                  aria-label="VoxVision — primary actions"
                >
                  <img
                    src="/voxvision-logo.png"
                    alt="VoxVision — empowering independence through technology"
                    className="hero-logo"
                  />
                  <h1 id="hero-heading" className="hero-title">
                    Because reading belongs to everyone.
                  </h1>
                  <p className="hero-subtitle">
                    Empowering Independence Through Technology
                  </p>
                  <div className="button-group" role="group" aria-label="Primary actions">
                    <button
                      onClick={handleCapture}
                      className="btn btn-capture"
                      aria-label="Capture a new document using your camera"
                      type="button"
                    >
                      <span className="btn-icon" aria-hidden="true">📷</span>
                      <span>Capture</span>
                    </button>
                    <button
                      onClick={handleUpload}
                      className="btn btn-upload"
                      aria-label="Upload an existing document from your device"
                      type="button"
                    >
                      <span className="btn-icon" aria-hidden="true">📁</span>
                      <span>Upload</span>
                    </button>
                  </div>
                </article>

              </div>
            </div>
          </section>

          {/* ── Features Section ──────────────────────────── */}
          <section className="features-section" aria-labelledby="features-heading">
            <div className="features-content">
              <h2 id="features-heading" className="features-title">What We Offer</h2>
              <ul className="feature-grid" role="list" aria-label="VoxVision features">
                {[
                  {
                    icon: '💵', title: 'Cash Reader',
                    description: 'Identify currency notes instantly with high accuracy',
                    cardClass: 'feature-card-1', link: '/about#cash-reader',
                    ariaLabel: 'Learn about Cash Reader — identify currency notes instantly'
                  },
                  {
                    icon: '📄', title: 'Document Reader',
                    description: 'Read text aloud from any printed document',
                    cardClass: 'feature-card-2', link: '/about#document-reader',
                    ariaLabel: 'Learn about Document Reader — read text aloud from any printed document'
                  },
                  {
                    icon: '🎯', title: 'Voice Guide',
                    description: 'Real-time camera alignment assistance',
                    cardClass: 'feature-card-3', link: '/about#voice-guide',
                    ariaLabel: 'Learn about Voice Guide — real-time camera alignment assistance'
                  }
                ].map((feature, index) => (
                  <li key={index} className="feature-list-item">
                    <div
                      className={`feature-card ${feature.cardClass}`}
                      role="button" tabIndex="0"
                      aria-label={feature.ariaLabel}
                      onClick={() => navigate(feature.link)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          navigate(feature.link);
                        }
                      }}
                    >
                      <div className="feature-icon" aria-hidden="true">{feature.icon}</div>
                      <h3 className="feature-title">{feature.title}</h3>
                      <p className="feature-description">{feature.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>

        </main>
      </div>

      <Footer darkMode={darkMode} />
    </>
  );
}