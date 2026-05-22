import React from 'react';
import '../Components/OrderSupport.css';

export default function OrderSupport() {
  return (
    <div className="order-support-page">
      <div className="content-box">
        <h1 className="brand-title">VoxVision</h1>
        <div className="gold-divider"></div>
        <h2 className="section-title">Direct Inquiries & Contributions</h2>
        <p className="description">
          We are currently processing orders and community contributions manually 
          to ensure premium service. Please reach out to our team directly.
        </p>

        <div className="action-grid">
          <div className="card">
            <h3>Direct Orders</h3>
            <p>Speak with a consultant regarding your project requirements.</p>
            <a href="https://wa.me/947XXXXXXXXX" className="action-btn">WhatsApp Order</a>
          </div>

          <div className="card">
            <h3>Support & Donate</h3>
            <p>Contribute to the development of VoxVision's infrastructure.</p>
            <a href="mailto:your-email@example.com" className="action-btn">Request Details</a>
          </div>
        </div>
      </div>
    </div>
  );
}