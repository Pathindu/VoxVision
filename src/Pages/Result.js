import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import '../Components/Result.css';

export default function Result({ darkMode, toggleDarkMode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isPlaying, setIsPlaying] = useState(false);
  const speechSynthesisRef = useRef(null);
  const [audioBlob, setAudioBlob] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Get result text from navigation state or use default
  const resultText = location.state?.resultText || "Detected: Rs. 1000 Note";
  const resultType = location.state?.resultType || "cash"; // 'cash' or 'document'

  const handleReadDocument = async (fullText) => {
    if (audioBlob.length > 0) {
      playAudio();
      return;
    }
    setIsLoading(true);
    setAudioBlob([]);
    // 1. Split into large blocks by script type
    const segments = fullText.match(/[\x00-\x7F]+|[^\x41-\x5A\x61-\x7A]+/g);
    
    if (!segments) {
      setIsLoading(false);
      return;
    }

    const fetchedBlobs = [];

    for (const segment of segments) {
      // Skip segments that are just whitespace
      if (!segment.trim()) continue;

      // 2. Determine the language of this specific chunk
      let lang = 'en-US'; // Default
      if ((/[\x41-\x5A\x61-\x7A]/.test(segment))) {
        lang = "en-US";
      } else lang = "si-LK"
      console.log(lang,": ", segment);
      
      // Wait for each segment to finish before starting the next
      const blob = await speakWithGoogleTTS(segment, lang);
      if (blob) {
        fetchedBlobs.push(blob);
      }
    }
    
    setAudioBlob(fetchedBlobs);
    setIsLoading(false);
    
    if (fetchedBlobs.length > 0) {
      await playAudioBlobs(fetchedBlobs);
    }
  };

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audio, setAudio] = useState(null);

  const speakWithGoogleTTS = async (text, lang) => {
    try {
      // 1. Call your Python backend endpoint
      const response = await fetch('http://localhost:8000/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text, lang_code: lang }),
      });

      if (!response.ok) throw new Error("Failed to get audio from backend");

      // 2. Convert the response to a Blob (Binary Large Object)
      const blob = await response.blob();
      return blob;

    } catch (error) {
      console.error("TTS Error:", error);
      setIsSpeaking(false);
      return null;
    }
  };

  const playAudioBlobs = async (blobs) => {
    if (!blobs || blobs.length === 0) {
      alert("No audio to play");
      return;
    }
    setIsSpeaking(true);
    for (const blob of blobs) {
      // 3. Create a temporary URL for the audio file
      const audioUrl = URL.createObjectURL(blob);
      
      // 4. Play the audio
      const newAudio = new Audio(audioUrl);
      setAudio(newAudio);
      
      await new Promise((resolve) => {
        newAudio.onended = () => {
          URL.revokeObjectURL(audioUrl); // Clean up memory
          resolve();
        };

        newAudio.play().catch(error => {
          console.error("Audio playback error:", error);
          resolve();
        });
      });
    }
    setIsSpeaking(false);
  };

  const playAudio = async () => {
    await playAudioBlobs(audioBlob);
  };

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
    // speakText(resultText);
    handleReadDocument(resultText);
  };

  const handlePause = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
    }
    if (isSpeaking){
      audio.pause();
      setIsSpeaking(false);
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
    // speakText(resultText);
    console.log(audioBlob.length);
    playAudio();
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
      <div className={`result-page-wrapper ${darkMode ? 'dark-mode' : ''}`}>
      {/* Navigation */}
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

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
                // disabled={!isPlaying}
                disabled={!isSpeaking}
              >
                <span className="audio-icon">⏸</span>
                <span className="audio-label">Pause</span>
              </button>

              <button 
                className="audio-btn play-btn" 
                onClick={handlePlay}
                disabled={isLoading}
              >
                <span className="audio-icon">{isLoading ? "⏳" : "▶"}</span>
                <span className="audio-label">{isLoading ? "Loading..." : "Play"}</span>
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

      <Footer darkMode={darkMode} />
    </div>
  );
}