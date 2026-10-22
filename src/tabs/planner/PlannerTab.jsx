import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Lock } from 'lucide-react';
import { useBackHandler } from '../../utils/useBackHandler';
import CalendarGrid from './CalendarGrid';
import AddPlanForm from './AddPlanForm';
import MyPlansList from './MyPlansList';
import { getFestivalsForDate, getFestivalsInMonth, getNextFestival, getDayEmoji, toDateStr, dateFromStr } from './festivalsData';
import { loadPlans, savePlans, addOrUpdatePlan, deletePlan, getBannerPlans, getKind } from './plansStorage';
import { requestSync } from './reminderService';
import { useApp } from '../../context/AppContext';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Notes jaisa pink-white glossy glow theme (koi blur nahi, taaki Planner halka rahe)
// Rang ab theme (light/dark) ke hisaab se makeStyles(c) se aate hain.

const roseBtn = {
  background: 'linear-gradient(160deg, #fb7185 0%, #e11d48 55%, #be123c 100%)',
  border: '1px solid rgba(255,255,255,0.5)',
  borderTop: '1px solid rgba(255,255,255,0.85)',
  boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,0.65), inset 0 -6px 12px -6px rgba(80,0,40,0.5), 0 8px 18px -4px rgba(225,29,72,0.65), 0 0 24px rgba(244,63,94,0.5)',
  color: '#ffffff',
};

const makeStyles = (c) => {
  const INK = c.text;

  const glass = {
    background: c.glass,
    border: '1px solid ' + c.glassBorder,
    borderTop: '1px solid ' + c.glassTop,
    boxShadow: c.glassShadow + ', 0 0 22px -8px rgba(251,113,133,0.35)',
  };

  const goldGlow = c.isDark
    ? {
        background: 'linear-gradient(160deg, rgba(251,191,36,0.22) 0%, rgba(245,158,11,0.12) 100%)',
        border: '1px solid rgba(251,191,36,0.6)',
        borderTop: '1px solid rgba(251,191,36,0.6)',
        boxShadow: '0 10px 22px -10px rgba(0,0,0,0.5), 0 0 26px -4px rgba(251,191,36,0.3)',
      }
    : {
        background: 'linear-gradient(160deg, #fffbe6 0%, #fff0b8 100%)',
        border: '1px solid rgba(251,191,36,0.75)',
        borderTop: '1px solid #fff7d6',
        boxShadow: 'inset 0 2px 0 #fffbe6, inset 0 -9px 14px -10px rgba(245,158,11,0.35), 0 10px 22px -10px rgba(245,158,11,0.5), 0 0 26px -4px rgba(251,191,36,0.6)',
      };

  const chipStyle = {
    fontSize: '11px',
    fontWeight: 900,
    padding: '6px 11px',
    borderRadius: '12px',
    background: 'rgba(244,63,94,0.1)',
    border: '1px solid rgba(251,113,133,0.35)',
    color: c.selectedText,
  };

  const roundButton = {
    ...glass,
    width: '44px',
    height: '44px',
    borderRadius: '16px',
    color: c.accentDeep,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  };

  return {
    INK,
    glass,
    goldGlow,
    chipStyle,
    roundButton,
    // text colours used inside the cards
    textSub: c.textSub,
    accentText: c.selectedText,
    midText: c.choiceText,
    dateText: c.isDark ? c.textSub : '#b0587a',
    goldSub: c.isDark ? '#fcd34d' : '#92400e',
  };
};

// "{n}" jaisi jagah ko asli value se badalta hai
const fmt = (text, vars) => String(text).replace(/\{(\w+)\}/g, (_, key) => (vars[key] ?? ''));

const formatTime = (time) => {
  const [h, m] = (time || '09:00').split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};

export default function PlannerTab() {
  // Theme (c) + language (tx) poore app wale context se
  const { c, t: tx, currentLang } = useApp();
  const { INK, glass, goldGlow, chipStyle, roundButton, textSub, accentText, midText, dateText, goldSub } = makeStyles(c);

  const [, setTick] = useState(0);
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
  const sliderRef = useRef(null);
  const [slideIndex, setSlideIndex] = useState(0);

  // Re-check every minute (so banners change at midnight) and refresh the reminders when the tab opens
  useEffect(() => {
    requestSync(500);
    const timer = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

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
      alert(tx.planStorageFull);
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
  const bannerPlans = getBannerPlans(plans, now);

  // Slides: the next festival first, then plan banners (7 days before / today)
  const slides = [
    ...(nextFestival ? [{ key: 'festival', type: 'festival' }] : []),
    ...bannerPlans.map(({ plan, days }) => ({ key: `plan-${plan.id}-${days}`, type: 'plan', plan, days })),
  ];
  const slideCount = slides.length;

  // Auto-slide every 4 seconds when there is more than one banner
  useEffect(() => {
    if (slideCount < 2) return undefined;
    const timer = setInterval(() => {
      const el = sliderRef.current;
      if (!el) return;
      const next = (Math.round(el.scrollLeft / el.clientWidth) + 1) % slideCount;
      el.scrollTo({ left: next * el.clientWidth, behavior: 'smooth' });
    }, 4000);
    return () => clearInterval(timer);
  }, [slideCount]);

  const onSliderScroll = (e) => {
    const el = e.currentTarget;
    setSlideIndex(Math.round(el.scrollLeft / el.clientWidth));
  };
  const monthFestivals = getFestivalsInMonth(viewYear, viewMonth);
  const selectedFestivals = selectedDate ? getFestivalsForDate(selectedDate) : [];
  const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth();

  // ---------- Language-aware names / dates (English me bilkul pehle jaisa) ----------
  const intlLocale = (currentLang || 'en') + '-u-nu-latn';
  const monthName = (m) => (currentLang === 'en' ? MONTH_NAMES[m] : new Date(2026, m, 1).toLocaleDateString(intlLocale, { month: 'long' }));
  const weekdayName = (d) => (currentLang === 'en' ? WEEKDAY_NAMES[d] : new Date(2026, 0, 4 + d).toLocaleDateString(intlLocale, { weekday: 'long' }));
  const prettyShort = (dateStr) => {
    const d = dateFromStr(dateStr);
    if (currentLang === 'en') return `${WEEKDAY_NAMES[d.getDay()].slice(0, 3)}, ${d.getDate()} ${MONTH_SHORT[d.getMonth()]}`;
    return d.toLocaleDateString(intlLocale, { weekday: 'short', day: 'numeric', month: 'short' });
  };
  const festName = (item) => item?.names?.[currentLang] || item?.names?.en || '';
  const daysText = (days) => (days === 0 ? tx.planTodayBang : days === 1 ? tx.planTomorrow : days > 1 ? fmt(tx.planInDays, { n: days }) : tx.planPassed);

  return (
    <div className="pb-28" style={{ overflowX: 'clip', maxWidth: '100%' }}>
      <div style={{ position: 'relative', padding: '4px 2px 22px', color: INK }}>
        {/* Soft colour glows behind the cards (blur nahi, sirf halka gradient) */}
        {/* Glow ko apne dabbe ke andar rok diya (pehle ye screen se bahar nikalkar side-scroll karata tha) */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-60px', right: '-50px', width: '230px', height: '230px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(244,114,182,0.30), transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '120px', left: '-70px', width: '230px', height: '230px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,113,133,0.25), transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-60px', right: '-40px', width: '210px', height: '210px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(253,224,71,0.30), transparent 70%)', pointerEvents: 'none' }} />
        </div>

        <div style={{ position: 'relative' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div>
              <h2 style={{ fontSize: '21px', fontWeight: 900, letterSpacing: '0.02em', color: INK, textShadow: '0 0 16px rgba(251,113,133,0.4)' }}>{tx.planTitle}</h2>
              <p style={{ fontSize: '11px', fontWeight: 800, color: textSub, marginTop: '1px' }}>{tx.planSub}</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" onClick={() => setShowList(true)} style={roundButton} aria-label={tx.planMyPlans} title={tx.planMyPlans}>
                <Lock size={17} />
              </button>
              <button type="button" onClick={() => openNewPlan(null)} style={{ ...roundButton, ...roseBtn }} aria-label={tx.planAdd} title={tx.planAdd}>
                <Plus size={20} strokeWidth={3} />
              </button>
            </div>
          </div>

          {/* Banner slider: next festival + plan banners (7 days before / today) */}
          {slideCount > 0 && (
            <div style={{ marginBottom: '14px' }}>
              <div ref={sliderRef} onScroll={onSliderScroll} style={{ display: 'flex', overflowX: 'auto', scrollSnapType: 'x mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
                {slides.map((slide) => {
                  const isToday = slide.type === 'plan' && slide.days === 0;
                  const cardStyle = {
                    ...glass,
                    flex: '0 0 100%',
                    scrollSnapAlign: 'start',
                    boxSizing: 'border-box',
                    borderRadius: '24px',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    color: INK,
                    cursor: 'pointer',
                    textAlign: 'left',
                    ...(isToday ? goldGlow : {}),
                  };

                  if (slide.type === 'festival') {
                    return (
                      <button
                        key={slide.key}
                        type="button"
                        onClick={() => {
                          const d = dateFromStr(nextFestival.dateStr);
                          setViewYear(d.getFullYear());
                          setViewMonth(d.getMonth());
                          setSelectedDate(nextFestival.dateStr);
                        }}
                        style={cardStyle}
                      >
                        <span style={{ fontSize: '30px' }}>{nextFestival.festival.emoji}</span>
                        <span style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ display: 'block', fontSize: '9.5px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: textSub }}>{tx.planNextFestival}</span>
                          <span style={{ display: 'block', fontSize: '15px', fontWeight: 900, marginTop: '1px', color: accentText }}>{festName(nextFestival.festival)}</span>
                          <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: midText }}>{prettyShort(nextFestival.dateStr)}</span>
                        </span>
                        <span style={chipStyle}>
                          {daysText(nextFestival.daysLeft)}
                        </span>
                      </button>
                    );
                  }

                  const { plan, days } = slide;
                  const kind = getKind(plan.kind);
                  return (
                    <button key={slide.key} type="button" onClick={() => openEditPlan(plan)} style={cardStyle}>
                      <span style={{ fontSize: '30px' }}>{kind.emoji}</span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: 'block', fontSize: '9.5px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: textSub }}>
                          {days === 0 ? tx.planTodayIsDay : tx.planOneWeek}
                        </span>
                        <span style={{ display: 'block', fontSize: '15px', fontWeight: 900, marginTop: '1px', color: accentText, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{plan.title}</span>
                        <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: midText }}>
                          {days === 0 ? tx.planToday : prettyShort(toDateStr(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7)))}, {formatTime(plan.time)}
                        </span>
                      </span>
                      <span style={chipStyle}>
                        {days === 0 ? tx.planTodayBang : tx.planIn7}
                      </span>
                    </button>
                  );
                })}
              </div>

              {slideCount > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', marginTop: '8px' }}>
                  {slides.map((slide, i) => (
                    <span key={slide.key} style={{ width: i === slideIndex ? '16px' : '6px', height: '6px', borderRadius: '3px', background: i === slideIndex ? '#e11d48' : 'rgba(251,113,133,0.4)', transition: 'all 0.2s' }} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Month selector */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <button type="button" onClick={() => shiftMonth(-1)} style={{ ...roundButton, width: '40px', height: '40px', borderRadius: '14px' }} aria-label={tx.planPrevMonth}>
              <ChevronLeft size={18} />
            </button>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 900, color: INK }}>{monthName(viewMonth)} {viewYear}</h3>
              {!isCurrentMonth && (
                <button type="button" onClick={goToday} style={{ marginTop: '3px', fontSize: '10px', fontWeight: 900, padding: '3px 10px', borderRadius: '10px', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(251,113,133,0.35)', color: accentText, cursor: 'pointer' }}>
                  {tx.planBackToday}
                </button>
              )}
            </div>
            <button type="button" onClick={() => shiftMonth(1)} style={{ ...roundButton, width: '40px', height: '40px', borderRadius: '14px' }} aria-label={tx.planNextMonth}>
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Calendar (swipe left / right to change month) */}
          <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            <CalendarGrid year={viewYear} month={viewMonth} todayStr={todayStr} selectedDateStr={selectedDate} onSelectDate={setSelectedDate} />
          </div>

          {/* Festivals this month */}
          <div style={{ ...glass, borderRadius: '26px', padding: '14px', marginTop: '18px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 900, marginBottom: '8px', color: INK }}>{fmt(tx.planFestivalsIn, { month: monthName(viewMonth) })}</h4>
            {monthFestivals.length === 0 ? (
              <p style={{ fontSize: '11.5px', fontWeight: 700, color: textSub }}>{tx.planNoFestMonth}</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {monthFestivals.map(({ dateStr, festivals }) =>
                  festivals.map((f) => (
                    <button
                      key={`${dateStr}-${f.id}`}
                      type="button"
                      onClick={() => setSelectedDate(dateStr)}
                      style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', borderRadius: '14px', background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(251,113,133,0.2)', color: INK, cursor: 'pointer', textAlign: 'left', opacity: dateStr < todayStr ? 0.6 : 1 }}
                    >
                      <span style={{ fontSize: '20px' }}>{f.emoji}</span>
                      <span style={{ flex: 1, fontSize: '12.5px', fontWeight: 900, color: accentText }}>{festName(f)}</span>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: dateText }}>{prettyShort(dateStr)}</span>
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
          <div onClick={() => setSelectedDate(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(60,10,30,0.45)' }} />
          <div style={{ position: 'relative', width: '100%', borderRadius: '32px 32px 0 0', padding: '20px 18px 26px', background: c.isDark ? '#1e293b' : 'linear-gradient(170deg, #ffffff 0%, #fff3f8 55%, #ffe3ef 100%)', border: '1px solid rgba(251,113,133,0.3)', borderBottom: 'none', borderTop: '1px solid ' + c.glassTop, boxShadow: c.isDark ? '0 -18px 50px -12px rgba(0,0,0,0.6)' : '0 -18px 50px -12px rgba(244,63,94,0.45), inset 0 2px 0 #ffffff', color: INK }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
              <span style={{ fontSize: '42px' }}>{getDayEmoji(selectedDate)}</span>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 900, color: INK }}>
                  {dateFromStr(selectedDate).getDate()} {monthName(dateFromStr(selectedDate).getMonth())} {dateFromStr(selectedDate).getFullYear()}
                </h3>
                <p style={{ fontSize: '11.5px', fontWeight: 800, color: textSub }}>{weekdayName(dateFromStr(selectedDate).getDay())}</p>
              </div>
            </div>

            {selectedFestivals.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                {selectedFestivals.map((f) => (
                  <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 13px', borderRadius: '18px', ...goldGlow }}>
                    <span style={{ fontSize: '24px' }}>{f.emoji}</span>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 900, color: accentText }}>{festName(f)}</p>
                      <p style={{ fontSize: '10.5px', fontWeight: 700, color: goldSub }}>{tx.planFestSpecial}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '12px', fontWeight: 700, color: textSub, marginBottom: '14px' }}>{tx.planNoFestDay}</p>
            )}

            <button type="button" onClick={() => openNewPlan(selectedDate)} style={{ ...roseBtn, width: '100%', padding: '13px', borderRadius: '18px', fontSize: '13.5px', fontWeight: 900, cursor: 'pointer' }}>
              {tx.planAddForDay}
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
