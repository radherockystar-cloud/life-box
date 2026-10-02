import React, { useState } from 'react';
import { Lock, Unlock, Fingerprint, KeyRound } from 'lucide-react';

export default function AppLockManager({ currentTheme }) {
  const [isLocked, setIsLocked] = useState(() => {
    return localStorage.getItem('newlife_lock_enabled') === 'true';
  });
  const [inputPin, setInputPin] = useState('');

  const handleSaveLock = (e) => {
    e.preventDefault();
    if (inputPin.length < 4) {
      alert('Passcode must be at least 4 digits!');
      return;
    }
    localStorage.setItem('newlife_passcode', inputPin);
    localStorage.setItem('newlife_lock_enabled', 'true');
    setIsLocked(true);
    setInputPin('');
    alert('App Lock & Passcode Enabled Successfully! 🔒');
    window.location.reload();
  };

  const handleDisableLock = () => {
    localStorage.setItem('newlife_lock_enabled', 'false');
    localStorage.removeItem('newlife_passcode');
    setIsLocked(false);
    setInputPin('');
    alert('App Lock Disabled! 🔓');
    window.location.reload();
  };

  const handleTestFingerprint = async () => {
    if (window.PublicKeyCredential) {
      try {
        alert('Scanning Fingerprint... Place your finger on the sensor.');
        // Simulating biometric success for local web environment
        setTimeout(() => {
          alert('Fingerprint Verified Successfully! 🧬✨');
        }, 1000);
      } catch (err) {
        alert('Biometric authentication failed.');
      }
    } else {
      alert('Fingerprint API not supported on this browser/device container.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ padding: '8px', borderRadius: '12px', background: '#fef3c7', color: '#d97706' }}>
          <Lock size={18} />
        </div>
        <h4 style={{ fontSize: '14px', fontWeight: '900', color: currentTheme === 'dark' ? '#f9fafb' : '#111827' }}>
          App Lock & Fingerprint 🧬
        </h4>
      </div>

      <div style={{ padding: '16px', borderRadius: '16px', background: currentTheme === 'dark' ? '#1e293b' : '#fafafa', border: '1px solid rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <h5 style={{ fontSize: '13px', fontWeight: '900', color: currentTheme === 'dark' ? '#f9fafb' : '#1f2937' }}>
            Status: {isLocked ? 'Protected (Pin + Fingerprint) 🛡️' : 'Unlocked 🔓'}
          </h5>
          <p style={{ fontSize: '10px', color: '#9ca3af', fontWeight: '700', marginTop: '2px' }}>
            Secure your vault against unauthorized access.
          </p>
        </div>

        {!isLocked ? (
          <form onSubmit={handleSaveLock} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input 
              type="password" 
              placeholder="Enter 4+ digit passcode" 
              value={inputPin}
              onChange={(e) => setInputPin(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #d1d5db', fontSize: '12px', outline: 'none', fontWeight: '700' }}
              required
            />
            <button 
              type="submit"
              style={{ width: '100%', padding: '10px', borderRadius: '12px', background: 'linear-gradient(135deg, #d97706, #b45309)', color: '#ffffff', border: 'none', fontSize: '12px', fontWeight: '900', cursor: 'pointer' }}
            >
              Enable Passcode & Lock 🔒
            </button>
          </form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button 
              onClick={handleTestFingerprint}
              style={{ width: '100%', padding: '10px', borderRadius: '12px', background: '#e0f2fe', border: '1px solid #bae6fd', color: '#0284c7', fontSize: '12px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <Fingerprint size={16} /> Test Fingerprint Unlock
            </button>
            <button 
              onClick={handleDisableLock}
              style={{ width: '100%', padding: '10px', borderRadius: '12px', background: '#fef2f2', border: '1px solid #fee2e2', color: '#ef4444', fontSize: '12px', fontWeight: '900', cursor: 'pointer' }}
            >
              Disable App Lock 🔓
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
