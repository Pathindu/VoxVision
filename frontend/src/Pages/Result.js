import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import '../Components/Result.css';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** True when the segment contains Sinhala Unicode characters (U+0D80–U+0DFF). */
const isSinhala = (text) => /[\u0D80-\u0DFF]/.test(text);

/**
 * Split mixed-language text into an array of { text, lang } objects.
 * Adjacent characters of the same script are grouped together.
 */
const segmentByLanguage = (text) => {
  const raw = text.match(/[\u0D80-\u0DFF\s]+|[^\u0D80-\u0DFF]+/g) || [];
  return raw
    .filter((s) => s.trim())
    .map((s) => ({ text: s, lang: isSinhala(s) ? 'si-LK' : 'en-US' }));
};

/**
 * Split a segment into chunks that are each under maxBytes bytes.
 * Tries to break at sentence boundaries (. or \n) when possible.
 */
const chunkSegment = (text, maxBytes = 4800) => {
  const enc = (s) => new Blob([s]).size;
  if (enc(text) <= maxBytes) return [text];

  const chunks = [];
  let start = 0;
  while (start < text.length) {
    let end = start;
    while (end < text.length && enc(text.slice(start, end + 1)) <= maxBytes) end++;
    if (end === start) { end = start + 1; } // safety: always advance

    // Back up to a sentence boundary
    let cut = end;
    for (let i = end; i > start && i > end - 80; i--) {
      if (text[i] === '.' || text[i] === '\n') { cut = i + 1; break; }
    }
    const chunk = text.slice(start, cut).trim();
    if (chunk) chunks.push(chunk);
    start = cut;
  }
  return chunks;
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function Result({ darkMode, toggleDarkMode }) {
  const navigate  = useNavigate();
  const location  = useLocation();

  const resultText = location.state?.resultText || 'Detected: Rs. 1000 Note';
  const resultType = location.state?.resultType || 'cash';

  const [isLoading,  setIsLoading]  = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused,   setIsPaused]   = useState(false);
  const [ttsError,   setTtsError]   = useState(null);

  const audioRef    = useRef(null);   // Audio object
  const audioUrlRef = useRef(null);   // Blob URL (for cleanup + download)
  const hasRun      = useRef(false);

  // ── TTS backend call ────────────────────────────────────────────────────
  const fetchTTSBlob = async (text, lang) => {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/synthesize`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ text, lang_code: lang }),
    });
    if (!res.ok) {
      const msg = await res.text();
      throw new Error(`TTS ${res.status}: ${msg}`);
    }
    return res.blob();
  };

  // ── Full TTS pipeline ───────────────────────────────────────────────────
  const generateAudio = useCallback(async (text) => {
    setIsLoading(true);
    setTtsError(null);

    try {
      const segments = segmentByLanguage(text);
      const blobs    = [];

      for (const { text: seg, lang } of segments) {
        for (const chunk of chunkSegment(seg)) {
          console.log(`[TTS] lang=${lang} bytes=${new Blob([chunk]).size}`);
          const blob = await fetchTTSBlob(chunk, lang);
          blobs.push(blob);
        }
      }

      if (!blobs.length) throw new Error('No audio blobs returned from TTS.');

      // Combine all MP3 blobs
      const combined = new Blob(blobs, { type: 'audio/mpeg' });
      const url      = URL.createObjectURL(combined);

      // Cleanup previous
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = url;

      const audio    = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => { setIsSpeaking(false); setIsPaused(false); };

      // Auto-play
      await audio.play();
      setIsSpeaking(true);
    } catch (err) {
      console.error('[TTS]', err);
      setTtsError(err.message || 'Audio generation failed.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasRun.current && resultText) {
      hasRun.current = true;
      generateAudio(resultText);
    }
    return () => {
      if (audioRef.current) audioRef.current.pause();
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    };
  }, [resultText, generateAudio]);

  // ── Controls ────────────────────────────────────────────────────────────
  const handlePlay = () => {
    if (!audioRef.current) {
      hasRun.current = false;
      generateAudio(resultText);
      return;
    }
    if (isPaused) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 2);
    } else {
      audioRef.current.currentTime = 0;
    }
    audioRef.current.play();
    setIsSpeaking(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    if (audioRef.current && isSpeaking) {
      audioRef.current.pause();
      setIsSpeaking(false);
      setIsPaused(true);
    }
  };

  const handleRepeat = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play();
    setIsSpeaking(true);
    setIsPaused(false);
  };

  const handleDownload = () => {
    if (!audioUrlRef.current) { alert('No audio to download yet.'); return; }
    const a  = document.createElement('a');
    a.href   = audioUrlRef.current;
    a.download = `${resultType}-audio-${Date.now()}.mp3`;
    a.click();
  };

  const handleProcessAnother = () => {
    if (audioRef.current) audioRef.current.pause();
    setIsSpeaking(false);
    setIsPaused(false);
    navigate('/');
  };

  // ── Render ──────────────────────────────────────────────────────────────
  return (
<<<<<<< HEAD
    <div className={`result-page-wrapper ${darkMode ? 'dark-mode' : ''}`}>
=======
    <div className={`result-page-wrapper ${darkMode ? 'dark-mode' : 'light-theme'}`}>
      {/* Navigation */}
>>>>>>> sandun
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <div className="result-container">
        <div className="result-content">
          <h1 className="result-page-title">Results</h1>

          <div className="result-box">
            <p className="result-text" tabIndex={0}>{resultText}</p>
          </div>

          {ttsError && (
            <div style={{
              background: '#fef2f2', color: '#dc2626',
              border: '1px solid #fca5a5', borderRadius: '8px',
              padding: '12px 16px', margin: '12px 0', fontSize: '0.9rem',
            }}>
              ⚠️ Audio Error: {ttsError}
              <button
                onClick={() => { hasRun.current = false; generateAudio(resultText); }}
                style={{ marginLeft: '12px', cursor: 'pointer' }}
              >
                Retry
              </button>
            </div>
          )}

          <div className="audio-controls-section">
            <h2 className="audio-title">Audio Controls</h2>
            <div className="audio-buttons">
              <button
                className="audio-btn pause-btn"
                onClick={handlePause}
                disabled={isLoading || !isSpeaking}
              >
                <span className="audio-icon">⏸</span>
                <span className="audio-label">Pause</span>
              </button>

              <button
                className="audio-btn play-btn"
                onClick={handlePlay}
                disabled={isLoading || isSpeaking}
              >
                <span className="audio-icon">{isLoading ? '⏳' : '▶'}</span>
                <span className="audio-label">{isLoading ? 'Loading...' : 'Play'}</span>
              </button>

              <button
                className="audio-btn repeat-btn"
                onClick={handleRepeat}
                disabled={isLoading || !audioRef.current}
              >
                <span className="audio-icon">🔁</span>
                <span className="audio-label">Repeat</span>
              </button>
            </div>
          </div>

          <div className="action-buttons">
            <button className="action-btn download-btn" onClick={handleDownload}>
              <span className="action-icon">📥</span>
              <span className="action-text">DOWNLOAD</span>
            </button>
            <button className="action-btn process-another-btn" onClick={handleProcessAnother}>
              <span className="action-icon">🔄</span>
              <span className="action-text">PROCESS ANOTHER</span>
            </button>
          </div>
        </div>
      </div>

      <Footer darkMode={darkMode} />
    </div>
  );
}
