import React from 'react';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import '../Components/Order.css';

export default function Order({ darkMode, toggleDarkMode }) {
  return (
    <div className={`order-page-wrapper ${darkMode ? 'dark-mode' : ''}`}>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      
      <div className="order-container">
        <main className="order-content">
          <h1 className="order-title">Order Your Smart Tags</h1>
          <p className="order-description">Enhance your accessibility experience with our premium NFC smart tags.</p>
          
          <div className="order-coming-soon">
            <h3>Coming Soon!</h3>
            <p>We are currently setting up our inventory and payment systems. Check back soon to order your Smart Tags!</p>
          </div>
        </main>
      </div>

      <Footer darkMode={darkMode} />
    </div>
  );
}
