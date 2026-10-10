import { CODE_ALPHABET, CODE_LENGTH, TRIP_LINK_BASE, getMode } from './tripConfig';

// ---------- Codes & links ----------

export const makeCode = () => {
  const bytes = new Uint32Array(CODE_LENGTH);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('');
};

export const isValidCode = (code) =>
  typeof code === 'string' && code.length === CODE_LENGTH && [...code].every((ch) => CODE_ALPHABET.includes(ch));

export const buildInviteLink = (code) => `${TRIP_LINK_BASE}?c=${code}`;

// Accepts a link (lifebox://trip/CODE or the web link), a whole pasted message, or just the code.
export const parseInviteInput = (input) => {
  if (!input) return null;
  const text = String(input).trim();
  const match = text.match(/(?:\/trip\/|[?&](?:c|trip)=)([A-Za-z0-9]+)/) || text.match(/^([A-Za-z0-9]+)$/);
  if (!match) return null;
  const code = match[1].toUpperCase();
  return isValidCode(code) ? code : null;
};

// ---------- Dates ----------

const pad = (n) => String(n).padStart(2, '0');

export const toInputDate = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

// 'YYYY-MM-DD' + 'HH:MM' (local time) -> milliseconds
export const toStartAt = (dateStr, timeStr) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const [hh, mm] = (timeStr || '00:00').split(':').map(Number);
  return new Date(y, m - 1, d, hh, mm, 0).getTime();
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const formatTripDate = (ms) => {
  const d = new Date(ms);
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

export const formatTripTime = (ms) => {
  const d = new Date(ms);
  const hours = d.getHours();
  const suffix = hours >= 12 ? 'PM' : 'AM';
  return `${hours % 12 || 12}:${pad(d.getMinutes())} ${suffix}`;
};

export const getCountdown = (startAt, now = Date.now()) => {
  const total = startAt - now;
  if (total <= 0) return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
  const seconds = Math.floor(total / 1000);
  return {
    total,
    days: Math.floor(seconds / 86400),
    hours: Math.floor((seconds % 86400) / 3600),
    minutes: Math.floor((seconds % 3600) / 60),
    seconds: seconds % 60,
  };
};

// 'cancelled' | 'upcoming' (not started) | 'now' (start time passed in the last 12 hours) | 'earlier'
export const getTripPhase = (trip, now = Date.now()) => {
  if (trip.status === 'cancelled') return 'cancelled';
  const diff = trip.startAt - now;
  if (diff > 0) return 'upcoming';
  if (diff > -12 * 3600 * 1000) return 'now';
  return 'earlier';
};

// ---------- Texts ----------

export const defaultTitle = (from, to) => `${from.trim()} → ${to.trim()}`;

// Full place name when we have it ("Rampur, Moradabad, Uttar Pradesh, India"), otherwise the short name
export const placeLabel = (trip, side) => (trip[`${side}Place`] && trip[`${side}Place`].label) || trip[side];

export const memberCount = (trip) => (trip.memberUids ? trip.memberUids.length : 1);

export const buildShareText = (trip, ownerName, customMessage) => {
  const mode = getMode(trip.mode);
  const lines = [
    `🧳 ${ownerName} invited you on a trip!`,
    '',
    `${mode.emoji} ${trip.title}`,
    `📍 ${placeLabel(trip, 'from')} → ${placeLabel(trip, 'to')}`,
    `🗓️ ${formatTripDate(trip.startAt)} · ${formatTripTime(trip.startAt)}`,
  ];

  if (customMessage && customMessage.trim()) {
    lines.push('', `💬 ${customMessage.trim()}`);
  }

  lines.push(
    '',
    'Open this link in the Life Box app to accept or reject:',
    buildInviteLink(trip.id),
    '',
    "Don't have the app yet? Install Life Box first, then tap the link again."
  );

  return lines.join('\n');
};

export const initials = (name) => {
  const clean = (name || '').trim();
  return clean ? clean.charAt(0).toUpperCase() : '?';
};
