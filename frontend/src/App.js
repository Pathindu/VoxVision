import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

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

// Auth context
import { AuthProvider } from './context/AuthContext';

import './App.css';

function App() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  const common = { darkMode, toggleDarkMode };

  return (
    <AuthProvider>
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
