import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  canNotify,
  isNotifEnabled,
  setNotifEnabled,
  getNotificationPermission,
  requestNotificationPermission,
  cancelAllNotifications,
  syncNotifications,
  sendTestNotification,
} from '../../tabs/planner/reminderService';

// Master notification switch.
//  OFF -> app koi notification nahi bhejta (pehle se lage hue sab cancel ho jate hain)
//  ON  -> festival, plan aur trip notifications wapas lag jate hain
export default function NotificationManager() {
  const { c, t } = useApp();

  const [enabled, setEnabled] = useState(isNotifEnabled);
  const [permission, setPermission] = useState('prompt'); // granted | denied | prompt | unsupported
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  // Phone ki asli permission dekho (popup ke bina)
  useEffect(() => {
    let alive = true;
    getNotificationPermission().then((p) => {
      if (alive) setPermission(p);
    });
    return () => {
      alive = false;
    };
  }, []);

  const handleToggle = async () => {
    if (busy) return;
    setBusy(true);
    setMessage('');
    try {
      if (!enabled) {
        // ON karna: pehle phone se permission maango
        const result = await requestNotificationPermission();
        setPermission(result);
        if (result === 'denied') {
          setMessage(t.notifDenied);
          return;
        }
        if (result === 'unsupported') setMessage(t.notifAppOnly);
        setNotifEnabled(true);
        setEnabled(true);
        await syncNotifications();
      } else {
        // OFF karna: switch band + sab lage hue notifications cancel
        setNotifEnabled(false);
        setEnabled(false);
        await cancelAllNotifications(true);
        // Agar us waqt koi sync chal raha tha to ye use band switch ke hisaab se dobara chalata hai
        syncNotifications();
      }
    } catch (err) {
      console.error('Notification switch failed:', err);
      setMessage(t.notifTestFailed);
    } finally {
      setBusy(false);
    }
  };

  const handleTest = async () => {
    setMessage('');
    if (!enabled) {
      setMessage(t.notifNeedEnable);
      return;
    }
    if (!canNotify()) {
      setMessage(t.notifAppOnly);
      return;
    }
    try {
      const sent = await sendTestNotification();
      setMessage(sent ? t.notifTestSent : t.notifDenied);
    } catch (err) {
      console.error('Test notification failed:', err);
      setMessage(t.notifTestFailed);
    }
  };

  const statusText = !enabled
    ? t.notifStatusOff
    : permission === 'denied' || permission === 'prompt'
      ? t.notifStatusPending
      : t.notifStatusOn;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ padding: '8px', borderRadius: '12px', background: c.accentSoft, color: '#f43f5e' }}>
          <Bell size={18} />
        </div>
        <h4 style={{ fontSize: '14px', fontWeight: '900', color: c.ink }}>{t.notifTitle}</h4>
      </div>

      <div style={{ padding: '16px', borderRadius: '16px', background: c.isDark ? c.surface : c.surfaceAlt, border: '1px solid ' + (c.isDark ? c.line : 'rgba(0,0,0,0.06)'), display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div>
          <h5 style={{ fontSize: '13px', fontWeight: '900', color: c.ink }}>{t.notifPush}</h5>
          <p style={{ fontSize: '10px', color: c.faint, fontWeight: '700', marginTop: '2px' }}>{statusText}</p>
        </div>
        <button
          onClick={handleToggle}
          disabled={busy}
          style={{
            background: enabled ? 'linear-gradient(135deg, #f43f5e, #ec4899)' : c.line,
            color: enabled ? '#ffffff' : c.inkSoft,
            border: 'none',
            padding: '8px 16px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: '900',
            cursor: busy ? 'default' : 'pointer',
            opacity: busy ? 0.6 : 1,
            boxShadow: enabled ? '0 4px 12px rgba(244,63,94,0.3)' : 'none',
            minWidth: '64px',
          }}
        >
          {enabled ? t.notifOn : t.notifOff}
        </button>
      </div>

      <p style={{ fontSize: '11px', color: c.inkMuted, fontWeight: '700', lineHeight: 1.5 }}>
        {enabled ? t.notifOnInfo : t.notifOffInfo}
      </p>

      <button
        onClick={handleTest}
        style={{ width: '100%', padding: '12px', borderRadius: '14px', background: c.isDark ? c.accentSoft : '#fef2f2', border: '1px solid ' + (c.isDark ? c.accentLine : '#fee2e2'), color: '#f43f5e', fontSize: '12px', fontWeight: '900', cursor: 'pointer', opacity: enabled ? 1 : 0.6 }}
      >
        {t.notifSend}
      </button>

      {message && (
        <p style={{ fontSize: '11px', color: c.inkSoft, fontWeight: '700', lineHeight: 1.5 }}>{message}</p>
      )}
    </div>
  );
}
