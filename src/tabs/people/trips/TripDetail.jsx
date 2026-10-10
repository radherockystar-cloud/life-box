import React, { useEffect, useState } from 'react';
import { X, Share2 } from 'lucide-react';
import { useBackHandler } from '../../../utils/useBackHandler';
import { sheetStyle, backdropStyle, primaryButton, softButton, dangerButton, glass } from './tripStyles';
import { getMode } from './tripConfig';
import { buildShareText, formatTripDate, formatTripTime, getTripPhase, initials, placeLabel } from './tripModels';
import { cancelCloudTrip, deleteCloudTrip, friendlyCloudError, leaveTrip } from './tripCloud';
import { deleteLocalTrip } from './tripStorage';
import { shareText } from './tripShare';
import { requestSync } from '../../planner/reminderService';
import Countdown from './Countdown';

const STATUS_LABEL = { owner: 'Owner', accepted: 'Going', declined: 'Declined', left: 'Left' };
const STATUS_COLOR = { owner: '#fde68a', accepted: '#bbf7d0', declined: '#fecdd3', left: '#e5e7eb' };

// One trip: details, who is coming, and what you can do with it
export default function TripDetail({ trip, user, displayName, onClose, onSoloChanged, onStart, onSkip, recordingAny }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useBackHandler(true, onClose);

  // The trip disappeared (deleted by the owner / you left): close this sheet
  useEffect(() => {
    if (!trip) onClose();
  }, [trip]);

  if (!trip) return null;

  const mode = getMode(trip.mode);
  const phase = getTripPhase(trip);
  const isOwner = !trip.solo && user && trip.ownerUid === user.uid;
  const isMember = !trip.solo && !isOwner;
  // The trip can be started from one hour before its start time
  const canStart = (phase === 'now' || (phase === 'upcoming' && trip.startAt - Date.now() < 60 * 60 * 1000)) && !!onStart;
  const members = trip.members ? Object.values(trip.members).filter((m) => m.status !== 'left') : [];

  const run = async (action) => {
    setBusy(true);
    setError('');
    try {
      await action();
    } catch (e) {
      setError(friendlyCloudError(e));
    } finally {
      setBusy(false);
    }
  };

  const handleShare = () =>
    run(async () => {
      const text = buildShareText(trip, trip.ownerName || displayName, trip.message);
      await shareText(`${trip.ownerName || displayName} invited you on a trip`, text);
    });

  const handleDeleteSolo = () => {
    if (!window.confirm(`Delete "${trip.title}"?\n\nIt goes to the Trash / Bin (Menu > Settings), where you can restore it within 7 days.`)) return;
    deleteLocalTrip(trip.id);
    requestSync();
    if (onSoloChanged) onSoloChanged();
    onClose();
  };

  const handleCancel = () => {
    if (!window.confirm('Cancel this trip for everyone? Your friends will see that it is cancelled.')) return;
    run(() => cancelCloudTrip(trip.id));
  };

  const handleDeleteGroup = () => {
    if (!window.confirm('Delete this trip for everyone? This cannot be undone.')) return;
    run(async () => {
      await deleteCloudTrip(trip.id);
      onClose();
    });
  };

  const handleLeave = () => {
    if (!window.confirm('Leave this trip? It will be removed from your list.')) return;
    run(async () => {
      await leaveTrip(trip.id, user, displayName);
      onClose();
    });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9200, display: 'flex', alignItems: 'flex-end' }}>
      <div onClick={onClose} style={backdropStyle} />

      <div style={sheetStyle}>
        <button type="button" onClick={onClose} aria-label="Close" style={{ position: 'absolute', top: '14px', right: '14px', width: '34px', height: '34px', borderRadius: '12px', background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <X size={16} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px', paddingRight: '40px' }}>
          <span style={{ width: '48px', height: '48px', borderRadius: '16px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '25px', background: 'linear-gradient(145deg, rgba(255,255,255,0.45), rgba(255,255,255,0.12))', border: '1px solid rgba(255,255,255,0.6)', boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,0.8)' }}>{mode.emoji}</span>
          <div style={{ minWidth: 0 }}>
            <h3 style={{ fontSize: '18px', fontWeight: 900, wordBreak: 'break-word' }}>{trip.title}</h3>
            <p style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.85)' }}>{trip.solo ? 'Solo trip' : 'Group trip'}{phase === 'cancelled' ? ' · Cancelled' : ''}</p>
          </div>
        </div>

        <div style={{ ...glass, borderRadius: '24px', padding: '14px', marginBottom: '12px' }}>
          <p style={{ fontSize: '13px', fontWeight: 900, marginBottom: '6px', wordBreak: 'break-word' }}>📍 {placeLabel(trip, 'from')} → {placeLabel(trip, 'to')}</p>
          <p style={{ fontSize: '12.5px', fontWeight: 800, color: 'rgba(255,255,255,0.92)' }}>🗓️ {formatTripDate(trip.startAt)} · {formatTripTime(trip.startAt)}</p>
          {trip.remind && phase !== 'cancelled' && <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.8)', marginTop: '6px' }}>🔔 Reminders on</p>}
          {phase === 'upcoming' && <div style={{ marginTop: '12px' }}><Countdown startAt={trip.startAt} /></div>}
          {phase === 'now' && <p style={{ textAlign: 'center', fontSize: '13px', fontWeight: 900, marginTop: '10px' }}>It's trip time! 🚀</p>}
        </div>

        {trip.message ? (
          <p style={{ fontSize: '12px', fontWeight: 700, padding: '12px', borderRadius: '16px', background: 'rgba(15,10,50,0.3)', marginBottom: '12px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>💬 {trip.message}</p>
        ) : null}

        {!trip.solo && members.length > 0 && (
          <div style={{ ...glass, borderRadius: '24px', padding: '12px 14px', marginBottom: '12px' }}>
            <p style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)', marginBottom: '8px' }}>People</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {members.map((m, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ width: '30px', height: '30px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 900, background: 'linear-gradient(145deg, #fde68a, #fb7185)', color: '#7c2d12', border: '2px solid rgba(255,255,255,0.8)' }}>{initials(m.name)}</span>
                  <span style={{ flex: 1, fontSize: '13px', fontWeight: 800, wordBreak: 'break-word' }}>{m.name}</span>
                  <span style={{ fontSize: '10px', fontWeight: 900, padding: '3px 9px', borderRadius: '9px', background: 'rgba(15,10,50,0.35)', color: STATUS_COLOR[m.status] || '#fff' }}>{STATUS_LABEL[m.status] || m.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && <p style={{ fontSize: '12px', fontWeight: 800, color: '#fde68a', marginBottom: '10px' }}>⚠️ {error}</p>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {canStart && (
            <>
              <button type="button" disabled={recordingAny} onClick={() => onStart(trip)} style={{ ...primaryButton, opacity: recordingAny ? 0.5 : 1 }}>
                ▶ Start this trip
              </button>
              {recordingAny && <p style={{ fontSize: '11px', fontWeight: 800, color: '#fde68a', textAlign: 'center' }}>Finish the trip you are recording first.</p>}
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Skip this trip? It will show in your trip stories as a trip you did not go on.')) onSkip(trip);
                }}
                style={softButton}
              >
                Skip this trip
              </button>
            </>
          )}
          {isOwner && phase !== 'cancelled' && (
            <button type="button" disabled={busy} onClick={handleShare} style={{ ...primaryButton, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: busy ? 0.6 : 1 }}>
              <Share2 size={16} /> Share invite link again
            </button>
          )}
          {isOwner && phase !== 'cancelled' && (
            <button type="button" disabled={busy} onClick={handleCancel} style={softButton}>Cancel trip for everyone</button>
          )}
          {isOwner && (
            <button type="button" disabled={busy} onClick={handleDeleteGroup} style={dangerButton}>Delete trip</button>
          )}
          {isMember && (
            <button type="button" disabled={busy} onClick={handleLeave} style={dangerButton}>Leave trip</button>
          )}
          {trip.solo && (
            <button type="button" onClick={handleDeleteSolo} style={dangerButton}>Delete trip</button>
          )}
        </div>
      </div>
    </div>
  );
}
