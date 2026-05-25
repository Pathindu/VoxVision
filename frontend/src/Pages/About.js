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
      Our Vision.
      To engineer a barrier-free digital ecosystem that redefines independence for the blind and visually impaired community. We envision a world where visual limitations no longer restrict personal autonomy or confidence. By breaking down the walls of daily informational exclusion, our goal is to guarantee every individual seamless access to the printed word, autonomous financial navigation, and equal life opportunities through innovative, intuitively designed assistive technologies that effortlessly bridge the gap between perception and reality.
      Our Mission.
      Our mission is to engineer an accessible, highly dependable, and voice-guided ecosystem tailored specifically to alleviate daily communication and transactional challenges. By integrating sophisticated computer vision, multi-lingual OCR pipelines supporting English and Sinhala, and smart camera alignment tracking into a streamlined web interface, we aim to deliver immediately practical, dignified, and empowering solutions for the visually impaired community in Sri Lanka.
      What We Built For You.
      First, Cash Reader. Instant and High-Accuracy Currency Identification. Financial independence is a cornerstone of autonomous living. The Cash Reader module eliminates the uncertainty visually impaired individuals experience during daily transactions by offering real-time, highly accurate banknote recognition. Powered by advanced computer vision architectures, this tool processes currency notes instantly under diverse environmental variables—including fluctuating light conditions, skewed angles, and complex backgrounds. Upon detection, the application securely broadcasts clear audio feedback of the denomination, empowering users to conduct financial exchanges with absolute privacy and confidence.
      Second, Document Reader. Seamless Printed-Text Translation to Audio. Access to printed literature, personal mail, and informational notices should never be a barrier. The Document Reader serves as an intelligent text-to-audio pipeline designed to transform any physical document into an audible format. Utilizing cutting-edge Optical Character Recognition (OCR) combined with robust image preprocessing routines—which automatically rectify page tilts, normalize contrast, and suppress background noise—the system cleanly extracts text from complex document surfaces. The output is then dynamically synthesized into natural-sounding speech, fully supporting both English and Sinhala languages to bridge the local accessibility gap.
      Third, Voice Guide. Real-Time Camera Alignment and Quality Assistance. One of the most persistent hurdles for visually impaired individuals when interacting with vision-based technology is capturing a perfectly framed image without visual feedback. The Voice Guide functions as an intelligent, real-time photographic assistant that bridges this gap. By continuously monitoring the camera feed for motion blur, framing issues, and edge alignment, the module provides immediate, interactive vocal navigation. It guides the user to adjust their device posture dynamically, ensuring optimal image quality is achieved for flawless text extraction and currency analysis.
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
    <div className={`about-page-wrapper ${darkMode ? 'dark-mode' : 'light-theme'}`}>
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
          {/* Card 1: Vision & Mission split visual blocks */}
          <div className="about-split-cards">
            <section className="about-card vision-card" tabIndex="0" aria-label="Our Vision">
              <h2>Our Vision</h2>
              <p>
                To engineer a barrier-free digital ecosystem that redefines independence for the blind and visually impaired community. We envision a world where visual limitations no longer restrict personal autonomy or confidence. By breaking down the walls of daily informational exclusion, our goal is to guarantee every individual seamless access to the printed word, autonomous financial navigation, and equal life opportunities through innovative, intuitively designed assistive technologies that effortlessly bridge the gap between perception and reality.
              </p>
            </section>

            <section className="about-card mission-card" tabIndex="0" aria-label="Our Mission">
              <h2>Our Mission</h2>
              <p>
                Our mission is to engineer an accessible, highly dependable, and voice-guided ecosystem tailored specifically to alleviate daily communication and transactional challenges. By integrating sophisticated computer vision, multi-lingual OCR pipelines supporting English and Sinhala, and smart camera alignment tracking into a streamlined web interface, we aim to deliver immediately practical, dignified, and empowering solutions for the visually impaired community in Sri Lanka.
              </p>
            </section>
          </div>

          {/* Card 2: What We Built For You */}
          <section className="about-features-section" aria-label="What We Built For You">
            <h2 className="section-title" tabIndex="0">What We Built For You</h2>

            <div className="about-feature-cards">
              {/* Feature 1 */}
              <div id="cash-reader" className="about-feature-card" tabIndex="0" aria-label="Cash Reader feature">
                <div className="feature-icon-wrapper" aria-hidden="true">💵</div>
                <div className="feature-text-wrapper">
                  <h3>Cash Reader</h3>
                  <h4 style={{ color: '#67e8f9', marginTop: '0', marginBottom: '0.75rem', fontWeight: '600' }}>
                    Instant & High-Accuracy Currency Identification
                  </h4>
                  <p>
                    Financial independence is a cornerstone of autonomous living. The Cash Reader module eliminates the uncertainty visually impaired individuals experience during daily transactions by offering real-time, highly accurate banknote recognition. Powered by advanced computer vision architectures, this tool processes currency notes instantly under diverse environmental variables—including fluctuating light conditions, skewed angles, and complex backgrounds. Upon detection, the application securely broadcasts clear audio feedback of the denomination, empowering users to conduct financial exchanges with absolute privacy and confidence.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div id="document-reader" className="about-feature-card" tabIndex="0" aria-label="Document Reader feature">
                <div className="feature-icon-wrapper" aria-hidden="true">📄</div>
                <div className="feature-text-wrapper">
                  <h3>Document Reader</h3>
                  <h4 style={{ color: '#67e8f9', marginTop: '0', marginBottom: '0.75rem', fontWeight: '600' }}>
                    Seamless Printed-Text Translation to Audio
                  </h4>
                  <p>
                    Access to printed literature, personal mail, and informational notices should never be a barrier. The Document Reader serves as an intelligent text-to-audio pipeline designed to transform any physical document into an audible format. Utilizing cutting-edge Optical Character Recognition (OCR) combined with robust image preprocessing routines—which automatically rectify page tilts, normalize contrast, and suppress background noise—the system cleanly extracts text from complex document surfaces. The output is then dynamically synthesized into natural-sounding speech, fully supporting both English and Sinhala languages to bridge the local accessibility gap.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div id="voice-guide" className="about-feature-card" tabIndex="0" aria-label="Voice Guide feature">
                <div className="feature-icon-wrapper" aria-hidden="true">🎧</div>
                <div className="feature-text-wrapper">
                  <h3>Voice Guide</h3>
                  <h4 style={{ color: '#67e8f9', marginTop: '0', marginBottom: '0.75rem', fontWeight: '600' }}>
                    Real-Time Camera Alignment & Quality Assistance
                  </h4>
                  <p>
                    One of the most persistent hurdles for visually impaired individuals when interacting with vision-based technology is capturing a perfectly framed image without visual feedback. The Voice Guide functions as an intelligent, real-time photographic assistant that bridges this gap. By continuously monitoring the camera feed for motion blur, framing issues, and edge alignment, the module provides immediate, interactive vocal navigation. It guides the user to adjust their device posture dynamically, ensuring optimal image quality is achieved for flawless text extraction and currency analysis.
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
