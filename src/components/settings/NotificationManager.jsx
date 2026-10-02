import React, { useState, useEffect } from 'react';
import { Bell, BellRing, CheckCircle, ShieldAlert } from 'lucide-react';

export default function NotificationManager({ currentTheme }) {
  const [permission, setPermission] = useState(Notification.permission);
  const [notifEnabled, setNotifEnabled] = useState(() => {
    return localStorage.getItem('newlife_notif') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('newlife_notif', notifEnabled);
  }, [notifEnabled]);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support desktop/mobile notifications.');
      return;
    }

    const res = await Notification.requestPermission();
    setPermission(res);

    if (res === 'granted') {
      setNotifEnabled(true);
      new Notification('New Life ❤️', {
        body: 'Notifications are successfully enabled! We will keep you updated.',
        icon: '/favicon.ico'
      });
    } else {
      setNotifEnabled(false);
      alert('Notification permission was denied.');
    }
  };

  const handleToggle = () => {
    if (!notifEnabled && permission !== 'granted') {
      requestPermission();
    } else {
      setNotifEnabled(!notifEnabled);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ padding: '8px', borderRadius: '12px', background: '#fff1f2', color: '#f43f5e' }}>
          <Bell size={18} />
        </div>
        <h4 style={{ fontSize: '14px', fontWeight: '900', color: currentTheme === 'dark' ? '#f9fafb' : '#111827' }}>
          Notification Settings
        </h4>
      </div>

      <div style={{ padding: '16px', borderRadius: '16px', background: currentTheme === 'dark' ? '#1e293b' : '#fafafa', border: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h5 style={{ fontSize: '13px', fontWeight: '900', color: currentTheme === 'dark' ? '#f9fafb' : '#1f2937' }}>
            Push Reminders
          </h5>
          <p style={{ fontSize: '10px', color: '#9ca3af', fontWeight: '700', marginTop: '2px' }}>
            Status: {permission === 'granted' && notifEnabled ? 'Active & Working ✅' : 'Disabled / Pending ⚠️'}
          </p>
        </div>
        <button 
          onClick={handleToggle}
          style={{ 
            background: notifEnabled ? 'linear-gradient(135deg, #f43f5e, #ec4899)' : '#e5e7eb', 
            color: notifEnabled ? '#ffffff' : '#4b5563', 
            border: 'none', 
            padding: '8px 16px', 
            borderRadius: '12px', 
            fontSize: '11px', 
            fontWeight: '900', 
            cursor: 'pointer',
            boxShadow: notifEnabled ? '0 4px 12px rgba(244,63,94,0.3)' : 'none'
          }}
        >
          {notifEnabled ? 'Enabled' : 'Enable'}
        </button>
      </div>

      <button 
        onClick={() => {
          if (Notification.permission === 'granted') {
            new Notification('New Life Reminder ❤️', { body: 'Aapka goal aapka intezaar kar raha hai! Mehnat karte raho!' });
            alert('Test notification sent!');
          } else {
            alert('Please enable notifications first.');
          }
        }}
        style={{ width: '100%', padding: '12px', borderRadius: '14px', background: '#fef2f2', border: '1px solid #fee2e2', color: '#f43f5e', fontSize: '12px', fontWeight: '900', cursor: 'pointer' }}
      >
        Send Test Notification 🔔
      </button>
    </div>
  );
}
