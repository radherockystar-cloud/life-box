import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Plus, Lock } from 'lucide-react';
import { useBackHandler } from '../../utils/useBackHandler';
import CalendarGrid from './CalendarGrid';
import AddPlanForm from './AddPlanForm';
import MyPlansList from './MyPlansList';
import { getFestivalsForDate, getFestivalsInMonth, getNextFestival, getDayEmoji, toDateStr, dateFromStr } from './festivalsData';
import { loadPlans, savePlans, addOrUpdatePlan, deletePlan } from './plansStorage';
import { requestSync } from './reminderService';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const AURORA = 'linear-gradient(160deg, #4f46e5 0%, #7c3aed 38%, #db2777 75%, #f59e0b 100%)';

const glass = {
  background: 'linear-gradient(145deg, rgba(255,255,255,0.28), rgba(255,255,255,0.09))',
  border: '1px solid rgba(255,255,255,0.45)',
  boxShadow: '0 12px 26px rgba(30,20,100,0.28), inset 0 1px 0 rgba(255,255,255,0.6)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
};

const roundButton = {
  ...glass,
  width: '42px',
  height: '42px',
  borderRadius: '15px',
  color: '#ffffff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
};

const daysText = (days) => (days === 0 ? 'Today!' : days === 1 ? 'Tomorrow' : days > 1 ? `In ${days} days` : 'Passed');

const prettyShort = (dateStr) => {
  const d = dateFromStr(dateStr);
  return `${WEEKDAY_NAMES[d.getDay()].slice(0, 3)}, ${d.getDate()} ${MONTH_SHORT[d.getMonth()]}`;
};

export default function PlannerTab() {
  const now = new Date();
  const todayStr = toDateStr(now);

  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  // Plans are only used by the "My Plans" page. The calendar never shows them.
  const [plans, setPlans] = useState(loadPlans);

  const [selectedDate, setSelectedDate] = useState(null); // opens the day sheet
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formDate, setFormDate] = useState(null);
  const [showList, setShowList] = useState(false);

  const touchStart = useRef(null);

  // ---------- Back button ----------
  const closeForm = () => {
    setShowForm(false);
    setEditingPlan(null);
  };

  useBackHandler(showList, () => setShowList(false));
  useBackHandler(selectedDate !== null, () => setSelectedDate(null));
  useBackHandler(showForm, closeForm);

  // ---------- Month navigation ----------
  const shiftMonth = (delta) => {
    const next = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  };

  const goToday = () => {
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
  };

  const onTouchStart = (e) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };

  const onTouchEnd = (e) => {
    if (!touchStart.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) shiftMonth(dx < 0 ? 1 : -1);
  };

  // ---------- Plans ----------
  const commitPlans = (updated) => {
    if (!savePlans(updated)) {
      alert('Phone storage is full, so this change could not be saved.');
      return false;
    }
    setPlans(updated);
    requestSync(); // update the reminders
    return true;
  };

  const openNewPlan = (dateStr) => {
    setSelectedDate(null);
    setEditingPlan(null);
    setFormDate(dateStr || todayStr);
    setShowForm(true);
  };

  const openEditPlan = (plan) => {
    setEditingPlan(plan);
    setFormDate(plan.date);
    setShowForm(true);
  };

  const handleSavePlan = (plan) => {
    if (commitPlans(addOrUpdatePlan(plans, plan))) closeForm();
  };

  const handleDeletePlan = (id) => {
    commitPlans(deletePlan(plans, id));
  };

  // ---------- What to show ----------
  const nextFestival = getNextFestival(now);
  const monthFestivals = getFestivalsInMonth(viewYear, viewMonth);
  const selectedFestivals = selectedDate ? getFestivalsForDate(selectedDate) : [];
  const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth();

  return (
    <div className="pb-28">
      <div style={{ position: 'relative', borderRadius: '34px', overflow: 'hidden', background: AURORA, padding: '16px 14px 22px', color: '#ffffff' }}>
        {/* Soft colour blobs behind the glass */}
        <div style={{ position: 'absolute', top: '-60px', right: '-50px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(56,189,248,0.55)', filter: 'blur(50px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '120px', left: '-70px', width: '210px', height: '210px', borderRadius: '50%', background: 'rgba(251,113,133,0.5)', filter: 'blur(55px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-60px', right: '-40px', width: '190px', height: '190px', borderRadius: '50%', background: 'rgba(253,224,71,0.45)', filter: 'blur(55px)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div>
              <h2 style={{ fontSize: '21px', fontWeight: 900, letterSpacing: '0.02em' }}>Planner</h2>
              <p style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.85)', marginTop: '1px' }}>Calendar, festivals & private plans</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" onClick={() => setShowList(true)} style={roundButton} aria-label="My Plans" title="My Plans">
                <Lock size={17} />
              </button>
              <button type="button" onClick={() => openNewPlan(null)} style={{ ...roundButton, background: 'linear-gradient(145deg, #ffffff, #ede9fe)', color: '#6d28d9', border: '1px solid #fff' }} aria-label="Add plan" title="Add plan">
                <Plus size={20} strokeWidth={3} />
              </button>
            </div>
          </div>

          {/* Next festival */}
          {nextFestival && (
            <button
              type="button"
              onClick={() => {
                const d = dateFromStr(nextFestival.dateStr);
                setViewYear(d.getFullYear());
                setViewMonth(d.getMonth());
                setSelectedDate(nextFestival.dateStr);
              }}
              style={{ ...glass, width: '100%', borderRadius: '24px', padding: '12px 14px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '12px', color: '#fff', cursor: 'pointer', textAlign: 'left' }}
            >
              <span style={{ fontSize: '30px', filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.3))' }}>{nextFestival.festival.emoji}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: '9.5px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)' }}>Next festival</span>
                <span style={{ display: 'block', fontSize: '15px', fontWeight: 900, marginTop: '1px' }}>{nextFestival.festival.names.en}</span>
                <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>{prettyShort(nextFestival.dateStr)}</span>
              </span>
              <span style={{ fontSize: '11px', fontWeight: 900, padding: '6px 11px', borderRadius: '12px', background: 'rgba(255,255,255,0.25)', border: '1px solid rgba(255,255,255,0.5)' }}>
                {daysText(nextFestival.daysLeft)}
              </span>
            </button>
          )}

          {/* Month selector */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <button type="button" onClick={() => shiftMonth(-1)} style={{ ...roundButton, width: '38px', height: '38px', borderRadius: '13px' }} aria-label="Previous month">
              <ChevronLeft size={18} />
            </button>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 900 }}>{MONTH_NAMES[viewMonth]} {viewYear}</h3>
              {!isCurrentMonth && (
                <button type="button" onClick={goToday} style={{ marginTop: '3px', fontSize: '10px', fontWeight: 900, padding: '3px 10px', borderRadius: '10px', background: 'rgba(255,255,255,0.25)', border: '1px solid rgba(255,255,255,0.5)', color: '#fff', cursor: 'pointer' }}>
                  Back to today
                </button>
              )}
            </div>
            <button type="button" onClick={() => shiftMonth(1)} style={{ ...roundButton, width: '38px', height: '38px', borderRadius: '13px' }} aria-label="Next month">
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Calendar (swipe left / right to change month) */}
          <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            <CalendarGrid year={viewYear} month={viewMonth} todayStr={todayStr} selectedDateStr={selectedDate} onSelectDate={setSelectedDate} />
          </div>

          {/* Festivals this month */}
          <div style={{ ...glass, borderRadius: '26px', padding: '14px', marginTop: '18px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 900, marginBottom: '8px' }}>🎊 Festivals in {MONTH_NAMES[viewMonth]}</h4>
            {monthFestivals.length === 0 ? (
              <p style={{ fontSize: '11.5px', fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>No festival listed for this month.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {monthFestivals.map(({ dateStr, festivals }) =>
                  festivals.map((f) => (
                    <button
                      key={`${dateStr}-${f.id}`}
                      type="button"
                      onClick={() => setSelectedDate(dateStr)}
                      style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', borderRadius: '14px', background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', cursor: 'pointer', textAlign: 'left', opacity: dateStr < todayStr ? 0.6 : 1 }}
                    >
                      <span style={{ fontSize: '20px' }}>{f.emoji}</span>
                      <span style={{ flex: 1, fontSize: '12.5px', fontWeight: 900 }}>{f.names.en}</span>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.85)' }}>{prettyShort(dateStr)}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ---------- Day sheet ---------- */}
      {selectedDate && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9050, display: 'flex', alignItems: 'flex-end' }}>
          <div onClick={() => setSelectedDate(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(15,10,50,0.55)', backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)' }} />
          <div style={{ position: 'relative', width: '100%', borderRadius: '32px 32px 0 0', padding: '20px 18px 26px', background: 'linear-gradient(160deg, rgba(79,70,229,0.96), rgba(124,58,237,0.96) 55%, rgba(190,40,120,0.96))', border: '1px solid rgba(255,255,255,0.35)', boxShadow: '0 -20px 50px rgba(20,10,80,0.5), inset 0 1px 0 rgba(255,255,255,0.5)', color: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
              <span style={{ fontSize: '42px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.35))' }}>{getDayEmoji(selectedDate)}</span>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 900 }}>
                  {dateFromStr(selectedDate).getDate()} {MONTH_NAMES[dateFromStr(selectedDate).getMonth()]} {dateFromStr(selectedDate).getFullYear()}
                </h3>
                <p style={{ fontSize: '11.5px', fontWeight: 800, color: 'rgba(255,255,255,0.85)' }}>{WEEKDAY_NAMES[dateFromStr(selectedDate).getDay()]}</p>
              </div>
            </div>

            {selectedFestivals.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                {selectedFestivals.map((f) => (
                  <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 13px', borderRadius: '18px', background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.4)' }}>
                    <span style={{ fontSize: '24px' }}>{f.emoji}</span>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 900 }}>{f.names.en}</p>
                      <p style={{ fontSize: '10.5px', fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>Festival / special day</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.85)', marginBottom: '14px' }}>No festival on this day.</p>
            )}

            <button type="button" onClick={() => openNewPlan(selectedDate)} style={{ width: '100%', padding: '13px', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.7)', background: 'linear-gradient(135deg, #ffffff, #ede9fe)', color: '#4c1d95', fontSize: '13.5px', fontWeight: 900, cursor: 'pointer', boxShadow: '0 10px 24px rgba(20,10,80,0.35)' }}>
              + Add a plan for this day
            </button>
          </div>
        </div>
      )}

      {/* ---------- My Plans (private) ---------- */}
      {showList && <MyPlansList plans={plans} onClose={() => setShowList(false)} onAdd={() => openNewPlan(null)} onEdit={openEditPlan} onDelete={handleDeletePlan} />}

      {/* ---------- Add / edit form ---------- */}
      {showForm && <AddPlanForm plan={editingPlan} defaultDate={formDate} onSave={handleSavePlan} onClose={closeForm} />}
    </div>
  );
}
