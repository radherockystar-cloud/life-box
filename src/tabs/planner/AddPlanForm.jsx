import React, { useState } from 'react';
import { X, Lock } from 'lucide-react';
import { PLAN_KINDS, getKind } from './plansStorage';
import { toDateStr } from './festivalsData';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const pad = (n) => String(n).padStart(2, '0');

const fieldStyle = {
  width: '100%',
  background: 'rgba(255,255,255,0.16)',
  border: '1px solid rgba(255,255,255,0.4)',
  borderRadius: '14px',
  padding: '12px',
  color: '#ffffff',
  fontSize: '13px',
  fontWeight: 800,
  outline: 'none',
  boxShadow: 'inset 0 2px 6px rgba(30,20,100,0.2)',
  colorScheme: 'dark',
};

const labelStyle = {
  display: 'block',
  fontSize: '10px',
  fontWeight: 900,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.8)',
  marginBottom: '6px',
};

// Add or edit a plan.  plan = null -> new plan.  defaultDate = 'YYYY-MM-DD' to start with.
export default function AddPlanForm({ plan, defaultDate, onSave, onClose }) {
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
      setError('Please write what this plan is about.');
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
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(15,10,50,0.6)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
      />

      <div
        style={{
          position: 'relative',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          borderRadius: '32px 32px 0 0',
          padding: '18px 18px 28px',
          background: 'linear-gradient(160deg, rgba(79,70,229,0.96), rgba(124,58,237,0.96) 55%, rgba(190,40,120,0.96))',
          border: '1px solid rgba(255,255,255,0.35)',
          boxShadow: '0 -20px 50px rgba(20,10,80,0.5), inset 0 1px 0 rgba(255,255,255,0.5)',
          color: '#ffffff',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 900 }}>{plan ? 'Edit Plan' : 'New Plan'}</h3>
            <p style={{ fontSize: '10.5px', fontWeight: 700, color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <Lock size={10} /> Private. It never shows on the calendar.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ width: '34px', height: '34px', borderRadius: '12px', background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
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
                  border: active ? '1px solid #ffffff' : '1px solid rgba(255,255,255,0.3)',
                  background: active ? 'rgba(255,255,255,0.32)' : 'rgba(255,255,255,0.1)',
                  boxShadow: active ? '0 0 16px rgba(255,255,255,0.45)' : 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                <span style={{ fontSize: '20px' }}>{k.emoji}</span>
                <span style={{ fontSize: '9.5px', fontWeight: 900 }}>{k.label}</span>
              </button>
            );
          })}
        </div>

        {/* Title */}
        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>What is it?</label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setError('');
            }}
            placeholder="e.g., Mom's Birthday"
            className="placeholder:text-white/50"
            style={fieldStyle}
          />
          {error && <p style={{ fontSize: '11px', fontWeight: 800, color: '#ffe08a', marginTop: '6px' }}>{error}</p>}
        </div>

        {/* Date */}
        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>Date</label>
          <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.5fr 1fr', gap: '8px' }}>
            <select value={safeDay} onChange={(e) => setDay(Number(e.target.value))} style={fieldStyle}>
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d} style={{ color: '#111827' }}>{d}</option>
              ))}
            </select>
            <select value={month} onChange={(e) => setMonth(Number(e.target.value))} style={fieldStyle}>
              {MONTHS.map((name, i) => (
                <option key={name} value={i + 1} style={{ color: '#111827' }}>{name}</option>
              ))}
            </select>
            <select value={year} onChange={(e) => setYear(Number(e.target.value))} style={fieldStyle}>
              {years.map((y) => (
                <option key={y} value={y} style={{ color: '#111827' }}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Time + repeat */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
          <div>
            <label style={labelStyle}>Remind me at</label>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} style={fieldStyle} />
          </div>
          <div>
            <label style={labelStyle}>Every year</label>
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
              <span>{repeatYearly ? 'Yes, repeat' : 'No, once'}</span>
              <span
                style={{
                  width: '38px',
                  height: '22px',
                  borderRadius: '11px',
                  background: repeatYearly ? '#34d399' : 'rgba(255,255,255,0.3)',
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
                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  }}
                />
              </span>
            </button>
          </div>
        </div>

        {/* Note */}
        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>Note (optional)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Gift idea, place, anything you want to remember..."
            className="placeholder:text-white/50"
            style={{ ...fieldStyle, resize: 'none', fontWeight: 700 }}
          />
        </div>

        {/* Info */}
        <p style={{ fontSize: '11px', fontWeight: 700, color: isInPast ? '#ffe08a' : 'rgba(255,255,255,0.85)', marginBottom: '14px', lineHeight: 1.5 }}>
          {isInPast
            ? '⚠️ This date has already passed, so no reminder will be sent.'
            : '🔔 You will get a reminder 7 days before and again on the day.'}
        </p>

        <button
          type="button"
          onClick={handleSave}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '18px',
            border: '1px solid rgba(255,255,255,0.7)',
            background: 'linear-gradient(135deg, #ffffff, #ede9fe)',
            color: '#4c1d95',
            fontSize: '14px',
            fontWeight: 900,
            cursor: 'pointer',
            boxShadow: '0 10px 24px rgba(20,10,80,0.35)',
          }}
        >
          {plan ? 'Save Changes ✅' : 'Save Plan ✅'}
        </button>
      </div>
    </div>
  );
}
