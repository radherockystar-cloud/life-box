// Goals ke shared helpers (date, streak, missed days, load).
// GoalsAppScreen.jsx, GoalDetailScreen.jsx aur goalReminders.js teeno yahin se use karte hain.

export const MISSED_ALERT_TIME = '23:55';

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// Local date (UTC bug fix: toISOString() raat 12-5:30 baje galat date deta tha)
export const toDateStr = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const parseDate = (s) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (date, n) => {
  const x = new Date(date);
  x.setDate(x.getDate() + n);
  return x;
};

export const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

export const formatDate = (s, opts = { day: 'numeric', month: 'short', year: 'numeric' }) =>
  parseDate(s).toLocaleDateString('en-IN', opts);

export const isTimeUnlocked = (actionTime) => {
  const now = new Date();
  const [h, m] = actionTime.split(':').map(Number);
  return now.getHours() * 60 + now.getMinutes() >= h * 60 + m;
};

// Purane goals (year/month wale) ko naye format me badalta hai
export const normalizeGoal = (g) => {
  const clean = { ...g };
  const startDate =
    g.startDate ||
    `${g.year ?? new Date().getFullYear()}-${String((g.month ?? new Date().getMonth()) + 1).padStart(2, '0')}-01`;
  delete clean.year;
  delete clean.month;
  return {
    ...clean,
    startDate,
    daysData: g.daysData || {},
    completed: !!g.completed,
    completedAt: g.completedAt || null,
    type: 'Goal',
  };
};

// Missed din: start se kal tak, jinka log nahi hai. Completed goal me kuch missed nahi.
export const getMissedDays = (goal) => {
  if (goal.completed) return [];
  const today = parseDate(toDateStr());
  const out = [];
  for (let d = parseDate(goal.startDate); d < today; d = addDays(d, 1)) {
    const s = toDateStr(d);
    if (!goal.daysData?.[s]) out.push(s);
  }
  return out;
};

export const getStats = (goal) => {
  const start = parseDate(goal.startDate);
  const lastStr = goal.completed && goal.completedAt ? goal.completedAt : toDateStr();
  const last = parseDate(lastStr);
  let done = 0, elapsed = 0, run = 0, best = 0;
  for (let d = start; d <= last; d = addDays(d, 1)) {
    elapsed++;
    const s = toDateStr(d);
    if (goal.daysData?.[s]?.status === 'done') {
      done++;
      run++;
      best = Math.max(best, run);
    } else if (s !== lastStr) {
      run = 0; // aaj abhi baaki hai to streak nahi tootti
    }
  }
  return {
    done,
    elapsed,
    streak: run,
    best,
    pct: elapsed > 0 ? Math.round((done / elapsed) * 100) : 0,
  };
};

// Goals vault se padhna (screen band ho tab bhi notifications ke liye kaam aata hai)
export const loadGoals = () => {
  try {
    const saved = JSON.parse(localStorage.getItem('newlife_vault') || '[]');
    if (!Array.isArray(saved)) return [];
    return saved.filter((i) => i && i.type === 'Goal').map(normalizeGoal);
  } catch (e) {
    return [];
  }
};
