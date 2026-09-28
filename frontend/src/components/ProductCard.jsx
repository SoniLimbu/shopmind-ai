import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import './ProductCard.css';

export default function ProductCard({ product }) {
  // Using a placeholder image if product has no images yet
  const imageUrl = product.images && product.images.length > 0 
    ? product.images[0].image 
    : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop';

  return (
    <div className="product-card glass-panel">
      <Link to={`/products/${product.id}`} className="card-image-link">
        <div className="image-wrapper">
          <img src={imageUrl} alt={product.name} className="product-image" />
        </div>
      </Link>
      
      <div className="card-content">
        <div className="card-header">
          {product.category && <span className="category-badge">{product.category.name}</span>}
          <div className="rating">⭐ {product.rating}</div>
        </div>
        
        <Link to={`/products/${product.id}`}>
          <h3 className="product-name">{product.name}</h3>
        </Link>
        
        <div className="card-footer">
          <span className="price">${product.price}</span>
          <button className="add-to-cart-btn" aria-label="Add to cart">
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
