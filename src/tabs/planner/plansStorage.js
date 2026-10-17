import { moveToBin } from '../../utils/binStorage';
import { appStorage } from '../../utils/appStorage';

// Same key the old planner used, so plans saved before are not lost
export const PLANS_KEY = 'lifebox_planner_plans';

// 'kind' decides the emoji and the reminder wording. (wish: "have you wished yet?")
export const PLAN_KINDS = [
  { id: 'birthday', label: 'Birthday', emoji: '🎂', yearly: true, wish: true },
  { id: 'anniversary', label: 'Anniversary', emoji: '💍', yearly: true, wish: true },
  { id: 'event', label: 'Event', emoji: '📌', yearly: false, wish: false },
  { id: 'other', label: 'Other', emoji: '✨', yearly: false, wish: false },
];

export const getKind = (id) => PLAN_KINDS.find((k) => k.id === id) || PLAN_KINDS[2];

const isValidDate = (str) => typeof str === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(str);

// Makes old / incomplete plans safe to use
const normalizePlan = (plan) => ({
  id: plan.id ?? Date.now() + Math.floor(Math.random() * 1000),
  title: String(plan.title || '').trim(),
  note: plan.note || '',
  date: plan.date,
  time: plan.time || '09:00',
  kind: plan.kind || 'event',
  repeatYearly: !!plan.repeatYearly,
});

export const loadPlans = () => {
  try {
    const saved = JSON.parse(appStorage.getItem(PLANS_KEY) || '[]');
    if (!Array.isArray(saved)) return [];
    return saved.filter((p) => p && p.title && isValidDate(p.date)).map(normalizePlan);
  } catch {
    return [];
  }
};

// Returns false if the phone storage is full
export const savePlans = (plans) => {
  try {
    appStorage.setItem(PLANS_KEY, JSON.stringify(plans));
    return true;
  } catch {
    return false;
  }
};

export const addOrUpdatePlan = (plans, plan) => {
  const exists = plans.some((p) => p.id === plan.id);
  return exists ? plans.map((p) => (p.id === plan.id ? plan : p)) : [plan, ...plans];
};

// Deleting sends the plan to the Trash / Bin first, so it can be restored from Settings
export const deletePlan = (plans, id) => {
  const plan = plans.find((p) => p.id === id);
  if (plan) moveToBin({ ...plan, type: 'Plan' }, PLANS_KEY);
  return plans.filter((p) => p.id !== id);
};

// Next date this plan happens (yearly plans repeat), or null if it is over
export const getNextOccurrence = (plan, today = new Date()) => {
  const [y, m, d] = plan.date.split('-').map(Number);
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  if (!plan.repeatYearly) {
    const when = new Date(y, m - 1, d);
    return when >= startOfToday ? when : null;
  }

  // 29 Feb in a non-leap year -> use 28 Feb (instead of rolling over to 1 Mar)
  const inYear = (year) => {
    const date = new Date(year, m - 1, d);
    return date.getMonth() === m - 1 ? date : new Date(year, m - 1, d - 1);
  };

  let when = inYear(startOfToday.getFullYear());
  if (when < startOfToday) when = inYear(startOfToday.getFullYear() + 1);
  return when;
};

export const daysUntil = (when, today = new Date()) => {
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((when - startOfToday) / 86400000);
};

// Plans that need a banner today: exactly 7 days away, or happening today.
// (Each banner shows for just that one day.)
export const getBannerPlans = (plans, today = new Date()) =>
  plans
    .map((plan) => {
      const next = getNextOccurrence(plan, today);
      return next ? { plan, days: daysUntil(next, today) } : null;
    })
    .filter((item) => item && (item.days === 0 || item.days === 7))
    .sort((a, b) => a.days - b.days || (a.plan.time || '').localeCompare(b.plan.time || ''));
