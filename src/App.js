import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Pages/Home';
import Capture from './Pages/Capture';
import Upload from './Pages/Upload';
import LoginRegister from './Pages/LoginRegister';
import Result from './Pages/Result';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/capture" element={<Capture />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/login" element={<LoginRegister />} />
          <Route path="/result" element={<Result />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;