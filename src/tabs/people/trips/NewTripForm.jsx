import React, { useState } from 'react';
import { ArrowLeft, Lock, Share2, Copy } from 'lucide-react';
import { SEA, glass, roundButton, fieldStyle, labelStyle, primaryButton, softButton } from './tripStyles';
import { TRIP_MODES } from './tripConfig';
import { buildInviteLink, buildShareText, defaultTitle, makeCode, toInputDate, toStartAt } from './tripModels';
import { addLocalTrip } from './tripStorage';
import { createCloudTrip, deleteCloudTrip, friendlyCloudError, updateCloudTripFields } from './tripCloud';
import { copyText, shareText } from './tripShare';
import PlaceInput from './PlaceInput';
import { distanceKm, slimPlace } from './placeSearch';
import { requestSync } from '../../planner/reminderService';

const segmentStyle = (active) => ({
  flex: 1,
  padding: '12px 6px',
  borderRadius: '16px',
  border: active ? '1px solid #ffffff' : '1px solid rgba(255,255,255,0.35)',
  background: active ? 'linear-gradient(145deg, rgba(255,255,255,0.4), rgba(255,255,255,0.18))' : 'rgba(255,255,255,0.1)',
  boxShadow: active ? '0 0 16px rgba(255,255,255,0.4), inset 0 1.5px 0 rgba(255,255,255,0.7)' : 'none',
  color: '#fff',
  fontSize: '12.5px',
  fontWeight: 900,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
});

// Create a new trip: solo (saved on this phone) or with others (saved online + invite link)
export default function NewTripForm({ user, ready, displayName, onClose, onGoToLogin, onSaved }) {
  const [initialDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return toInputDate(d);
  });
  const [tripCode] = useState(makeCode);

  const [title, setTitle] = useState('');
  const [fromText, setFromText] = useState('');
  const [fromPlace, setFromPlace] = useState(null); // real place chosen from the list
  const [toText, setToText] = useState('');
  const [toPlace, setToPlace] = useState(null);
  const [showPlaceErrors, setShowPlaceErrors] = useState(false);
  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState('08:00');
  const [mode, setMode] = useState('car');
  const [who, setWho] = useState('solo'); // 'solo' | 'group'
  const [message, setMessage] = useState('');
  const [remind, setRemind] = useState(true);

  const [savedOnline, setSavedOnline] = useState(false);
  const [shared, setShared] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const isGroup = who === 'group';
  const needsLogin = isGroup && ready && !user;

  const buildTrip = () => ({
    id: isGroup ? tripCode : `solo-${tripCode}`,
    title: title.trim() || defaultTitle(fromPlace.name, toPlace.name),
    from: fromPlace.name,
    to: toPlace.name,
    fromPlace: slimPlace(fromPlace),
    toPlace: slimPlace(toPlace),
    startAt: toStartAt(date, time),
    mode,
    message: isGroup ? message.trim() : '',
    remind,
    solo: !isGroup,
    status: 'upcoming',
  });

  const validate = () => {
    if (!fromPlace || !toPlace) {
      setShowPlaceErrors(true);
      return 'Please choose both places from the suggestions. Only real places can be used.';
    }
    if (distanceKm(fromPlace, toPlace) < 0.2) return 'Start and destination are the same place.';
    if (!date || !time) return 'Please choose the date and time.';
    if (toStartAt(date, time) < Date.now() - 60000) return 'Please pick a date and time in the future.';
    return '';
  };

  // Group trips must exist online before the link is shared
  const saveOnline = async () => {
    const trip = buildTrip();
    if (!savedOnline) {
      await createCloudTrip(trip, user, displayName);
      setSavedOnline(true);
    } else {
      await updateCloudTripFields(trip.id, trip);
    }
    return trip;
  };

  const handleShare = async (copyOnly) => {
    const problem = validate();
    if (problem) return setError(problem);
    if (!user) return setError('Please log in from the Me tab first.');

    setError('');
    setInfo('');
    setBusy(true);
    try {
      const trip = await saveOnline();
      const text = buildShareText(trip, displayName, message);

      const result = copyOnly ? await copyText(text) : await shareText(`${displayName} invited you on a trip`, text);

      if (result === 'shared') {
        setShared(true);
      } else if (result === 'copied') {
        setShared(true);
        setInfo('Invite copied. Paste it in WhatsApp.');
      } else if (result === 'failed') {
        setError('Could not share. Please try again.');
      }
      // 'cancelled': the person closed the share sheet, nothing to do
    } catch (e) {
      setError(friendlyCloudError(e));
    } finally {
      setBusy(false);
    }
  };

  const handleDone = async () => {
    const problem = validate();
    if (problem) return setError(problem);
    setError('');
    setBusy(true);

    try {
      if (isGroup) {
        if (!shared || !user) return;
        await saveOnline(); // keep the online copy up to date with any last change
      } else {
        // If a link was already shared and then the person chose "Solo", remove the online copy
        if (savedOnline) {
          try {
            await deleteCloudTrip(tripCode);
          } catch {
            // ignore: the unused online trip stays empty
          }
        }
        if (!addLocalTrip(buildTrip())) {
          setError('Phone storage is full, so the trip could not be saved.');
          return;
        }
      }

      requestSync(); // set the trip reminders
      if (onSaved) onSaved();
      onClose();
    } catch (e) {
      setError(friendlyCloudError(e));
    } finally {
      setBusy(false);
    }
  };

  const doneDisabled = busy || (isGroup && (!shared || needsLogin));

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9100, overflowY: 'auto', background: SEA, color: '#ffffff' }}>
      <div style={{ padding: '18px 16px 40px', maxWidth: '520px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <button type="button" onClick={onClose} style={roundButton} aria-label="Back">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 style={{ fontSize: '19px', fontWeight: 900 }}>New Trip</h2>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>Tell us about your journey</p>
          </div>
        </div>

        {/* Who */}
        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>Who is going?</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" onClick={() => setWho('solo')} style={segmentStyle(!isGroup)}>🧍 Solo</button>
            <button type="button" onClick={() => setWho('group')} style={segmentStyle(isGroup)}>👥 With others</button>
          </div>
        </div>

        {/* Trip name */}
        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>Trip name (optional)</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Goa with friends" className="placeholder:text-white/50" style={fieldStyle} />
        </div>

        {/* From / To: only real places */}
        <PlaceInput
          label="From"
          placeholder="Starting place"
          text={fromText}
          place={fromPlace}
          showError={showPlaceErrors && !fromPlace}
          onTextChange={(t) => { setFromText(t); setFromPlace(null); setError(''); }}
          onSelect={(p) => { setFromPlace(p); setFromText(p.name); setError(''); }}
        />
        <PlaceInput
          label="To"
          placeholder="Destination"
          text={toText}
          place={toPlace}
          showError={showPlaceErrors && !toPlace}
          onTextChange={(t) => { setToText(t); setToPlace(null); setError(''); }}
          onSelect={(p) => { setToPlace(p); setToText(p.name); setError(''); }}
        />
        <p style={{ fontSize: '9.5px', fontWeight: 700, color: 'rgba(255,255,255,0.65)', marginTop: '-4px', marginBottom: '12px' }}>
          Place search: © OpenStreetMap contributors (Photon)
        </p>

        {/* Date / Time */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px', marginBottom: '12px' }}>
          <div>
            <label style={labelStyle}>Date</label>
            <input type="date" value={date} onChange={(e) => { setDate(e.target.value); setError(''); }} style={fieldStyle} />
          </div>
          <div>
            <label style={labelStyle}>Start time</label>
            <input type="time" value={time} onChange={(e) => { setTime(e.target.value); setError(''); }} style={fieldStyle} />
          </div>
        </div>

        {/* Travel mode */}
        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>How are you travelling?</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {TRIP_MODES.map((m) => (
              <button key={m.id} type="button" onClick={() => setMode(m.id)} style={{ ...segmentStyle(mode === m.id), padding: '10px 4px', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '20px' }}>{m.emoji}</span>
                <span style={{ fontSize: '10px' }}>{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Reminder */}
        <button
          type="button"
          onClick={() => setRemind(!remind)}
          style={{ ...glass, width: '100%', borderRadius: '18px', padding: '12px 14px', marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fff', cursor: 'pointer', textAlign: 'left' }}
        >
          <span>
            <span style={{ display: 'block', fontSize: '12.5px', fontWeight: 900 }}>Remind me</span>
            <span style={{ display: 'block', fontSize: '10.5px', fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>1 hour before and when the trip starts</span>
          </span>
          <span style={{ width: '42px', height: '24px', borderRadius: '12px', background: remind ? '#34d399' : 'rgba(255,255,255,0.3)', position: 'relative', flexShrink: 0, transition: 'background 0.2s' }}>
            <span style={{ position: 'absolute', top: '2px', left: remind ? '20px' : '2px', width: '20px', height: '20px', borderRadius: '10px', background: '#fff', transition: 'left 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }} />
          </span>
        </button>

        {/* Invite section (only with others) */}
        {isGroup && (
          <div style={{ ...glass, borderRadius: '24px', padding: '14px', marginBottom: '14px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 900, marginBottom: '10px' }}>💌 Invite your people</h4>

            {needsLogin ? (
              <>
                <p style={{ fontSize: '11.5px', fontWeight: 700, color: 'rgba(255,255,255,0.9)', marginBottom: '10px', lineHeight: 1.5, display: 'flex', gap: '6px' }}>
                  <Lock size={14} style={{ flexShrink: 0, marginTop: '2px' }} /> Please log in first. Invites and live trips need an account.
                </p>
                <button type="button" onClick={() => { onClose(); if (onGoToLogin) onGoToLogin(); }} style={softButton}>
                  Go to Me tab to log in
                </button>
              </>
            ) : (
              <>
                <label style={labelStyle}>Message for your friends (optional)</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  placeholder="e.g., Bring your camera! We leave sharp at 8."
                  className="placeholder:text-white/50"
                  style={{ ...fieldStyle, resize: 'none', fontWeight: 700, marginBottom: '10px' }}
                />

                <label style={labelStyle}>Invite link</label>
                <div style={{ background: 'rgba(15,10,50,0.35)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '12px', padding: '10px', fontSize: '10.5px', fontWeight: 700, wordBreak: 'break-all', color: 'rgba(255,255,255,0.9)', marginBottom: '10px' }}>
                  {buildInviteLink(tripCode)}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" disabled={busy} onClick={() => handleShare(false)} style={{ ...primaryButton, padding: '12px', fontSize: '13px', opacity: busy ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <Share2 size={15} /> {shared ? 'Share again' : 'Share invite'}
                  </button>
                  <button type="button" disabled={busy} onClick={() => handleShare(true)} style={{ ...softButton, width: 'auto', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '6px', opacity: busy ? 0.6 : 1 }}>
                    <Copy size={14} /> Copy
                  </button>
                </div>

                {shared && <p style={{ fontSize: '11px', fontWeight: 800, color: '#bbf7d0', marginTop: '10px' }}>✅ Invite shared. Tap Done to finish.</p>}
                {info && <p style={{ fontSize: '11px', fontWeight: 800, color: '#fde68a', marginTop: '6px' }}>{info}</p>}
              </>
            )}
          </div>
        )}

        {error && (
          <p style={{ fontSize: '12px', fontWeight: 800, color: '#fde68a', background: 'rgba(15,10,50,0.35)', borderRadius: '12px', padding: '10px 12px', marginBottom: '12px' }}>
            ⚠️ {error}
          </p>
        )}

        {isGroup && !shared && !needsLogin && (
          <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.85)', marginBottom: '10px', textAlign: 'center' }}>
            Share the invite link to finish creating this trip.
          </p>
        )}

        <button type="button" disabled={doneDisabled} onClick={handleDone} style={{ ...primaryButton, opacity: doneDisabled ? 0.5 : 1, cursor: doneDisabled ? 'default' : 'pointer' }}>
          {busy ? 'Please wait...' : 'Done ✅'}
        </button>
      </div>
    </div>
  );
}
