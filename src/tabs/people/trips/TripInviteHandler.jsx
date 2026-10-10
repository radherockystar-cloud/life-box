import React, { useCallback, useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { X, Lock } from 'lucide-react';
import { useBackHandler } from '../../../utils/useBackHandler';
import { PENDING_CODE_KEY } from './tripConfig';
import { parseInviteInput } from './tripModels';
import { sheetStyle, backdropStyle, primaryButton } from './tripStyles';
import useAuthUser from './useAuthUser';
import InviteResponse from './InviteResponse';

const readPending = () => {
  try {
    return parseInviteInput(localStorage.getItem(PENDING_CODE_KEY));
  } catch {
    return null;
  }
};

function LoginNeeded({ onLogin, onClose }) {
  useBackHandler(true, onClose);
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9300, display: 'flex', alignItems: 'flex-end' }}>
      <div onClick={onClose} style={backdropStyle} />
      <div style={sheetStyle}>
        <button type="button" onClick={onClose} aria-label="Close" style={{ position: 'absolute', top: '14px', right: '14px', width: '34px', height: '34px', borderRadius: '12px', background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <X size={16} />
        </button>
        <div style={{ textAlign: 'center', padding: '20px 0 6px' }}>
          <div style={{ width: '54px', height: '54px', borderRadius: '18px', margin: '0 auto 12px', background: 'rgba(255,255,255,0.22)', border: '1px solid rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Lock size={24} />
          </div>
          <p style={{ fontSize: '17px', fontWeight: 900, marginBottom: '6px' }}>You got a trip invite 🧳</p>
          <p style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.9)', marginBottom: '16px', lineHeight: 1.5 }}>
            Please log in first. Your invite is saved, and it will open again right after you log in.
          </p>
          <button type="button" onClick={onLogin} style={primaryButton}>Go to Me tab to log in</button>
        </div>
      </div>
    </div>
  );
}

// Always mounted (in App.jsx). Listens for invite links and shows the Accept / Reject sheet.
export default function TripInviteHandler({ onGoToLogin, onGoToPeople }) {
  const { user, ready, displayName } = useAuthUser();
  const [code, setCode] = useState(readPending);
  const [hidden, setHidden] = useState(false);

  const openInvite = useCallback((newCode) => {
    if (!newCode) return;
    try {
      localStorage.setItem(PENDING_CODE_KEY, newCode);
    } catch {
      // ignore: the invite still opens now
    }
    setHidden(false);
    setCode(newCode);
  }, []);

  const closeInvite = () => {
    localStorage.removeItem(PENDING_CODE_KEY);
    setHidden(false);
    setCode(null);
  };

  useEffect(() => {
    // Testing in the browser:  ?trip=CODE
    const fromUrl = parseInviteInput(window.location.search);
    if (fromUrl) {
      openInvite(fromUrl);
      window.history.replaceState(window.history.state, '', window.location.pathname);
    }

    let cancelled = false;
    let listener = null;

    if (Capacitor.isNativePlatform()) {
      // The app was already open and a link was tapped
      CapApp.addListener('appUrlOpen', (event) => openInvite(parseInviteInput(event.url))).then((handle) => {
        if (cancelled) handle.remove();
        else listener = handle;
      });

      // The app was closed and the link opened it
      CapApp.getLaunchUrl()
        .then((result) => {
          if (result && result.url) openInvite(parseInviteInput(result.url));
        })
        .catch(() => {});
    }

    // "I have an invite code" in the People tab
    const onManual = (e) => openInvite(e.detail && e.detail.code);
    window.addEventListener('newlife-open-trip-invite', onManual);

    return () => {
      cancelled = true;
      if (listener) listener.remove();
      window.removeEventListener('newlife-open-trip-invite', onManual);
    };
  }, [openInvite]);

  // After logging in, show the saved invite again
  useEffect(() => {
    if (user) setHidden(false);
  }, [user ? user.uid : null]);

  if (!code || !ready) return null;

  if (!user) {
    if (hidden) return null;
    return (
      <LoginNeeded
        onClose={closeInvite}
        onLogin={() => {
          setHidden(true);
          if (onGoToLogin) onGoToLogin();
        }}
      />
    );
  }

  return (
    <InviteResponse
      code={code}
      user={user}
      displayName={displayName}
      onClose={closeInvite}
      onViewTrips={() => {
        closeInvite();
        if (onGoToPeople) onGoToPeople();
      }}
    />
  );
}
