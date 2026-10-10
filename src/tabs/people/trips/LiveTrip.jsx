import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useBackHandler } from '../../../utils/useBackHandler';
import { SEA, glass, roundButton, primaryButton, softButton, dangerButton } from './tripStyles';
import { getMode, STOP_MIN_MS, DEMO_STOP_MIN_MS } from './tripConfig';
import { cleanPoints, detectStops, formatDuration, formatKm, haversineMeters, totalDistanceKm } from './tripAnalysis';
import { markFamousSeen, openLocationSettings } from './tripRecorder';
import useActiveTrip from './useActiveTrip';
import TripMap from './TripMap';

function Stat({ label, value }) {
  return (
    <div style={{ ...glass, flex: 1, borderRadius: 18, padding: '10px 6px', textAlign: 'center' }}>
      <div style={{ fontSize: 16, fontWeight: 900, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>{label}</div>
    </div>
  );
}

// The screen shown while a trip is being recorded. Pressing Back only hides it, recording goes on.
export default function LiveTrip({ onHide, onComplete, onDiscard }) {
  const { active, points, status, errorMessage, needsSettings } = useActiveTrip();
  const [now, setNow] = useState(Date.now());

  useBackHandler(true, onHide);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const mode = getMode(active && active.mode);
  const clean = useMemo(() => cleanPoints(points, active ? active.mode : 'car'), [points, active && active.mode]);
  const km = useMemo(() => totalDistanceKm(clean), [clean]);
  const stopCount = useMemo(() => {
    if (clean.length === 0) return 0;
    const first = { lat: clean[0][0], lon: clean[0][1] };
    const last = { lat: clean[clean.length - 1][0], lon: clean[clean.length - 1][1] };
    // same rule as the story: the starting place and the place you are at right now are not counted as stops
    return detectStops(clean, { minMs: active && active.demo ? DEMO_STOP_MIN_MS : STOP_MIN_MS }).filter((s) => haversineMeters(s, first) > 250 && haversineMeters(s, last) > 250).length;
  }, [clean, active && active.demo]);
  const path = useMemo(() => clean.map((p) => [p[0], p[1], p[2]]), [clean]);

  if (!active) return null;

  // A demo runs on a made-up clock, a real trip on the phone's clock
  const elapsed = active.demo && points.length > 1 ? points[points.length - 1][2] - points[0][2] : now - active.startedAt;
  const unseen = (active.famous || []).filter((f) => !f.seen);
  const card = unseen[unseen.length - 1];

  const markers = [];
  if (points.length > 0) markers.push({ lat: points[0][0], lon: points[0][1], emoji: '🚩', title: 'Start' });

  const handleComplete = () => {
    if (points.length < 2 || km < 0.1) {
      if (!window.confirm('Very little movement was recorded. Save this trip anyway?')) return;
    } else if (!window.confirm('Complete this trip and create your story?')) {
      return;
    }
    onComplete();
  };

  const handleDiscard = () => {
    if (window.confirm('Discard this trip? The route recorded so far will be deleted.')) onDiscard();
  };

  const chip =
    status === 'error' ? { text: 'Problem', bg: 'rgba(244,63,94,0.6)' } : status === 'recording' ? { text: '● Recording', bg: 'rgba(16,185,129,0.6)' } : status === 'starting' ? { text: 'Starting...', bg: 'rgba(251,191,36,0.55)' } : { text: 'Paused', bg: 'rgba(255,255,255,0.25)' };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9150, background: SEA, color: '#fff', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 14px 10px' }}>
        <button type="button" onClick={onHide} style={roundButton} aria-label="Hide">
          <ArrowLeft size={18} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ fontSize: 16, fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {mode.emoji} {active.title}
          </h2>
          <p style={{ fontSize: 10.5, fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>
            {active.demo ? 'Demo trip · ' : ''}
            {active.fromPlace ? `From ${active.fromPlace.name}` : 'Finding your starting place...'}
          </p>
        </div>
        <span style={{ fontSize: 10, fontWeight: 900, padding: '5px 10px', borderRadius: 12, background: chip.bg, border: '1px solid rgba(255,255,255,0.4)' }}>{chip.text}</span>
      </div>

      {/* Map */}
      <div style={{ flex: 1, minHeight: 200, padding: '0 14px' }}>
        <TripMap path={path} markers={markers} live liveEmoji={mode.emoji} />
      </div>

      {/* Bottom panel */}
      <div style={{ padding: '12px 14px 18px', overflowY: 'auto', maxHeight: '48vh' }}>
        {errorMessage && (
          <div style={{ ...glass, borderRadius: 18, padding: '10px 12px', marginBottom: 10, background: 'rgba(244,63,94,0.3)' }}>
            <p style={{ fontSize: 12, fontWeight: 800, lineHeight: 1.5 }}>⚠️ {errorMessage}</p>
            {needsSettings && (
              <button type="button" onClick={openLocationSettings} style={{ ...softButton, marginTop: 8, padding: 9, fontSize: 12 }}>
                Open phone settings
              </button>
            )}
          </div>
        )}

        {card && (
          <div style={{ ...glass, borderRadius: 22, padding: '12px 14px', marginBottom: 10, background: 'linear-gradient(145deg, rgba(253,224,71,0.4), rgba(251,113,133,0.3))' }}>
            <p style={{ fontSize: 9.5, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#fff7c2' }}>⭐ Famous place near you</p>
            <p style={{ fontSize: 15, fontWeight: 900, margin: '3px 0' }}>{card.title}</p>
            {card.extract && <p style={{ fontSize: 11.5, fontWeight: 700, lineHeight: 1.5, color: 'rgba(255,255,255,0.95)' }}>{card.extract}</p>}
            <button type="button" onClick={() => markFamousSeen(card.title)} style={{ ...softButton, marginTop: 8, padding: 8, fontSize: 12 }}>
              Got it
            </button>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <Stat label="Time" value={formatDuration(elapsed)} />
          <Stat label="Distance" value={formatKm(km)} />
          <Stat label="Stops" value={stopCount} />
        </div>

        <button type="button" onClick={handleComplete} style={primaryButton}>
          🏁 Complete trip
        </button>
        <button type="button" onClick={handleDiscard} style={{ ...dangerButton, marginTop: 8, padding: 10, fontSize: 12 }}>
          Discard this trip
        </button>
        <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: 10 }}>
          Press Back to hide this screen. Recording keeps going.
        </p>
      </div>
    </div>
  );
}
