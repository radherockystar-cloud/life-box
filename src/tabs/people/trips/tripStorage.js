import { LOCAL_TRIPS_KEY, CLOUD_CACHE_KEY } from './tripConfig';
import { moveToBin } from '../../../utils/binStorage';

const readJson = (key, fallback) => {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value === null || value === undefined ? fallback : value;
  } catch {
    return fallback;
  }
};

const isUsable = (t) => t && t.id && t.title && Number.isFinite(t.startAt);

// ---------- Solo trips (only on this phone) ----------

export const loadLocalTrips = () => {
  const list = readJson(LOCAL_TRIPS_KEY, []);
  return Array.isArray(list) ? list.filter(isUsable).map((t) => ({ ...t, solo: true })) : [];
};

export const saveLocalTrips = (trips) => {
  try {
    localStorage.setItem(LOCAL_TRIPS_KEY, JSON.stringify(trips));
    return true;
  } catch {
    return false;
  }
};

export const addLocalTrip = (trip) => saveLocalTrips([trip, ...loadLocalTrips().filter((t) => t.id !== trip.id)]);

// Deleting sends the trip to the Trash / Bin first, so it can be restored from Settings
export const deleteLocalTrip = (id) => {
  const trips = loadLocalTrips();
  const trip = trips.find((t) => t.id === id);
  if (trip) moveToBin({ ...trip, type: 'Trip' }, LOCAL_TRIPS_KEY);
  return saveLocalTrips(trips.filter((t) => t.id !== id));
};

// ---------- Group trips: last copy from the cloud (so the list also shows offline) ----------

export const readCloudCache = (uid) => {
  const cache = readJson(CLOUD_CACHE_KEY, null);
  if (!cache || (uid && cache.uid !== uid) || !Array.isArray(cache.trips)) return [];
  return cache.trips.filter(isUsable);
};

// Used by reminders: whatever is cached, for whoever is logged in on this phone
export const readAnyCloudCache = () => {
  const cache = readJson(CLOUD_CACHE_KEY, null);
  return cache && Array.isArray(cache.trips) ? cache.trips.filter(isUsable) : [];
};

export const writeCloudCache = (uid, trips) => {
  try {
    localStorage.setItem(CLOUD_CACHE_KEY, JSON.stringify({ uid, trips }));
  } catch {
    // storage full: the list still works while online
  }
};

export const clearCloudCache = () => localStorage.removeItem(CLOUD_CACHE_KEY);
