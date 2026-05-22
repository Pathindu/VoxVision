import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Pages/Home';
import Capture from './Pages/Capture';
import Upload from './Pages/Upload';
import LoginRegister from './Pages/LoginRegister';
import Result from './Pages/Result';
import Contact from './Pages/Contact';
import Order from './Pages/Order';
import About from './Pages/About';
import OurTeam from './Pages/OurTeam';
import './App.css';
import './Components/LightTheme.css';

function App() {
  // Dark mode state - load from localStorage if available (defaults to dark)
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode !== null ? savedMode === 'true' : true;
  });

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  // Save dark mode preference to localStorage
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    // Apply theme class to body
    if (darkMode) {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.remove('dark-mode');
      document.body.classList.add('light-theme');
    }
  }, [darkMode]);

  return (
    <Router>
      <div className={`App ${darkMode ? 'dark-mode' : 'light-theme'}`}>
        <Routes>
          <Route path="/" element={<Home darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
          <Route path="/capture" element={<Capture darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
          <Route path="/upload" element={<Upload darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
          <Route path="/login" element={<LoginRegister darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
          <Route path="/result" element={<Result darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
          <Route path="/contact" element={<Contact darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
          <Route path="/order" element={<Order darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
          <Route path="/about" element={<About darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
          <Route path="/team" element={<OurTeam darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;