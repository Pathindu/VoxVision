import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import { useAuth } from '../context/AuthContext';
import { createOrder, createDonation } from '../services/api';

const PRODUCTS = [
  { name: 'VoxVision NFC Tag Pack (10 stickers)', price: 350,  description: '10 blank NFC stickers ready to program.' },
  { name: 'VoxVision NFC Tag Pack (50 stickers)', price: 1500, description: '50 blank NFC stickers – best value for caregivers.' },
  { name: 'VoxVision Starter Kit',                price: 800,  description: '10 NFC stickers + quick-start guide card.' },
];

// ── PayHere sandbox config ────────────────────────────────────────────────
const PAYHERE_MERCHANT_ID = process.env.REACT_APP_PAYHERE_MERCHANT_ID || '1230213';
const PAYHERE_NOTIFY_URL  = `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/payments/webhook`;
const PAYHERE_RETURN_URL  = `${window.location.origin}/store?payment=success`;
const PAYHERE_CANCEL_URL  = `${window.location.origin}/store?payment=cancelled`;

function launchPayhere({ orderId, amount, name, email, phone, itemName, customType }) {
  // Create a hidden HTML form and submit it to PayHere sandbox
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = 'https://sandbox.payhere.lk/pay/checkout';

  const fields = {
    merchant_id:   PAYHERE_MERCHANT_ID,
    return_url:    PAYHERE_RETURN_URL,
    cancel_url:    PAYHERE_CANCEL_URL,
    notify_url:    PAYHERE_NOTIFY_URL,
    order_id:      orderId,
    items:         itemName,
    currency:      'LKR',
    amount:        amount.toFixed(2),
    first_name:    name.split(' ')[0] || name,
    last_name:     name.split(' ').slice(1).join(' ') || 'N/A',
    email:         email,
    phone:         phone || '0771234567',
    address:       'N/A',
    city:          'Colombo',
    country:       'Sri Lanka',
    custom_1:      customType,   // 'order' or 'donation'
    custom_2:      orderId,      // internal record ID
  };

  Object.entries(fields).forEach(([key, val]) => {
    const input = document.createElement('input');
    input.type  = 'hidden';
    input.name  = key;
    input.value = val;
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
}

export default function Store({ darkMode, toggleDarkMode }) {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab]         = useState('shop');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  // ── Order form ────────────────────────────────────────────────────────
  const [orderForm, setOrderForm] = useState({
    product: PRODUCTS[0], quantity: 1, address: '', phone: '',
  });

  // ── Donation form ──────────────────────────────────────────────────────
  const [donateForm, setDonateForm] = useState({
    donor_name: '', donor_email: '', amount: '', message: '', phone: '',
  });

  // Check for payment return
  const params = new URLSearchParams(window.location.search);
  const paymentStatus = params.get('payment');

  // ── Place Order → PayHere ─────────────────────────────────────────────
  const handleOrder = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) { navigate('/login'); return; }
    if (!orderForm.address.trim()) { setError('Please enter a shipping address.'); return; }
    setLoading(true); setError('');
    try {
      const res = await createOrder({
        product_name:     orderForm.product.name,
        quantity:         parseInt(orderForm.quantity),
        unit_price:       orderForm.product.price,
        shipping_address: orderForm.address,
      });
      // Launch PayHere checkout
      launchPayhere({
        orderId:    res.data.id,
        amount:     res.data.total_amount,
        name:       user?.full_name || user?.username || 'Customer',
        email:      user?.email || 'customer@example.com',
        phone:      orderForm.phone,
        itemName:   orderForm.product.name,
        customType: 'order',
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create order.');
      setLoading(false);
    }
  };

  // ── Donate → PayHere ──────────────────────────────────────────────────
  const handleDonate = async (e) => {
    e.preventDefault();
    if (!donateForm.donor_name || !donateForm.donor_email || !donateForm.amount) {
      setError('Please fill in all required fields.'); return;
    }
    if (parseFloat(donateForm.amount) <= 0) { setError('Please enter a valid amount.'); return; }
    setLoading(true); setError('');
    try {
      const res = await createDonation({
        donor_name:  donateForm.donor_name,
        donor_email: donateForm.donor_email,
        amount:      parseFloat(donateForm.amount),
        message:     donateForm.message || undefined,
      });
      // Launch PayHere checkout
      launchPayhere({
        orderId:    res.data.id,
        amount:     res.data.amount,
        name:       donateForm.donor_name,
        email:      donateForm.donor_email,
        phone:      donateForm.phone || '0771234567',
        itemName:   'VoxVision Donation',
        customType: 'donation',
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to process donation.');
      setLoading(false);
    }
  };

  const resetFeedback = () => { setError(''); setSuccess(''); };

  return (
    <div className={`upload-page-wrapper ${darkMode ? 'dark-mode' : ''}`}>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <div className="upload-container">
        <div className="upload-content" style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h1 className="upload-title">🛒 VoxVision Store</h1>

          {/* Payment return banners */}
          {paymentStatus === 'success' && (
            <div style={banner('#d1fae5', '#065f46')}>
              🎉 Payment successful! Your order has been confirmed.
            </div>
          )}
          {paymentStatus === 'cancelled' && (
            <div style={banner('#fef3c7', '#92400e')}>
              ⚠️ Payment was cancelled. Your order is saved — try again anytime.
            </div>
          )}

          {/* Tab switcher */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', justifyContent: 'center' }}>
            <button onClick={() => { setTab('shop'); resetFeedback(); }} style={tabBtn(tab === 'shop')}>
              🏷️ Buy NFC Tags
            </button>
            <button onClick={() => { setTab('donate'); resetFeedback(); }} style={tabBtn(tab === 'donate')}>
              ❤️ Donate
            </button>
          </div>

          {error && <div style={banner('#fee2e2', '#dc2626')}>❌ {error}</div>}

          {/* ── Shop tab ── */}
          {tab === 'shop' && (
            <form onSubmit={handleOrder} style={formCard}>
              <h2 style={sectionTitle}>Select Product</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                {PRODUCTS.map(p => (
                  <label key={p.name} style={{
                    ...productCard,
                    borderColor: orderForm.product.name === p.name ? '#6d28d9' : '#e5e7eb',
                    background:  orderForm.product.name === p.name ? '#f5f3ff' : '#fff',
                  }}>
                    <input type="radio" name="product"
                      checked={orderForm.product.name === p.name}
                      onChange={() => setOrderForm({ ...orderForm, product: p })}
                      style={{ marginRight: '12px' }} />
                    <div style={{ flex: 1 }}>
                      <strong>{p.name}</strong>
                      <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#6b7280' }}>{p.description}</p>
                    </div>
                    <span style={{ fontWeight: '700', color: '#6d28d9', whiteSpace: 'nowrap', marginLeft: '12px' }}>
                      LKR {p.price.toLocaleString()}
                    </span>
                  </label>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '120px' }}>
                  <label className="form-label">Quantity</label>
                  <input type="number" min="1" max="100" value={orderForm.quantity}
                    onChange={e => setOrderForm({ ...orderForm, quantity: e.target.value })}
                    className="form-input" style={{ marginTop: '6px' }} />
                </div>
                <div style={{ flex: 2, minWidth: '180px' }}>
                  <label className="form-label">Total</label>
                  <div className="form-input" style={{
                    marginTop: '6px', background: '#f9fafb',
                    fontWeight: '700', color: '#6d28d9',
                  }}>
                    LKR {(orderForm.product.price * (parseInt(orderForm.quantity) || 1)).toLocaleString()}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label className="form-label">Phone Number</label>
                <input type="tel" value={orderForm.phone}
                  onChange={e => setOrderForm({ ...orderForm, phone: e.target.value })}
                  placeholder="07XXXXXXXX" className="form-input" style={{ marginTop: '6px' }} />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label className="form-label">Shipping Address</label>
                <textarea value={orderForm.address}
                  onChange={e => setOrderForm({ ...orderForm, address: e.target.value })}
                  placeholder="Full postal address including city and postal code"
                  rows={3} className="form-input"
                  style={{ marginTop: '6px', resize: 'vertical', width: '100%', boxSizing: 'border-box' }} />
              </div>

              {!isLoggedIn && (
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>
                  You need to{' '}
                  <span onClick={() => navigate('/login')}
                    style={{ color: '#6d28d9', cursor: 'pointer', fontWeight: '600' }}>
                    log in
                  </span>{' '}
                  to place an order.
                </p>
              )}

              <button className="auth-button" type="submit" disabled={loading}>
                {loading ? 'Redirecting to PayHere...' : '💳 Pay with PayHere'}
              </button>

              <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '10px', textAlign: 'center' }}>
                🔒 Secured by PayHere Sandbox
              </p>
            </form>
          )}

          {/* ── Donate tab ── */}
          {tab === 'donate' && (
            <form onSubmit={handleDonate} style={formCard}>
              <h2 style={sectionTitle}>Support VoxVision</h2>
              <p style={{ color: '#6b7280', marginBottom: '20px', fontSize: '15px' }}>
                Your donation helps us provide free NFC stickers to caregivers and maintain
                the platform for visually impaired users across Sri Lanka.
              </p>

              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '180px' }}>
                  <label className="form-label">Your Name *</label>
                  <input type="text" value={donateForm.donor_name}
                    onChange={e => setDonateForm({ ...donateForm, donor_name: e.target.value })}
                    placeholder="Full name" className="form-input" style={{ marginTop: '6px' }} />
                </div>
                <div style={{ flex: 1, minWidth: '180px' }}>
                  <label className="form-label">Email *</label>
                  <input type="email" value={donateForm.donor_email}
                    onChange={e => setDonateForm({ ...donateForm, donor_email: e.target.value })}
                    placeholder="your@email.com" className="form-input" style={{ marginTop: '6px' }} />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label className="form-label">Phone</label>
                <input type="tel" value={donateForm.phone}
                  onChange={e => setDonateForm({ ...donateForm, phone: e.target.value })}
                  placeholder="07XXXXXXXX" className="form-input" style={{ marginTop: '6px' }} />
              </div>

              <label className="form-label">Donation Amount (LKR) *</label>
              <div style={{ display: 'flex', gap: '10px', margin: '8px 0 4px', flexWrap: 'wrap' }}>
                {[250, 500, 1000, 2500].map(amt => (
                  <button key={amt} type="button"
                    onClick={() => setDonateForm({ ...donateForm, amount: String(amt) })}
                    style={{
                      padding: '6px 16px', borderRadius: '20px', border: '1px solid #d1d5db',
                      background: donateForm.amount === String(amt) ? '#6d28d9' : '#fff',
                      color:      donateForm.amount === String(amt) ? '#fff' : '#374151',
                      cursor: 'pointer', fontWeight: '600', fontSize: '14px',
                    }}>
                    {amt.toLocaleString()}
                  </button>
                ))}
              </div>
              <input type="number" min="1" value={donateForm.amount}
                onChange={e => setDonateForm({ ...donateForm, amount: e.target.value })}
                placeholder="Or enter custom amount" className="form-input"
                style={{ marginBottom: '16px' }} />

              <label className="form-label">Message (optional)</label>
              <textarea value={donateForm.message}
                onChange={e => setDonateForm({ ...donateForm, message: e.target.value })}
                placeholder="Leave an encouraging message…"
                rows={3} className="form-input"
                style={{ marginTop: '6px', marginBottom: '20px', resize: 'vertical', width: '100%', boxSizing: 'border-box' }} />

              <button className="auth-button" type="submit" disabled={loading}>
                {loading ? 'Redirecting to PayHere...' : '❤️ Donate with PayHere'}
              </button>

              <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '10px', textAlign: 'center' }}>
                🔒 Secured by PayHere Sandbox
              </p>
            </form>
          )}
        </div>
      </div>

      <Footer darkMode={darkMode} />
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────
const tabBtn = (active) => ({
  padding: '10px 28px', borderRadius: '8px', fontWeight: '700',
  fontSize: '15px', cursor: 'pointer',
  border:      active ? 'none' : '1px solid #e5e7eb',
  background:  active ? '#6d28d9' : '#fff',
  color:       active ? '#fff'    : '#374151',
});
const banner = (bg, color) => ({
  background: bg, color, padding: '12px 16px',
  borderRadius: '8px', marginBottom: '16px', fontSize: '14px',
});
const formCard = {
  background: '#fff', border: '1px solid #e5e7eb',
  borderRadius: '14px', padding: '28px',
};
const sectionTitle = {
  fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#111827',
};
const productCard = {
  display: 'flex', alignItems: 'center', padding: '14px 16px',
  border: '2px solid', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.15s',
};