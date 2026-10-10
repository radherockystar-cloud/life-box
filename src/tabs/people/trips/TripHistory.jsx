import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useBackHandler } from '../../../utils/useBackHandler';
import { SEA, glass, roundButton, softButton } from './tripStyles';
import { getMode } from './tripConfig';
import { formatDuration, formatKm } from './tripAnalysis';
import { formatTripDate, placeLabel } from './tripModels';
import { getMissedTrips, hideMissed, loadHistory } from './tripStories';
import { historyLimit } from './premium';
import useActiveTrip from './useActiveTrip';

// The route as a small glowing drawing (no map needed)
function TrailThumb({ path }) {
  if (!path || path.length < 2) return null;
  const lats = path.map((p) => p[0]);
  const lons = path.map((p) => p[1]);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLon = Math.min(...lons), maxLon = Math.max(...lons);
  const span = Math.max(maxLat - minLat, (maxLon - minLon) * Math.cos((minLat * Math.PI) / 180), 0.0001);
  const x = (p) => 8 + ((p[1] - minLon) * Math.cos((minLat * Math.PI) / 180) / span) * 64;
  const y = (p) => 72 - ((p[0] - minLat) / span) * 64;
  const d = path.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(p).toFixed(1)} ${y(p).toFixed(1)}`).join(' ');

  return (
    <svg width="80" height="80" viewBox="0 0 80 80" style={{ flexShrink: 0, borderRadius: 18, background: 'rgba(15,10,50,0.45)', border: '1px solid rgba(255,255,255,0.3)' }}>
      <defs>
        <linearGradient id="thumbGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="50%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#f472b6" />
        </linearGradient>
      </defs>
      <path d={d} fill="none" stroke="url(#thumbGradient)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" opacity="0.35" />
      <path d={d} fill="none" stroke="url(#thumbGradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const chipStyle = { fontSize: 10, fontWeight: 900, padding: '3px 8px', borderRadius: 9, background: 'rgba(255,255,255,0.22)' };

// All finished trips as stories, plus the planned trips the person did not go on
export default function TripHistory({ trips, onClose, onOpenStory }) {
  const { active } = useActiveTrip();
  const [history, setHistory] = useState(loadHistory);
  const [version, setVersion] = useState(0);

  useBackHandler(true, onClose);

  useEffect(() => {
    const reload = () => {
      setHistory(loadHistory());
      setVersion((v) => v + 1);
    };
    window.addEventListener('newlife-trip-history-changed', reload);
    window.addEventListener('newlife-vault-changed', reload);
    return () => {
      window.removeEventListener('newlife-trip-history-changed', reload);
      window.removeEventListener('newlife-vault-changed', reload);
    };
  }, []);

  const missed = useMemo(() => getMissedTrips(trips, history, active && active.tripId), [trips, history, active, version]);

  const items = useMemo(() => {
    const stories = history.map((entry) => ({ kind: 'story', when: entry.endedAt, entry }));
    const skipped = missed.map((trip) => ({ kind: 'missed', when: trip.startAt, trip }));
    return [...stories, ...skipped].sort((a, b) => b.when - a.when);
  }, [history, missed]);

  const limit = historyLimit();
  const shown = items.slice(0, limit);
  const lockedCount = items.length - shown.length;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9100, overflowY: 'auto', background: SEA, color: '#fff' }}>
      <div style={{ padding: '18px 16px 40px', maxWidth: 520, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <button type="button" onClick={onClose} style={roundButton} aria-label="Back">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 style={{ fontSize: 19, fontWeight: 900 }}>Trip stories</h2>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>Every finished trip, told as a story</p>
          </div>
        </div>

        {items.length === 0 && (
          <div style={{ ...glass, borderRadius: 30, padding: '30px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 52, marginBottom: 8 }}>📖</div>
            <p style={{ fontSize: 16, fontWeight: 900, marginBottom: 6 }}>No stories yet</p>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.88)', lineHeight: 1.6 }}>
              Start a trip and press Complete when you arrive. Your route, stops and famous places become a story here, all by themselves.
            </p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {shown.map((item) => {
            if (item.kind === 'story') {
              const e = item.entry;
              const mode = getMode(e.mode);
              return (
                <button key={e.id} type="button" onClick={() => onOpenStory(e)} className="active:scale-[0.98]" style={{ ...glass, display: 'flex', gap: 12, alignItems: 'center', width: '100%', textAlign: 'left', borderRadius: 26, padding: 12, color: '#fff', cursor: 'pointer', transition: 'transform 0.15s ease' }}>
                  <TrailThumb path={e.path} />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: 14.5, fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mode.emoji} {e.title}</span>
                    <span style={{ display: 'block', fontSize: 10.5, fontWeight: 700, color: 'rgba(255,255,255,0.85)', margin: '2px 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {e.from.name} → {e.to.name}
                    </span>
                    <span style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      <span style={chipStyle}>{formatTripDate(e.startedAt)}</span>
                      <span style={chipStyle}>{formatKm(e.distanceKm)}</span>
                      <span style={chipStyle}>{formatDuration(e.durationMs)}</span>
                      {e.demo && <span style={{ ...chipStyle, background: 'rgba(251,191,36,0.5)' }}>Demo</span>}
                    </span>
                  </span>
                </button>
              );
            }

            const t = item.trip;
            return (
              <div key={`missed-${t.id}`} style={{ ...glass, borderRadius: 26, padding: 14, opacity: 0.8, borderStyle: 'dashed' }}>
                <p style={{ fontSize: 14, fontWeight: 900 }}>{getMode(t.mode).emoji} {t.title}</p>
                <p style={{ fontSize: 10.5, fontWeight: 700, color: 'rgba(255,255,255,0.85)', margin: '2px 0 8px' }}>
                  {placeLabel(t, 'from')} → {placeLabel(t, 'to')} · {formatTripDate(t.startAt)}
                </p>
                <p style={{ fontSize: 12, fontWeight: 900, color: '#fde68a', marginBottom: 10 }}>🚫 You did not go on this trip</p>
                <button type="button" onClick={() => hideMissed(t.id)} style={{ ...softButton, padding: 8, fontSize: 11.5 }}>
                  Remove this card
                </button>
              </div>
            );
          })}
        </div>

        {lockedCount > 0 && (
          <p style={{ ...glass, borderRadius: 18, padding: '12px 14px', marginTop: 14, fontSize: 12, fontWeight: 800, textAlign: 'center' }}>
            🔒 {lockedCount} older {lockedCount === 1 ? 'story is' : 'stories are'} kept safely. Unlock Premium to see them all.
          </p>
        )}
      </div>
    </div>
  );
}
