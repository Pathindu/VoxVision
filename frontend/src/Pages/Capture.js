import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import '../Components/Capture.css';

export default function Capture({ darkMode, toggleDarkMode }) {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage,  setCapturedImage]  = useState(null);
  const [loadingCash,    setLoadingCash]    = useState(false);
  const [loadingDoc,     setLoadingDoc]     = useState(false);
  const [error,          setError]          = useState(null);

  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const navigate  = useNavigate();

  // ── Camera ────────────────────────────────────────────────────────────
  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      setIsCameraActive(false);
    }
  };

  useEffect(() => {
    startCamera();
    return stopCamera;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas  = canvasRef.current;
    const video   = videoRef.current;
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    setCapturedImage(canvas.toDataURL('image/png'));
    stopCamera();
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  // ── Submit to backend ─────────────────────────────────────────────────
  const submitImage = async (endpoint, type) => {
    setError(null);
    if (type === 'cash') setLoadingCash(true); else setLoadingDoc(true);
    try {
      const res    = await fetch(capturedImage);
      const blob   = await res.blob();
      const file   = new File([blob], 'capture.png', { type: 'image/png' });
      const form   = new FormData();
      form.append('image', file);

      const response = await fetch(`${process.env.REACT_APP_API_URL}/${endpoint}`, {
        method: 'POST',
        body:   form,
      });

      if (!response.ok) {
        const msg = await response.text();
        throw new Error(`Server error ${response.status}: ${msg}`);
      }

      const data = await response.json();
      navigate('/result', { state: { resultText: data.result, resultType: type } });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to connect to backend.');
    } finally {
      setLoadingCash(false);
      setLoadingDoc(false);
    }
  };

  return (
<<<<<<< HEAD
    <div className={`capture-page-wrapper ${darkMode ? 'dark-mode' : ''}`}>
=======
    <div className={`capture-page-wrapper ${darkMode ? 'dark-mode' : 'light-theme'}`}>
      {/* Navigation */}
>>>>>>> sandun
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <div className="capture-container">
        <div className="capture-content">
          <h1 className="capture-title">Capture</h1>

          {error && (
            <div style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5',
                          borderRadius: '8px', padding: '10px 14px', marginBottom: '12px' }}>
              ⚠️ {error}
            </div>
          )}

          <div className="camera-section">
            <div className="camera-header">
              <span className="camera-icon">📷</span>
              <span className="camera-label">CAMERA VIEW</span>
            </div>

            <div className="camera-view">
              {!capturedImage ? (
                <>
                  <video ref={videoRef} autoPlay playsInline className="video-stream" />
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

            {!capturedImage ? (
              <button className="capture-button" onClick={captureImage} disabled={!isCameraActive}>
                CAPTURE
              </button>
            ) : (
              <button className="capture-button retake-button" onClick={retakePhoto}>
                RETAKE
              </button>
            )}
          </div>

          {capturedImage && (
            <div className="processing-section">
              <h2 className="processing-title">Processing Options</h2>
              <div className="processing-buttons">
                <button
                  className="process-btn cash-btn"
                  onClick={() => submitImage('cash-to-text/', 'cash')}
                  disabled={loadingCash || loadingDoc}
                >
                  {loadingCash ? <span className="loader-capture"></span> : <span className="btn-icon">💰</span>}
                  <span className="btn-text">{loadingCash ? 'PROCESSING...' : 'CASH READER'}</span>
                </button>

                <button
                  className="process-btn document-btn"
                  onClick={() => submitImage('image-to-text/', 'document')}
                  disabled={loadingCash || loadingDoc}
                >
                  {loadingDoc ? <span className="loader-capture"></span> : <span className="btn-icon">📄</span>}
                  <span className="btn-text">{loadingDoc ? 'PROCESSING...' : 'DOCUMENT READER'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer darkMode={darkMode} />
    </div>
  );
}
