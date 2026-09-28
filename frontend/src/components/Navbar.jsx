import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, User, LogOut } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('access_token');

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  return (
    <nav className="navbar glass-panel">
      <div className="container navbar-container">
        <Link to="/" className="brand">
          <span className="gradient-text">ShopMind AI</span>
        </Link>
        <div className="nav-links">
          <Link to="/products" className="nav-item">Explore</Link>
          <Link to="/categories" className="nav-item">Categories</Link>
        </div>
        <div className="nav-actions">
          <button className="icon-btn" title="Search"><Search size={20} /></button>
          <Link to="/cart" className="icon-btn" title="Cart"><ShoppingCart size={20} /></Link>
          
          {isLoggedIn ? (
            <button onClick={handleLogout} className="icon-btn" title="Logout">
              <LogOut size={20} />
            </button>
          ) : (
            <Link to="/login" className="icon-btn" title="Login">
              <User size={20} />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
