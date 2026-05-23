import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { storage } from './Storage';
// Pages
import Home          from './Pages/Home';
import Capture       from './Pages/Capture';
import Upload        from './Pages/Upload';
import LoginRegister from './Pages/LoginRegister';
import Result        from './Pages/Result';
import Contact       from './Pages/Contact';
import TagWriter     from './Pages/TagWriter';
import TagScanner    from './Pages/TagScanner';
import Store         from './Pages/Store';

// Components
import SplashScreen  from './Components/SplashScreen'; // 👈 IMPORT THE SPLASH SCREEN

// Auth context
import { AuthProvider } from './context/AuthContext';

import './App.css';

function App() {
  // 1. Existing Dark Mode State
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  
  // 2. 👈 NEW: State to control the Splash Screen visibility
  const [showSplash, setShowSplash] = useState(true);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  const common = { darkMode, toggleDarkMode };

  return (
    <AuthProvider>
      
      {/* 3. 👈 NEW: Render the Splash Screen if 'showSplash' is true */}
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}

      <Router>
        <div className={`App ${darkMode ? 'dark-mode' : ''}`}>
          <Routes>
            {/* ── Existing routes ── */}
            <Route path="/"        element={<Home    {...common} />} />
            <Route path="/capture" element={<Capture {...common} />} />
            <Route path="/upload"  element={<Upload  {...common} />} />
            <Route path="/login"   element={<LoginRegister {...common} />} />
            <Route path="/result"  element={<Result  {...common} />} />
            <Route path="/contact" element={<Contact {...common} />} />

            {/* ── New VoxVision routes ── */}
            <Route path="/tags"        element={<TagWriter  {...common} />} />
            <Route path="/scan/:tagId" element={<TagScanner {...common} />} />
            <Route path="/store"       element={<Store      {...common} />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;