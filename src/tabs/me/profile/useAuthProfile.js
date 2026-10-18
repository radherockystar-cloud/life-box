// Login ki halat (kaun login hai) + uska profile. Sirf padhne ke liye; badlav authService / profileService se hote hain.
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../firebase';
import { EMPTY_PROFILE, clearOldGuestProfile, loadProfile } from './profileService';
import { initAppStorage } from '../../../utils/appStorage';
import { AUTH_RECHECK_EVENT, isLoginGateActive, isBrandNewAccount } from '../auth/authService';
import { startCloudSync, stopCloudSync, getSyncStatus, subscribeSyncStatus } from '../../../utils/cloudSync';

export function useAuthProfile() {
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState(null); // null = guest (login nahi)
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [syncStatus, setSyncStatus] = useState(getSyncStatus()); // { state: 'idle'|'syncing'|'error', lastSyncAt, error }

  useEffect(() => subscribeSyncStatus(setSyncStatus), []);

  useEffect(() => {
    initAppStorage().then(clearOldGuestProfile);
    let cancelled = false;
    // Net bahut slow ho to bhi page "Loading..." par atka na rahe
    const readyTimer = setTimeout(() => setAuthReady(true), 6000);

    let appliedUid = null; // jis user ko app pehle hi "login" maan chuka hai (dobara kaam na ho)

    const applyUser = async (firebaseUser) => {
      if (appliedUid === firebaseUser.uid) return;
      appliedUid = firebaseUser.uid;
      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || '',
        photoURL: firebaseUser.photoURL || '',
        emailVerified: !!firebaseUser.emailVerified,
        providerData: firebaseUser.providerData || [],
      });
      // Data sync peeche chalta hai (screen ko rokta nahi). Cloud ka data aaya to app khud reload ho jata hai.
      initAppStorage()
        .then(() => startCloudSync(firebaseUser.uid))
        .catch((error) => console.error('Cloud sync start failed:', error));
      try {
        const data = await loadProfile(firebaseUser);
        if (!cancelled) setProfile(data);
      } catch (error) {
        console.error('Error fetching profile from Firestore:', error);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (cancelled) return;

      if (firebaseUser) {
        // "Login" tab se Google ka naya (bina account wala) user: jab tak authService check na kar le, ise login mat maano
        if (isLoginGateActive() && isBrandNewAccount(firebaseUser)) return;
        await applyUser(firebaseUser);
      } else {
        // Logout: kisi ka bhi data na dikhe
        appliedUid = null;
        stopCloudSync();
        setUser(null);
        setProfile(EMPTY_PROFILE);
      }

      if (!cancelled) setAuthReady(true);
    });

    // Google check poora hone ke baad (user pehle se bana hua tha to) use ab login maan lo
    const onRecheck = () => {
      const u = auth.currentUser;
      if (!cancelled && u) applyUser(u);
    };
    window.addEventListener(AUTH_RECHECK_EVENT, onRecheck);

    return () => {
      cancelled = true;
      clearTimeout(readyTimer);
      unsubscribe();
      window.removeEventListener(AUTH_RECHECK_EVENT, onRecheck);
    };
  }, []);

  return { authReady, user, isLoggedIn: !!user, profile, setProfile, syncStatus };
}
