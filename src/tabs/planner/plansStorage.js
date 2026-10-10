import { moveToBin } from '../../utils/binStorage';

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
    const saved = JSON.parse(localStorage.getItem(PLANS_KEY) || '[]');
    if (!Array.isArray(saved)) return [];
    return saved.filter((p) => p && p.title && isValidDate(p.date)).map(normalizePlan);
  } catch {
    return [];
  }
};

// Returns false if the phone storage is full
export const savePlans = (plans) => {
  try {
    localStorage.setItem(PLANS_KEY, JSON.stringify(plans));
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

  let when = new Date(startOfToday.getFullYear(), m - 1, d);
  if (when < startOfToday) when = new Date(startOfToday.getFullYear() + 1, m - 1, d);
  return when;
};

export const daysUntil = (when, today = new Date()) => {
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((when - startOfToday) / 86400000);
};
