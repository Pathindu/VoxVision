import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import '../Components/Upload.css';

export default function Upload({ darkMode, toggleDarkMode }) {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loadingCash, setLoadingCash] = useState(false);
  const [loadingDoc, setLoadingDoc] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // ✅ checkBackend defined properly
  const checkBackend = async (retries = 5, delay = 5000) => {
    setBackendStatus('checking');
    for (let i = 0; i < retries; i++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        const backend = await fetch("https://voxvision-backend.onrender.com/", {
          signal: controller.signal
        });
        clearTimeout(timeout);
        const data = await backend.json();
        console.log("Backend online:", data);
        setBackendStatus('online');
        return;
      } catch (error) {
        console.log(`Attempt ${i + 1} failed...`);
        if (i < retries - 1) await new Promise(res => setTimeout(res, delay));
      }
    }
    setBackendStatus('offline');
  };

  useEffect(() => {
    checkBackend();
  }, []);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
      const reader = new FileReader();
      reader.onload = (e) => setUploadedImage(e.target.result);
      reader.readAsDataURL(file);
    } else {
      alert('Please select a valid image or PDF file');
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
      const reader = new FileReader();
      reader.onload = (e) => setUploadedImage(e.target.result);
      reader.readAsDataURL(file);
    } else {
      alert('Please drop a valid image or PDF file');
    }
  };

  const handleUploadClick = () => fileInputRef.current.click();

  const handleRemoveImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ✅ Only ONE handleCashReader
  const handleCashReader = async () => {
    if (!uploadedImage) return;
    setLoadingCash(true);
    try {
      const res = await fetch(uploadedImage);
      const blob = await res.blob();
      const file = new File(
        [blob],
        blob.type === 'application/pdf' ? 'upload.pdf' : 'upload.png',
        { type: blob.type }
      );
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('https://voxvision-backend.onrender.com/cash-to-text/', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const data = await response.json();
      navigate('/result', { state: { resultText: data.result, resultType: 'cash' } });
    } catch (error) {
      console.error("Cash Reader Error:", error);
      alert("Failed to connect to backend. Please wait a moment and try again.");
    } finally {
      setLoadingCash(false);
    }
  };

  // ✅ Only ONE handleDocumentReader
  const handleDocumentReader = async () => {
    if (!uploadedImage) return;
    setLoadingDoc(true);
    try {
      const res = await fetch(uploadedImage);
      const blob = await res.blob();
      const file = new File(
        [blob],
        blob.type === 'application/pdf' ? 'upload.pdf' : 'upload.png',
        { type: blob.type }
      );
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('https://voxvision-backend.onrender.com/image-to-text/', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const data = await response.json();
      navigate('/result', { state: { resultText: data.result, resultType: 'document' } });
    } catch (error) {
      console.error("Document Reader Error:", error);
      alert("Failed to connect to backend. Please wait a moment and try again.");
    } finally {
      setLoadingDoc(false);
    }
  };

  return (
    <div className={`upload-page-wrapper ${darkMode ? 'dark-mode' : ''}`}>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      {/* ✅ Backend Status Banner */}
      {backendStatus === 'checking' && (
        <div style={{ background: '#f59e0b', color: '#fff', textAlign: 'center', padding: '10px', fontWeight: 'bold' }}>
          ⏳ Backend is starting up, please wait...
        </div>
      )}
      {backendStatus === 'online' && (
        <div style={{ background: '#10b981', color: '#fff', textAlign: 'center', padding: '10px', fontWeight: 'bold' }}>
          ✅ Backend is online!
        </div>
      )}
      {backendStatus === 'offline' && (
        <div style={{ background: '#ef4444', color: '#fff', textAlign: 'center', padding: '10px', fontWeight: 'bold' }}>
          ❌ Backend is offline. Please try again later.
        </div>
      )}

      <div className="upload-container">
        <div className="upload-content">
          <h1 className="upload-title">Upload</h1>

          <div className="upload-section">
            <div
              className={`upload-area ${isDragging ? 'dragging' : ''} ${uploadedImage ? 'has-image' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={!uploadedImage ? handleUploadClick : null}
            >
              {!uploadedImage ? (
                <div className="upload-prompt">
                  <div className="focus-frame-upload">
                    <div className="corner-upload top-left"></div>
                    <div className="corner-upload top-right"></div>
                    <div className="corner-upload bottom-left"></div>
                    <div className="corner-upload bottom-right"></div>
                  </div>
                  <div className="upload-text">
                    <h2>ADD FILE</h2>
                    <p>Click or drag & drop to upload</p>
                  </div>
                </div>
              ) : (
                <div className="uploaded-image-container">
                  {uploadedImage.startsWith('data:application/pdf') ? (
                    <embed src={uploadedImage} type="application/pdf" className="uploaded-image" />
                  ) : (
                    <img src={uploadedImage} alt="Uploaded" className="uploaded-image" />
                  )}
                  <button className="remove-button" onClick={handleRemoveImage}>✕</button>
                  <div className="focus-frame-overlay">
                    <div className="corner-upload top-left"></div>
                    <div className="corner-upload top-right"></div>
                    <div className="corner-upload bottom-left"></div>
                    <div className="corner-upload bottom-right"></div>
                  </div>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </div>

          <div className="processing-section-upload">
            <h2 className="processing-title-upload">Processing Options</h2>
            <div className="processing-buttons-upload">
              <button
                className="process-btn-upload cash-btn-upload"
                onClick={handleCashReader}
                disabled={!uploadedImage || loadingCash || loadingDoc || backendStatus !== 'online'}
              >
                {loadingCash ? <span className="loader-upload"></span> : <span className="btn-icon-upload">💰</span>}
                <span className="btn-text-upload">{loadingCash ? 'PROCESSING...' : 'CASH READER'}</span>
              </button>
              <button
                className="process-btn-upload document-btn-upload"
                onClick={handleDocumentReader}
                disabled={!uploadedImage || loadingDoc || loadingCash || backendStatus !== 'online'}
              >
                {loadingDoc ? <span className="loader-upload"></span> : <span className="btn-icon-upload">📄</span>}
                <span className="btn-text-upload">{loadingDoc ? 'PROCESSING...' : 'DOCUMENT READER'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer darkMode={darkMode} />
    </div>
  );
}