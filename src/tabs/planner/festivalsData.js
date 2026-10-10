// Festivals & special days shown in the calendar and used for automatic greeting notifications.
//
// tone: 'happy'   -> greeting message ("Wishing you a very happy ...")
//       'respect' -> calm message ("Today is ... Wishing you peace")
//
// Dates of lunar festivals (Diwali, Holi, Eid ...) change every year, so they are listed per year below.
// Dates were checked against public panchang / government holiday lists for 2026 and 2027.
// Some can differ by one day between regions, and Eid depends on moon sighting.
// To add a new year: add its lunar dates to LUNAR_FESTIVALS (fixed-date days work for every year automatically).

const F = (id, emoji, en, hi, tone = 'happy') => ({ id, emoji, names: { en, hi }, tone });

// ---------- Same date every year: [month, day, festival] ----------
const FIXED_FESTIVALS = [
  [1, 1, F('newyear', '🎆', "New Year's Day", 'नया साल')],
  [1, 13, F('lohri', '🔥', 'Lohri', 'लोहड़ी')],
  [1, 26, F('republic', '🇮🇳', 'Republic Day', 'गणतंत्र दिवस')],
  [2, 14, F('valentine', '❤️', "Valentine's Day", 'वैलेंटाइन डे')],
  [3, 8, F('womens', '👩', "Women's Day", 'महिला दिवस')],
  [4, 14, F('ambedkar', '📘', 'Ambedkar Jayanti', 'अंबेडकर जयंती', 'respect')],
  [8, 15, F('independence', '🇮🇳', 'Independence Day', 'स्वतंत्रता दिवस')],
  [9, 5, F('teachers', '📚', "Teachers' Day", 'शिक्षक दिवस')],
  [10, 2, F('gandhi', '🕊️', 'Gandhi Jayanti', 'गांधी जयंती', 'respect')],
  [11, 14, F('childrens', '🧒', "Children's Day", 'बाल दिवस')],
  [12, 25, F('christmas', '🎄', 'Christmas', 'क्रिसमस')],
  [12, 31, F('nye', '🥂', "New Year's Eve", 'नववर्ष की पूर्व संध्या')],
];

// ---------- Same weekday rule every year: [month, weekday(0=Sun), nth, festival] ----------
const RULE_FESTIVALS = [
  [5, 0, 2, F('mothers', '💐', "Mother's Day", 'मातृ दिवस')],
  [6, 0, 3, F('fathers', '👔', "Father's Day", 'पितृ दिवस')],
  [8, 0, 1, F('friendship', '🤝', 'Friendship Day', 'मित्रता दिवस')],
];

// ---------- Lunar / moving festivals: 'YYYY-MM-DD' -> festival ----------
const LUNAR_FESTIVALS = [
  // ===== 2026 =====
  ['2026-03-04', F('holi', '🎨', 'Holi', 'होली')],
  ['2026-08-28', F('rakhi', '🧵', 'Raksha Bandhan', 'रक्षा बंधन')],
  ['2026-09-04', F('janmashtami', '🦚', 'Janmashtami', 'जन्माष्टमी')],
  ['2026-09-14', F('ganesh', '🐘', 'Ganesh Chaturthi', 'गणेश चतुर्थी')],
  ['2026-10-11', F('navratri', '🙏', 'Navratri', 'नवरात्रि')],
  ['2026-10-20', F('dussehra', '🏹', 'Dussehra', 'दशहरा')],
  ['2026-10-29', F('karwachauth', '🌕', 'Karwa Chauth', 'करवा चौथ')],
  ['2026-11-06', F('dhanteras', '💰', 'Dhanteras', 'धनतेरस')],
  ['2026-11-08', F('diwali', '🪔', 'Diwali', 'दिवाली')],
  ['2026-11-11', F('bhaidooj', '👫', 'Bhai Dooj', 'भाई दूज')],
  ['2026-11-15', F('chhath', '🌅', 'Chhath Puja', 'छठ पूजा')],
  ['2026-11-24', F('gurunanak', '🙏', 'Guru Nanak Jayanti', 'गुरु नानक जयंती')],

  // ===== 2027 =====
  ['2027-01-14', F('sankranti', '🪁', 'Makar Sankranti', 'मकर संक्रांति')],
  ['2027-01-15', F('pongal', '🌾', 'Pongal', 'पोंगल')],
  ['2027-02-11', F('vasant', '🌼', 'Vasant Panchami', 'वसंत पंचमी')],
  ['2027-03-06', F('shivratri', '🔱', 'Maha Shivratri', 'महाशिवरात्रि')],
  ['2027-03-10', F('eidfitr', '🌙', 'Eid al-Fitr', 'ईद-उल-फ़ित्र')],
  ['2027-03-22', F('holi', '🎨', 'Holi', 'होली')],
  ['2027-03-26', F('goodfriday', '✝️', 'Good Friday', 'गुड फ्राइडे', 'respect')],
  ['2027-03-28', F('easter', '🐣', 'Easter', 'ईस्टर')],
  ['2027-04-07', F('ugadi', '🌺', 'Ugadi / Gudi Padwa', 'उगादी / गुड़ी पड़वा')],
  ['2027-04-14', F('baisakhi', '🌾', 'Baisakhi', 'बैसाखी')],
  ['2027-04-15', F('ramnavami', '🛕', 'Ram Navami', 'राम नवमी')],
  ['2027-04-19', F('mahavir', '🕉️', 'Mahavir Jayanti', 'महावीर जयंती')],
  ['2027-04-20', F('hanuman', '🐒', 'Hanuman Jayanti', 'हनुमान जयंती')],
  ['2027-05-09', F('akshaya', '✨', 'Akshaya Tritiya', 'अक्षय तृतीया')],
  ['2027-05-17', F('eidadha', '🐑', 'Eid al-Adha (Bakrid)', 'ईद-उल-अज़हा (बकरीद)')],
  ['2027-05-20', F('buddha', '🪷', 'Buddha Purnima', 'बुद्ध पूर्णिमा')],
  ['2027-07-18', F('gurupurnima', '🌕', 'Guru Purnima', 'गुरु पूर्णिमा')],
  ['2027-08-17', F('rakhi', '🧵', 'Raksha Bandhan', 'रक्षा बंधन')],
  ['2027-08-25', F('janmashtami', '🦚', 'Janmashtami', 'जन्माष्टमी')],
  ['2027-09-04', F('ganesh', '🐘', 'Ganesh Chaturthi', 'गणेश चतुर्थी')],
  ['2027-09-12', F('onam', '🌸', 'Onam', 'ओणम')],
  ['2027-09-30', F('navratri', '🙏', 'Navratri', 'नवरात्रि')],
  ['2027-10-09', F('dussehra', '🏹', 'Dussehra', 'दशहरा')],
  ['2027-10-18', F('karwachauth', '🌕', 'Karwa Chauth', 'करवा चौथ')],
  ['2027-10-27', F('dhanteras', '💰', 'Dhanteras', 'धनतेरस')],
  ['2027-10-29', F('diwali', '🪔', 'Diwali', 'दिवाली')],
  ['2027-10-31', F('bhaidooj', '👫', 'Bhai Dooj', 'भाई दूज')],
  ['2027-11-14', F('gurunanak', '🙏', 'Guru Nanak Jayanti', 'गुरु नानक जयंती')],
];

// ---------- Helpers ----------
const pad = (n) => String(n).padStart(2, '0');

// Local date -> 'YYYY-MM-DD' (never use toISOString for this: it shifts the day in India)
export const toDateStr = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const parseDateStr = (dateStr) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return { y, m, d };
};

export const dateFromStr = (dateStr) => {
  const { y, m, d } = parseDateStr(dateStr);
  return new Date(y, m - 1, d);
};

const nthWeekdayOfMonth = (year, month, weekday, nth) => {
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  return 1 + ((weekday - firstWeekday + 7) % 7) + (nth - 1) * 7;
};

const yearCache = {};

const buildYear = (year) => {
  if (yearCache[year]) return yearCache[year];
  const map = {};
  const add = (dateStr, festival) => {
    if (!map[dateStr]) map[dateStr] = [];
    map[dateStr].push(festival);
  };

  FIXED_FESTIVALS.forEach(([m, d, f]) => add(`${year}-${pad(m)}-${pad(d)}`, f));
  RULE_FESTIVALS.forEach(([m, weekday, nth, f]) => add(`${year}-${pad(m)}-${pad(nthWeekdayOfMonth(year, m, weekday, nth))}`, f));
  LUNAR_FESTIVALS.forEach(([dateStr, f]) => {
    if (dateStr.startsWith(`${year}-`)) add(dateStr, f);
  });

  yearCache[year] = map;
  return map;
};

export const getFestivalsForDate = (dateStr) => buildYear(parseDateStr(dateStr).y)[dateStr] || [];

// All festivals from start date to end date (inclusive), oldest first
export const getFestivalsBetween = (startDate, endDate) => {
  const result = [];
  const startStr = toDateStr(startDate);
  const endStr = toDateStr(endDate);

  for (let year = startDate.getFullYear(); year <= endDate.getFullYear(); year++) {
    const map = buildYear(year);
    Object.keys(map).forEach((dateStr) => {
      if (dateStr >= startStr && dateStr <= endStr) result.push({ dateStr, festivals: map[dateStr] });
    });
  }

  return result.sort((a, b) => (a.dateStr < b.dateStr ? -1 : 1));
};

export const getFestivalsInMonth = (year, monthIndex) => {
  const prefix = `${year}-${pad(monthIndex + 1)}-`;
  const map = buildYear(year);
  return Object.keys(map)
    .filter((dateStr) => dateStr.startsWith(prefix))
    .sort()
    .map((dateStr) => ({ dateStr, festivals: map[dateStr] }));
};

// The next festival from today (today counts)
export const getNextFestival = (fromDate = new Date()) => {
  const end = new Date(fromDate.getFullYear() + 1, fromDate.getMonth(), fromDate.getDate());
  const upcoming = getFestivalsBetween(fromDate, end);
  if (upcoming.length === 0) return null;

  const first = upcoming[0];
  const today = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
  const daysLeft = Math.round((dateFromStr(first.dateStr) - today) / 86400000);
  return { dateStr: first.dateStr, festival: first.festivals[0], daysLeft };
};

// Every date gets an emoji: the festival's emoji on festival days, otherwise the day-of-week emoji
const WEEKDAY_EMOJI = ['☀️', '🌙', '🔥', '🌿', '⭐', '💖', '🪐']; // Sun .. Sat

export const getDayEmoji = (dateStr) => {
  const festivals = getFestivalsForDate(dateStr);
  if (festivals.length > 0) return festivals[0].emoji;
  return WEEKDAY_EMOJI[dateFromStr(dateStr).getDay()];
};
