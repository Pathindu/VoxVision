import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import '../Components/LoginRegister.css';

export default function LoginRegister() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    confirmPassword: ''
  });
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      alert('Please fill in all fields');
      return;
    }
    // Add your login logic here
    alert('Login successful!');
    navigate('/');
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.username || !formData.password || !formData.confirmPassword) {
      alert('Please fill in all fields');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    // Add your registration logic here
    alert('Registration successful!');
    setIsLogin(true);
    setFormData({
      username: '',
      password: '',
      fullName: '',
      email: '',
      confirmPassword: ''
    });
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setFormData({
      username: '',
      password: '',
      fullName: '',
      email: '',
      confirmPassword: ''
    });
  };

  return (
    <>
    {/* Navbar */}
              <Navbar />
    <div className="auth-container">
        
      <div className="auth-wrapper">
        <div className="auth-card">
          <h1 className="auth-title">
            {isLogin ? 'Welcome Back' : 'Create Your Account'}
          </h1>

          {isLogin ? (
            // Login Form
            <form onSubmit={handleLogin} className="auth-form">
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Enter your username"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className="form-input"
                />
              </div>

              <button type="submit" className="auth-button">
                LOGIN
              </button>

              <a href="#forgot" className="forgot-link">
                Forgot Password?
              </a>

              <p className="switch-text">
                Don't have an account?{' '}
                <span className="switch-link" onClick={toggleForm}>
                  Register here
                </span>
              </p>
            </form>
          ) : (
            // Register Form
            <form onSubmit={handleRegister} className="auth-form">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter your name"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Choose a username"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Create a secure password"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your secure password"
                  className="form-input"
                />
              </div>

              <button type="submit" className="auth-button">
                CREATE ACCOUNT
              </button>

              <p className="switch-text">
                Already have an account?{' '}
                <span className="switch-link" onClick={toggleForm}>
                  Login here
                </span>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>

    {/* Footer */}
    <Footer/>
    </>
  );
}