import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import '../Components/Capture.css';

export default function Capture({ darkMode, toggleDarkMode }) {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  
  const checkBackend = async () => {
    try {
      const backend = await fetch("http://localhost:8000/");
      const data = await backend.json();
      console.log(data);
    } catch (error) {
      console.log(error);
      alert("Backend is not running. Please start the backend.");
    }
  };

  useEffect(() => {
    checkBackend();
  }, [])

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions.');
    }
  };

  // Capture image
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageData = canvas.toDataURL('image/png');
      setCapturedImage(imageData);
      
      // Stop camera
      const stream = video.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      setIsCameraActive(false);
    }
  };

  // Retake photo
  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  // Handle Cash Reader - Navigate to Result page
  const handleCashReader = async () => {
    setLoading(true);
    // Convert the base64 data URL to a File object
    const res = await fetch(capturedImage);
    const blob = await res.blob();
    const file = new File([blob], "capture.png", { type: "image/png" });
    
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('http://localhost:8000/cash-to-text/', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    console.log("Extracted Text:", data.result);

    navigate('/result', {
      state: {
        resultText: data.result,
        resultType: 'document'
      }
      // state: {
      //   resultText: 'Detected: Rs. 1000 Note',
      //   resultType: 'cash'
      // }
    });
    setLoading(false);
  };

  // Handle Document Reader - Navigate to Result page
  const handleDocumentReader = async () => {
    setLoading(true);
    // Convert the base64 data URL to a File object
    const res = await fetch(capturedImage);
    const blob = await res.blob();
    const file = new File([blob], "capture.png", { type: "image/png" });
    
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('http://localhost:8000/image-to-text/', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    console.log("Extracted Text:", data.result);

    navigate('/result', {
      state: {
        resultText: data.result,
        resultType: 'document'
      }
      // state: {
      //   resultText: 'The quick brown fox jumps over the lazy dog. This is a sample text extracted from the captured image.',
      //   resultType: 'document'
      // }
    });
    setLoading(false);
  };

  // Start camera on component mount
  React.useEffect(() => {
    startCamera();
    
    return () => {
      // Cleanup: stop camera when component unmounts
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  return (
      <div className={`capture-page-wrapper ${darkMode ? 'dark-mode' : ''}`}>
      {/* Navigation */}
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <div className="capture-container">
        <div className="capture-content">
          <h1 className="capture-title">Capture</h1>

          {/* Camera View */}
          <div className="camera-section">
            <div className="camera-header">
              <span className="camera-icon">📷</span>
              <span className="camera-label">CAMERA VIEW</span>
            </div>

            <div className="camera-view">
              {!capturedImage ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="video-stream"
                  />
                  <div className="focus-frame">
                    <div className="corner top-left"></div>
                    <div className="corner top-right"></div>
                    <div className="corner bottom-left"></div>
                    <div className="corner bottom-right"></div>
                  </div>
                </>
              ) : (
                <img src={capturedImage} alt="Captured" className="captured-image" />
              )}
            </div>

            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {/* Capture Button */}
            {!capturedImage ? (
              <button className="capture-button" onClick={captureImage}>
                CAPTURE
              </button>
            ) : (
              <button className="capture-button retake-button" onClick={retakePhoto}>
                RETAKE
              </button>
            )}
          </div>

          {/* Processing Options */}
          {capturedImage && (
            <div className="processing-section">
              <h2 className="processing-title">Processing Options</h2>
              <div className="processing-buttons">
                <button className="process-btn cash-btn" onClick={handleCashReader} disabled={loading}>
                  {loading ? (
                    <span className="loader-capture"></span>
                  ) : (
                    <span className="btn-icon">💰</span>
                  )}
                  <span className="btn-text">{loading ? 'PROCESSING...' : 'CASH READER'}</span>
                </button>
                <button className="process-btn document-btn" onClick={handleDocumentReader} disabled={loading}>
                  {loading ? (
                    <span className="loader-capture"></span>
                  ) : (
                    <span className="btn-icon">📄</span>
                  )}
                  <span className="btn-text">{loading ? 'PROCESSING...' : 'DOCUMENT READER'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer darkMode={darkMode} />
    </div>
  );
}