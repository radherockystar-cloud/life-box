import React, { useState, useEffect } from 'react';
import { ArrowLeft, History, Share2, Trash2, Cake, ChevronRight } from 'lucide-react';
import { useBackHandler } from '../utils/useBackHandler';
import { computeStats, parseDob } from '../utils/lifeMeterMath';
import { appStorage } from '../utils/appStorage';
import { useScreenT, tokensOf, glassOf } from '../utils/screenTexts';

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
const prettyDate = (str, loc = 'en-IN') => {
  const d = parseDob(str);
  return d ? d.toLocaleDateString(loc, { day: 'numeric', month: 'short', year: 'numeric' }) : '';
};
// ---------- design (Notes / Memories jaisa pink-white glossy glow) ----------
const roseBtn = {
  background: 'linear-gradient(160deg,#fb7185 0%,#e11d48 55%,#be123c 100%)',
  border: '1px solid rgba(255,255,255,0.5)',
  borderTop: '1px solid rgba(255,255,255,0.85)',
  boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,0.65), inset 0 -6px 12px -6px rgba(80,0,40,0.5), 0 8px 18px -4px rgba(225,29,72,0.65), 0 0 24px rgba(244,63,94,0.5)',
  color: '#fff',
};

// Rang theme (light/dark) ke hisaab se
const makeStyles = (c) => {
  const INK = c.text;
  const glassCard = { ...glassOf(c), borderRadius: '22px' };
  const roundBtn = {
    ...glassCard,
    width: '44px',
    height: '44px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: c.accentDeep,
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
    color: c.accentDeep,
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
    background: c.isDark ? c.inputBg : '#fff',
    outline: 'none',
  };
  return { INK, glassCard, roundBtn, softBtn, fieldStyle };
};

const CSS = `
@keyframes lmRise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.lm-rise{animation:lmRise .3s ease-out}
.lm-field::placeholder{color:rgba(190,24,93,.4)}
[data-theme="dark"] .lm-field::placeholder{color:rgba(253,164,175,.5)}
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
  const { c } = useScreenT();
  const T = tokensOf(c);
  const INK = c.text;
  const base = c.isDark ? '#1e293b' : '#ffffff';
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
        background: `linear-gradient(160deg, ${base} 0%, ${rgba(0.22)} 100%)`,
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
            background: `linear-gradient(160deg, ${base}, ${rgba(0.25)})`,
            border: `1px solid ${rgba(0.45)}`,
            boxShadow: `inset 0 1px 0 #ffffff, 0 0 12px -2px ${rgba(0.6)}`,
            flexShrink: 0,
          }}
        >
          {emoji}
        </span>
        <span style={{ fontSize: '12px', fontWeight: 800, color: T.mid }}>{label}</span>
      </div>
      <div style={{ position: 'relative', fontSize: `${size}px`, fontWeight: 900, marginTop: '10px', whiteSpace: 'nowrap', color: INK }}>{value}</div>
      {sub && <div style={{ position: 'relative', fontSize: '11px', fontWeight: 700, color: T.sub, marginTop: '4px' }}>{sub}</div>}
    </div>
  );
}

export default function LifeMeterScreen({ onBack }) {
  const { c, st, loc } = useScreenT();
  const T = tokensOf(c);
  const { INK, glassCard, roundBtn, softBtn, fieldStyle } = makeStyles(c);
  const plural = (n, one, many) => `${n} ${n === 1 ? st(one) : st(many)}`;
  const ageText = (e) => `${plural(e.years, 'yOne', 'yMany')} ${plural(e.months, 'moOne', 'moMany')} ${plural(e.days, 'dOne', 'dMany')}`;
  const weekdayOf = (dobStr) => {
    const d = parseDob(dobStr);
    return d ? d.toLocaleDateString(loc, { weekday: 'long' }) : '';
  };
  const buildShareText = (entry) => {
    const dob = parseDob(entry.dob);
    const s = dob && computeStats(dob, new Date());
    if (!s) return '';
    const { exact: e, approx: a } = s;
    return [
      `${st('lShHead')}${entry.name ? ` - ${entry.name}` : ''}`,
      st('lShBorn', { d: prettyDate(entry.dob, loc), w: weekdayOf(entry.dob) }),
      st('lShAge', { a: ageText(e) }),
      '',
      st('lShDays', { v: fmt(e.totalDays) }),
      st('lShHours', { v: fmt(e.totalHours) }),
      st('lShHeart', { v: fmt(a.heartbeats) }),
      st('lShBreath', { v: fmt(a.breaths) }),
      st('lShSteps', { v: fmt(a.steps) }),
      st('lShWater', { v: fmt(a.water) }),
      st('lShFood', { v: fmt(a.food) }),
      '',
      st('lShMade'),
    ].join('\n');
  };

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
    if (!date || date.getFullYear() < 1900) return setError(st('lErrDob'));
    if (date > new Date()) return setError(st('lErrFuture'));

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
    setToast(st('lDeleted'));
  };

  const handleShare = async (entry) => {
    const text = buildShareText(entry);
    if (!text) return;
    try {
      if (navigator.share) {
        await navigator.share({ title: st('lTitle'), text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setToast(st('copied'));
    } catch (e) {
      // share cancel kiya to kuch nahi karna
    }
  };

  const activeEntry = history.find((h) => h.id === activeId);
  const activeDob = activeEntry ? parseDob(activeEntry.dob) : null;
  const stats = view === 'result' && activeDob ? computeStats(activeDob, now) : null;

  const title = view === 'history' ? st('lHistory') : view === 'result' && activeEntry?.name ? activeEntry.name : st('lTitle');
  const subtitle =
    view === 'history'
      ? st('lEntries', { n: plural(history.length, 'eOne', 'eMany') })
      : view === 'result' && activeEntry
      ? st('lBorn', { d: prettyDate(activeEntry.dob, loc) })
      : st('lSub');

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
          <div style={{ fontSize: '11.5px', fontWeight: 700, color: T.sub, marginTop: '2px' }}>{subtitle}</div>
        </div>
        {view === 'form' && (
          <button
            type="button"
            onClick={() => setView('history')}
            style={{ ...glassCard, height: '44px', borderRadius: '16px', padding: '0 14px', display: 'flex', alignItems: 'center', gap: '6px', color: T.label, fontSize: '13px', fontWeight: 900, flexShrink: 0 }}
          >
            <History size={17} style={{ color: T.icon }} />
            {st('lHistory')}
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
          <div style={{ fontSize: '17px', fontWeight: 900, textAlign: 'center', marginTop: '6px', color: INK }}>{st('lEnter')}</div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: T.sub, textAlign: 'center', margin: '4px 0 16px' }}>
            {st('lSee')}
          </div>
          <input
            type="text"
            className="lm-field"
            value={name}
            maxLength={30}
            placeholder={st('lName')}
            onChange={(e) => setName(e.target.value)}
            style={{ ...fieldStyle, marginBottom: '10px' }}
          />
          <input
            type="date"
            className="lm-field"
            value={dobInput}
            max={todayStr()}
            onChange={(e) => setDobInput(e.target.value)}
            style={{ ...fieldStyle, fontSize: '16px', fontWeight: 800, colorScheme: c.isDark ? 'dark' : 'light' }}
          />
          {error && <div style={{ color: T.acc, fontSize: '12px', fontWeight: 800, marginTop: '8px' }}>{error}</div>}
          <button
            type="button"
            onClick={handleDone}
            style={{ ...roseBtn, width: '100%', marginTop: '14px', padding: '15px', borderRadius: '16px', fontSize: '15px', fontWeight: 900 }}
          >
            {st('lDone')}
          </button>
        </div>
      )}

      {/* RESULT */}
      {view === 'result' && stats && (
        <>
          <div style={{ ...glassCard, padding: '22px 20px', textAlign: 'center', boxShadow: `${glassCard.boxShadow}, 0 0 34px -6px rgba(251,191,36,0.55)`, border: '1px solid rgba(251,191,36,0.75)', borderTop: '1px solid #fff7d6' }}>
            <div style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '0.1em', color: T.label }}>{st('lAge')}</div>
            <div style={{ fontSize: '26px', fontWeight: 900, marginTop: '6px', lineHeight: 1.25, color: INK, textShadow: '0 0 18px rgba(251,113,133,0.4)' }}>{ageText(stats.exact)}</div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: T.sub, marginTop: '8px' }}>{st('lBornOn', { w: weekdayOf(activeEntry.dob) })}</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '12px', padding: '7px 14px', borderRadius: '14px', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(251,113,133,0.35)', color: T.acc, fontSize: '12px', fontWeight: 900 }}>
              <Cake size={14} />
              {stats.exact.birthdayToday && stats.exact.years > 0
                ? st('lHb')
                : st('lNextB', { n: plural(stats.exact.daysToBirthday, 'dOne', 'dMany') })}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '16px' }}>
            <Stat emoji="📅" tone="sky" label={st('sDays')} value={fmt(stats.exact.totalDays)} />
            <Stat emoji="🗓️" tone="indigo" label={st('sWeeks')} value={fmt(stats.exact.totalWeeks)} />
            <Stat emoji="🌙" tone="violet" label={st('sMonths')} value={fmt(stats.exact.totalMonths)} />
            <Stat emoji="⏰" tone="orange" label={st('sHours')} value={fmt(stats.exact.totalHours)} />
            <Stat emoji="⏱️" tone="teal" label={st('sMin')} value={fmt(stats.exact.totalMinutes)} wide />
            <Stat emoji="⚡" tone="gold" label={st('sSec')} value={fmt(stats.exact.totalSeconds)} wide />
            <Stat emoji="❤️" tone="rose" label={st('sHeart')} value={fmt(stats.approx.heartbeats)} wide />
            <Stat emoji="🌬️" tone="cyan" label={st('sBreath')} value={fmt(stats.approx.breaths)} />
            <Stat emoji="👁️" tone="fuchsia" label={st('sBlink')} value={fmt(stats.approx.blinks)} />
            <Stat emoji="👣" tone="emerald" label={st('sSteps')} value={fmt(stats.approx.steps)} />
            <Stat
              emoji="🛣️"
              tone="lime" label={st('sDist')}
              value={`${fmt(stats.approx.km)} km`}
              sub={stats.approx.earthLaps >= 0.05 ? st('sEarth', { n: fmt1(stats.approx.earthLaps) }) : undefined}
            />
            <Stat emoji="💧" tone="sky" label={st('sWater')} value={`${fmt(stats.approx.water)} L`} />
            <Stat emoji="🍽️" tone="orange" label={st('sFood')} value={`${fmt(stats.approx.food)} kg`} />
            <Stat
              emoji="😴"
              tone="indigo" label={st('sSleep')}
              value={`${fmt(stats.approx.sleepDays)} ${st('dMany')}`}
              sub={stats.approx.sleepYears >= 0.1 ? st('sSleepY', { n: fmt1(stats.approx.sleepYears) }) : undefined}
            />
            <Stat emoji="🌕" tone="gold" label={st('sMoon')} value={fmt(stats.approx.fullMoons)} />
          </div>

          <div style={{ fontSize: '10px', fontWeight: 700, color: T.soft, textAlign: 'center', marginTop: '16px' }}>
            {st('lFoot')}
          </div>
        </>
      )}

      {/* HISTORY */}
      {view === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {history.length === 0 && (
            <div style={{ ...glassCard, padding: '28px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '34px' }}>🕘</div>
              <div style={{ fontSize: '15px', fontWeight: 900, marginTop: '8px', color: INK }}>{st('lNothing')}</div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: T.sub, marginTop: '4px' }}>{st('lNothingSub')}</div>
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
                    <span style={{ display: 'block', fontSize: '16px', fontWeight: 900, color: T.acc, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.name || prettyDate(item.dob, loc)}
                    </span>
                    <span style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: T.sub, marginTop: '2px' }}>
                      {item.name ? `${prettyDate(item.dob, loc)} · ` : ''}
                      {s ? `${plural(s.exact.years, 'yOne', 'yMany')} ${plural(s.exact.months, 'moOne', 'moMany')}` : ''}
                    </span>
                  </span>
                  <ChevronRight size={18} style={{ color: '#e11d48' }} />
                </button>
                <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                  <button type="button" onClick={() => handleShare(item)} style={softBtn}>
                    <Share2 size={15} /> {st('share')}
                  </button>
                  <button type="button" onClick={() => setConfirmId(item.id)} style={{ ...softBtn, color: T.acc, background: 'rgba(225,29,72,0.12)', border: '1px solid rgba(225,29,72,0.45)' }}>
                    <Trash2 size={15} /> {st('delete')}
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
          <div style={{ ...glassCard, background: c.isDark ? c.surface : 'linear-gradient(160deg,#ffffff,#fff3f8)', padding: '22px', width: '100%', maxWidth: '320px', textAlign: 'center' }}>
            <div style={{ fontSize: '17px', fontWeight: 900, color: INK }}>{st('lDelQ')}</div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: T.sub, marginTop: '6px' }}>{st('lUndo')}</div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button type="button" onClick={() => setConfirmId(null)} style={{ ...glassCard, flex: 1, padding: '12px', borderRadius: '14px', fontSize: '14px', fontWeight: 800, color: T.label }}>
                {st('cancel')}
              </button>
              <button type="button" onClick={handleDelete} style={{ ...roseBtn, flex: 1, padding: '12px', borderRadius: '14px', fontSize: '14px', fontWeight: 900 }}>
                {st('delete')}
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
