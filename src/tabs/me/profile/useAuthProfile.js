// Login ki halat (kaun login hai) + uska profile. Sirf padhne ke liye; badlav authService / profileService se hote hain.
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../firebase';
import { EMPTY_PROFILE, clearOldGuestProfile, loadProfile } from './profileService';
import { initAppStorage } from '../../../utils/appStorage';
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

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (cancelled) return;

      if (firebaseUser) {
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
      } else {
        // Logout: kisi ka bhi data na dikhe
        stopCloudSync();
        setUser(null);
        setProfile(EMPTY_PROFILE);
      }

      if (!cancelled) setAuthReady(true);
    });

    return () => {
      cancelled = true;
      clearTimeout(readyTimer);
      unsubscribe();
    };
  }, []);

  return { authReady, user, isLoggedIn: !!user, profile, setProfile, syncStatus };
}
