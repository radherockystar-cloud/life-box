import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useBackHandler } from '../../../utils/useBackHandler';
import { sheetStyle, backdropStyle, primaryButton, softButton, glass } from './tripStyles';
import { getMode } from './tripConfig';
import { formatTripDate, formatTripTime, memberCount, placeLabel } from './tripModels';
import { acceptTrip, declineTrip, fetchTrip, friendlyCloudError, isTripFull } from './tripCloud';

const TWELVE_HOURS = 12 * 3600 * 1000;

// "Do you accept this trip?"  (opened from an invite link)
export default function InviteResponse({ code, user, displayName, onClose, onViewTrips }) {
  const [status, setStatus] = useState('loading'); // loading | missing | error | ready | accepted | declined
  const [trip, setTrip] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useBackHandler(true, onClose);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const found = await fetchTrip(code);
        if (cancelled) return;
        if (!found) {
          setStatus('missing');
        } else {
          setTrip(found);
          setStatus('ready');
        }
      } catch (e) {
        if (!cancelled) {
          setError(friendlyCloudError(e));
          setStatus('error');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code]);

  // Is there a reason the person cannot answer?
  let blocker = '';
  if (trip) {
    if (trip.ownerUid === user.uid) blocker = 'This is your own trip.';
    else if ((trip.memberUids || []).includes(user.uid)) blocker = 'You are already part of this trip.';
    else if (trip.status === 'cancelled') blocker = 'The owner cancelled this trip.';
    else if (trip.startAt < Date.now() - TWELVE_HOURS) blocker = 'This trip is already over.';
    else if (isTripFull(trip)) blocker = 'This trip is full.';
  }

  const answer = async (accept) => {
    setBusy(true);
    setError('');
    try {
      if (accept) await acceptTrip(code, user, displayName);
      else await declineTrip(code, user, displayName);
      setStatus(accept ? 'accepted' : 'declined');
    } catch (e) {
      setError(friendlyCloudError(e));
    } finally {
      setBusy(false);
    }
  };

  const mode = trip ? getMode(trip.mode) : null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9300, display: 'flex', alignItems: 'flex-end' }}>
      <div onClick={onClose} style={backdropStyle} />

      <div style={sheetStyle}>
        <button type="button" onClick={onClose} aria-label="Close" style={{ position: 'absolute', top: '14px', right: '14px', width: '34px', height: '34px', borderRadius: '12px', background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <X size={16} />
        </button>

        {status === 'loading' && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: '40px', marginBottom: '8px' }}>🧳</div>
            <p style={{ fontSize: '13px', fontWeight: 800 }}>Opening your invite...</p>
          </div>
        )}

        {status === 'missing' && (
          <div style={{ textAlign: 'center', padding: '30px 0 10px' }}>
            <div style={{ fontSize: '40px', marginBottom: '8px' }}>🔍</div>
            <p style={{ fontSize: '15px', fontWeight: 900, marginBottom: '6px' }}>Invite not found</p>
            <p style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.85)', marginBottom: '16px', lineHeight: 1.5 }}>The link may be wrong, or the trip was deleted.</p>
            <button type="button" onClick={onClose} style={primaryButton}>Close</button>
          </div>
        )}

        {status === 'error' && (
          <div style={{ textAlign: 'center', padding: '30px 0 10px' }}>
            <div style={{ fontSize: '40px', marginBottom: '8px' }}>📡</div>
            <p style={{ fontSize: '14px', fontWeight: 900, marginBottom: '6px' }}>Could not open the invite</p>
            <p style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.85)', marginBottom: '16px', lineHeight: 1.5 }}>{error}</p>
            <button type="button" onClick={onClose} style={primaryButton}>Close</button>
          </div>
        )}

        {status === 'ready' && trip && (
          <>
            <p style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)', paddingRight: '40px' }}>Trip invite</p>
            <h3 style={{ fontSize: '19px', fontWeight: 900, margin: '4px 0 14px' }}>{trip.ownerName} invited you 🎉</h3>

            <div style={{ ...glass, borderRadius: '24px', padding: '14px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <span style={{ fontSize: '26px' }}>{mode.emoji}</span>
                <span style={{ fontSize: '15px', fontWeight: 900 }}>{trip.title}</span>
              </div>
              <p style={{ fontSize: '12.5px', fontWeight: 800, marginBottom: '4px', wordBreak: 'break-word' }}>📍 {placeLabel(trip, 'from')} → {placeLabel(trip, 'to')}</p>
              <p style={{ fontSize: '12.5px', fontWeight: 800, marginBottom: '4px' }}>🗓️ {formatTripDate(trip.startAt)} · {formatTripTime(trip.startAt)}</p>
              <p style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>👥 {memberCount(trip)} going so far</p>
              {trip.message ? (
                <p style={{ fontSize: '12px', fontWeight: 700, marginTop: '10px', padding: '10px', borderRadius: '12px', background: 'rgba(15,10,50,0.3)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>💬 {trip.message}</p>
              ) : null}
            </div>

            {blocker ? (
              <>
                <p style={{ fontSize: '12.5px', fontWeight: 800, color: '#fde68a', textAlign: 'center', marginBottom: '12px' }}>{blocker}</p>
                <button type="button" onClick={(blocker.includes('already') || blocker.includes('own')) ? onViewTrips : onClose} style={primaryButton}>
                  {(blocker.includes('already') || blocker.includes('own')) ? 'View my trips' : 'Close'}
                </button>
              </>
            ) : (
              <>
                {error && <p style={{ fontSize: '12px', fontWeight: 800, color: '#fde68a', marginBottom: '10px' }}>⚠️ {error}</p>}
                <p style={{ fontSize: '11.5px', fontWeight: 700, color: 'rgba(255,255,255,0.85)', marginBottom: '12px', textAlign: 'center' }}>Do you want to join this trip?</p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" disabled={busy} onClick={() => answer(false)} style={{ ...softButton, flex: 1, opacity: busy ? 0.6 : 1 }}>Reject</button>
                  <button type="button" disabled={busy} onClick={() => answer(true)} style={{ ...primaryButton, flex: 1.4, opacity: busy ? 0.6 : 1 }}>{busy ? 'Please wait...' : 'Accept ✅'}</button>
                </div>
              </>
            )}
          </>
        )}

        {status === 'accepted' && (
          <div style={{ textAlign: 'center', padding: '24px 0 6px' }}>
            <div style={{ fontSize: '48px', marginBottom: '8px' }}>🎉</div>
            <p style={{ fontSize: '17px', fontWeight: 900, marginBottom: '6px' }}>You're in!</p>
            <p style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.9)', marginBottom: '16px', lineHeight: 1.5 }}>The countdown has started. You can see it in the People tab.</p>
            <button type="button" onClick={onViewTrips} style={primaryButton}>View my trips</button>
          </div>
        )}

        {status === 'declined' && (
          <div style={{ textAlign: 'center', padding: '24px 0 6px' }}>
            <div style={{ fontSize: '44px', marginBottom: '8px' }}>👋</div>
            <p style={{ fontSize: '16px', fontWeight: 900, marginBottom: '6px' }}>Invite rejected</p>
            <p style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.9)', marginBottom: '16px', lineHeight: 1.5 }}>{trip && trip.ownerName} will see that you said no.</p>
            <button type="button" onClick={onClose} style={primaryButton}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
}
