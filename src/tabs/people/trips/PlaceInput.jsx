import React, { useEffect, useState } from 'react';
import { fieldStyle, labelStyle } from './tripStyles';
import { searchPlaces } from './placeSearch';

const GREEN = '#4ade80';
const RED = '#fb7185';
const ORANGE = '#fbbf24';

// A place box that only accepts REAL places: type 3+ letters, then tap the right one from the list.
//   text / place      -> what is typed / the place that was chosen (null until chosen)
//   onTextChange(t)   -> typing (the parent must clear the chosen place)
//   onSelect(place)   -> a suggestion was tapped
//   showError         -> the parent wants the red "choose a place" message (after pressing Done)
export default function PlaceInput({ label, placeholder, text, place, onTextChange, onSelect, showError }) {
  const [status, setStatus] = useState('idle'); // idle | loading | ok | empty | error
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (place) {
      setStatus('idle');
      setResults([]);
      return undefined;
    }

    const query = text.trim();
    if (query.length < 3) {
      setStatus('idle');
      setResults([]);
      return undefined;
    }

    setStatus('loading');
    setOpen(true);

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const found = await searchPlaces(query, controller.signal);
        setResults(found);
        setStatus(found.length > 0 ? 'ok' : 'empty');
      } catch (error) {
        if (error && error.name === 'AbortError') return;
        setStatus('error');
      }
    }, 450);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [text, place]);

  const notChosen = !place && (status === 'empty' || !!showError);
  const borderColor = place ? GREEN : notChosen ? RED : status === 'error' ? ORANGE : 'rgba(255,255,255,0.4)';

  let message = null;
  if (place) message = { color: GREEN, text: `✓ ${place.label}` };
  else if (status === 'empty') message = { color: RED, text: "❌ We couldn't find this place. Please check the spelling." };
  else if (status === 'error') message = { color: ORANGE, text: '⚠️ Could not check this place. Please check your internet.' };
  else if (showError) message = { color: RED, text: 'Please choose a place from the list.' };
  else if (status === 'loading') message = { color: 'rgba(255,255,255,0.85)', text: 'Searching...' };
  else if (text.trim().length > 0 && text.trim().length < 3) message = { color: 'rgba(255,255,255,0.8)', text: 'Type at least 3 letters.' };

  return (
    <div style={{ marginBottom: '12px' }}>
      <label style={labelStyle}>{label}</label>
      <input
        type="text"
        value={text}
        onChange={(e) => {
          onTextChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
        className="placeholder:text-white/50"
        style={{ ...fieldStyle, border: `1.5px solid ${borderColor}` }}
      />

      {message && <p style={{ fontSize: '11.5px', fontWeight: 800, color: message.color, marginTop: '6px', lineHeight: 1.4, wordBreak: 'break-word' }}>{message.text}</p>}

      {!place && open && status === 'ok' && results.length > 0 && (
        <div style={{ marginTop: '8px', borderRadius: '16px', overflow: 'hidden', background: 'rgba(15,10,50,0.55)', border: '1px solid rgba(255,255,255,0.35)' }}>
          {results.map((item, i) => (
            <button
              key={`${item.label}-${i}`}
              type="button"
              onClick={() => {
                onSelect(item);
                setOpen(false);
              }}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', textAlign: 'left', background: 'transparent', border: 'none', borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer' }}
            >
              <span style={{ fontSize: '18px', flexShrink: 0 }}>{item.kind}</span>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: '13px', fontWeight: 900 }}>{item.name}</span>
                {item.context && <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.75)' }}>{item.context}</span>}
              </span>
            </button>
          ))}
          <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.65)', padding: '8px 12px', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
            Many places share a name. Pick the right one by its district and state.
          </p>
        </div>
      )}
    </div>
  );
}
