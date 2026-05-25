import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import { useAuth } from '../context/AuthContext';
import { loginUser, registerUser } from '../services/api';
import '../Components/LoginRegister.css';

export default function LoginRegister({ darkMode, toggleDarkMode }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [formData, setFormData] = useState({
    username: '', password: '', fullName: '', email: '',
    confirmPassword: '', isCaregiver: false,
  });

  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleChange = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: val });
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      const res = await loginUser({ username: formData.username, password: formData.password });
      login(res.data.access_token, res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Check your credentials.');
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.username || !formData.password) {
      setError('Please fill in all fields.'); return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.'); return;
    }
    setLoading(true);
    try {
      await registerUser({
        full_name:    formData.fullName,
        email:        formData.email,
        username:     formData.username,
        password:     formData.password,
        is_caregiver: formData.isCaregiver,
      });
      setError('');
      alert('Account created! Please log in.');
      toggleForm();
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed.');
    } finally { setLoading(false); }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({ username: '', password: '', fullName: '', email: '', confirmPassword: '', isCaregiver: false });
  };

  return (
    <div className={`auth-wrapper ${darkMode ? 'dark-mode' : 'light-theme'}`}>
      {/* Navigation */}
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">{isLogin ? 'Welcome Back' : 'Create Your Account'}</h1>

          {error && (
            <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px',
              borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
              {error}
            </div>
          )}

          {isLogin ? (
            <form onSubmit={handleLogin} className="auth-form">
              <div className="form-group">
                <label className="form-label">Username</label>
                <input type="text" name="username" value={formData.username}
                  onChange={handleChange} placeholder="Enter your username" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input type="password" name="password" value={formData.password}
                  onChange={handleChange} placeholder="Enter your password" className="form-input" />
              </div>
              <button type="submit" className="auth-button" disabled={loading}>
                {loading ? 'LOGGING IN...' : 'LOGIN'}
              </button>
              <p className="switch-text">
                Don't have an account?{' '}
                <span className="switch-link" onClick={toggleForm}>Register here</span>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="auth-form">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" name="fullName" value={formData.fullName}
                  onChange={handleChange} placeholder="Enter your name" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" name="email" value={formData.email}
                  onChange={handleChange} placeholder="Enter your email" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input type="text" name="username" value={formData.username}
                  onChange={handleChange} placeholder="Choose a username" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input type="password" name="password" value={formData.password}
                  onChange={handleChange} placeholder="Create a secure password" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input type="password" name="confirmPassword" value={formData.confirmPassword}
                  onChange={handleChange} placeholder="Confirm your password" className="form-input" />
              </div>
              <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                <input type="checkbox" name="isCaregiver" id="isCaregiver"
                  checked={formData.isCaregiver} onChange={handleChange}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                <label htmlFor="isCaregiver" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>
                  I am a Caregiver (can program NFC tags)
                </label>
              </div>
              <button type="submit" className="auth-button" disabled={loading}>
                {loading ? 'CREATING...' : 'CREATE ACCOUNT'}
              </button>
              <p className="switch-text">
                Already have an account?{' '}
                <span className="switch-link" onClick={toggleForm}>Login here</span>
              </p>
            </form>
          )}
        </div>
      </div>

      <Footer darkMode={darkMode} />
    </div>
  );
}
