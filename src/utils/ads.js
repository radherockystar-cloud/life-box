// Ads (Google AdMob). Abhi band hai (src/config/plans.js me ADS_ENABLED = false).
//
// AdMob lagane ke steps:
//   1) npm i @capacitor-community/admob   phir   npx cap sync android
//   2) AndroidManifest.xml me <application> ke andar apna AdMob APP ID daalo:
//        <meta-data android:name="com.google.android.gms.ads.APPLICATION_ID" android:value="ca-app-pub-XXXX~YYYY"/>
//   3) src/config/plans.js me ADS_ENABLED = true karo aur ADMOB.bannerUnitId apna daalo (testMode: false jab live jao)
// Is file me kuch badalna nahi padta.
import { Capacitor, registerPlugin } from '@capacitor/core';
import { ADS_ENABLED, ADMOB } from '../config/plans';

const AdMob = registerPlugin('AdMob');
const isNative = () => Capacitor.isNativePlatform();

let ready = null;
let shown = false;

// Pehle consent (jahan zaroori ho, jaise Europe), phir AdMob start
function initAds() {
  if (!ADS_ENABLED || !isNative()) return Promise.resolve(false);
  if (!ready) {
    ready = (async () => {
      try {
        const info = await AdMob.requestConsentInfo();
        if (info && info.isConsentFormAvailable && info.status === 'REQUIRED') await AdMob.showConsentForm();
      } catch {
        /* consent na mile to aage badho */
      }
      try {
        await AdMob.initialize({ initializeForTesting: ADMOB.testMode });
        return true;
      } catch {
        ready = null;
        return false;
      }
    })();
  }
  return ready;
}

// true = banner dikhao, false = hatao
export async function setBannerVisible(visible) {
  if (!ADS_ENABLED || !isNative()) return;
  try {
    if (visible && !shown) {
      if (!(await initAds())) return;
      await AdMob.showBanner({
        adId: ADMOB.bannerUnitId,
        adSize: 'ADAPTIVE_BANNER',
        position: 'BOTTOM_CENTER',
        margin: ADMOB.bottomMargin,
        isTesting: ADMOB.testMode,
      });
      shown = true;
    } else if (!visible && shown) {
      shown = false;
      await AdMob.removeBanner();
    }
  } catch {
    shown = false;
  }
}
