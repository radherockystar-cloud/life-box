import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../../firebase';
import { ME_DEFAULT_NAME } from './tripConfig';

// Who is logged in, and the name to show to other people on a trip.
export default function useAuthUser() {
  const [user, setUser] = useState(auth.currentUser);
  const [ready, setReady] = useState(false);
  const [profileName, setProfileName] = useState('');

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setReady(true);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setProfileName('');
      return undefined;
    }
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'users', user.uid, 'profile', 'data'));
        if (!cancelled && snap.exists()) setProfileName(snap.data().name || '');
      } catch {
        // offline: fall back to the account name
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user ? user.uid : null]);

  const customName = profileName && profileName !== ME_DEFAULT_NAME ? profileName : '';
  const emailName = user && user.email ? user.email.split('@')[0] : '';
  const displayName = customName || (user && user.displayName) || emailName || 'Traveller';

  return { user, ready, displayName };
}
