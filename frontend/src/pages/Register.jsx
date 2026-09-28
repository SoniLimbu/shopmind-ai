import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import './Auth.css';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    username: '', email: '', password: '', password_confirm: '' 
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.password_confirm) {
      setError("Passwords don't match.");
      setLoading(false);
      return;
    }

    try {
      await api.post('auth/register/', formData);
      // Automatically log them in after registration
      const loginResponse = await api.post('auth/login/', {
        username: formData.username,
        password: formData.password
      });
      localStorage.setItem('access_token', loginResponse.data.access);
      localStorage.setItem('refresh_token', loginResponse.data.refresh);
      navigate('/');
      window.location.reload();
    } catch (err) {
      setError('Registration failed. Username or email might be taken.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card glass-panel">
        <h2 className="gradient-text">Create Account</h2>
        <p className="auth-subtitle">Join ShopMind AI today</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input 
              type="text" id="username" name="username" 
              className="form-input" required 
              value={formData.username} onChange={handleChange} 
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" id="email" name="email" 
              className="form-input" required 
              value={formData.email} onChange={handleChange} 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" id="password" name="password" 
              className="form-input" required 
              value={formData.password} onChange={handleChange} 
            />
          </div>

          <div className="form-group">
            <label htmlFor="password_confirm">Confirm Password</label>
            <input 
              type="password" id="password_confirm" name="password_confirm" 
              className="form-input" required 
              value={formData.password_confirm} onChange={handleChange} 
            />
          </div>
          
          <button type="submit" className="btn-primary auth-btn" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
        
        <div className="auth-redirect">
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
}
