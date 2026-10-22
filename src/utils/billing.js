// Subscription ka dimaag: Google Play se kharidna, "kaun sa plan active hai" yaad rakhna, free AI messages ginna.
//
// Is file me kuch badalne ki zarurat nahi padti. Prices / plans / free limit: src/config/plans.js
//
// Zaroori: asli kharidari ke liye plugin lagana padta hai:   npm i @capgo/native-purchases@^8   phir   npx cap sync android
// (Plugin na ho tab bhi app build hota hai aur chalta hai, bas kharidna "available nahi" dikhata hai.)
import { useSyncExternalStore } from 'react';
import { Capacitor, registerPlugin } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import {
  PLANS,
  FREE_AI_MESSAGES,
  GRACE_DAYS,
  TEST_MODE,
  AI_BUDGET_INR,
  USD_TO_INR,
  AI_COST_SAFETY,
  AI_FALLBACK_REPLY_INR,
  AI_PRICES,
  AI_PRICE_DEFAULT,
} from '../config/plans';
import { bt, billLoc } from './billingTexts';

const NativePurchases = registerPlugin('NativePurchases');
const isNative = () => Capacitor.isNativePlatform();

// Ye data jaan-boojhkar localStorage me hai (appStorage me nahi), taaki cloud sync / backup / logout isko
// na chhue: ek phone ka subscription ya free-limit doosre phone ya backup file se na aa sake.
const ENT_KEY = 'lifebox_entitlement_v1';
const AI_KEY = 'lifebox_ai_free_used_v1';
const BUD_KEY = 'lifebox_ai_budget_v1'; // is mahine ka AI kharcha {month, spent}

const lsGet = (k) => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};
const lsSet = (k, v) => {
  try {
    localStorage.setItem(k, v);
  } catch {
    /* storage na mile to bhi app chalega */
  }
};

const readCache = () => {
  try {
    const v = JSON.parse(lsGet(ENT_KEY) || '{}');
    return v && typeof v === 'object' ? v : {};
  } catch {
    return {};
  }
};
const readUsed = () => {
  const n = parseInt(lsGet(AI_KEY) || '0', 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

const monthKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};
const readBudget = () => {
  try {
    const v = JSON.parse(lsGet(BUD_KEY) || '{}');
    if (v && v.month === monthKey() && Number.isFinite(v.spent) && v.spent >= 0) return { month: v.month, spent: v.spent };
  } catch {
    /* naya mahina / kharab data: zero se shuru */
  }
  return { month: monthKey(), spent: 0 };
};

let cache = readCache(); // { pro, adFree, checkedAt, testPro, testAdFree }
let used = readUsed();
let budget = readBudget(); // Pro user ka is mahine ka AI kharcha (rupaye)
let products = {}; // productId -> { price: 'Rs 79.00' } (Play se aaya hua)
let busy = false;

const nextResetText = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 1).toLocaleDateString(billLoc(), { day: 'numeric', month: 'short' });
};

const compute = () => {
  if (budget.month !== monthKey()) budget = { month: monthKey(), spent: 0 }; // naya mahina: hisaab zero
  const fresh = Date.now() - (cache.checkedAt || 0) < GRACE_DAYS * 86400000;
  const paidPro = Boolean(fresh && cache.pro);
  const paidAd = Boolean(fresh && cache.adFree);
  const testPro = TEST_MODE && Boolean(cache.testPro);
  const testAd = TEST_MODE && Boolean(cache.testAdFree);
  const pro = paidPro || testPro;
  const aiLeft = Math.max(0, FREE_AI_MESSAGES - used);
  const aiPctLeft = Math.max(0, Math.min(100, Math.round(100 * (1 - budget.spent / AI_BUDGET_INR))));
  const aiBlocked = pro ? budget.spent >= AI_BUDGET_INR : aiLeft <= 0;
  let aiBanner = '';
  if (pro) {
    if (aiBlocked) aiBanner = bt('bannerUsed', { d: nextResetText() });
    else if (aiPctLeft <= 30) aiBanner = bt('bannerLeft', { p: aiPctLeft });
  } else {
    aiBanner = aiBlocked ? bt('bannerFreeDone') : bt('bannerFreeLeft', { a: aiLeft, b: FREE_AI_MESSAGES });
  }
  return {
    pro,
    adFree: paidAd || testAd,
    aiUsed: used,
    aiLeft,
    aiLimit: FREE_AI_MESSAGES,
    aiPctLeft,
    aiBlocked,
    aiBanner,
    products,
    busy,
    canBuy: isNative(),
    testMode: TEST_MODE,
  };
};

let state = compute();
const listeners = new Set();
const emit = () => {
  state = compute();
  listeners.forEach((l) => l());
};
const subscribe = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const getEntitlements = () => state;
export const useEntitlements = () => useSyncExternalStore(subscribe, getEntitlements, getEntitlements);

const saveCache = (patch) => {
  cache = { ...cache, ...patch };
  lsSet(ENT_KEY, JSON.stringify(cache));
  emit();
};

// ---------------------------------------------------------------- Google Play
const validPurchase = (p) => p && (p.purchaseState === 'PURCHASED' || p.purchaseState === '1');

// Play se pucho: is Google account ke kaun se plan abhi chalu hain
export async function refreshEntitlements() {
  if (!isNative()) {
    emit();
    return state;
  }
  try {
    const res = await NativePurchases.getPurchases({ productType: 'subs' });
    const owned = new Set((res?.purchases || []).filter(validPurchase).map((p) => p.productIdentifier));
    let pro = false;
    let adFree = false;
    PLANS.forEach((plan) => {
      if (!owned.has(plan.productId)) return;
      if (plan.grants.pro) pro = true;
      if (plan.grants.adFree) adFree = true;
    });
    saveCache({ pro, adFree, checkedAt: Date.now() });
  } catch {
    // Play se baat na ho paye (offline) to purani jaankari GRACE_DAYS tak chalti hai
    emit();
  }
  return state;
}

export async function loadProducts() {
  if (!isNative()) return;
  try {
    const res = await NativePurchases.getProducts({ productIdentifiers: PLANS.map((p) => p.productId), productType: 'subs' });
    const map = {};
    (res?.products || []).forEach((p) => {
      const price = p.priceString || (typeof p.price === 'number' ? String(p.price) : '');
      if (p.identifier && price) map[p.identifier] = { price };
    });
    products = map;
    emit();
  } catch {
    /* config wali price dikhegi */
  }
}

const friendly = (e) => {
  const msg = String((e && (e.message || e.errorMessage)) || e || '');
  if (/cancel/i.test(msg) || (e && e.code === 'USER_CANCELLED')) return null; // user ne khud band kiya
  if (/not.?found|unavailable|not available|item|sku|product/i.test(msg)) return bt('errNotAvail');
  if (/network|internet|timeout|offline/i.test(msg)) return bt('errNet');
  if (/unimplemented|not implemented/i.test(msg)) return bt('errUnimpl');
  return bt('errFail');
};

export async function purchasePlan(planId) {
  const plan = PLANS.find((p) => p.id === planId);
  if (!plan) return { ok: false, error: bt('errUnknown') };
  if (!isNative()) return { ok: false, error: bt('errWebBuy') };
  if (busy) return { ok: false, error: '' };
  busy = true;
  emit();
  try {
    await NativePurchases.purchaseProduct({
      productIdentifier: plan.productId,
      planIdentifier: plan.basePlanId,
      productType: 'subs',
      quantity: 1,
      autoAcknowledgePurchases: true,
    });
    await refreshEntitlements();
    return { ok: true };
  } catch (e) {
    const error = friendly(e);
    return error === null ? { ok: false, cancelled: true } : { ok: false, error };
  } finally {
    busy = false;
    emit();
  }
}

export async function restorePurchases() {
  if (!isNative()) return { ok: false, error: bt('errWebRestore') };
  try {
    try {
      await NativePurchases.restorePurchases();
    } catch {
      /* Android par zaroori nahi, neeche refresh wahi kaam karta hai */
    }
    await refreshEntitlements();
    return { ok: true, active: state.pro || state.adFree };
  } catch {
    return { ok: false, error: bt('errRestoreFail') };
  }
}

export async function manageSubscriptions() {
  try {
    await NativePurchases.manageSubscriptions();
  } catch {
    window.open('https://play.google.com/store/account/subscriptions', '_blank');
  }
}

// ---------------------------------------------------------------- Test mode (sirf TEST_MODE me)
export function testGrant(planId) {
  if (!TEST_MODE) return;
  const plan = PLANS.find((p) => p.id === planId);
  if (!plan) return;
  saveCache({ testPro: cache.testPro || plan.grants.pro, testAdFree: cache.testAdFree || plan.grants.adFree });
}
export function testClear() {
  if (!TEST_MODE) return;
  saveCache({ testPro: false, testAdFree: false });
  used = 0;
  lsSet(AI_KEY, '0');
  budget = { month: monthKey(), spent: 0 };
  lsSet(BUD_KEY, JSON.stringify(budget));
  emit();
}

// ---------------------------------------------------------------- AI messages ka hisaab
export const canUseAi = () => !state.aiBlocked;

// Gemini ke ek jawab ka kharcha (rupaye). Tokens Gemini ke jawab (usageMetadata) se aate hain.
export function replyCostInr(data) {
  const u = data && data.usageMetadata;
  if (!u || !Number.isFinite(u.promptTokenCount)) return AI_FALLBACK_REPLY_INR;
  const model = String((data && data.modelVersion) || '');
  const entry = AI_PRICES.find((p) => p.match.test(model)) || AI_PRICE_DEFAULT;
  const price = Date.now() >= Date.UTC(2027, 0, 1) && entry.from2027 ? entry.from2027 : entry;
  const out = (u.candidatesTokenCount || 0) + (u.thoughtsTokenCount || 0); // soch-vichar ke tokens bhi output ke daam par bilte hain
  const usd = (u.promptTokenCount * price.input + out * price.output) / 1e6;
  return usd * USD_TO_INR * AI_COST_SAFETY;
}

// Har KAMYAB jawab ke baad bulao (data = Gemini ka poora jawab). Free user ka ek message ginta hai, Pro ka kharcha judta hai.
export function consumeAiMessage(data) {
  if (budget.month !== monthKey()) budget = { month: monthKey(), spent: 0 };
  budget = { month: budget.month, spent: budget.spent + replyCostInr(data) };
  lsSet(BUD_KEY, JSON.stringify(budget));
  if (!state.pro) {
    used += 1;
    lsSet(AI_KEY, String(used));
  }
  emit();
}

// ---------------------------------------------------------------- Plans screen kholne ka tareeka (kahin se bhi)
export const PLANS_EVENT = 'lifebox-open-plans';
export const openPlans = () => window.dispatchEvent(new Event(PLANS_EVENT));

// ---------------------------------------------------------------- App start
let started = false;
export function initBilling() {
  if (started) return;
  started = true;
  refreshEntitlements();
  loadProducts();
  const again = () => refreshEntitlements();
  window.addEventListener('online', again);
  // Bhasha badle to AI banner wagairah naye shabdon me dikhe
  window.addEventListener('newlife-lang-changed', () => emit());
  // Plan khatam hote hi Pro dobara lock ho: Play se har 30 minute me poochho (app khula ho tab),
  // aur har minute dekho ki grace samay khatam to nahi hua (sirf badalne par hi screen refresh hoti hai).
  setInterval(() => {
    if (typeof document === 'undefined' || !document.hidden) refreshEntitlements();
  }, 30 * 60 * 1000);
  setInterval(() => {
    const n = compute();
    if (n.pro !== state.pro || n.adFree !== state.adFree) emit();
  }, 60 * 1000);
  if (isNative()) {
    CapApp.addListener('appStateChange', (s) => {
      if (s.isActive) again();
    });
  }
}

// Sirf tests ke liye
export const __resetBillingForTests = () => {
  cache = readCache();
  used = readUsed();
  budget = readBudget();
  products = {};
  busy = false;
  emit();
};
