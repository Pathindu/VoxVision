import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import { getTag } from '../services/api';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export default function TagScanner({ darkMode, toggleDarkMode }) {
  const { tagId }  = useParams();
  const navigate   = useNavigate();

  const [tag, setTag]           = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [speaking, setSpeaking] = useState(false);
  const [audio, setAudio]       = useState(null);
  const hasSpoken               = useRef(false);

  // ── Fetch tag description from backend ────────────────────────────────
  useEffect(() => {
    if (!tagId) return;
    setLoading(true);
    getTag(tagId)
      .then(res => { setTag(res.data); setLoading(false); })
      .catch(err => {
        setError(
          err.response?.status === 404
            ? 'This tag has not been programmed yet.'
            : 'Could not load tag. Please check your connection.'
        );
        setLoading(false);
      });
  }, [tagId]);

  // ── Auto-play TTS when description loads ──────────────────────────────
  useEffect(() => {
    if (tag && !hasSpoken.current) {
      hasSpoken.current = true;
      speakDescription(tag.description);
    }
  }, [tag]);

  const speakDescription = async (text) => {
    setSpeaking(true);
    try {
      // Detect language chunks (Sinhala vs English) the same way Result.js does
      const segments = text.match(/[\x00-\x7F]+|[^\x41-\x5A\x61-\x7A]+/g) || [text];
      const blobs = [];

      for (const seg of segments) {
        if (!seg.trim()) continue;
        const lang = /[\x41-\x5A\x61-\x7A]/.test(seg) ? 'en-US' : 'si-LK';
        const blob = await fetchAudio(seg, lang);
        if (blob) blobs.push(blob);
      }

      if (blobs.length === 0) { setSpeaking(false); return; }

      const combined = new Blob(blobs, { type: 'audio/mpeg' });
      const url = URL.createObjectURL(combined);
      const a = new Audio(url);
      setAudio(a);
      a.play();
      a.onended = () => setSpeaking(false);
    } catch (err) {
      console.error('TTS error:', err);
      setSpeaking(false);
    }
  };

  const fetchAudio = async (text, lang) => {
    try {
      const res = await fetch(`${API}/synthesize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, lang_code: lang }),
      });
      if (!res.ok) return null;
      return await res.blob();
    } catch { return null; }
  };

  const handlePlay = () => {
    if (audio) { audio.currentTime = 0; audio.play(); setSpeaking(true); audio.onended = () => setSpeaking(false); }
    else if (tag) { hasSpoken.current = false; speakDescription(tag.description); }
  };

  const handleStop = () => {
    if (audio) { audio.pause(); audio.currentTime = 0; }
    setSpeaking(false);
  };

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className={`upload-page-wrapper ${darkMode ? 'dark-mode' : ''}`}>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <div className="upload-container">
        <div className="upload-content" style={{ maxWidth: '620px', margin: '0 auto', textAlign: 'center' }}>

          {loading && (
            <div style={{ padding: '60px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📡</div>
              <p style={{ color: '#6b7280', fontSize: '18px' }}>Loading tag…</p>
            </div>
          )}

          {error && (
            <div style={{ padding: '60px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
              <p style={{ color: '#dc2626', fontSize: '18px' }}>{error}</p>
              <button className="auth-button" style={{ marginTop: '24px' }} onClick={() => navigate('/')}>
                Go Home
              </button>
            </div>
          )}

          {tag && !loading && (
            <>
              <div style={{ fontSize: '64px', marginBottom: '8px' }}>🏷️</div>
              <h1 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px' }}>
                NFC Tag
              </h1>
              <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '24px' }}>
                ID: {tag.id}
              </p>

              {/* Description box */}
              <div style={{
                background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px',
                padding: '24px', marginBottom: '32px', textAlign: 'left',
                fontSize: '17px', lineHeight: '1.7', color: '#111827',
              }}
                tabIndex={0}
                aria-label="Tag description"
              >
                {tag.description}
              </div>

              {/* Speaking indicator */}
              {speaking && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: '10px', color: '#6d28d9', fontWeight: '600', marginBottom: '20px' }}>
                  <span style={{ animation: 'pulse 1s infinite' }}>🔊</span> Speaking…
                </div>
              )}

              {/* Audio controls */}
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={handlePlay}
                  disabled={speaking}
                  style={ctaBtn('#6d28d9')}
                  aria-label="Play description"
                >
                  ▶ {speaking ? 'Playing…' : 'Play Again'}
                </button>
                <button
                  onClick={handleStop}
                  disabled={!speaking}
                  style={ctaBtn('#6b7280')}
                  aria-label="Stop"
                >
                  ⏹ Stop
                </button>
              </div>

              <button
                onClick={() => navigate('/')}
                style={{ ...ctaBtn('#e5e7eb'), color: '#374151', marginTop: '24px' }}
              >
                ← Back to Home
              </button>
            </>
          )}
        </div>
      </div>

      <Footer darkMode={darkMode} />
    </div>
  );
}

const ctaBtn = (bg) => ({
  background: bg, color: '#fff', border: 'none', borderRadius: '10px',
  padding: '12px 28px', fontSize: '16px', fontWeight: '700', cursor: 'pointer',
});
