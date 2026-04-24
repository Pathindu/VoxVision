import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import '../Components/Result.css';

export default function Result({ darkMode, toggleDarkMode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audio, setAudio] = useState(null);
  const [audioSrc, setAudioSrc] = useState(null);
  
  // Get result text from navigation state or use default
  const resultText = location.state?.resultText || "Detected: Rs. 1000 Note";
  const resultType = location.state?.resultType || "cash"; // 'cash' or 'document'

  useEffect(() => {
    handleReadDocument(resultText);
  }, [])

  const handleReadDocument = async (fullText) => {
    setIsLoading(true);
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
    
    createAudio(fetchedBlobs);
    setIsLoading(false);
  };

  const createAudio = (blobs) => {
    const combinedBlobs = new Blob(blobs, { type: 'audio/mpeg' });
    const audioUrl = URL.createObjectURL(combinedBlobs);
    const audio = new Audio(audioUrl);
    setAudio(audio);
    URL.revokeObjectURL(audioSrc); // Clean up memory
    setAudioSrc(audioUrl);
  }

  const playAudio = async () => {
    setIsSpeaking(true)
    await new Promise((resolve) => {
      if (isPaused){
        setIsPaused(false)
        audio.currentTime = audio.currentTime - 2;
        audio.play().catch(error => {
          console.error("Audio playback error:", error);
          resolve();
        });
      }
      else {
        audio.currentTime = 0;
        audio.play().catch(error => {
          console.error("Audio playback error:", error);
          resolve();
        });
      }
    });
    setIsSpeaking(false)
  };

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

  const handlePlay = () => {
    if (audioSrc) playAudio();
    else alert("No audio to play. Please wait for the audio to be generated.");
  };

  const handlePause = () => {
    if (isSpeaking){
      audio.pause();
      setIsSpeaking(false);
      setIsPaused(true);
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
    setIsPaused(false)
    audio.currentTime = 0;
    playAudio();
  };

  const handleDownload = () => {
    if (!audioSrc) {
      alert("No audio to download")
      return 
    }
    const link = document.createElement('a');
    link.href = audioSrc;
    link.download = `${resultType}-audio-${Date.now()}.mp3`;
    link.click();

    // Create a text file and download
    // const element = document.createElement('a');
    // const file = new Blob([resultText], { type: 'text/plain' });
    // element.href = URL.createObjectURL(file);
    // element.download = `${resultType}-result-${Date.now()}.txt`;
    // document.body.appendChild(element);
    // element.click();
    // document.body.removeChild(element);
  };

  const handleProcessAnother = () => {
    // Stop any ongoing speech
    if (isSpeaking){
      audio.pause();
    }
    setIsSpeaking(false);
    setIsPaused(false);
    
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
                disabled={isLoading || !isSpeaking}
              >
                <span className="audio-icon">⏸</span>
                <span className="audio-label">Pause</span>
              </button>

              <button 
                className="audio-btn play-btn" 
                onClick={handlePlay}
                disabled={isLoading || isSpeaking}
              >
                <span className="audio-icon">{isLoading ? "⏳" : "▶"}</span>
                <span className="audio-label">{isLoading ? "Loading..." : "Play"}</span>
              </button>

              <button 
                className="audio-btn repeat-btn" 
                onClick={handleRepeat}
                disabled={isLoading}
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