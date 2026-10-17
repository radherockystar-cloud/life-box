import React, { useState } from 'react';
import { X, Lock } from 'lucide-react';
import { PLAN_KINDS, getKind } from './plansStorage';
import { toDateStr } from './festivalsData';
import { useApp } from '../../context/AppContext';
import { monthLong } from '../../utils/dateLabels';

const pad = (n) => String(n).padStart(2, '0');

// Notes jaisa pink-white glossy glow theme (koi blur nahi)
// Rang ab theme (light/dark) ke hisaab se makeStyles(c) se aate hain.
const makeStyles = (c) => {
  const INK = c.text;

  const fieldStyle = {
    width: '100%',
    background: c.isDark ? c.surfaceAlt : 'linear-gradient(160deg, #ffffff 0%, rgba(255,255,255,0.85) 55%, rgba(255,234,243,0.96) 100%)',
    border: '1px solid rgba(251,113,133,0.3)',
    borderTop: '1px solid ' + c.glassTop,
    borderRadius: '14px',
    padding: '12px',
    color: INK,
    fontSize: '13px',
    fontWeight: 800,
    outline: 'none',
    boxShadow: c.isDark ? 'none' : 'inset 0 2px 0 #ffffff, 0 8px 16px -10px rgba(244,63,94,0.35)',
    colorScheme: c.isDark ? 'dark' : 'light',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '10px',
    fontWeight: 900,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: c.isDark ? c.textSub : '#a8264f',
    marginBottom: '6px',
  };

  return { INK, fieldStyle, labelStyle };
};

const FORM_CSS = `
.pl-field::placeholder{color:rgba(190,24,93,.4)}
.pl-field:focus{border-color:rgba(244,63,94,.85)!important;box-shadow:0 0 0 3px rgba(244,63,94,.15),0 0 22px rgba(244,63,94,.25)!important}
[data-theme="dark"] .pl-field::placeholder{color:rgba(253,164,175,.5)}
`;

// Add or edit a plan.  plan = null -> new plan.  defaultDate = 'YYYY-MM-DD' to start with.
export default function AddPlanForm({ plan, defaultDate, onSave, onClose }) {
  // Theme (c) + language (tx) poore app wale context se
  const { c, t: tx, currentLang } = useApp();
  const { INK, fieldStyle, labelStyle } = makeStyles(c);
  // Plan type ka naam: agar translation (kind_<id>) mile to wo, warna plansStorage wala label
  const kindLabel = (k) => tx['kind_' + k.id] || k.label;

  const startDate = plan ? plan.date : defaultDate || toDateStr(new Date());
  const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
  const thisYear = new Date().getFullYear();

  const [kind, setKind] = useState(plan ? plan.kind : 'birthday');
  const [title, setTitle] = useState(plan ? plan.title : '');
  const [day, setDay] = useState(startDay);
  const [month, setMonth] = useState(startMonth);
  const [year, setYear] = useState(startYear);
  const [time, setTime] = useState(plan ? plan.time : '09:00');
  const [repeatYearly, setRepeatYearly] = useState(plan ? plan.repeatYearly : getKind('birthday').yearly);
  const [note, setNote] = useState(plan ? plan.note : '');
  const [error, setError] = useState('');

  const daysInMonth = new Date(year, month, 0).getDate();
  const safeDay = Math.min(day, daysInMonth);

  const firstYear = Math.min(thisYear - 100, startYear);
  const lastYear = Math.max(thisYear + 15, startYear);
  const years = Array.from({ length: lastYear - firstYear + 1 }, (_, i) => firstYear + i);

  const chosenDate = `${year}-${pad(month)}-${pad(safeDay)}`;
  const isInPast = !repeatYearly && chosenDate < toDateStr(new Date());

  const pickKind = (id) => {
    setKind(id);
    setRepeatYearly(getKind(id).yearly);
  };

  const handleSave = () => {
    if (!title.trim()) {
      setError(tx.apErrTitle);
      return;
    }

    onSave({
      id: plan ? plan.id : Date.now(),
      title: title.trim(),
      note: note.trim(),
      date: chosenDate,
      time: time || '09:00',
      kind,
      repeatYearly,
    });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9100, display: 'flex', alignItems: 'flex-end' }}>
      <style>{FORM_CSS}</style>
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(60,10,30,0.5)' }}
      />

      <div
        style={{
          position: 'relative',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          borderRadius: '32px 32px 0 0',
          padding: '18px 18px 28px',
          background: c.isDark ? '#1e293b' : 'linear-gradient(170deg, #ffffff 0%, #fff3f8 55%, #ffe3ef 100%)',
          border: '1px solid rgba(251,113,133,0.3)',
          borderBottom: 'none',
          borderTop: '1px solid ' + c.glassTop,
          boxShadow: c.isDark ? '0 -18px 50px -12px rgba(0,0,0,0.6)' : '0 -18px 50px -12px rgba(244,63,94,0.45), inset 0 2px 0 #ffffff',
          color: INK,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 900, color: INK, textShadow: '0 0 16px rgba(251,113,133,0.4)' }}>{plan ? tx.apEdit : tx.apNew}</h3>
            <p style={{ fontSize: '10.5px', fontWeight: 700, color: c.textSub, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <Lock size={10} /> {tx.apPrivate}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ width: '38px', height: '38px', borderRadius: '13px', background: c.isDark ? c.surfaceAlt : 'linear-gradient(160deg, #ffffff 0%, rgba(255,234,243,0.96) 100%)', border: '1px solid rgba(251,113,133,0.3)', borderTop: '1px solid ' + c.glassTop, boxShadow: c.isDark ? 'none' : 'inset 0 2px 0 #ffffff, 0 8px 16px -8px rgba(244,63,94,0.4)', color: c.accentDeep, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Type */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '14px' }}>
          {PLAN_KINDS.map((k) => {
            const active = kind === k.id;
            return (
              <button
                key={k.id}
                type="button"
                onClick={() => pickKind(k.id)}
                style={{
                  padding: '10px 4px',
                  borderRadius: '16px',
                  border: active ? '1px solid rgba(244,63,94,0.8)' : '1px solid rgba(251,113,133,0.25)',
                  borderTop: '1px solid ' + c.glassTop,
                  background: active ? c.selectedBg : (c.isDark ? c.surface : 'linear-gradient(160deg, #ffffff 0%, rgba(255,234,243,0.9) 100%)'),
                  boxShadow: active ? (c.isDark ? '0 0 18px -2px rgba(244,63,94,0.55)' : 'inset 0 2px 0 #ffffff, 0 0 18px -2px rgba(244,63,94,0.55)') : (c.isDark ? 'none' : 'inset 0 2px 0 #ffffff, 0 6px 12px -8px rgba(244,63,94,0.3)'),
                  color: active ? c.selectedText : (c.isDark ? c.textSub : '#a8264f'),
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                <span style={{ fontSize: '20px' }}>{k.emoji}</span>
                <span style={{ fontSize: '9.5px', fontWeight: 900 }}>{kindLabel(k)}</span>
              </button>
            );
          })}
        </div>

        {/* Title */}
        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>{tx.apWhat}</label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setError('');
            }}
            placeholder={tx.apWhatPh}
            className="pl-field"
            style={fieldStyle}
          />
          {error && <p style={{ fontSize: '11px', fontWeight: 800, color: c.selectedText, marginTop: '6px' }}>{error}</p>}
        </div>

        {/* Date */}
        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>{tx.apDate}</label>
          <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.5fr 1fr', gap: '8px' }}>
            <select value={safeDay} onChange={(e) => setDay(Number(e.target.value))} className="pl-field" style={fieldStyle}>
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d} style={{ color: c.isDark ? '#f9fafb' : '#111827', background: c.isDark ? '#1e293b' : undefined }}>{d}</option>
              ))}
            </select>
            <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="pl-field" style={fieldStyle}>
              {Array.from({ length: 12 }, (_, i) => i).map((i) => (
                <option key={i} value={i + 1} style={{ color: c.isDark ? '#f9fafb' : '#111827', background: c.isDark ? '#1e293b' : undefined }}>{monthLong(currentLang, i)}</option>
              ))}
            </select>
            <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="pl-field" style={fieldStyle}>
              {years.map((y) => (
                <option key={y} value={y} style={{ color: c.isDark ? '#f9fafb' : '#111827', background: c.isDark ? '#1e293b' : undefined }}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Time + repeat */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
          <div>
            <label style={labelStyle}>{tx.apRemindAt}</label>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="pl-field" style={fieldStyle} />
          </div>
          <div>
            <label style={labelStyle}>{tx.apEveryYear}</label>
            <button
              type="button"
              onClick={() => setRepeatYearly(!repeatYearly)}
              style={{
                ...fieldStyle,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span>{repeatYearly ? tx.apYes : tx.apNo}</span>
              <span
                style={{
                  width: '38px',
                  height: '22px',
                  borderRadius: '11px',
                  background: repeatYearly ? 'linear-gradient(160deg, #fb7185, #e11d48)' : (c.isDark ? 'rgba(251,113,133,0.25)' : 'rgba(190,24,93,0.2)'),
                  boxShadow: repeatYearly ? '0 0 12px rgba(244,63,94,0.45)' : 'inset 0 2px 4px rgba(190,24,93,0.2)',
                  position: 'relative',
                  transition: 'background 0.2s',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: '2px',
                    left: repeatYearly ? '18px' : '2px',
                    width: '18px',
                    height: '18px',
                    borderRadius: '9px',
                    background: '#fff',
                    transition: 'left 0.2s',
                    boxShadow: '0 2px 4px rgba(130,10,60,0.35)',
                  }}
                />
              </span>
            </button>
          </div>
        </div>

        {/* Note */}
        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>{tx.apNote}</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder={tx.apNotePh}
            className="pl-field"
            style={{ ...fieldStyle, resize: 'none', fontWeight: 700 }}
          />
        </div>

        {/* Info */}
        <p style={{ fontSize: '11px', fontWeight: 700, color: isInPast ? (c.isDark ? '#fbbf24' : '#b45309') : c.textSub, marginBottom: '14px', lineHeight: 1.5 }}>
          {isInPast ? tx.apPast : tx.apInfo}
        </p>

        <button
          type="button"
          onClick={handleSave}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '18px',
            background: 'linear-gradient(160deg, #fb7185 0%, #e11d48 55%, #be123c 100%)',
            border: '1px solid rgba(255,255,255,0.5)',
            borderTop: '1px solid rgba(255,255,255,0.85)',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: 900,
            cursor: 'pointer',
            boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,0.65), inset 0 -6px 12px -6px rgba(80,0,40,0.5), 0 8px 18px -4px rgba(225,29,72,0.65), 0 0 24px rgba(244,63,94,0.5)',
          }}
        >
          {plan ? tx.apSaveChanges : tx.apSavePlan}
        </button>
      </div>
    </div>
  );
}
