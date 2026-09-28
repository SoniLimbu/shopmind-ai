import React, { useState, useEffect } from 'react';
import api from '../api';
import ProductCard from '../components/ProductCard';
import './Home.css';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('products/');
        // Handle paginated response
        setProducts(response.data.results || response.data);
      } catch (err) {
        setError('Failed to fetch products. Is the backend running?');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="home-page container">
      <header className="hero-section">
        <h1 className="hero-title">Discover the Future of <br/><span className="gradient-text">Smart Shopping</span></h1>
        <p className="hero-subtitle">ShopMind AI curates the best products tailored just for you.</p>
      </header>

      <section className="products-section">
        <div className="section-header">
          <h2>Trending Products</h2>
        </div>
        
        {loading && <div className="loading-state">Loading amazing products...</div>}
        {error && <div className="error-state">{error}</div>}
        
        {!loading && !error && products.length === 0 && (
          <div className="empty-state">
            <h3>No products found!</h3>
            <p>Add some products from the Django Admin to see them here.</p>
          </div>
        )}

        <div className="products-grid">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
