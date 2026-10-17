// Mahine / din ke naam aur tareekh ka label, app ki language me.
// English me bilkul pehle jaisa text aata hai; baaki languages me phone ka Intl use hota hai.

const MONTHS_LONG_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS_SHORT_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS_SHORT_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// "-u-nu-latn" => hamesha 0-9 ke ank (Arabic/Hindi me bhi)
const locale = (lang) => (lang || 'en') + '-u-nu-latn';

// m = 0..11
export const monthLong = (lang, m) =>
  lang === 'en' || !lang
    ? MONTHS_LONG_EN[m]
    : new Date(2026, m, 1).toLocaleDateString(locale(lang), { month: 'long' });

// d = 0 (Sunday) .. 6 (Saturday)
export const weekdayShort = (lang, d) =>
  lang === 'en' || !lang
    ? WEEKDAYS_SHORT_EN[d]
    : new Date(2026, 0, 4 + d).toLocaleDateString(locale(lang), { weekday: 'short' });

// y = year, m = 1..12, d = day  ->  "12 Oct 2026"
export const dateLabel = (lang, y, m, d) =>
  lang === 'en' || !lang
    ? `${d} ${MONTHS_SHORT_EN[m - 1]} ${y}`
    : new Date(y, m - 1, d).toLocaleDateString(locale(lang), { day: 'numeric', month: 'short', year: 'numeric' });

// Festival / item ka naam: current language, nahi mila to English
export const localizedName = (item, lang) => item?.names?.[lang] || item?.names?.en || '';
