import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import { useAuth } from '../context/AuthContext';
import { createOrder, createDonation } from '../services/api';

const PRODUCTS = [
  { name: 'VoxVision NFC Tag Pack (10 stickers)', price: 350, description: '10 blank NFC stickers ready to program.' },
  { name: 'VoxVision NFC Tag Pack (50 stickers)', price: 1500, description: '50 blank NFC stickers – best value for caregivers.' },
  { name: 'VoxVision Starter Kit',                price: 800,  description: '10 NFC stickers + quick-start guide card.' },
];

export default function Store({ darkMode, toggleDarkMode }) {
  const { isLoggedIn } = useAuth();
  const navigate       = useNavigate();

  const [tab, setTab]       = useState('shop');  // 'shop' | 'donate'
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError]     = useState('');

  // ── Order form ─────────────────────────────────────────────────────────
  const [orderForm, setOrderForm] = useState({
    product: PRODUCTS[0], quantity: 1, address: '',
  });

  // ── Donation form ──────────────────────────────────────────────────────
  const [donateForm, setDonateForm] = useState({
    donor_name: '', donor_email: '', amount: '', message: '',
  });

  // ─── Order helpers ─────────────────────────────────────────────────────
  const handleOrder = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) { navigate('/login'); return; }
    if (!orderForm.address.trim()) { setError('Please enter a shipping address.'); return; }
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await createOrder({
        product_name:     orderForm.product.name,
        quantity:         parseInt(orderForm.quantity),
        unit_price:       orderForm.product.price,
        shipping_address: orderForm.address,
      });
      const total = res.data.total_amount.toLocaleString('en-LK', { style: 'currency', currency: 'LKR' });
      setSuccess(`Order #${res.data.id.slice(0, 8)} placed! Total: ${total}. We'll contact you for payment.`);
      setOrderForm({ product: PRODUCTS[0], quantity: 1, address: '' });
    } catch (err) {
      setError(err.response?.data?.detail || 'Order failed. Please try again.');
    } finally { setLoading(false); }
  };

  // ─── Donation helpers ──────────────────────────────────────────────────
  const handleDonate = async (e) => {
    e.preventDefault();
    if (!donateForm.donor_name || !donateForm.donor_email || !donateForm.amount) {
      setError('Please fill in all required fields.'); return;
    }
    if (parseFloat(donateForm.amount) <= 0) { setError('Please enter a valid amount.'); return; }
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await createDonation({
        donor_name:  donateForm.donor_name,
        donor_email: donateForm.donor_email,
        amount:      parseFloat(donateForm.amount),
        message:     donateForm.message || undefined,
      });
      setSuccess(`Thank you for your donation of LKR ${res.data.amount}! Your support helps visually impaired users.`);
      setDonateForm({ donor_name: '', donor_email: '', amount: '', message: '' });
    } catch (err) {
      setError(err.response?.data?.detail || 'Donation failed. Please try again.');
    } finally { setLoading(false); }
  };

  const resetFeedback = () => { setError(''); setSuccess(''); };

  return (
    <div className={`upload-page-wrapper ${darkMode ? 'dark-mode' : ''}`}>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <div className="upload-container">
        <div className="upload-content" style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h1 className="upload-title">🛒 VoxVision Store</h1>

          {/* Tab switcher */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', justifyContent: 'center' }}>
            <button onClick={() => { setTab('shop'); resetFeedback(); }}
              style={tabBtn(tab === 'shop')}>🏷️ Buy NFC Tags</button>
            <button onClick={() => { setTab('donate'); resetFeedback(); }}
              style={tabBtn(tab === 'donate')}>❤️ Donate</button>
          </div>

          {error   && <div style={banner('#fee2e2', '#dc2626')}>❌ {error}</div>}
          {success && <div style={banner('#d1fae5', '#065f46')}>✅ {success}</div>}

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
                    <div>
                      <strong>{p.name}</strong>
                      <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#6b7280' }}>{p.description}</p>
                    </div>
                    <span style={{ marginLeft: 'auto', fontWeight: '700', color: '#6d28d9', whiteSpace: 'nowrap' }}>
                      LKR {p.price.toLocaleString()}
                    </span>
                  </label>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '140px' }}>
                  <label className="form-label">Quantity</label>
                  <input type="number" min="1" max="100" value={orderForm.quantity}
                    onChange={e => setOrderForm({ ...orderForm, quantity: e.target.value })}
                    className="form-input" style={{ marginTop: '6px' }} />
                </div>
                <div style={{ flex: 2, minWidth: '200px' }}>
                  <label className="form-label">Total</label>
                  <div className="form-input" style={{
                    marginTop: '6px', background: '#f9fafb', fontWeight: '700', color: '#6d28d9',
                  }}>
                    LKR {(orderForm.product.price * (parseInt(orderForm.quantity) || 1)).toLocaleString()}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label className="form-label">Shipping Address</label>
                <textarea value={orderForm.address}
                  onChange={e => setOrderForm({ ...orderForm, address: e.target.value })}
                  placeholder="Full postal address including city and postal code"
                  rows={3} className="form-input" style={{ marginTop: '6px', resize: 'vertical', width: '100%', boxSizing: 'border-box' }} />
              </div>

              {!isLoggedIn && (
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>
                  You need to <span onClick={() => navigate('/login')} style={{ color: '#6d28d9', cursor: 'pointer', fontWeight: '600' }}>
                    log in</span> to place an order.
                </p>
              )}
              <button className="auth-button" type="submit" disabled={loading}>
                {loading ? 'Placing order…' : '🛒 Place Order'}
              </button>
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
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <label className="form-label">Your Name *</label>
                  <input type="text" value={donateForm.donor_name}
                    onChange={e => setDonateForm({ ...donateForm, donor_name: e.target.value })}
                    placeholder="Full name" className="form-input" style={{ marginTop: '6px' }} />
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <label className="form-label">Email *</label>
                  <input type="email" value={donateForm.donor_email}
                    onChange={e => setDonateForm({ ...donateForm, donor_email: e.target.value })}
                    placeholder="your@email.com" className="form-input" style={{ marginTop: '6px' }} />
                </div>
              </div>

              {/* Quick amount buttons */}
              <label className="form-label">Donation Amount (LKR) *</label>
              <div style={{ display: 'flex', gap: '10px', margin: '8px 0 4px', flexWrap: 'wrap' }}>
                {[250, 500, 1000, 2500].map(amt => (
                  <button key={amt} type="button"
                    onClick={() => setDonateForm({ ...donateForm, amount: String(amt) })}
                    style={{
                      padding: '6px 16px', borderRadius: '20px', border: '1px solid #d1d5db',
                      background: donateForm.amount === String(amt) ? '#6d28d9' : '#fff',
                      color: donateForm.amount === String(amt) ? '#fff' : '#374151',
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
                {loading ? 'Processing…' : '❤️ Donate Now'}
              </button>
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
  padding: '10px 28px', borderRadius: '8px', fontWeight: '700', fontSize: '15px', cursor: 'pointer',
  border: active ? 'none' : '1px solid #e5e7eb',
  background: active ? '#6d28d9' : '#fff',
  color: active ? '#fff' : '#374151',
});
const banner = (bg, color) => ({
  background: bg, color, padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px',
});
const formCard = {
  background: '#fff', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '28px',
};
const sectionTitle = {
  fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#111827',
};
const productCard = {
  display: 'flex', alignItems: 'center', padding: '14px 16px', border: '2px solid',
  borderRadius: '10px', cursor: 'pointer', transition: 'all 0.15s',
};
