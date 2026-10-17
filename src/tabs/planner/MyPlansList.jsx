import React, { useState } from 'react';
import { ArrowLeft, Plus, Search, Trash2, Edit3, Lock, Repeat, Bell } from 'lucide-react';
import { getKind, getNextOccurrence, daysUntil } from './plansStorage';
import { SETTING_KEYS, readSetting, writeSetting, requestSync, canNotify, isNotifEnabled } from './reminderService';
import { useApp } from '../../context/AppContext';
import { dateLabel } from '../../utils/dateLabels';

// Notes jaisa pink-white glossy glow theme (koi blur nahi, taaki screen halka rahe)
// Rang ab theme (light/dark) ke hisaab se makeStyles(c) se aate hain.
const makeStyles = (c) => {
  const glass = {
    background: c.glass,
    border: '1px solid ' + c.glassBorder,
    borderTop: '1px solid ' + c.glassTop,
    boxShadow: c.glassShadow + ', 0 0 22px -8px rgba(251,113,133,0.35)',
  };

  // Har plan card ko halka alag pastel rang
  const TINTS = c.isDark
    ? [
        'linear-gradient(160deg, #1e293b 0%, #3a1f33 100%)',
        'linear-gradient(160deg, #1e293b 0%, #3a2a22 100%)',
        'linear-gradient(160deg, #1e293b 0%, #2c2447 100%)',
        'linear-gradient(160deg, #1e293b 0%, #1f3a33 100%)',
        'linear-gradient(160deg, #1e293b 0%, #1f2f45 100%)',
      ]
    : [
        'linear-gradient(160deg, #ffffff 0%, #ffeaf3 100%)',
        'linear-gradient(160deg, #ffffff 0%, #fff0e6 100%)',
        'linear-gradient(160deg, #ffffff 0%, #f5ecff 100%)',
        'linear-gradient(160deg, #ffffff 0%, #e9f9f0 100%)',
        'linear-gradient(160deg, #ffffff 0%, #e8f3ff 100%)',
      ];

  return {
    INK: c.text,
    glass,
    TINTS,
    textSub: c.textSub,
    accentText: c.selectedText,
    accentDeep: c.accentDeep,
    midText: c.choiceText,
    warnText: c.isDark ? '#fbbf24' : '#b45309',
  };
};

// "{n}" jaisi jagah ko asli value se badalta hai
const fmt = (text, vars) => String(text).replace(/\{(\w+)\}/g, (_, key) => (vars[key] ?? ''));

function Toggle({ label, hint, value, onChange }) {
  const { c } = useApp();
  const INK = c.text;
  const textSub = c.textSub;

  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '10px 2px', background: 'transparent', border: 'none', color: INK, cursor: 'pointer', textAlign: 'left' }}
    >
      <span>
        <span style={{ display: 'block', fontSize: '12.5px', fontWeight: 900, color: INK }}>{label}</span>
        <span style={{ display: 'block', fontSize: '10.5px', fontWeight: 700, color: textSub, marginTop: '2px' }}>{hint}</span>
      </span>
      <span style={{ flexShrink: 0, width: '42px', height: '24px', borderRadius: '12px', background: value ? 'linear-gradient(160deg, #fb7185, #e11d48)' : (c.isDark ? 'rgba(251,113,133,0.25)' : 'rgba(190,24,93,0.2)'), boxShadow: value ? '0 0 12px rgba(244,63,94,0.45)' : 'inset 0 2px 4px rgba(190,24,93,0.2)', position: 'relative', transition: 'background 0.2s' }}>
        <span style={{ position: 'absolute', top: '2px', left: value ? '20px' : '2px', width: '20px', height: '20px', borderRadius: '10px', background: '#fff', transition: 'left 0.2s', boxShadow: '0 2px 4px rgba(130,10,60,0.35)' }} />
      </span>
    </button>
  );
}

// All saved plans: view, edit, delete. Only reachable from the "My Plans" button.
export default function MyPlansList({ plans, onClose, onAdd, onEdit, onDelete }) {
  // Theme (c) + language (tx) poore app wale context se
  const { c, t: tx, currentLang } = useApp();
  const { INK, glass, TINTS, textSub, accentText, accentDeep, midText, warnText } = makeStyles(c);

  const formatDate = (dateStr) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return dateLabel(currentLang, y, m, d);
  };

  const countdownText = (days) => {
    if (days === null) return tx.mpFinished;
    if (days === 0) return tx.planTodayBang;
    if (days === 1) return tx.planTomorrow;
    return fmt(tx.planInDays, { n: days });
  };

  const [query, setQuery] = useState('');
  const [festivalsOn, setFestivalsOn] = useState(() => readSetting(SETTING_KEYS.festivals, true));
  const [plansOn, setPlansOn] = useState(() => readSetting(SETTING_KEYS.plans, true));
  const [hideTitles, setHideTitles] = useState(() => readSetting(SETTING_KEYS.hideTitles, false));

  const changeSetting = (key, setter) => (value) => {
    writeSetting(key, value);
    setter(value);
    requestSync(300);
  };

  const handleDelete = (plan) => {
    const ok = window.confirm(fmt(tx.mpConfirmDelete, { title: plan.title }));
    if (ok) onDelete(plan.id);
  };

  const text = query.trim().toLowerCase();
  const rows = plans
    .filter((p) => !text || p.title.toLowerCase().includes(text) || (p.note || '').toLowerCase().includes(text))
    .map((plan) => {
      const next = getNextOccurrence(plan);
      return { plan, next, days: next ? daysUntil(next) : null };
    })
    .sort((a, b) => {
      if (a.days === null && b.days === null) return b.plan.date.localeCompare(a.plan.date);
      if (a.days === null) return 1;
      if (b.days === null) return -1;
      return a.days - b.days;
    });

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9000,
        overflowY: 'auto',
        background: c.isDark ? c.pageBg : 'radial-gradient(90% 40% at 0% 0%, rgba(251,113,133,0.28), transparent 60%), radial-gradient(80% 40% at 100% 100%, rgba(244,114,182,0.28), transparent 62%), linear-gradient(180deg, #fff8fb, #ffeaf3)',
        color: INK,
      }}
    >
      <div style={{ padding: '18px 16px 40px', maxWidth: '520px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button type="button" onClick={onClose} style={{ ...glass, width: '44px', height: '44px', borderRadius: '16px', color: accentDeep, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <ArrowLeft size={18} />
            </button>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 900, color: INK, textShadow: '0 0 16px rgba(251,113,133,0.4)' }}>{tx.planMyPlans}</h2>
              <p style={{ fontSize: '10.5px', fontWeight: 700, color: textSub, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Lock size={10} /> {tx.mpPrivate}
              </p>
            </div>
          </div>
          <button type="button" onClick={onAdd} style={{ width: '44px', height: '44px', borderRadius: '16px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'linear-gradient(160deg, #fb7185 0%, #e11d48 55%, #be123c 100%)', border: '1px solid rgba(255,255,255,0.5)', borderTop: '1px solid rgba(255,255,255,0.85)', boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,0.65), inset 0 -6px 12px -6px rgba(80,0,40,0.5), 0 8px 18px -4px rgba(225,29,72,0.65), 0 0 24px rgba(244,63,94,0.5)' }}>
            <Plus size={20} />
          </button>
        </div>

        {/* Search */}
        <div style={{ ...glass, borderRadius: '18px', display: 'flex', alignItems: 'center', gap: '8px', padding: '0 14px', marginBottom: '14px' }}>
          <Search size={15} color="#f43f5e" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tx.mpSearch}
            className="placeholder:text-[rgba(190,24,93,0.4)]"
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: INK, fontSize: '13px', fontWeight: 800, padding: '13px 0' }}
          />
        </div>

        {/* Plans */}
        {rows.length === 0 ? (
          <div style={{ ...glass, borderRadius: '24px', padding: '30px 18px', textAlign: 'center', marginBottom: '16px' }}>
            <div style={{ fontSize: '38px', marginBottom: '8px' }}>🗓️</div>
            <p style={{ fontSize: '13px', fontWeight: 900, color: INK }}>{plans.length === 0 ? tx.mpNone : tx.mpNoMatch}</p>
            <p style={{ fontSize: '11px', fontWeight: 700, color: textSub, marginTop: '4px' }}>
              {plans.length === 0 ? tx.mpNoneHint : tx.mpTryOther}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            {rows.map(({ plan, days }) => {
              const kind = getKind(plan.kind);
              const finished = days === null;
              return (
                <div key={plan.id} style={{ ...glass, background: TINTS[Math.abs(Number(plan.id) || 0) % TINTS.length], borderRadius: '22px', padding: '14px', opacity: finished ? 0.65 : 1 }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '15px', background: c.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.85)', border: '1px solid rgba(251,113,133,0.3)', boxShadow: c.isDark ? 'none' : 'inset 0 2px 0 #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>
                      {kind.emoji}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: '14px', fontWeight: 900, wordBreak: 'break-word', color: accentText }}>{plan.title}</h4>
                      <p style={{ fontSize: '11px', fontWeight: 800, color: textSub, marginTop: '2px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px' }}>
                        <span>{formatDate(plan.date)} · {plan.time}</span>
                        {plan.repeatYearly && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}><Repeat size={10} /> {tx.apEveryYear}</span>
                        )}
                      </p>
                      {plan.note ? (
                        <p style={{ fontSize: '11px', fontWeight: 600, color: midText, marginTop: '6px', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{plan.note}</p>
                      ) : null}
                    </div>
                    <span style={{ alignSelf: 'flex-start', flexShrink: 0, fontSize: '10px', fontWeight: 900, padding: '4px 9px', borderRadius: '10px', background: days === 0 ? '#fde68a' : 'rgba(244,63,94,0.1)', border: days === 0 ? '1px solid rgba(251,191,36,0.75)' : '1px solid rgba(251,113,133,0.3)', color: days === 0 ? '#7c2d12' : accentText }}>
                      {countdownText(days)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <button type="button" onClick={() => onEdit(plan)} style={{ flex: 1, padding: '9px', borderRadius: '13px', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(251,113,133,0.3)', color: accentDeep, fontSize: '11.5px', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <Edit3 size={13} /> {tx.mpEdit}
                    </button>
                    <button type="button" onClick={() => handleDelete(plan)} style={{ flex: 1, padding: '9px', borderRadius: '13px', background: 'rgba(225,29,72,0.12)', border: '1px solid rgba(225,29,72,0.45)', color: accentText, fontSize: '11.5px', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <Trash2 size={13} /> {tx.mpDelete}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Reminder settings */}
        <div style={{ ...glass, borderRadius: '24px', padding: '14px 16px' }}>
          <h4 style={{ fontSize: '13px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', color: INK }}>
            <Bell size={14} style={{ color: accentDeep }} /> {tx.mpReminders}
          </h4>

          <Toggle label={tx.mpFestival} hint={tx.mpFestivalHint} value={festivalsOn} onChange={changeSetting(SETTING_KEYS.festivals, setFestivalsOn)} />
          <Toggle label={tx.mpPlanRem} hint={tx.mpPlanRemHint} value={plansOn} onChange={changeSetting(SETTING_KEYS.plans, setPlansOn)} />
          <Toggle label={tx.mpHide} hint={tx.mpHideHint} value={hideTitles} onChange={changeSetting(SETTING_KEYS.hideTitles, setHideTitles)} />

          <p style={{ fontSize: '10.5px', fontWeight: 700, color: textSub, marginTop: '8px', lineHeight: 1.5 }}>
            {tx.mpLangNote}
          </p>

          {/* Master switch OFF (Menu > Settings > Notifications) ho to user ko pata chale ki reminders kyun nahi aa rahe */}
          {!isNotifEnabled() && (
            <p style={{ fontSize: '10.5px', fontWeight: 800, color: warnText, marginTop: '8px', lineHeight: 1.5 }}>
              {tx.mpMasterOff}
            </p>
          )}

          {!canNotify() && (
            <p style={{ fontSize: '10.5px', fontWeight: 800, color: warnText, marginTop: '8px', lineHeight: 1.5 }}>
              {tx.mpBrowserNote}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
