import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import '../Components/About.css';

export default function About({ darkMode, toggleDarkMode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const location = useLocation();

  // Clean up speech synthesis when component unmounts
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Handle hash scrolling on path/hash changes
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        const timer = setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus();
        }, 150);
        return () => clearTimeout(timer);
      }
    }
  }, [location]);

  const startTTS = () => {
    window.speechSynthesis.cancel();

    const textToRead = `
      About Us.
      Empowering Vision, Enabling Independence.
      Introduction.
      Welcome to our platform. We are a dedicated team of Computer Science students committed to breaking down everyday barriers. Our smart assistive web application is designed to give visually impaired individuals total confidence in handling their finances and accessing printed information.
      Our Vision.
      A world where visual impairment is no longer a barrier to financial independence, education, and daily communication. We envision an inclusive society where technology bridges the gap, allowing everyone to live with autonomy and dignity.
      Our Mission.
      To provide a smart, affordable, and highly accurate web-based solution that seamlessly integrates into the daily lives of visually impaired users. By leveraging advanced AI, we aim to make reading documents and identifying Sri Lankan currency an effortless, independent experience.
      What We Built For You.
      First, The Smart Cash Reader. Never second-guess your transactions. Powered by advanced API technology, our Cash Reader accurately identifies Sri Lankan currency notes from LKR 20 to 5000 under various lighting conditions. Simply point your camera, and the system will instantly announce the denomination aloud, ensuring your financial security.
      Second, The Hard Copy Reader. Bringing printed words to life. Whether it is a letter, a book, or a printed bill, our Document Reader quickly scans the text and converts it into clear, natural-sounding speech. We optimized the system to process information rapidly, giving you immediate access to the written world around you.
      Third, Voice-Guided Navigation. You are never lost on our platform. From the moment you open the application, our built-in Voice Guidance system walks you through every step. It provides real-time audio feedback, helping you locate buttons, align your camera correctly, and navigate the interface without needing to rely on a screen.
    `;

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 1.0;

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const stopTTS = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  const togglePauseTTS = () => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  return (
    <div className={`about-page-wrapper ${darkMode ? 'dark-mode' : ''}`}>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <main className="about-container" id="main-content">
        {/* Massive locatable Audio Player Header */}
        <div className="audio-control-bar" aria-label="Audio Reader Controls">
          {!isPlaying ? (
            <button 
              className="audio-btn start-btn" 
              onClick={startTTS}
              aria-label="Read this page aloud"
            >
              🔊 Read This Page Aloud
            </button>
          ) : (
            <div className="audio-control-group">
              <button 
                className="audio-btn pause-btn" 
                onClick={togglePauseTTS}
                aria-label={isPaused ? "Resume reading page text" : "Pause reading page text"}
              >
                {isPaused ? "▶️ Resume" : "⏸️ Pause"}
              </button>
              <button 
                className="audio-btn stop-btn" 
                onClick={stopTTS}
                aria-label="Stop reading page text"
              >
                ⏹️ Stop Reading
              </button>
            </div>
          )}
        </div>

        {/* Header Section */}
        <header className="about-header">
          <h1 className="about-main-title" tabIndex="0">
            Empowering Vision, Enabling Independence.
          </h1>
        </header>

        {/* Content Sections */}
        <div className="about-content-grid">
          {/* Card 1: Intro */}
          <section className="about-card intro-card" tabIndex="0" aria-label="Introduction">
            <p>
              Welcome to our platform. We are a dedicated team of Computer Science students committed to breaking down everyday barriers. Our smart assistive web application is designed to give visually impaired individuals total confidence in handling their finances and accessing printed information.
            </p>
          </section>

          {/* Card 2: Vision & Mission split visual blocks */}
          <div className="about-split-cards">
            <section className="about-card vision-card" tabIndex="0" aria-label="Our Vision">
              <h2>Our Vision</h2>
              <p>
                A world where visual impairment is no longer a barrier to financial independence, education, and daily communication. We envision an inclusive society where technology bridges the gap, allowing everyone to live with autonomy and dignity.
              </p>
            </section>

            <section className="about-card mission-card" tabIndex="0" aria-label="Our Mission">
              <h2>Our Mission</h2>
              <p>
                To provide a smart, affordable, and highly accurate web-based solution that seamlessly integrates into the daily lives of visually impaired users. By leveraging advanced AI, we aim to make reading documents and identifying Sri Lankan currency an effortless, independent experience.
              </p>
            </section>
          </div>

          {/* Card 3: What We Built For You */}
          <section className="about-features-section" aria-label="What We Built For You">
            <h2 className="section-title" tabIndex="0">What We Built For You</h2>

            <div className="about-feature-cards">
              {/* Feature 1 */}
              <div id="cash-reader" className="about-feature-card" tabIndex="0" aria-label="The Smart Cash Reader feature">
                <div className="feature-icon-wrapper" aria-hidden="true">💵</div>
                <div className="feature-text-wrapper">
                  <h3>The Smart Cash Reader</h3>
                  <p>
                    Never second-guess your transactions. Powered by advanced API technology, our Cash Reader accurately identifies Sri Lankan currency notes (from LKR 20 to 5000) under various lighting conditions. Simply point your camera, and the system will instantly announce the denomination aloud, ensuring your financial security.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div id="document-reader" className="about-feature-card" tabIndex="0" aria-label="The Hard Copy Reader feature">
                <div className="feature-icon-wrapper" aria-hidden="true">📄</div>
                <div className="feature-text-wrapper">
                  <h3>The Hard Copy Reader</h3>
                  <p>
                    Bringing printed words to life. Whether it is a letter, a book, or a printed bill, our Document Reader quickly scans the text and converts it into clear, natural-sounding speech. We optimized the system to process information rapidly, giving you immediate access to the written world around you.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div id="voice-guide" className="about-feature-card" tabIndex="0" aria-label="Voice-Guided Navigation feature">
                <div className="feature-icon-wrapper" aria-hidden="true">🎧</div>
                <div className="feature-text-wrapper">
                  <h3>Voice-Guided Navigation</h3>
                  <p>
                    You are never lost on our platform. From the moment you open the application, our built-in Voice Guidance system walks you through every step. It provides real-time audio feedback, helping you locate buttons, align your camera correctly, and navigate the interface without needing to rely on a screen.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer darkMode={darkMode} />
    </div>
  );
}
