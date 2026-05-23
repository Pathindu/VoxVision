import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import { useAuth } from '../context/AuthContext';
import { createOrder, createDonation } from '../services/api';

const PRODUCTS = [
  { name: 'VoxVision NFC Tag Pack (10 stickers)', price: 350,  description: '10 blank NFC stickers ready to program.' },
  { name: 'VoxVision NFC Tag Pack (50 stickers)', price: 1500, description: '50 blank NFC stickers – best value for caregivers.' },
  { name: 'VoxVision Starter Kit',               price: 800,  description: '10 NFC stickers + quick-start guide card.' },
];

const PAYHERE_MERCHANT_ID = process.env.REACT_APP_PAYHERE_MERCHANT_ID || '1235833';
const PAYHERE_NOTIFY_URL  = `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/payments/webhook`;
const PAYHERE_RETURN_URL  = `${window.location.origin}/store?payment=success`;
const PAYHERE_CANCEL_URL  = `${window.location.origin}/store?payment=cancelled`;

function launchPayhere({ orderId, amount, name, email, phone, itemName, customType, hash }, navigate) {
  
  // ── QUICK TOGGLE ──
  // Comment these 2 lines to ENABLE PAYHERE
  // Uncomment them to ENABLE SUPPORT PAGE
  navigate('/OrderSupport');
  return; 

  /* // ── PAYHERE LIVE CODE ──
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = 'https://sandbox.payhere.lk/pay/checkout';

  const fields = {
    merchant_id: PAYHERE_MERCHANT_ID,
    return_url: PAYHERE_RETURN_URL,
    cancel_url: PAYHERE_CANCEL_URL,
    notify_url: PAYHERE_NOTIFY_URL,
    order_id: orderId,
    items: itemName,
    currency: 'LKR',
    amount: amount.toFixed(2),
    first_name: name.split(' ')[0] || name,
    last_name: name.split(' ').slice(1).join(' ') || 'N/A',
    email: email,
    phone: phone || '0771234567',
    address: 'N/A', city: 'Colombo', country: 'Sri Lanka',
    custom_1: customType, custom_2: orderId, hash: hash
  };

  Object.entries(fields).forEach(([key, val]) => {
    const input = document.createElement('input');
    input.type = 'hidden'; input.name = key; input.value = val;
    form.appendChild(input);
  });
  document.body.appendChild(form);
  form.submit();
  */
}

export default function Store({ darkMode, toggleDarkMode }) {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('shop');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderForm, setOrderForm] = useState({ product: PRODUCTS[0], quantity: 1, address: '', phone: '' });
  const [donateForm, setDonateForm] = useState({ donor_name: '', donor_email: '', amount: '', message: '', phone: '' });

  const handleOrder = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) { navigate('/login'); return; }
    if (!orderForm.address.trim()) { setError('Please enter a shipping address.'); return; }
    setLoading(true); setError('');
    try {
      const res = await createOrder({
        product_name: orderForm.product.name, quantity: parseInt(orderForm.quantity),
        unit_price: orderForm.product.price, shipping_address: orderForm.address,
      });
      launchPayhere({
        orderId: res.data.id, amount: res.data.total_amount, name: user?.full_name || 'Customer',
        email: user?.email || 'customer@example.com', phone: orderForm.phone,
        itemName: orderForm.product.name, customType: 'order', hash: res.data.hash
      }, navigate);
    } catch (err) {
      const msg = err.response?.data?.detail;
      setError(typeof msg === 'object' ? JSON.stringify(msg) : (msg || 'Failed to create order.'));
      setLoading(false);
    }
  };

  const handleDonate = async (e) => {
    e.preventDefault();
    if (!donateForm.donor_name || !donateForm.donor_email || !donateForm.amount) { setError('All fields required.'); return; }
    setLoading(true); setError('');
    try {
      const res = await createDonation({
        donor_name: donateForm.donor_name, donor_email: donateForm.donor_email,
        amount: parseFloat(donateForm.amount), message: donateForm.message || undefined,
      });
      launchPayhere({
        orderId: res.data.id, amount: res.data.amount, name: donateForm.donor_name,
        email: donateForm.donor_email, phone: donateForm.phone || '0771234567',
        itemName: 'VoxVision Donation', customType: 'donation', hash: res.data.hash
      }, navigate);
    } catch (err) {
      const msg = err.response?.data?.detail;
      setError(typeof msg === 'object' ? JSON.stringify(msg) : (msg || 'Failed to process donation.'));
      setLoading(false);
    }
  };

  return (
    <div className={`upload-page-wrapper ${darkMode ? 'dark-mode' : ''}`}>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <div className="upload-container">
        <div className="upload-content" style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h1 className="upload-title">🛒 VoxVision Store</h1>
          {error && <div style={banner('#fee2e2', '#dc2626')}>❌ {error}</div>}
          
          <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', justifyContent: 'center' }}>
            <button onClick={() => setTab('shop')} style={tabBtn(tab === 'shop')}>🏷️ Shop</button>
            <button onClick={() => setTab('donate')} style={tabBtn(tab === 'donate')}>❤️ Donate</button>
          </div>

          {tab === 'shop' && (
            <form onSubmit={handleOrder} style={formCard}>
              {/* Product selection logic ... */}
              <button className="auth-button" type="submit" disabled={loading}>
                {loading ? 'Processing...' : 'Proceed to Inquiry'}
              </button>
            </form>
          )}
          {tab === 'donate' && (
            <form onSubmit={handleDonate} style={formCard}>
              {/* Donation fields ... */}
              <button className="auth-button" type="submit" disabled={loading}>
                {loading ? 'Processing...' : 'Submit Support Request'}
              </button>
            </form>
          )}
        </div>
      </div>
      <Footer darkMode={darkMode} />
    </div>
  );
}

const tabBtn = (active) => ({ padding: '10px 28px', borderRadius: '8px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', border: active ? 'none' : '1px solid #e5e7eb', background: active ? '#6d28d9' : '#fff', color: active ? '#fff' : '#374151' });
const banner = (bg, color) => ({ background: bg, color, padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' });
const formCard = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '28px' };