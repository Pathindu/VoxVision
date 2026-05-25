import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { storage } from './Storage';
// Pages
import Home          from './Pages/Home';
import Capture       from './Pages/Capture';
import Upload        from './Pages/Upload';
import LoginRegister from './Pages/LoginRegister';
<<<<<<< HEAD
import Result        from './Pages/Result';
import Contact       from './Pages/Contact';
import TagWriter     from './Pages/TagWriter';
import TagScanner    from './Pages/TagScanner';
import Store         from './Pages/Store';

// Components
import SplashScreen  from './Components/SplashScreen'; // 👈 IMPORT THE SPLASH SCREEN

// Auth context
import { AuthProvider } from './context/AuthContext';

=======
import Result from './Pages/Result';
import Contact from './Pages/Contact';
import Order from './Pages/Order';
import About from './Pages/About';
import OurTeam from './Pages/OurTeam';
>>>>>>> sandun
import './App.css';
import './Components/LightTheme.css';

function App() {
<<<<<<< HEAD
  // 1. Existing Dark Mode State
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  
  // 2. 👈 NEW: State to control the Splash Screen visibility
  const [showSplash, setShowSplash] = useState(true);
=======
  // Dark mode state - load from localStorage if available (defaults to dark)
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode !== null ? savedMode === 'true' : true;
  });
>>>>>>> sandun

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
<<<<<<< HEAD
    document.body.classList.toggle('dark-mode', darkMode);
=======
    // Apply theme class to body
    if (darkMode) {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.remove('dark-mode');
      document.body.classList.add('light-theme');
    }
>>>>>>> sandun
  }, [darkMode]);

  const common = { darkMode, toggleDarkMode };

  return (
<<<<<<< HEAD
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
=======
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
>>>>>>> sandun
  );
}

export default App;