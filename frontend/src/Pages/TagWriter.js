import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import { useAuth } from '../context/AuthContext';
import { createTag, getMyTags, updateTag, deleteTag } from '../services/api';

const BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export default function TagWriter({ darkMode, toggleDarkMode }) {
  const { isLoggedIn, isCaregiver } = useAuth();
  const navigate = useNavigate();

  const [description, setDescription] = useState('');
  const [myTags, setMyTags]           = useState([]);
  const [status, setStatus]           = useState('');    // '', 'writing', 'done', 'error'
  const [createdTag, setCreatedTag]   = useState(null);
  const [nfcSupported, setNfcSupported] = useState('checking');
  const [editingId, setEditingId]     = useState(null);
  const [editText, setEditText]       = useState('');

  useEffect(() => {
    if (!isLoggedIn) { navigate('/login'); return; }
    if (!isCaregiver) { navigate('/'); return; }
    setNfcSupported('NDEFReader' in window ? 'yes' : 'no');
    loadMyTags();
  }, [isLoggedIn, isCaregiver]);

  const loadMyTags = async () => {
    try { const res = await getMyTags(); setMyTags(res.data); } catch {}
  };

  // 1. Save description to backend → get tag ID
  const handleCreateTag = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;
    setStatus('saving');
    try {
      const res = await createTag({ description });
      setCreatedTag(res.data);
      setStatus('ready_to_write');
      loadMyTags();
    } catch (err) {
      setStatus('error');
      alert(err.response?.data?.detail || 'Failed to save tag.');
    }
  };

  // 2. Write the tag URL to the physical NFC sticker via Web NFC API
  const handleWriteNFC = async () => {
    if (!('NDEFReader' in window)) {
      alert('Web NFC is not supported in this browser. Use Chrome on Android.');
      return;
    }
    setStatus('writing');
    try {
      const ndef = new window.NDEFReader();
      // The URL that a scanning phone will open – the /scan/:id page
      const tagUrl = `${window.location.origin}/scan/${createdTag.id}`;
      await ndef.write({ records: [{ recordType: 'url', data: tagUrl }] });
      setStatus('done');
    } catch (err) {
      setStatus('error');
      alert('NFC write failed: ' + err.message);
    }
  };

  const handleReset = () => { setDescription(''); setCreatedTag(null); setStatus(''); };

  const handleDeleteTag = async (id) => {
    if (!window.confirm('Delete this tag?')) return;
    try { await deleteTag(id); loadMyTags(); } catch {}
  };

  const handleSaveEdit = async (id) => {
    try { await updateTag(id, { description: editText }); setEditingId(null); loadMyTags(); }
    catch (err) { alert(err.response?.data?.detail || 'Update failed.'); }
  };

  return (
    <div className={`upload-page-wrapper ${darkMode ? 'dark-mode' : ''}`}>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <div className="upload-container">
        <div className="upload-content">
          <h1 className="upload-title">🏷️ Program NFC Tag</h1>
          <p style={{ color: '#6b7280', marginBottom: '24px', textAlign: 'center' }}>
            Write a description, save it to the server, then hold your phone to a blank NFC sticker.
          </p>

          {nfcSupported === 'no' && (
            <div style={bannerStyle('#fef3c7', '#92400e')}>
              ⚠️ Web NFC is not supported here. Use <strong>Chrome on Android</strong> to write stickers.
              You can still create tags and note the ID to program later.
            </div>
          )}

          {/* ── Step 1: Create tag on server ── */}
          {!createdTag && (
            <form onSubmit={handleCreateTag} style={{ width: '100%', maxWidth: '560px', margin: '0 auto' }}>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label className="form-label">Tag Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="e.g. This is the bathroom door. Turn the handle right to open."
                  rows={5}
                  style={textareaStyle}
                  maxLength={2000}
                />
                <small style={{ color: '#9ca3af', textAlign: 'right' }}>{description.length}/2000</small>
              </div>
              <button className="auth-button" type="submit" disabled={status === 'saving' || !description.trim()}>
                {status === 'saving' ? 'Saving...' : '💾 Save to Server'}
              </button>
            </form>
          )}

          {/* ── Step 2: Write to physical sticker ── */}
          {createdTag && status !== 'done' && (
            <div style={cardStyle}>
              <div style={bannerStyle('#d1fae5', '#065f46')}>
                ✅ Tag saved! ID: <strong>{createdTag.id}</strong>
              </div>
              <p style={{ margin: '12px 0 4px', color: '#374151' }}>
                <strong>Description:</strong> {createdTag.description}
              </p>
              {nfcSupported === 'yes' ? (
                <>
                  <button className="auth-button" onClick={handleWriteNFC} disabled={status === 'writing'}
                    style={{ marginTop: '16px' }}>
                    {status === 'writing' ? '📡 Hold to sticker...' : '📡 Write to NFC Sticker'}
                  </button>
                  <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '8px' }}>
                    Hold your phone flat against the blank NFC sticker after pressing the button.
                  </p>
                </>
              ) : (
                <p style={{ marginTop: '12px', color: '#6b7280', fontSize: '14px' }}>
                  Manually program the sticker with URL: <br />
                  <code style={{ background: '#f3f4f6', padding: '4px 8px', borderRadius: '4px' }}>
                    {window.location.origin}/scan/{createdTag.id}
                  </code>
                </p>
              )}
              <button onClick={handleReset} style={ghostBtn}>Create another tag</button>
            </div>
          )}

          {status === 'done' && (
            <div style={cardStyle}>
              <div style={bannerStyle('#d1fae5', '#065f46')}>
                🎉 NFC sticker programmed successfully! Tag ID: <strong>{createdTag.id}</strong>
              </div>
              <button className="auth-button" onClick={handleReset} style={{ marginTop: '16px' }}>
                Program Another Tag
              </button>
            </div>
          )}

          {/* ── My Tags list ── */}
          {myTags.length > 0 && (
            <div style={{ width: '100%', maxWidth: '680px', margin: '40px auto 0' }}>
              <h2 style={{ fontWeight: '700', marginBottom: '16px' }}>My Tags ({myTags.length})</h2>
              {myTags.map(tag => (
                <div key={tag.id} style={tagRowStyle}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontFamily: 'monospace', background: '#f3f4f6',
                      padding: '2px 8px', borderRadius: '4px', fontSize: '13px' }}>
                      {tag.id}
                    </span>
                    {editingId === tag.id ? (
                      <textarea value={editText} onChange={e => setEditText(e.target.value)}
                        rows={3} style={{ ...textareaStyle, marginTop: '8px' }} />
                    ) : (
                      <p style={{ margin: '6px 0 0', color: '#374151', fontSize: '14px' }}>
                        {tag.description}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginLeft: '12px' }}>
                    {editingId === tag.id ? (
                      <>
                        <button onClick={() => handleSaveEdit(tag.id)} style={smallBtn('#10b981')}>Save</button>
                        <button onClick={() => setEditingId(null)} style={smallBtn('#6b7280')}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => { setEditingId(tag.id); setEditText(tag.description); }}
                          style={smallBtn('#3b82f6')}>Edit</button>
                        <button onClick={() => handleDeleteTag(tag.id)} style={smallBtn('#ef4444')}>Delete</button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer darkMode={darkMode} />
    </div>
  );
}

// ── Inline styles ─────────────────────────────────────────────────────────
const bannerStyle = (bg, color) => ({
  background: bg, color, padding: '10px 14px', borderRadius: '8px', marginBottom: '8px', fontSize: '14px',
});
const cardStyle = {
  background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px',
  padding: '24px', maxWidth: '560px', width: '100%', margin: '0 auto',
};
const textareaStyle = {
  width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db',
  fontSize: '15px', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box',
};
const tagRowStyle = {
  display: 'flex', alignItems: 'flex-start', background: '#fff',
  border: '1px solid #e5e7eb', borderRadius: '10px', padding: '14px 16px', marginBottom: '12px',
};
const smallBtn = (bg) => ({
  background: bg, color: '#fff', border: 'none', borderRadius: '6px',
  padding: '5px 12px', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
});
const ghostBtn = {
  background: 'transparent', border: '1px solid #d1d5db', borderRadius: '8px',
  padding: '8px 18px', cursor: 'pointer', marginTop: '12px', fontSize: '14px',
};
