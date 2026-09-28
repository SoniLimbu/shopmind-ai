import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import api from '../api';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainImage, setMainImage] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`products/${id}/`);
        setProduct(response.data);
        if (response.data.images && response.data.images.length > 0) {
          setMainImage(response.data.images[0].image);
        }
      } catch (err) {
        setError('Failed to load product details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="container loading-state mt-page">Loading product details...</div>;
  if (error) return <div className="container error-state mt-page">{error}</div>;
  if (!product) return <div className="container empty-state mt-page">Product not found.</div>;

  const fallbackImage = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop';

  return (
    <div className="product-detail-page container mt-page">
      <Link to="/" className="back-link">
        <ArrowLeft size={20} /> Back to Products
      </Link>
      
      <div className="product-layout glass-panel">
        <div className="product-gallery">
          <div className="main-image-container">
            <img src={mainImage || fallbackImage} alt={product.name} className="main-image" />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="thumbnail-list">
              {product.images.map((img) => (
                <img 
                  key={img.id} 
                  src={img.image} 
                  alt="Thumbnail" 
                  className={`thumbnail ${mainImage === img.image ? 'active' : ''}`}
                  onClick={() => setMainImage(img.image)}
                />
              ))}
            </div>
          )}
        </div>
        
        <div className="product-info">
          {product.category && <span className="category-badge">{product.category.name}</span>}
          <h1 className="product-title">{product.name}</h1>
          
          <div className="product-meta">
            <div className="rating-badge">⭐ {product.rating}</div>
            <div className="stock-status">
              {product.stock > 0 ? (
                <span className="in-stock"><Check size={16} /> In Stock ({product.stock})</span>
              ) : (
                <span className="out-of-stock"><AlertCircle size={16} /> Out of Stock</span>
              )}
            </div>
            {product.brand && <div className="brand-name">Brand: {product.brand}</div>}
          </div>
          
          <div className="price-section">
            <span className="price">${product.price}</span>
            {product.discount_percentage > 0 && (
              <span className="discount-badge">-{product.discount_percentage}% OFF</span>
            )}
          </div>
          
          <div className="product-description">
            <h3>About this item</h3>
            <p>{product.description}</p>
          </div>
          
          {product.specifications && product.specifications.length > 0 && (
            <div className="product-specs">
              <h3>Specifications</h3>
              <ul className="spec-list">
                {product.specifications.map(spec => (
                  <li key={spec.id}>
                    <span className="spec-key">{spec.key}:</span> 
                    <span className="spec-value">{spec.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="actions">
            <button className="btn-primary" disabled={product.stock === 0}>
              <ShoppingCart size={20} />
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
