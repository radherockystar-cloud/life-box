import React, { useState, useEffect } from 'react';
import { ArrowLeft, History, Share2, Trash2, Cake, ChevronRight } from 'lucide-react';
import { useBackHandler } from '../utils/useBackHandler';
import { computeStats, parseDob } from '../utils/lifeMeterMath';

// Life Meter apni alag keys use karta hai (kisi vault mein kuch save nahi hota)
const HISTORY_KEY = 'lifebox_lifemeter_history';
const OLD_DOB_KEY = 'lifebox_dob'; // pehle wale version ki DOB, history mein le aate hain

const loadHistory = () => {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) {
      const list = JSON.parse(raw);
      return Array.isArray(list) ? list : [];
    }
    const oldDob = localStorage.getItem(OLD_DOB_KEY);
    if (oldDob) {
      const migrated = [{ id: `old-${Date.now()}`, name: '', dob: oldDob, createdAt: Date.now() }];
      localStorage.setItem(HISTORY_KEY, JSON.stringify(migrated));
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

const glassCard = {
  background: 'linear-gradient(155deg, rgba(255,255,255,0.34) 0%, rgba(255,255,255,0.10) 50%, rgba(255,255,255,0.18) 100%)',
  border: '1px solid rgba(255,255,255,0.38)',
  borderTop: '1px solid rgba(255,255,255,0.7)',
  boxShadow:
    'inset 0 1.5px 0 rgba(255,255,255,0.7), inset 0 -10px 20px -10px rgba(60,10,140,0.45), 0 14px 28px -12px rgba(25,0,70,0.65), 0 0 24px -8px rgba(255,255,255,0.25)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  borderRadius: '22px',
};
const roundBtn = {
  ...glassCard,
  width: '42px',
  height: '42px',
  borderRadius: '15px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
  flexShrink: 0,
};

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
      style={{
        position: 'relative',
        overflow: 'hidden',
        gridColumn: wide ? 'span 2' : 'auto',
        minWidth: 0,
        padding: '14px',
        borderRadius: '22px',
        background: `linear-gradient(150deg, ${rgba(0.62)} 0%, ${rgba(0.24)} 52%, ${rgba(0.42)} 100%)`,
        border: '1px solid rgba(255,255,255,0.34)',
        borderTop: '1px solid rgba(255,255,255,0.75)',
        boxShadow: `inset 0 1.5px 0 rgba(255,255,255,0.7), inset 0 -12px 20px -10px ${rgba(0.75)}, 0 14px 24px -12px rgba(15,0,50,0.7), 0 8px 26px -8px ${rgba(0.6)}`,
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      {/* upar ki chamak (glass shine) */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '46%', background: 'linear-gradient(180deg, rgba(255,255,255,0.30), rgba(255,255,255,0))', borderRadius: '22px 22px 50% 50% / 22px 22px 16px 16px', pointerEvents: 'none' }} />
      {/* neeche kone ka glow */}
      <div style={{ position: 'absolute', right: '-24px', bottom: '-30px', width: '90px', height: '90px', borderRadius: '50%', background: `radial-gradient(circle, ${rgba(0.55)}, transparent 70%)`, pointerEvents: 'none' }} />

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
            background: `linear-gradient(160deg, rgba(255,255,255,0.6), ${rgba(0.35)})`,
            border: '1px solid rgba(255,255,255,0.55)',
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.8), 0 5px 10px -3px rgba(0,0,0,0.35), 0 0 12px ${rgba(0.55)}`,
            flexShrink: 0,
          }}
        >
          {emoji}
        </span>
        <span style={{ fontSize: '12px', fontWeight: 800, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>{label}</span>
      </div>
      <div style={{ position: 'relative', fontSize: `${size}px`, fontWeight: 900, marginTop: '10px', whiteSpace: 'nowrap', textShadow: '0 2px 0 rgba(0,0,0,0.18), 0 0 18px rgba(255,255,255,0.3)' }}>{value}</div>
      {sub && <div style={{ position: 'relative', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.88)', marginTop: '4px' }}>{sub}</div>}
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
      localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
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
        borderRadius: '28px',
        padding: '16px 16px 112px',
        color: '#fff',
        background:
          'radial-gradient(90% 40% at 10% 0%,rgba(255,255,255,.24) 0%,transparent 60%),radial-gradient(80% 45% at 100% 30%,rgba(255,95,184,.40) 0%,transparent 62%),linear-gradient(172deg,#3b1db8 0%,#6a27d6 30%,#a321b5 62%,#e04a86 88%,#f4975f 100%)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
        <button type="button" onClick={view === 'form' ? onBack : goForm} style={roundBtn} aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '22px', fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#e0d3ff' }}>{subtitle}</div>
        </div>
        {view === 'form' && (
          <button
            type="button"
            onClick={() => setView('history')}
            style={{ ...glassCard, height: '42px', borderRadius: '15px', padding: '0 14px', display: 'flex', alignItems: 'center', gap: '6px', color: '#fff', fontSize: '13px', fontWeight: 800, flexShrink: 0 }}
          >
            <History size={17} />
            History
            {history.length > 0 && (
              <span style={{ background: '#fff', color: '#6d28d9', borderRadius: '10px', fontSize: '11px', fontWeight: 900, padding: '1px 7px' }}>{history.length}</span>
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
          <div style={{ fontSize: '17px', fontWeight: 900, textAlign: 'center', marginTop: '6px' }}>Enter date of birth</div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#e0d3ff', textAlign: 'center', margin: '4px 0 16px' }}>
            See how much life you have lived.
          </div>
          <input
            type="text"
            value={name}
            maxLength={30}
            placeholder="Name (optional)"
            onChange={(e) => setName(e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box', padding: '14px', borderRadius: '16px', border: 'none', fontSize: '15px', fontWeight: 700, color: '#4c1d95', background: '#fff', marginBottom: '10px' }}
          />
          <input
            type="date"
            value={dobInput}
            max={todayStr()}
            onChange={(e) => setDobInput(e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box', padding: '14px', borderRadius: '16px', border: 'none', fontSize: '16px', fontWeight: 800, color: '#4c1d95', background: '#fff', colorScheme: 'light' }}
          />
          {error && <div style={{ color: '#ffd1e3', fontSize: '12px', fontWeight: 800, marginTop: '8px' }}>{error}</div>}
          <button
            type="button"
            onClick={handleDone}
            style={{ width: '100%', marginTop: '14px', padding: '15px', borderRadius: '16px', fontSize: '15px', fontWeight: 900, color: '#4c1d95', background: 'linear-gradient(180deg,#fff,#f6edff 50%,#dcc8ff)', boxShadow: '0 5px 0 #a98ae0' }}
          >
            Done
          </button>
        </div>
      )}

      {/* RESULT */}
      {view === 'result' && stats && (
        <>
          <div style={{ ...glassCard, padding: '22px 20px', textAlign: 'center', boxShadow: `${glassCard.boxShadow}, 0 0 40px -6px rgba(255,120,200,0.45)` }}>
            <div style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '0.1em', color: '#e0d3ff' }}>AGE</div>
            <div style={{ fontSize: '26px', fontWeight: 900, marginTop: '6px', lineHeight: 1.25, textShadow: '0 2px 0 rgba(40,0,90,0.35), 0 0 22px rgba(255,255,255,0.35)' }}>{ageText(stats.exact)}</div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#e0d3ff', marginTop: '8px' }}>Born on a {stats.exact.weekday}</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '12px', padding: '7px 14px', borderRadius: '14px', background: 'rgba(255,255,255,0.22)', border: '1px solid rgba(255,255,255,0.4)', fontSize: '12px', fontWeight: 900 }}>
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

          <div style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: '16px' }}>
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
              <div style={{ fontSize: '15px', fontWeight: 900, marginTop: '8px' }}>Nothing here yet</div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#e0d3ff', marginTop: '4px' }}>Every date of birth you check will show up here.</div>
            </div>
          )}
          {history.map((item) => {
            const d = parseDob(item.dob);
            const s = d ? computeStats(d, new Date()) : null;
            return (
              <div key={item.id} style={{ ...glassCard, padding: '14px' }}>
                <button
                  type="button"
                  onClick={() => openEntry(item.id)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left', color: '#fff' }}
                >
                  <span style={{ fontSize: '28px' }}>🎂</span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: '16px', fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.name || prettyDate(item.dob)}
                    </span>
                    <span style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#e0d3ff', marginTop: '2px' }}>
                      {item.name ? `${prettyDate(item.dob)} · ` : ''}
                      {s ? `${plural(s.exact.years, 'year')} ${plural(s.exact.months, 'month')}` : ''}
                    </span>
                  </span>
                  <ChevronRight size={18} />
                </button>
                <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                  <button
                    type="button"
                    onClick={() => handleShare(item)}
                    style={{ flex: 1, padding: '10px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px', fontWeight: 800, color: '#fff', background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.35)' }}
                  >
                    <Share2 size={15} /> Share
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmId(item.id)}
                    style={{ flex: 1, padding: '10px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px', fontWeight: 800, color: '#fff', background: 'rgba(240,40,110,0.35)', border: '1px solid rgba(255,150,190,0.6)' }}
                  >
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(20,0,50,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', zIndex: 60 }}>
          <div style={{ ...glassCard, background: 'linear-gradient(160deg,#6a27d6,#a321b5)', padding: '22px', width: '100%', maxWidth: '320px', textAlign: 'center' }}>
            <div style={{ fontSize: '17px', fontWeight: 900 }}>Delete this entry?</div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#e0d3ff', marginTop: '6px' }}>This can't be undone.</div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button type="button" onClick={() => setConfirmId(null)} style={{ flex: 1, padding: '12px', borderRadius: '14px', fontSize: '14px', fontWeight: 800, color: '#fff', background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.35)' }}>
                Cancel
              </button>
              <button type="button" onClick={handleDelete} style={{ flex: 1, padding: '12px', borderRadius: '14px', fontSize: '14px', fontWeight: 900, color: '#fff', background: 'linear-gradient(180deg,#ff9cc4,#f9468c 52%,#d0206a)' }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', left: '50%', bottom: '110px', transform: 'translateX(-50%)', background: 'rgba(30,10,70,0.92)', color: '#fff', padding: '10px 18px', borderRadius: '14px', fontSize: '13px', fontWeight: 800, zIndex: 70 }}>
          {toast}
        </div>
      )}
    </div>
  );
}
