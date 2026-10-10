import React, { useMemo, useState } from 'react';
import { ArrowLeft, Play, Share2, Trash2 } from 'lucide-react';
import { useBackHandler } from '../../../utils/useBackHandler';
import { SEA, glass, roundButton, primaryButton, softButton, dangerButton } from './tripStyles';
import { getMode } from './tripConfig';
import { formatDuration, formatKm } from './tripAnalysis';
import { formatTripDate } from './tripModels';
import { buildStoryShareText, buildTimeline } from './storyText';
import { deleteHistoryEntry } from './tripStories';
import { shareText } from './tripShare';
import { canUse } from './premium';
import TripMap from './TripMap';

const chipStyle = { fontSize: 11, fontWeight: 900, padding: '5px 11px', borderRadius: 11, background: 'rgba(255,255,255,0.22)', border: '1px solid rgba(255,255,255,0.35)' };

// One finished trip, told as a story: the real map with the trail, a replay, and the moments in order
export default function TripStory({ entry, onClose, onDeleted }) {
  const [replayKey, setReplayKey] = useState(0);
  const [info, setInfo] = useState('');

  useBackHandler(true, onClose);

  const mode = getMode(entry.mode);
  const timeline = useMemo(() => buildTimeline(entry), [entry]);

  const markers = useMemo(() => {
    const pins = [];
    if (entry.from) pins.push({ lat: entry.from.lat, lon: entry.from.lon, emoji: '🚩', title: `Start: ${entry.from.name}` });
    (entry.stops || []).forEach((s) => pins.push({ lat: s.lat, lon: s.lon, emoji: '📍', title: `Stop: ${s.name}` }));
    (entry.famous || []).forEach((f) => pins.push({ lat: f.lat, lon: f.lon, emoji: '⭐', title: f.title }));
    if (entry.to) pins.push({ lat: entry.to.lat, lon: entry.to.lon, emoji: '🏁', title: `End: ${entry.to.name}` });
    return pins;
  }, [entry]);

  const handleShare = async () => {
    const result = await shareText(entry.title, buildStoryShareText(entry));
    if (result === 'copied') setInfo('Story copied. Paste it anywhere.');
    else if (result === 'failed') setInfo('Could not share this story.');
  };

  const handleDelete = () => {
    if (!window.confirm(`Delete the story "${entry.title}"?\n\nIt goes to the Trash / Bin (Menu > Settings), where you can restore it within 7 days.`)) return;
    deleteHistoryEntry(entry.id);
    if (onDeleted) onDeleted();
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9250, overflowY: 'auto', background: SEA, color: '#fff' }}>
      <div style={{ padding: '14px 14px 40px', maxWidth: 520, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <button type="button" onClick={onClose} style={roundButton} aria-label="Back">
            <ArrowLeft size={18} />
          </button>
          <div style={{ minWidth: 0 }}>
            <h2 style={{ fontSize: 18, fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mode.emoji} {entry.title}</h2>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>{formatTripDate(entry.startedAt)}{entry.demo ? ' · Demo trip' : ''}</p>
          </div>
        </div>

        <div style={{ height: 320, marginBottom: 12 }}>
          <TripMap path={entry.path} markers={markers} replayKey={replayKey} />
        </div>

        {canUse('replay') && entry.path.length >= 2 && (
          <button type="button" onClick={() => setReplayKey((k) => k + 1)} style={{ ...primaryButton, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 14 }}>
            <Play size={16} /> {replayKey > 0 ? 'Replay again' : 'Watch your trip replay'}
          </button>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          <span style={chipStyle}>📏 {formatKm(entry.distanceKm)}</span>
          <span style={chipStyle}>⏱️ {formatDuration(entry.durationMs)}</span>
          <span style={chipStyle}>📍 {(entry.stops || []).length} {(entry.stops || []).length === 1 ? 'stop' : 'stops'}</span>
          <span style={chipStyle}>⭐ {(entry.famous || []).length} famous</span>
        </div>

        {entry.companions && entry.companions.length > 0 && (
          <p style={{ ...glass, borderRadius: 18, padding: '10px 14px', marginBottom: 14, fontSize: 12.5, fontWeight: 800 }}>👥 Travelled with {entry.companions.join(', ')}</p>
        )}

        {/* The story */}
        <div style={{ ...glass, borderRadius: 28, padding: '18px 16px', marginBottom: 14 }}>
          <p style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)', marginBottom: 14 }}>Your story</p>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 17, top: 10, bottom: 10, width: 3, borderRadius: 2, background: 'linear-gradient(180deg, #22d3ee, #a78bfa, #f472b6)', opacity: 0.8 }} />
            {timeline.map((item, i) => (
              <div key={i} style={{ position: 'relative', display: 'flex', gap: 12, paddingBottom: i === timeline.length - 1 ? 0 : 18 }}>
                <span style={{ width: 38, height: 38, borderRadius: 19, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, zIndex: 1, background: 'linear-gradient(145deg, rgba(255,255,255,0.95), rgba(224,231,255,0.8))', border: '2px solid #fff', boxShadow: '0 5px 12px rgba(20,10,80,0.4)' }}>{item.emoji}</span>
                <span style={{ minWidth: 0, paddingTop: 2 }}>
                  <span style={{ display: 'block', fontSize: 14, fontWeight: 900, wordBreak: 'break-word' }}>{item.title}</span>
                  <span style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: 'rgba(255,255,255,0.85)', marginTop: 2, lineHeight: 1.5, wordBreak: 'break-word' }}>{item.sub}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {info && <p style={{ fontSize: 12, fontWeight: 800, color: '#fde68a', marginBottom: 10 }}>{info}</p>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button type="button" onClick={handleShare} style={{ ...softButton, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Share2 size={15} /> Share this story
          </button>
          <button type="button" onClick={handleDelete} style={{ ...dangerButton, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Trash2 size={15} /> Delete story
          </button>
        </div>
      </div>
    </div>
  );
}
