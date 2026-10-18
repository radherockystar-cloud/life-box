# Life Box Subscription: setup guide

## 1. Code lagana (Termux, ~/new-life me)
unzip -o ~/storage/downloads/lifebox-subscription.zip
node scripts/add-ai-paywall.mjs
npm i @capgo/native-purchases@^8
npm run build
npx cap sync android

## 2. Test
Lock/unlock ka "TEST MODE" box sirf `npm run dev` (browser) me dikhta hai. APK me kabhi nahi.
APK me asli kharidari Google Play Console ke subscriptions ban jaane ke baad hi test hoti hai (License testing se paisa nahi katta).

## 3. Asli subscription (Google Play Console)
1. Play Console account (one-time $25) + Payments profile (bank details) banao.
2. App banao (package: com.lifebox.app), signed AAB upload karo: Testing > Internal testing.
3. Monetize > Products > Subscriptions > Create subscription:
   - Product ID: lifebox_pro_monthly   | base plan ID: monthly | auto-renewing | billing period 1 month | price INR 79
   - (ads on hone ke baad) lifebox_adfree_monthly = INR 59, lifebox_bundle_monthly = INR 119
   - Har subscription ko Activate karo.
4. Setup > License testing me apna Gmail daalo (test me paisa nahi katta).
Product ID / price badalna ho to src/config/plans.js me bhi wahi badlo.

## 4. Ads (baad me, AdMob ke baad)
Steps src/utils/ads.js ke upar likhe hain. Sirf src/config/plans.js (ADS_ENABLED = true + apna banner ID)
aur AndroidManifest.xml me AdMob App ID badalna hota hai.
Isi ke saath Ad-free aur Pro + Ad-free plans apne aap app me dikhne lagte hain.

## 5. Play Store form
Data safety me: Purchase history (Google Play), Device or other IDs (ads, jab ads on ho), Email/Name (login),
App content > Ads = "Yes, contains ads" (jab ads on ho). Privacy Policy URL zaroori hai.

## 6. AI ka kharcha (profit)
- Free user: 10 messages (src/config/plans.js -> FREE_AI_MESSAGES), phir Pro tak AI band.
- Pro user: har mahine AI_BUDGET_INR = 15 (asli kharcha ~Rs 12). Poora ho to agle mahine ki 1 tareekh tak AI ruk jata hai.
- Hisaab Gemini ke asli tokens se hota hai. Dollar ka bhav USD_TO_INR me, model ke daam AI_PRICES me badlo.
- Kharcha kam rakhna ho to .env me sasta model rakho: VITE_GEMINI_MODEL=<koi flash-lite model>
- Ad-free plan chhupe hain. Ads chalu hone par ADS_ENABLED = true karo, apne aap dikhne lagenge.
