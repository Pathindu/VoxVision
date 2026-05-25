import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import '../Components/Capture.css';

// ── Constants ──────────────────────────────────────────────────────────────────
const AREA_MIN = 0.30;   // document must cover at least 30 % of frame
const AREA_MAX = 0.85;   // … but no more than 85 %
const CENTER_TOL = 0.10;   // centre may deviate ±10 % of half-dimension
const TILT_TOL = 0.20;   // left/right edge height may differ ≤ 20 % of height
const HOLD_MS = 1400;   // ms the document must stay in sweet-spot
const LOOP_MS = 150;    // frame-analysis interval (≈ 6-7 fps analysis)
const TTS_COOLDOWN_MS = 2500; // minimum gap between spoken prompts

// ── Helpers ────────────────────────────────────────────────────────────────────
/** Speak a phrase; silently skip when synthesis is already talking. */
function speak(text, lastSpokeRef) {
  const synth = window.speechSynthesis;
  if (!synth) return;
  const now = Date.now();
  if (synth.speaking || now - lastSpokeRef.current < TTS_COOLDOWN_MS) return;
  lastSpokeRef.current = now;
  synth.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.rate = 1.05;
  utt.pitch = 1.0;
  synth.speak(utt);
}

/** Vibrate the device (if supported). */
function vibrate(pattern) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}

export default function Capture({ darkMode, toggleDarkMode }) {
  // ── Existing state ───────────────────────────────────────────────────────────
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [loadingCash, setLoadingCash] = useState(false);
  const [loadingDoc, setLoadingDoc] = useState(false);
  const [error, setError] = useState(null);

  // ── Guidance state ───────────────────────────────────────────────────────────
  const [guidePrompt, setGuidePrompt] = useState('');      // text shown on screen
  const [alignStatus, setAlignStatus] = useState('idle');  // 'idle' | 'aligned' | 'bad'
  const [holdProgress, setHoldProgress] = useState(0);       // 0–100 for countdown ring

  // ── Refs ─────────────────────────────────────────────────────────────────────
  const videoRef = useRef(null);
  const canvasRef = useRef(null);           // hidden analysis canvas
  const hiddenCtxRef = useRef(null);
  const loopRef = useRef(null);           // setInterval id
  const holdStartRef = useRef(null);           // timestamp when alignment began
  const lastSpokeRef = useRef(0);             // timestamp of last TTS utterance
  const hasAutoFiredRef = useRef(false);        // prevent double-capture

  const navigate = useNavigate();

  // ── Camera ────────────────────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    setError(null);
    hasAutoFiredRef.current = false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 960 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Unable to access camera. Please check permissions.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      setIsCameraActive(false);
    }
    if (loopRef.current) {
      clearInterval(loopRef.current);
      loopRef.current = null;
    }
    setGuidePrompt('');
    setAlignStatus('idle');
    setHoldProgress(0);
    holdStartRef.current = null;
    hasAutoFiredRef.current = false;
  }, []);

  // ── Capture the current video frame ──────────────────────────────────────────
  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    setCapturedImage(canvas.toDataURL('image/png'));
    stopCamera();
  }, [stopCamera]);

  // ── Step 3 & 4: Frame analysis → geometry → prompt ───────────────────────────
  /**
   * Analyses the current video frame on the hidden canvas using a simple
   * luminance-based threshold to find a bright document against a darker
   * background (or vice-versa), then derives:
   *   • centroid (cx, cy)
   *   • area ratio
   *   • left-edge vs right-edge height ratio (tilt proxy)
   * Returns { ok, prompt } where ok=true means all metrics are in the sweet-spot.
   */
  const analyseFrame = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return { ok: false, prompt: '' };

    const W = video.videoWidth || 320;
    const H = video.videoHeight || 240;

    // Use a small off-screen canvas for speed
    if (!hiddenCtxRef.current) {
      const offscreen = document.createElement('canvas');
      offscreen.width = 80;  // downscale for perf
      offscreen.height = 60;
      hiddenCtxRef.current = offscreen.getContext('2d');
    }
    const ctx = hiddenCtxRef.current;
    const sw = ctx.canvas.width;
    const sh = ctx.canvas.height;

    ctx.drawImage(video, 0, 0, sw, sh);
    const imgData = ctx.getImageData(0, 0, sw, sh);
    const data = imgData.data;

    // --- Simple luminance segmentation ---
    // Compute mean luminance, then classify pixels above/below as foreground
    let total = 0;
    for (let i = 0; i < data.length; i += 4) {
      total += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    }
    const meanLum = total / (sw * sh);

    // Collect foreground pixel coordinates
    let sumX = 0, sumY = 0, fgCount = 0;
    // Bounding-box tracking
    let minX = sw, maxX = 0, minY = sh, maxY = 0;
    // Track left-column and right-column extents for tilt
    let leftTop = sh, leftBot = 0, rightTop = sh, rightBot = 0;
    const leftBound = Math.floor(sw * 0.15);
    const rightBound = Math.floor(sw * 0.85);

    for (let y = 0; y < sh; y++) {
      for (let x = 0; x < sw; x++) {
        const idx = (y * sw + x) * 4;
        const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
        const isFg = Math.abs(lum - meanLum) > 15; // bright foreground heuristic
        if (!isFg) continue;
        sumX += x; sumY += y; fgCount++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        // Left-strip
        if (x <= leftBound) {
          if (y < leftTop) leftTop = y;
          if (y > leftBot) leftBot = y;
        }
        // Right-strip
        if (x >= rightBound) {
          if (y < rightTop) rightTop = y;
          if (y > rightBot) rightBot = y;
        }
      }
    }

    if (fgCount < 50) return { ok: false, prompt: 'Point the camera at a document.' };

    const cx = sumX / fgCount;          // centroid x (downscaled space)
    const cy = sumY / fgCount;          // centroid y
    const areaRatio = fgCount / (sw * sh);    // fraction of frame covered

    // Map centroid to 0-1 space
    const relCx = cx / sw;   // 0 = left, 1 = right
    const relCy = cy / sh;   // 0 = top,  1 = bottom

    // Tilt: compare left-edge height vs right-edge height
    const leftH = leftBot > leftTop ? (leftBot - leftTop) / sh : 0;
    const rightH = rightBot > rightTop ? (rightBot - rightTop) / sh : 0;
    const tiltDiff = leftH > 0 && rightH > 0 ? Math.abs(leftH - rightH) : 0;

    // ── Map errors to prompts ─────────────────────────────────────────────────
    if (areaRatio < AREA_MIN) return { ok: false, prompt: 'Bring the camera closer.' };
    if (areaRatio > AREA_MAX) return { ok: false, prompt: 'Move the camera further away.' };

    const cxErr = relCx - 0.5;
    const cyErr = relCy - 0.5;

    if (cxErr < -CENTER_TOL) return { ok: false, prompt: 'Move camera left.' };
    if (cxErr > CENTER_TOL) return { ok: false, prompt: 'Move camera right.' };
    if (cyErr < -CENTER_TOL) return { ok: false, prompt: 'Move camera up.' };
    if (cyErr > CENTER_TOL) return { ok: false, prompt: 'Move camera down.' };

    if (tiltDiff > TILT_TOL) return { ok: false, prompt: 'Level the phone.' };

    return { ok: true, prompt: 'Perfect, hold still…' };
  }, []);

  // ── Step 1 & 6 & 7: The main interval loop ───────────────────────────────────
  const startGuidanceLoop = useCallback(() => {
    if (loopRef.current) return; // already running

    loopRef.current = setInterval(() => {
      if (hasAutoFiredRef.current) return;

      const { ok, prompt } = analyseFrame();

      if (ok) {
        setAlignStatus('aligned');
        setGuidePrompt('Perfect, hold still…');
        speak('Perfect, hold still.', lastSpokeRef);

        if (!holdStartRef.current) {
          holdStartRef.current = Date.now();
          vibrate([50, 30, 50]); // light double-buzz: "you've hit the target"
        }

        const elapsed = Date.now() - holdStartRef.current;
        const progress = Math.min((elapsed / HOLD_MS) * 100, 100);
        setHoldProgress(progress);

        // Step 7: auto-capture after HOLD_MS of stable alignment
        if (elapsed >= HOLD_MS && !hasAutoFiredRef.current) {
          hasAutoFiredRef.current = true;
          clearInterval(loopRef.current);
          loopRef.current = null;
          vibrate([100, 50, 100, 50, 200]); // success haptic
          speak('Capturing now.', lastSpokeRef);
          setGuidePrompt('');
          setAlignStatus('idle');
          setHoldProgress(0);
          // Slight delay so the last speech starts before capture
          setTimeout(() => captureImage(), 300);
        }
      } else {
        // Reset hold timer when misaligned
        holdStartRef.current = null;
        setHoldProgress(0);
        setAlignStatus('bad');
        if (prompt) {
          setGuidePrompt(prompt);
          speak(prompt, lastSpokeRef);
        }
      }
    }, LOOP_MS);
  }, [analyseFrame, captureImage]);

  // ── Lifecycle ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      window.speechSynthesis?.cancel();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Start guidance loop once camera is live
  useEffect(() => {
    if (!isCameraActive || capturedImage) return;
    // Wait one tick for the video element to be ready
    const t = setTimeout(() => startGuidanceLoop(), 500);
    return () => clearTimeout(t);
  }, [isCameraActive, capturedImage, startGuidanceLoop]);

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  // ── Submit to backend ─────────────────────────────────────────────────────────
  const submitImage = async (endpoint, type) => {
    setError(null);
    if (type === 'cash') setLoadingCash(true); else setLoadingDoc(true);
    try {
      const res = await fetch(capturedImage);
      const blob = await res.blob();
      const file = new File([blob], 'capture.png', { type: 'image/png' });
      const form = new FormData();
      form.append('image', file);

      const response = await fetch(`${process.env.REACT_APP_API_URL}/${endpoint}`, {
        method: 'POST',
        body: form,
      });

      if (!response.ok) {
        const msg = await response.text();
        throw new Error(`Server error ${response.status}: ${msg}`);
      }

      const data = await response.json();
      navigate('/result', { state: { resultText: data.result, resultType: type } });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to connect to backend.');
    } finally {
      setLoadingCash(false);
      setLoadingDoc(false);
    }
  };

  // ── Guidance overlay colours ──────────────────────────────────────────────────
  const frameColor = alignStatus === 'aligned' ? '#22c55e'
    : alignStatus === 'bad' ? '#f97316'
      : '#ffffff';

  // Countdown ring SVG values
  const RING_R = 44;
  const RING_CIRC = 2 * Math.PI * RING_R;
  const dashOffset = RING_CIRC * (1 - holdProgress / 100);

  return (
    <div className={`capture-page-wrapper ${darkMode ? 'dark-mode' : 'light-theme'}`}>
      {/* Navigation */}
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <div className="capture-container">
        <div className="capture-content">
          <h1 className="capture-title">Capture</h1>

          {error && (
            <div style={{
              background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5',
              borderRadius: '8px', padding: '10px 14px', marginBottom: '12px'
            }}>
              ⚠️ {error}
            </div>
          )}

          <div className="camera-section">
            <div className="camera-header">
              <span className="camera-icon">📷</span>
              <span className="camera-label">CAMERA VIEW</span>
            </div>

            <div className="camera-view">
              {!capturedImage ? (
                <>
                  <video ref={videoRef} autoPlay playsInline className="video-stream" />

                  {/* ── Guidance overlay ─────────────────────────────────── */}
                  <div className="focus-frame" style={{ borderColor: frameColor }}>
                    <div className="corner top-left" style={{ borderColor: frameColor }} />
                    <div className="corner top-right" style={{ borderColor: frameColor }} />
                    <div className="corner bottom-left" style={{ borderColor: frameColor }} />
                    <div className="corner bottom-right" style={{ borderColor: frameColor }} />
                  </div>

                  {/* Guide prompt banner */}
                  {guidePrompt && (
                    <div className={`guide-prompt ${alignStatus === 'aligned' ? 'guide-prompt--aligned' : 'guide-prompt--bad'}`}>
                      {guidePrompt}
                    </div>
                  )}

                  {/* Hold-still countdown ring (only shown when aligned) */}
                  {alignStatus === 'aligned' && holdProgress > 0 && (
                    <div className="hold-ring-wrapper">
                      <svg width="100" height="100" className="hold-ring-svg">
                        <circle
                          cx="50" cy="50" r={RING_R}
                          fill="none"
                          stroke="rgba(255,255,255,0.2)"
                          strokeWidth="8"
                        />
                        <circle
                          cx="50" cy="50" r={RING_R}
                          fill="none"
                          stroke="#22c55e"
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={RING_CIRC}
                          strokeDashoffset={dashOffset}
                          style={{
                            transform: 'rotate(-90deg)', transformOrigin: '50px 50px',
                            transition: 'stroke-dashoffset 0.15s linear'
                          }}
                        />
                      </svg>
                      <span className="hold-ring-label">
                        {Math.round(holdProgress)}%
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <img src={capturedImage} alt="Captured" className="captured-image" />
              )}
            </div>

            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {!capturedImage ? (
              <button
                className="capture-button"
                onClick={captureImage}
                disabled={!isCameraActive}
                title="Capture image manually"
              >
                CAPTURE
              </button>
            ) : (
              <button className="capture-button retake-button" onClick={retakePhoto}>
                RETAKE
              </button>
            )}
          </div>

          {capturedImage && (
            <div className="processing-section">
              <h2 className="processing-title">Processing Options</h2>
              <div className="processing-buttons">
                <button
                  className="process-btn cash-btn"
                  onClick={() => submitImage('cash-to-text/', 'cash')}
                  disabled={loadingCash || loadingDoc}
                >
                  {loadingCash ? <span className="loader-capture" /> : <span className="btn-icon">💰</span>}
                  <span className="btn-text">{loadingCash ? 'PROCESSING...' : 'CASH READER'}</span>
                </button>

                <button
                  className="process-btn document-btn"
                  onClick={() => submitImage('image-to-text/', 'document')}
                  disabled={loadingCash || loadingDoc}
                >
                  {loadingDoc ? <span className="loader-capture" /> : <span className="btn-icon">📄</span>}
                  <span className="btn-text">{loadingDoc ? 'PROCESSING...' : 'DOCUMENT READER'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer darkMode={darkMode} />
    </div>
  );
}
