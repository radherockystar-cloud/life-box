// Life Meter: DOB se asli aankde (exact) aur andaze wale aankde (approx) nikalta hai.
// Andaze average (aam ausat) par based hain: har insan ke alag ho sakte hain.

const DAY_MS = 86400000;
const YEAR_DAYS = 365.25;
const EARTH_KM = 40075;

// Age band ke hisaab se roz ka average
const BANDS = [
  { from: 0, to: 1, bpm: 120, breath: 40, sleep: 14, water: 0.7, food: 0.5, steps: 0 },
  { from: 1, to: 5, bpm: 100, breath: 28, sleep: 12, water: 1.2, food: 0.9, steps: 6000 },
  { from: 5, to: 12, bpm: 90, breath: 22, sleep: 10, water: 1.6, food: 1.2, steps: 10000 },
  { from: 12, to: 18, bpm: 80, breath: 18, sleep: 9, water: 2.0, food: 1.6, steps: 8000 },
  { from: 18, to: Infinity, bpm: 72, breath: 16, sleep: 8, water: 2.0, food: 1.8, steps: 5000 },
];

export const parseDob = (str) => {
  const [y, m, d] = String(str || '').split('-').map(Number);
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d);
  return Number.isNaN(date.getTime()) ? null : date;
};

const daysInMonth = (year, monthIndex) => new Date(year, monthIndex + 1, 0).getDate();

export function computeStats(dob, now = new Date()) {
  const ms = now.getTime() - dob.getTime();
  if (ms < 0) return null;

  // ---------- Asli (exact) ----------
  let years = now.getFullYear() - dob.getFullYear();
  let months = now.getMonth() - dob.getMonth();
  let days = now.getDate() - dob.getDate();
  if (days < 0) {
    months -= 1;
    days += daysInMonth(now.getFullYear(), now.getMonth() - 1);
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const totalDays = Math.floor(ms / DAY_MS);

  // Agla birthday (29 Feb ho to non-leap saal mein 28 Feb)
  const bdayIn = (year) => {
    const date = new Date(year, dob.getMonth(), dob.getDate());
    return date.getMonth() === dob.getMonth() ? date : new Date(year, dob.getMonth(), dob.getDate() - 1);
  };
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let next = bdayIn(now.getFullYear());
  if (next < startOfToday) next = bdayIn(now.getFullYear() + 1);
  const daysToBirthday = Math.round((next - startOfToday) / DAY_MS);

  const exact = {
    years,
    months,
    days,
    totalDays,
    totalWeeks: Math.floor(totalDays / 7),
    totalMonths: years * 12 + months,
    totalHours: Math.floor(ms / 3600000),
    totalMinutes: Math.floor(ms / 60000),
    totalSeconds: Math.floor(ms / 1000),
    daysToBirthday,
    birthdayToday: daysToBirthday === 0,
    weekday: dob.toLocaleDateString('en-IN', { weekday: 'long' }),
  };

  // ---------- Andaza (approx) ----------
  const ageYears = ms / (DAY_MS * YEAR_DAYS);
  let heartbeats = 0;
  let breaths = 0;
  let sleepHours = 0;
  let water = 0;
  let food = 0;
  let steps = 0;
  let blinks = 0;

  BANDS.forEach((b) => {
    const overlapYears = Math.max(0, Math.min(ageYears, b.to) - b.from);
    const d = overlapYears * YEAR_DAYS; // is band mein kitne din jiye
    heartbeats += d * b.bpm * 1440;
    breaths += d * b.breath * 1440;
    sleepHours += d * b.sleep;
    water += d * b.water;
    food += d * b.food;
    steps += d * b.steps;
    blinks += d * (24 - b.sleep) * 60 * 15; // jagte hue ~15 baar/minute
  });

  const km = steps * 0.0007; // ~0.7 m ka ek kadam

  const approx = {
    heartbeats,
    breaths,
    steps,
    km,
    earthLaps: km / EARTH_KM,
    water,
    food,
    sleepDays: sleepHours / 24,
    sleepYears: sleepHours / 24 / YEAR_DAYS,
    blinks,
    fullMoons: totalDays / 29.53,
  };

  return { exact, approx };
}
