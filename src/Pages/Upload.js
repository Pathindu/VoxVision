import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import '../Components/Upload.css';

export default function Upload({ darkMode, toggleDarkMode }) {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
        setUploadedFile(file);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please select a valid image file');
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
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
        setUploadedFile(file);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please drop a valid image file');
    }
  };

  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  // Remove uploaded image
  const handleRemoveImage = () => {
    setUploadedImage(null);
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle Cash Reader - Navigate to Result page
  const handleCashReader = () => {
    navigate('/result', {
      state: {
        resultText: 'Detected: Rs. 1000 Note',
        resultType: 'cash'
      }
    });
  };

  // Handle Document Reader - Navigate to Result page
  const handleDocumentReader = async (image) => {
    const formData = new FormData();
    formData.append('image', image);

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
      //   resultText: 'The quick brown fox jumps over the lazy dog. This is a sample text extracted from the document.',
      //   resultType: 'document'
      // }
    });
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
                  <img src={uploadedImage} alt="Uploaded" className="uploaded-image" />
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
              accept="image/*"
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
                disabled={!uploadedImage}
              >
                <span className="btn-icon-upload">💰</span>
                <span className="btn-text-upload">CASH READER</span>
              </button>
              <button 
                className="process-btn-upload document-btn-upload" 
                onClick={() => handleDocumentReader(uploadedFile)}
                disabled={!uploadedImage}
              >
                <span className="btn-icon-upload">📄</span>
                <span className="btn-text-upload">DOCUMENT READER</span>
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