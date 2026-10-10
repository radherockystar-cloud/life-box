import React, { useState } from 'react';
import { ArrowLeft, Plus, Search, Trash2, Edit3, Lock, Repeat, Bell } from 'lucide-react';
import { getKind, getNextOccurrence, daysUntil } from './plansStorage';
import { SETTING_KEYS, readSetting, writeSetting, requestSync, canNotify, sendTestNotification } from './reminderService';

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const formatDate = (dateStr) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return `${d} ${MONTHS_SHORT[m - 1]} ${y}`;
};

const glass = {
  background: 'linear-gradient(145deg, rgba(255,255,255,0.28), rgba(255,255,255,0.09))',
  border: '1px solid rgba(255,255,255,0.45)',
  boxShadow: '0 12px 26px rgba(30,20,100,0.28), inset 0 1px 0 rgba(255,255,255,0.6)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
};

const countdownText = (days) => {
  if (days === null) return 'Finished';
  if (days === 0) return 'Today!';
  if (days === 1) return 'Tomorrow';
  return `In ${days} days`;
};

function Toggle({ label, hint, value, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '10px 2px', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', textAlign: 'left' }}
    >
      <span>
        <span style={{ display: 'block', fontSize: '12.5px', fontWeight: 900 }}>{label}</span>
        <span style={{ display: 'block', fontSize: '10.5px', fontWeight: 700, color: 'rgba(255,255,255,0.75)', marginTop: '2px' }}>{hint}</span>
      </span>
      <span style={{ flexShrink: 0, width: '42px', height: '24px', borderRadius: '12px', background: value ? '#34d399' : 'rgba(255,255,255,0.3)', position: 'relative', transition: 'background 0.2s' }}>
        <span style={{ position: 'absolute', top: '2px', left: value ? '20px' : '2px', width: '20px', height: '20px', borderRadius: '10px', background: '#fff', transition: 'left 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }} />
      </span>
    </button>
  );
}

// All saved plans: view, edit, delete. Only reachable from the "My Plans" button.
export default function MyPlansList({ plans, onClose, onAdd, onEdit, onDelete }) {
  const [query, setQuery] = useState('');
  const [festivalsOn, setFestivalsOn] = useState(() => readSetting(SETTING_KEYS.festivals, true));
  const [plansOn, setPlansOn] = useState(() => readSetting(SETTING_KEYS.plans, true));
  const [hideTitles, setHideTitles] = useState(() => readSetting(SETTING_KEYS.hideTitles, false));
  const [testMessage, setTestMessage] = useState('');

  const changeSetting = (key, setter) => (value) => {
    writeSetting(key, value);
    setter(value);
    requestSync(300);
  };

  const handleTest = async () => {
    setTestMessage('Sending...');
    try {
      const ok = await sendTestNotification();
      setTestMessage(ok ? 'A test notification will arrive in 5 seconds.' : 'Could not send. Please allow notifications for this app in phone settings.');
    } catch {
      setTestMessage('Could not send a test notification.');
    }
  };

  const handleDelete = (plan) => {
    const ok = window.confirm(`Delete "${plan.title}"?\n\nIt goes to the Trash / Bin (Menu > Settings), where you can restore it within 7 days.`);
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
        background: 'linear-gradient(160deg, #4f46e5 0%, #7c3aed 38%, #db2777 75%, #f59e0b 100%)',
        color: '#ffffff',
      }}
    >
      <div style={{ padding: '18px 16px 40px', maxWidth: '520px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button type="button" onClick={onClose} style={{ ...glass, width: '40px', height: '40px', borderRadius: '14px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <ArrowLeft size={18} />
            </button>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 900 }}>My Plans</h2>
              <p style={{ fontSize: '10.5px', fontWeight: 700, color: 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Lock size={10} /> Only you can see this page
              </p>
            </div>
          </div>
          <button type="button" onClick={onAdd} style={{ ...glass, width: '40px', height: '40px', borderRadius: '14px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Plus size={20} />
          </button>
        </div>

        {/* Search */}
        <div style={{ ...glass, borderRadius: '18px', display: 'flex', alignItems: 'center', gap: '8px', padding: '0 14px', marginBottom: '14px' }}>
          <Search size={15} color="rgba(255,255,255,0.8)" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your plans..."
            className="placeholder:text-white/60"
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '13px', fontWeight: 800, padding: '13px 0' }}
          />
        </div>

        {/* Plans */}
        {rows.length === 0 ? (
          <div style={{ ...glass, borderRadius: '24px', padding: '30px 18px', textAlign: 'center', marginBottom: '16px' }}>
            <div style={{ fontSize: '38px', marginBottom: '8px' }}>🗓️</div>
            <p style={{ fontSize: '13px', fontWeight: 900 }}>{plans.length === 0 ? 'No plans yet' : 'No plan matches your search'}</p>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.8)', marginTop: '4px' }}>
              {plans.length === 0 ? 'Tap + to add a birthday, anniversary or anything you want to remember.' : 'Try a different word.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            {rows.map(({ plan, days }) => {
              const kind = getKind(plan.kind);
              const finished = days === null;
              return (
                <div key={plan.id} style={{ ...glass, borderRadius: '22px', padding: '14px', opacity: finished ? 0.65 : 1 }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '15px', background: 'rgba(255,255,255,0.25)', border: '1px solid rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>
                      {kind.emoji}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: '14px', fontWeight: 900, wordBreak: 'break-word' }}>{plan.title}</h4>
                      <p style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.85)', marginTop: '2px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px' }}>
                        <span>{formatDate(plan.date)} · {plan.time}</span>
                        {plan.repeatYearly && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}><Repeat size={10} /> Every year</span>
                        )}
                      </p>
                      {plan.note ? (
                        <p style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginTop: '6px', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{plan.note}</p>
                      ) : null}
                    </div>
                    <span style={{ alignSelf: 'flex-start', flexShrink: 0, fontSize: '10px', fontWeight: 900, padding: '4px 9px', borderRadius: '10px', background: days === 0 ? '#fde68a' : 'rgba(255,255,255,0.22)', color: days === 0 ? '#7c2d12' : '#fff' }}>
                      {countdownText(days)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <button type="button" onClick={() => onEdit(plan)} style={{ flex: 1, padding: '9px', borderRadius: '13px', background: 'rgba(255,255,255,0.22)', border: '1px solid rgba(255,255,255,0.45)', color: '#fff', fontSize: '11.5px', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <Edit3 size={13} /> Edit
                    </button>
                    <button type="button" onClick={() => handleDelete(plan)} style={{ flex: 1, padding: '9px', borderRadius: '13px', background: 'rgba(244,63,94,0.35)', border: '1px solid rgba(255,200,210,0.6)', color: '#fff', fontSize: '11.5px', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Reminder settings */}
        <div style={{ ...glass, borderRadius: '24px', padding: '14px 16px' }}>
          <h4 style={{ fontSize: '13px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <Bell size={14} /> Reminders
          </h4>

          <Toggle label="Festival greetings" hint="A good-wishes message on every festival, automatically." value={festivalsOn} onChange={changeSetting(SETTING_KEYS.festivals, setFestivalsOn)} />
          <Toggle label="Plan reminders" hint="7 days before and on the day of each plan." value={plansOn} onChange={changeSetting(SETTING_KEYS.plans, setPlansOn)} />
          <Toggle label="Hide plan names in notifications" hint='Shows only "You have a private plan".' value={hideTitles} onChange={changeSetting(SETTING_KEYS.hideTitles, setHideTitles)} />

          <p style={{ fontSize: '10.5px', fontWeight: 700, color: 'rgba(255,255,255,0.8)', marginTop: '8px', lineHeight: 1.5 }}>
            Notifications come in your app language. The plan name stays exactly as you wrote it.
          </p>

          {canNotify() ? (
            <>
              <button type="button" onClick={handleTest} style={{ marginTop: '10px', width: '100%', padding: '10px', borderRadius: '14px', background: 'rgba(255,255,255,0.22)', border: '1px solid rgba(255,255,255,0.5)', color: '#fff', fontSize: '12px', fontWeight: 900, cursor: 'pointer' }}>
                Send a test notification
              </button>
              {testMessage && <p style={{ fontSize: '10.5px', fontWeight: 700, color: '#fde68a', marginTop: '6px' }}>{testMessage}</p>}
            </>
          ) : (
            <p style={{ fontSize: '10.5px', fontWeight: 800, color: '#fde68a', marginTop: '8px', lineHeight: 1.5 }}>
              Notifications are sent by the installed Android app. They do not appear while testing in the browser.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
