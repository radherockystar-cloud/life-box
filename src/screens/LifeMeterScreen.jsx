import React, { useState, useEffect } from 'react';
import { ArrowLeft, History, Share2, Trash2, Cake, ChevronRight } from 'lucide-react';
import { useBackHandler } from '../utils/useBackHandler';
import { computeStats, parseDob } from '../utils/lifeMeterMath';
import { appStorage } from '../utils/appStorage';

// Life Meter apni alag keys use karta hai (kisi vault mein kuch save nahi hota)
const HISTORY_KEY = 'lifebox_lifemeter_history';
const OLD_DOB_KEY = 'lifebox_dob'; // pehle wale version ki DOB, history mein le aate hain

const loadHistory = () => {
  try {
    const raw = appStorage.getItem(HISTORY_KEY);
    if (raw) {
      const list = JSON.parse(raw);
      return Array.isArray(list) ? list : [];
    }
    const oldDob = appStorage.getItem(OLD_DOB_KEY);
    if (oldDob) {
      const migrated = [{ id: `old-${Date.now()}`, name: '', dob: oldDob, createdAt: Date.now() }];
      appStorage.setItem(HISTORY_KEY, JSON.stringify(migrated));
      return migrated;
    }
  } catch (e) {
    // ignore
  }
  return [];
};

const fmt = (n) => Math.floor(n).toLocaleString('en-IN');
const fmt1 = (n) => n.toLocaleString('en-IN', { maximumFractionDigits: 1 });
const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const prettyDate = (str) => {
  const d = parseDob(str);
  return d ? d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
};
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
const ageText = (e) => `${plural(e.years, 'year')} ${plural(e.months, 'month')} ${plural(e.days, 'day')}`;

// ---------- design (Notes / Memories jaisa pink-white glossy glow) ----------
const INK = '#3b0f24';
const glassCard = {
  background: 'linear-gradient(160deg,#ffffff 0%,rgba(255,255,255,0.82) 55%,rgba(255,234,243,0.96) 100%)',
  border: '1px solid rgba(251,113,133,0.25)',
  borderTop: '1px solid #ffffff',
  boxShadow: 'inset 0 2px 0 #ffffff, inset 0 -9px 14px -10px rgba(244,63,94,0.25), 0 10px 22px -10px rgba(244,63,94,0.35), 0 0 22px -8px rgba(251,113,133,0.35)',
  borderRadius: '22px',
};
const roseBtn = {
  background: 'linear-gradient(160deg,#fb7185 0%,#e11d48 55%,#be123c 100%)',
  border: '1px solid rgba(255,255,255,0.5)',
  borderTop: '1px solid rgba(255,255,255,0.85)',
  boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,0.65), inset 0 -6px 12px -6px rgba(80,0,40,0.5), 0 8px 18px -4px rgba(225,29,72,0.65), 0 0 24px rgba(244,63,94,0.5)',
  color: '#fff',
};
const roundBtn = {
  ...glassCard,
  width: '44px',
  height: '44px',
  borderRadius: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#e11d48',
  flexShrink: 0,
};
const softBtn = {
  flex: 1,
  padding: '10px',
  borderRadius: '14px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  fontSize: '13px',
  fontWeight: 800,
  color: '#e11d48',
  background: 'rgba(244,63,94,0.1)',
  border: '1px solid rgba(251,113,133,0.3)',
};
const fieldStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '14px',
  borderRadius: '16px',
  border: '1px solid rgba(251,113,133,0.3)',
  fontSize: '15px',
  fontWeight: 700,
  color: INK,
  background: '#fff',
  outline: 'none',
};

const CSS = `
@keyframes lmRise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.lm-rise{animation:lmRise .3s ease-out}
.lm-field::placeholder{color:rgba(190,24,93,.4)}
.lm-field:focus{border-color:rgba(244,63,94,.85)!important;box-shadow:0 0 0 3px rgba(244,63,94,.15),0 0 22px rgba(244,63,94,.25)!important}
`;

// Har card ka apna halka rang (RGB). Sirf design, logic se koi lena-dena nahi.
const TONES = {
  sky: [56, 189, 248],
  indigo: [99, 102, 241],
  violet: [168, 85, 247],
  orange: [251, 146, 60],
  teal: [45, 212, 191],
  gold: [250, 204, 21],
  rose: [251, 63, 110],
  cyan: [34, 211, 238],
  fuchsia: [232, 80, 220],
  emerald: [52, 211, 153],
  lime: [163, 230, 53],
};

// Label upar, ginti neeche. Lambi ginti ka font apne aap chhota hota hai taaki ek line mein aaye.
function Stat({ emoji, label, value, sub, wide, tone = 'violet' }) {
  const [r, g, b] = TONES[tone] || TONES.violet;
  const rgba = (a) => `rgba(${r},${g},${b},${a})`;
  const len = value.length;
  const size = wide ? (len <= 13 ? 28 : 24) : len <= 8 ? 24 : len <= 10 ? 20 : len <= 12 ? 17 : 15;
  return (
    <div
      className="lm-rise"
      style={{
        position: 'relative',
        overflow: 'hidden',
        gridColumn: wide ? 'span 2' : 'auto',
        minWidth: 0,
        padding: '14px',
        borderRadius: '22px',
        background: `linear-gradient(160deg, #ffffff 0%, ${rgba(0.22)} 100%)`,
        border: `1px solid ${rgba(0.4)}`,
        borderTop: '1px solid #ffffff',
        boxShadow: `inset 0 2px 0 #ffffff, inset 0 -9px 14px -10px ${rgba(0.4)}, 0 10px 22px -10px ${rgba(0.5)}, 0 0 22px -8px ${rgba(0.5)}`,
      }}
    >
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span
          style={{
            width: '30px',
            height: '30px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            background: `linear-gradient(160deg, #ffffff, ${rgba(0.25)})`,
            border: `1px solid ${rgba(0.45)}`,
            boxShadow: `inset 0 1px 0 #ffffff, 0 0 12px -2px ${rgba(0.6)}`,
            flexShrink: 0,
          }}
        >
          {emoji}
        </span>
        <span style={{ fontSize: '12px', fontWeight: 800, color: '#6f2f4b' }}>{label}</span>
      </div>
      <div style={{ position: 'relative', fontSize: `${size}px`, fontWeight: 900, marginTop: '10px', whiteSpace: 'nowrap', color: INK }}>{value}</div>
      {sub && <div style={{ position: 'relative', fontSize: '11px', fontWeight: 700, color: '#a8466c', marginTop: '4px' }}>{sub}</div>}
    </div>
  );
}

const buildShareText = (entry) => {
  const dob = parseDob(entry.dob);
  const s = dob && computeStats(dob, new Date());
  if (!s) return '';
  const { exact: e, approx: a } = s;
  return [
    `🎂 Life Meter${entry.name ? ` - ${entry.name}` : ''}`,
    `Born: ${prettyDate(entry.dob)} (${e.weekday})`,
    `Age: ${ageText(e)}`,
    '',
    `📅 Days lived: ${fmt(e.totalDays)}`,
    `⏰ Hours: ${fmt(e.totalHours)}`,
    `❤️ Heartbeats: ${fmt(a.heartbeats)}`,
    `🌬️ Breaths: ${fmt(a.breaths)}`,
    `👣 Steps: ${fmt(a.steps)}`,
    `💧 Water drunk: ${fmt(a.water)} L`,
    `🍽️ Food eaten: ${fmt(a.food)} kg`,
    '',
    'Made with Life Box',
  ].join('\n');
};

export default function LifeMeterScreen({ onBack }) {
  const [history, setHistory] = useState(loadHistory);
  const [view, setView] = useState('form'); // 'form' | 'result' | 'history'
  const [activeId, setActiveId] = useState(null);
  const [name, setName] = useState('');
  const [dobInput, setDobInput] = useState('');
  const [error, setError] = useState('');
  const [now, setNow] = useState(() => new Date());
  const [confirmId, setConfirmId] = useState(null);
  const [toast, setToast] = useState('');

  const resetForm = () => {
    setName('');
    setDobInput('');
    setError('');
  };
  const goForm = () => {
    resetForm();
    setView('form');
  };

  // Phone ka back button: result/history se form par, confirm popup band
  useBackHandler(view === 'result', goForm);
  useBackHandler(view === 'history', goForm);
  useBackHandler(confirmId !== null, () => setConfirmId(null));

  // Result screen par har second counters chalte rahenge
  useEffect(() => {
    if (view !== 'result') return undefined;
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, [view]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(''), 2200);
    return () => clearTimeout(timer);
  }, [toast]);

  const saveHistory = (list) => {
    setHistory(list);
    try {
      appStorage.setItem(HISTORY_KEY, JSON.stringify(list));
    } catch (e) {
      // save na ho paye to bhi chalega
    }
  };

  const openEntry = (id) => {
    setActiveId(id);
    setNow(new Date());
    setView('result');
  };

  const handleDone = () => {
    const date = parseDob(dobInput);
    if (!date || date.getFullYear() < 1900) return setError('Please choose a valid date of birth.');
    if (date > new Date()) return setError("Date of birth can't be in the future.");

    const cleanName = name.trim();
    const existing = history.find((h) => h.dob === dobInput && (h.name || '') === cleanName);
    const entry = existing || { id: `${Date.now()}`, name: cleanName, dob: dobInput, createdAt: Date.now() };
    saveHistory([entry, ...history.filter((h) => h.id !== entry.id)]);
    setError('');
    openEntry(entry.id);
  };

  const handleDelete = () => {
    saveHistory(history.filter((h) => h.id !== confirmId));
    setConfirmId(null);
    setToast('Deleted');
  };

  const handleShare = async (entry) => {
    const text = buildShareText(entry);
    if (!text) return;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Life Meter', text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setToast('Copied to clipboard');
    } catch (e) {
      // share cancel kiya to kuch nahi karna
    }
  };

  const activeEntry = history.find((h) => h.id === activeId);
  const activeDob = activeEntry ? parseDob(activeEntry.dob) : null;
  const stats = view === 'result' && activeDob ? computeStats(activeDob, now) : null;

  const title = view === 'history' ? 'History' : view === 'result' && activeEntry?.name ? activeEntry.name : 'Life Meter';
  const subtitle =
    view === 'history'
      ? `${plural(history.length, 'entry').replace('entrys', 'entries')} saved`
      : view === 'result' && activeEntry
      ? `Born ${prettyDate(activeEntry.dob)}`
      : 'Your life in numbers';

  return (
    <div
      style={{
        minHeight: '100vh',
        paddingBottom: '112px',
        color: INK,
      }}
    >
      <style>{CSS}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', padding: '0 4px' }}>
        <button type="button" onClick={view === 'form' ? onBack : goForm} style={roundBtn} aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '21px', fontWeight: 900, color: INK, textShadow: '0 0 16px rgba(251,113,133,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
          <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#a8466c', marginTop: '2px' }}>{subtitle}</div>
        </div>
        {view === 'form' && (
          <button
            type="button"
            onClick={() => setView('history')}
            style={{ ...glassCard, height: '44px', borderRadius: '16px', padding: '0 14px', display: 'flex', alignItems: 'center', gap: '6px', color: '#a8264f', fontSize: '13px', fontWeight: 900, flexShrink: 0 }}
          >
            <History size={17} style={{ color: '#e11d48' }} />
            History
            {history.length > 0 && (
              <span style={{ ...roseBtn, borderRadius: '10px', fontSize: '11px', fontWeight: 900, padding: '1px 7px', boxShadow: 'none' }}>{history.length}</span>
            )}
          </button>
        )}
        {view === 'result' && activeEntry && (
          <button type="button" onClick={() => handleShare(activeEntry)} style={roundBtn} aria-label="Share">
            <Share2 size={18} />
          </button>
        )}
      </div>

      {/* FORM */}
      {view === 'form' && (
        <div style={{ ...glassCard, padding: '20px' }}>
          <div style={{ fontSize: '40px', textAlign: 'center' }}>🎂</div>
          <div style={{ fontSize: '17px', fontWeight: 900, textAlign: 'center', marginTop: '6px', color: INK }}>Enter date of birth</div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#a8466c', textAlign: 'center', margin: '4px 0 16px' }}>
            See how much life you have lived.
          </div>
          <input
            type="text"
            className="lm-field"
            value={name}
            maxLength={30}
            placeholder="Name (optional)"
            onChange={(e) => setName(e.target.value)}
            style={{ ...fieldStyle, marginBottom: '10px' }}
          />
          <input
            type="date"
            className="lm-field"
            value={dobInput}
            max={todayStr()}
            onChange={(e) => setDobInput(e.target.value)}
            style={{ ...fieldStyle, fontSize: '16px', fontWeight: 800, colorScheme: 'light' }}
          />
          {error && <div style={{ color: '#be123c', fontSize: '12px', fontWeight: 800, marginTop: '8px' }}>{error}</div>}
          <button
            type="button"
            onClick={handleDone}
            style={{ ...roseBtn, width: '100%', marginTop: '14px', padding: '15px', borderRadius: '16px', fontSize: '15px', fontWeight: 900 }}
          >
            Done
          </button>
        </div>
      )}

      {/* RESULT */}
      {view === 'result' && stats && (
        <>
          <div style={{ ...glassCard, padding: '22px 20px', textAlign: 'center', boxShadow: `${glassCard.boxShadow}, 0 0 34px -6px rgba(251,191,36,0.55)`, border: '1px solid rgba(251,191,36,0.75)', borderTop: '1px solid #fff7d6' }}>
            <div style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '0.1em', color: '#a8264f' }}>AGE</div>
            <div style={{ fontSize: '26px', fontWeight: 900, marginTop: '6px', lineHeight: 1.25, color: INK, textShadow: '0 0 18px rgba(251,113,133,0.4)' }}>{ageText(stats.exact)}</div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#a8466c', marginTop: '8px' }}>Born on a {stats.exact.weekday}</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '12px', padding: '7px 14px', borderRadius: '14px', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(251,113,133,0.35)', color: '#be123c', fontSize: '12px', fontWeight: 900 }}>
              <Cake size={14} />
              {stats.exact.birthdayToday && stats.exact.years > 0
                ? 'Happy Birthday! 🎉'
                : `Next birthday in ${plural(stats.exact.daysToBirthday, 'day')}`}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '16px' }}>
            <Stat emoji="📅" tone="sky" label="Days lived" value={fmt(stats.exact.totalDays)} />
            <Stat emoji="🗓️" tone="indigo" label="Weeks" value={fmt(stats.exact.totalWeeks)} />
            <Stat emoji="🌙" tone="violet" label="Months" value={fmt(stats.exact.totalMonths)} />
            <Stat emoji="⏰" tone="orange" label="Hours" value={fmt(stats.exact.totalHours)} />
            <Stat emoji="⏱️" tone="teal" label="Minutes" value={fmt(stats.exact.totalMinutes)} wide />
            <Stat emoji="⚡" tone="gold" label="Seconds" value={fmt(stats.exact.totalSeconds)} wide />
            <Stat emoji="❤️" tone="rose" label="Heartbeats" value={fmt(stats.approx.heartbeats)} wide />
            <Stat emoji="🌬️" tone="cyan" label="Breaths" value={fmt(stats.approx.breaths)} />
            <Stat emoji="👁️" tone="fuchsia" label="Eye blinks" value={fmt(stats.approx.blinks)} />
            <Stat emoji="👣" tone="emerald" label="Steps" value={fmt(stats.approx.steps)} />
            <Stat
              emoji="🛣️"
              tone="lime" label="Distance"
              value={`${fmt(stats.approx.km)} km`}
              sub={stats.approx.earthLaps >= 0.05 ? `${fmt1(stats.approx.earthLaps)}x around the Earth` : undefined}
            />
            <Stat emoji="💧" tone="sky" label="Water drunk" value={`${fmt(stats.approx.water)} L`} />
            <Stat emoji="🍽️" tone="orange" label="Food eaten" value={`${fmt(stats.approx.food)} kg`} />
            <Stat
              emoji="😴"
              tone="indigo" label="Time asleep"
              value={`${fmt(stats.approx.sleepDays)} days`}
              sub={stats.approx.sleepYears >= 0.1 ? `${fmt1(stats.approx.sleepYears)} years` : undefined}
            />
            <Stat emoji="🌕" tone="gold" label="Full moons" value={fmt(stats.approx.fullMoons)} />
          </div>

          <div style={{ fontSize: '10px', fontWeight: 700, color: '#b0587a', textAlign: 'center', marginTop: '16px' }}>
            Some figures are calculated from average human values.
          </div>
        </>
      )}

      {/* HISTORY */}
      {view === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {history.length === 0 && (
            <div style={{ ...glassCard, padding: '28px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '34px' }}>🕘</div>
              <div style={{ fontSize: '15px', fontWeight: 900, marginTop: '8px', color: INK }}>Nothing here yet</div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#a8466c', marginTop: '4px' }}>Every date of birth you check will show up here.</div>
            </div>
          )}
          {history.map((item) => {
            const d = parseDob(item.dob);
            const s = d ? computeStats(d, new Date()) : null;
            return (
              <div key={item.id} className="lm-rise" style={{ ...glassCard, padding: '14px' }}>
                <button
                  type="button"
                  onClick={() => openEntry(item.id)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left', color: INK }}
                >
                  <span style={{ fontSize: '28px' }}>🎂</span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: '16px', fontWeight: 900, color: '#be123c', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.name || prettyDate(item.dob)}
                    </span>
                    <span style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#a8466c', marginTop: '2px' }}>
                      {item.name ? `${prettyDate(item.dob)} · ` : ''}
                      {s ? `${plural(s.exact.years, 'year')} ${plural(s.exact.months, 'month')}` : ''}
                    </span>
                  </span>
                  <ChevronRight size={18} style={{ color: '#e11d48' }} />
                </button>
                <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                  <button type="button" onClick={() => handleShare(item)} style={softBtn}>
                    <Share2 size={15} /> Share
                  </button>
                  <button type="button" onClick={() => setConfirmId(item.id)} style={{ ...softBtn, color: '#be123c', background: 'rgba(225,29,72,0.12)', border: '1px solid rgba(225,29,72,0.45)' }}>
                    <Trash2 size={15} /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete confirm */}
      {confirmId !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(60,10,30,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', zIndex: 60 }}>
          <div style={{ ...glassCard, background: 'linear-gradient(160deg,#ffffff,#fff3f8)', padding: '22px', width: '100%', maxWidth: '320px', textAlign: 'center' }}>
            <div style={{ fontSize: '17px', fontWeight: 900, color: INK }}>Delete this entry?</div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#a8466c', marginTop: '6px' }}>This can't be undone.</div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button type="button" onClick={() => setConfirmId(null)} style={{ ...glassCard, flex: 1, padding: '12px', borderRadius: '14px', fontSize: '14px', fontWeight: 800, color: '#a8264f' }}>
                Cancel
              </button>
              <button type="button" onClick={handleDelete} style={{ ...roseBtn, flex: 1, padding: '12px', borderRadius: '14px', fontSize: '14px', fontWeight: 900 }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', left: '50%', bottom: '110px', transform: 'translateX(-50%)', background: 'rgba(60,10,30,0.92)', color: '#fff', padding: '10px 18px', borderRadius: '14px', fontSize: '13px', fontWeight: 800, zIndex: 70 }}>
          {toast}
        </div>
      )}
    </div>
  );
}
