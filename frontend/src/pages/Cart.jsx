import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import api from '../api';
import './Cart.css';

export default function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCart = async () => {
    try {
      const response = await api.get('cart/');
      setCart(response.data);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError('Please log in to view your cart.');
      } else {
        setError('Failed to load cart.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (itemId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1) return;
    
    try {
      await api.put('cart/update_item/', {
        item_id: itemId,
        quantity: newQuantity
      });
      fetchCart();
    } catch (err) {
      console.error('Failed to update quantity', err);
    }
  };

  const removeItem = async (itemId) => {
    try {
      await api.delete('cart/remove_item/', {
        data: { item_id: itemId }
      });
      fetchCart();
    } catch (err) {
      console.error('Failed to remove item', err);
    }
  };

  if (loading) return <div className="container loading-state mt-page">Loading cart...</div>;
  if (error) return <div className="container error-state mt-page">{error}</div>;

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="container empty-state mt-page">
        <h2>Your Cart is Empty</h2>
        <p>Looks like you haven't added anything to your cart yet.</p>
        <Link to="/products" className="btn-primary mt-4" style={{display: 'inline-flex'}}>Start Shopping</Link>
      </div>
    );
  }

  const fallbackImage = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop';

  return (
    <div className="cart-page container mt-page">
      <h1 className="page-title">Your Shopping Cart</h1>
      
      <div className="cart-layout">
        <div className="cart-items-section glass-panel">
          {cart.items.map(item => {
            const product = item.product_details;
            const imageUrl = product.images && product.images.length > 0 ? product.images[0].image : fallbackImage;
            
            return (
              <div key={item.id} className="cart-item">
                <img src={imageUrl} alt={product.name} className="cart-item-image" />
                
                <div className="cart-item-info">
                  <Link to={`/products/${product.id}`} className="cart-item-name">{product.name}</Link>
                  <div className="cart-item-price">${product.price}</div>
                </div>
                
                <div className="cart-item-actions">
                  <div className="quantity-controls">
                    <button onClick={() => updateQuantity(item.id, item.quantity, -1)} className="qty-btn"><Minus size={16}/></button>
                    <span className="qty-value">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity, 1)} className="qty-btn"><Plus size={16}/></button>
                  </div>
                  
                  <div className="item-total">${item.total_price.toFixed(2)}</div>
                  
                  <button onClick={() => removeItem(item.id)} className="remove-btn" title="Remove item">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="cart-summary-section glass-panel">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>${cart.cart_total.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>Calculated at checkout</span>
          </div>
          <div className="summary-row total-row">
            <span>Total</span>
            <span className="gradient-text">${cart.cart_total.toFixed(2)}</span>
          </div>
          
          <button className="btn-primary checkout-btn">
            Proceed to Checkout <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
