import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './Checkout.css';

export default function Checkout() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shippingAddress, setShippingAddress] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await api.get('cart/');
        if (!response.data.items || response.data.items.length === 0) {
          navigate('/cart'); // Don't allow checkout with empty cart
        } else {
          setCart(response.data);
        }
      } catch (err) {
        setError('Failed to load cart for checkout.');
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [navigate]);

  const handleCheckout = async (e) => {
    e.preventDefault();
    setProcessing(true);
    
    try {
      await api.post('orders/checkout/', {
        shipping_address: shippingAddress
      });
      alert("Order placed successfully! In a real app, this would show your receipt.");
      navigate('/');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        alert(err.response.data.error);
      } else {
        alert('Failed to place order. Please try again.');
      }
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="container loading-state mt-page">Preparing checkout...</div>;
  if (error) return <div className="container error-state mt-page">{error}</div>;
  if (!cart) return null;

  return (
    <div className="checkout-page container mt-page">
      <h1 className="page-title">Checkout</h1>
      
      <div className="checkout-layout">
        <div className="checkout-form-section glass-panel">
          <h2>Shipping Information</h2>
          <form onSubmit={handleCheckout} className="checkout-form">
            <div className="form-group">
              <label htmlFor="shippingAddress">Full Shipping Address</label>
              <textarea 
                id="shippingAddress" 
                name="shippingAddress"
                className="form-input" 
                rows="4" 
                required
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="123 Main St, City, State, ZIP"
              />
            </div>
            
            <div className="payment-info mt-4">
              <h3>Payment</h3>
              <p className="text-secondary" style={{marginTop: '0.5rem'}}>This is a portfolio demo. Payment step is simulated.</p>
            </div>
            
            <button type="submit" className="btn-primary checkout-submit-btn" disabled={processing || !shippingAddress}>
              {processing ? 'Processing Order...' : `Place Order ($${cart.cart_total.toFixed(2)})`}
            </button>
          </form>
        </div>
        
        <div className="checkout-summary-section glass-panel">
          <h2>Order Summary</h2>
          <div className="checkout-items">
            {cart.items.map(item => (
              <div key={item.id} className="checkout-item-row">
                <span className="checkout-item-qty">{item.quantity}x</span>
                <span className="checkout-item-name">{item.product_details.name}</span>
                <span className="checkout-item-price">${item.total_price.toFixed(2)}</span>
              </div>
            ))}
          </div>
          
          <div className="summary-row mt-4 pt-4 border-t">
            <span>Subtotal</span>
            <span>${cart.cart_total.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className="summary-row total-row">
            <span>Total</span>
            <span className="gradient-text">${cart.cart_total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
