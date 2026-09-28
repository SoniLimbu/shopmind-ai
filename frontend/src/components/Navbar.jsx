import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Search, User } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
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
          <button className="icon-btn"><Search size={20} /></button>
          <Link to="/cart" className="icon-btn"><ShoppingCart size={20} /></Link>
          <button className="icon-btn"><User size={20} /></button>
        </div>
      </div>
    </nav>
  );
}
