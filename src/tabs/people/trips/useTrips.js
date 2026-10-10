import { useEffect, useMemo, useState } from 'react';
import useAuthUser from './useAuthUser';
import { subscribeMyTrips, friendlyCloudError } from './tripCloud';
import { loadLocalTrips, readCloudCache, writeCloudCache, clearCloudCache } from './tripStorage';
import { requestSync } from '../../planner/reminderService';

// One list with every trip: solo trips (this phone) + group trips (cloud), soonest first.
export default function useTrips() {
  const { user, ready, displayName } = useAuthUser();
  const [localTrips, setLocalTrips] = useState(loadLocalTrips);
  const [cloudTrips, setCloudTrips] = useState([]);
  const [cloudError, setCloudError] = useState('');

  // Solo trips changed somewhere (new trip, restored from the Bin ...)
  const reloadLocal = () => {
    setLocalTrips(loadLocalTrips());
    requestSync();
  };

  useEffect(() => {
    window.addEventListener('newlife-vault-changed', reloadLocal);
    return () => window.removeEventListener('newlife-vault-changed', reloadLocal);
  }, []);

  // Group trips: live from the cloud
  useEffect(() => {
    if (!ready) return undefined;

    if (!user) {
      setCloudTrips([]);
      setCloudError('');
      clearCloudCache(); // someone else may log in on this phone later
      requestSync();
      return undefined;
    }

    setCloudTrips(readCloudCache(user.uid)); // show the last copy at once, even offline
    setCloudError('');

    const unsubscribe = subscribeMyTrips(
      user.uid,
      (list) => {
        setCloudTrips(list);
        writeCloudCache(user.uid, list);
        setCloudError('');
        requestSync();
      },
      (error) => setCloudError(friendlyCloudError(error))
    );

    return unsubscribe;
  }, [ready, user ? user.uid : null]);

  const trips = useMemo(
    () => [...localTrips, ...cloudTrips].sort((a, b) => a.startAt - b.startAt),
    [localTrips, cloudTrips]
  );

  return { trips, user, ready, displayName, cloudError, reloadLocal };
}
