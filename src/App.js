import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Pages/Home';
import Capture from './Pages/Capture';
import Upload from './Pages/Upload';
import LoginRegister from './Pages/LoginRegister';
import Result from './Pages/Result';
import Contact from './Pages/Contact';
import './App.css';

function App() {
    // Dark mode state - load from localStorage if available
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true' || false;
  });

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  // Save dark mode preference to localStorage
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    // Apply dark mode class to body
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  return (
    <Router>
     <div className={`App ${darkMode ? 'dark-mode' : ''}`}>
        <Routes>
          <Route path="/" element={<Home darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
          <Route path="/capture" element={<Capture darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
          <Route path="/upload" element={<Upload darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
          <Route path="/login" element={<LoginRegister darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
          <Route path="/result" element={<Result darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
          <Route path="/contact" element={<Contact darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;