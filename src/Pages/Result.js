import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import '../Components/Result.css';

export default function Result() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isPlaying, setIsPlaying] = useState(false);
  const speechSynthesisRef = useRef(null);
  
  // Get result text from navigation state or use default
  const resultText = location.state?.resultText || "Detected: Rs. 1000 Note";
  const resultType = location.state?.resultType || "cash"; // 'cash' or 'document'

  // Text-to-Speech functions
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      
      speechSynthesisRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Text-to-speech is not supported in your browser');
    }
  };

  const handlePlay = () => {
    speakText(resultText);
  };

  const handlePause = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
    }
  };

  const handlePrev = () => {
    // Navigate to previous section of text
    alert('Previous feature - Navigate to previous section');
  };

  const handleNext = () => {
    // Navigate to next section of text
    alert('Next feature - Navigate to next section');
  };

  const handleRepeat = () => {
    window.speechSynthesis.cancel();
    speakText(resultText);
  };

  const handleDownload = () => {
    // Create a text file and download
    const element = document.createElement('a');
    const file = new Blob([resultText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${resultType}-result-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleProcessAnother = () => {
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    
    // Navigate back to home
    navigate('/');
  };

  return (
    <div className="result-page-wrapper">
      <Navbar />

      <div className="result-container">
        <div className="result-content">
          <h1 className="result-page-title">Results</h1>

          {/* Result Display Box */}
          <div className="result-box">
            <p className="result-text">{resultText}</p>
          </div>

          {/* Audio Controls */}
          <div className="audio-controls-section">
            <h2 className="audio-title">Audio Controls</h2>
            
            <div className="audio-buttons">
              <button 
                className="audio-btn pause-btn" 
                onClick={handlePause}
                disabled={!isPlaying}
              >
                <span className="audio-icon">⏸</span>
                <span className="audio-label">Pause</span>
              </button>

              <button 
                className="audio-btn play-btn" 
                onClick={handlePlay}
              >
                <span className="audio-icon">▶</span>
                <span className="audio-label">Play</span>
              </button>

              <button 
                className="audio-btn repeat-btn" 
                onClick={handleRepeat}
              >
                <span className="audio-icon">🔁</span>
                <span className="audio-label">Repeat</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button className="action-btn download-btn" onClick={handleDownload}>
              <span className="action-icon">📥</span>
              <span className="action-text">DOWNLOAD</span>
            </button>

            <button className="action-btn process-another-btn" onClick={handleProcessAnother}>
              <span className="action-icon">🔄</span>
              <span className="action-text">PROCESS ANOTHER</span>
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}