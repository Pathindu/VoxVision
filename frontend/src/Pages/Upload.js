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
  const fileInputRef = useRef(null);
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

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please select a valid image or PDF file');
    }
  };

  // Handle drag and drop
  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files[0];
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please drop a valid image or PDF file');
    }
  };

  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  // Remove uploaded image
  const handleRemoveImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle Cash Reader - Navigate to Result page
  const handleCashReader = async () => {
    setLoadingCash(true);
    // Convert the base64 data URL to a File object
    const res = await fetch(uploadedImage);
    const blob = await res.blob();
    const file = new File([blob], blob.type === 'application/pdf' ? 'upload.pdf' : 'upload.png', { type: blob.type });
    
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
        resultType: 'cash'
      }
    });
    setLoadingCash(false);
    setLoadingDoc(false);
  };

  // Handle Document Reader - Navigate to Result page
  const handleDocumentReader = async () => {
    setLoadingDoc(true);
    // Convert the base64 data URL to a File object
    const res = await fetch(uploadedImage);
    const blob = await res.blob();
    const file = new File([blob], blob.type === 'application/pdf' ? 'upload.pdf' : 'upload.png', { type: blob.type });
    
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
    });
    setLoadingCash(false);
    setLoadingDoc(false);
  };

  return (
      <div className={`upload-page-wrapper ${darkMode ? 'dark-mode' : ''}`}>
      {/* Navigation */}
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <div className="upload-container">
        <div className="upload-content">
          <h1 className="upload-title">Upload</h1>

          {/* Upload Section */}
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
                  <button className="remove-button" onClick={handleRemoveImage}>
                    ✕
                  </button>
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

          {/* Processing Options */}
          <div className="processing-section-upload">
            <h2 className="processing-title-upload">Processing Options</h2>
            <div className="processing-buttons-upload">
              <button 
                className="process-btn-upload cash-btn-upload" 
                onClick={handleCashReader}
                disabled={!uploadedImage || loadingCash || loadingDoc}
              >
                {loadingCash ? (
                  <span className="loader-upload"></span>
                ) : (
                  <span className="btn-icon-upload">💰</span>
                )}
                <span className="btn-text-upload">{loadingCash ? 'PROCESSING...' : 'CASH READER'}</span>
              </button>
              <button 
                className="process-btn-upload document-btn-upload" 
                onClick={handleDocumentReader}
                disabled={!uploadedImage || loadingDoc || loadingCash}
              >
                {loadingDoc ? (
                  <span className="loader-upload"></span>
                ) : (
                  <span className="btn-icon-upload">📄</span>
                )}
                <span className="btn-text-upload">{loadingDoc ? 'PROCESSING...' : 'DOCUMENT READER'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer darkMode={darkMode} />
    </div>
  );
}