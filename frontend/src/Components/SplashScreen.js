import React, { useEffect, useState } from 'react';
// Make sure this path points to your new logo!
import myLogo from '../assets/logo.svg'; 

export default function SplashScreen({ onComplete }) {
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Keep the splash screen visible for 3 seconds
    const timer = setTimeout(() => {
      setIsFading(true);
      setTimeout(() => onComplete(), 500); 
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div style={{
      ...styles.container,
      opacity: isFading ? 0 : 1,
      visibility: isFading ? 'hidden' : 'visible',
    }}>
      <div style={styles.content}>
        <div style={styles.logoWrapper}>
          <img src={myLogo} alt="VoxVision Logo" style={styles.logo} />
        </div>
        
        <h1 style={styles.brandName}>VoxVision</h1>
        <p style={styles.slogan}>"Because reading belongs to everyone."</p>
        
        <div style={styles.loader}>
          <div className="dot-pulse"></div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .dot-pulse {
          width: 36px;
          height: 36px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #4A90E2; 
          border-radius: 50%;
          animation: spin 1s cubic-bezier(0.55, 0.15, 0.45, 0.85) infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
    backgroundColor: '#F8FAFC', display: 'flex', justifyContent: 'center',
    alignItems: 'center', zIndex: 9999, transition: 'opacity 0.5s ease, visibility 0.5s ease',
  },
  content: { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' },
  logoWrapper: { width: '140px', height: '140px', animation: 'float 3s ease-in-out infinite', marginBottom: '16px' },
  logo: { width: '100%', height: '100%', objectFit: 'contain' },
  brandName: { fontSize: '38px', fontWeight: '800', color: '#1E293B', margin: '0 0 4px 0', letterSpacing: '-0.5px', fontFamily: 'system-ui, -apple-system, sans-serif' },
  slogan: { fontSize: '18px', color: '#64748B', margin: '0 0 36px 0', fontStyle: 'italic', fontWeight: '500', letterSpacing: '0.3px' },
  loader: { display: 'flex', justifyContent: 'center' }
};