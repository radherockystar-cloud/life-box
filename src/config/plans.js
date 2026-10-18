// ============================================================================
//  SUBSCRIPTION KI SAARI SETTINGS YAHIN HAIN.
//  Price / free limit / ads on-off badalna ho to sirf is file me badlo.
// ============================================================================

// --- AI CHAT KA HISAAB (profit bachane ke liye) -------------------------------------------------
// Free user: itne messages ek baar mile, khatam hone ke baad Pro lene tak AI band (wapas nahi aate).
export const FREE_AI_MESSAGES = 10;

// Pro user: har mahine ke liye AI ka kharcha is rupaye tak. Poora hone par AI agle mahine ki 1 tareekh tak ruk jata hai.
// App har jawab ke asli tokens (Gemini batata hai) ginkar kharcha jodta hai, isliye message chhota/lamba ho to bhi hisaab sahi rehta hai.
// Neeche AI_COST_SAFETY (1.25x) laga hai, yaani asli kharcha is number se kam hi rehta hai.
// Abhi 15 => asli kharcha lagbhag Rs 12 / user / mahina (Rs 79 me se Google ka 15% + GST ke baad bhi acha munafa).
export const AI_BUDGET_INR = 15;
export const USD_TO_INR = 90; // dollar ka bhav badle to yahan badlo
export const AI_COST_SAFETY = 1.25;
export const AI_FALLBACK_REPLY_INR = 0.4; // Gemini tokens na bataye to ek jawab ka itna maan lo

// Gemini ke paid daam (USD per 1M tokens). Model ka naam jawab me aata hai, usi se daam chunta hai.
// Jo model pehchana na jaye uske liye sabse mehenga "flash" wala daam lagta hai (surakshit taraf).
// Flash ke daam 1 Jan 2027 se double ho rahe hain (Google ki pricing page), wo apne aap lag jayenge.
export const AI_PRICES = [
  { match: /flash-lite/i, input: 0.3, output: 2.5 },
  { match: /pro/i, input: 2.5, output: 15 },
  { match: /flash/i, input: 0.75, output: 3.75, from2027: { input: 1.5, output: 7.5 } },
];
export const AI_PRICE_DEFAULT = { input: 0.75, output: 3.75, from2027: { input: 1.5, output: 7.5 } };

// --- Internet na ho to purani "subscribed" jaankari kitne din chalti rahe
export const GRACE_DAYS = 3;

// --- ADS: AdMob lagane ke baad ise true karo (aur neeche ADMOB ke IDs bharo).
//     Jab tak false hai: koi ad nahi dikhta aur "Ad-free" / "Pro + Ad-free" plan bhi chhupe rehte hain
//     (jo cheez abhi hai hi nahi use bechna Play Store ke niyam ke khilaf hai).
export const ADS_ENABLED = false;

export const ADMOB = {
  // Ye Google ke test IDs hain. Asli AdMob account ban jaye to apne IDs yahan daalo.
  bannerUnitId: 'ca-app-pub-3940256099942544/6300978111',
  testMode: true, // asli ads dikhane ke liye false karo
  bottomMargin: 72, // banner bottom navigation ke upar baithe, isliye itna margin (px)
};
// AdMob ka APP ID AndroidManifest.xml me bhi daalna hota hai (Termux guide me likha hai).

// --- TEST MODE: sirf developer ke liye (npm run dev, browser me). APK / release build me kabhi on nahi hota,
//     isliye "Grant Pro" wala test box user ko kabhi nahi dikhta.
export const TEST_MODE = Boolean(import.meta.env?.DEV);

// --- Plans. productId = Google Play Console me banaya hua Subscription ID,
//     basePlanId = us subscription ka Base plan ID (monthly). Price Play Console me bhi yahi rakho.
export const PLANS = [
  {
    id: 'pro',
    productId: 'lifebox_pro_monthly',
    basePlanId: 'monthly',
    price: 79,
    title: 'Pro',
    tagline: 'AI chat + Memories tab',
    features: ['AI Assistant with a generous monthly allowance', 'Memories tab unlocked', 'Cloud sync stays free'],
    grants: { pro: true, adFree: false },
    needsAds: false,
  },
  {
    id: 'adfree',
    productId: 'lifebox_adfree_monthly',
    basePlanId: 'monthly',
    price: 59,
    title: 'Ad-free',
    tagline: 'No ads anywhere in the app',
    features: ['No ads in the whole app'],
    grants: { pro: false, adFree: true },
    needsAds: true,
  },
  {
    id: 'bundle',
    productId: 'lifebox_bundle_monthly',
    basePlanId: 'monthly',
    price: 119,
    title: 'Pro + Ad-free',
    tagline: 'Everything in one plan',
    features: ['AI Assistant with a generous monthly allowance', 'Memories tab unlocked', 'No ads anywhere in the app'],
    grants: { pro: true, adFree: true },
    needsAds: true,
    badge: 'Best value',
  },
];

// Ad-free wale plan ads aane tak chhupe rehte hain. Sirf "Coming soon" dikhana ho to true karo.
export const SHOW_ADFREE_COMING_SOON = false;

export const visiblePlans = () => PLANS.filter((p) => ADS_ENABLED || SHOW_ADFREE_COMING_SOON || !p.needsAds);
