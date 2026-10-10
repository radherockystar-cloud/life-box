// Records the route of a trip. The route (GPS points) is kept ONLY on this phone.
// - Installed app: @capgo/background-geolocation (keeps working with the screen off, shows the small "recording" notification)
// - Browser (local testing): the browser's own location
// - Demo trip: made-up points (demoTrip.js)
// The screens never talk to the GPS directly. They use getSnapshot / subscribe (see useActiveTrip.js).

import { Capacitor } from '@capacitor/core';
import { BackgroundGeolocation } from '@capgo/background-geolocation';
import { ACTIVE_KEY, ACTIVE_POINTS_KEY } from './tripConfig';
import { haversineMeters } from './tripAnalysis';
import { abortAfter, findFamousNear, reverseGeocode } from './placeLookup';
import { startDemoFeed } from './demoTrip';

const MIN_STEP_M = 15; // ignore moves smaller than this ...
const MAX_QUIET_MS = 120000; // ... unless this much time has passed
const MAX_ACCURACY_M = 150; // ignore very inaccurate points
const FAMOUS_EVERY_M = 3000; // look for famous places every 3 km
const FAMOUS_MIN_GAP_MS = 8000; // but not more often than every 8 seconds

const read = (key, fallback) => {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value === null || value === undefined ? fallback : value;
  } catch {
    return fallback;
  }
};

// ---------- State ----------
let active = read(ACTIVE_KEY, null); // { id, tripId, title, mode, startedAt, fromPlace, toPlace, demo, famous: [], companions: [] }
let points = read(ACTIVE_POINTS_KEY, []); // [[lat, lon, time, accuracy], ...]
let backend = null; // { stop() } of the running tracker
let status = active ? 'paused' : 'idle'; // idle | starting | recording | paused | error
let errorMessage = '';
let needsSettings = false;
let lastFamous = null; // { lat, lon, realAt }
let famousBusy = false;

const listeners = new Set();
let snapshot;

const makeSnapshot = () => ({ active, points: points.slice(), status, errorMessage, needsSettings });
snapshot = makeSnapshot();

const notify = () => {
  snapshot = makeSnapshot();
  listeners.forEach((listener) => listener());
};

export const getSnapshot = () => snapshot;

export const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

// ---------- Saving on the phone ----------
const saveActive = () => {
  try {
    if (active) localStorage.setItem(ACTIVE_KEY, JSON.stringify(active));
    else localStorage.removeItem(ACTIVE_KEY);
  } catch {
    // storage full: the trip still records while the app stays open
  }
};

const savePointsNow = () => {
  try {
    if (active) localStorage.setItem(ACTIVE_POINTS_KEY, JSON.stringify(points));
    else localStorage.removeItem(ACTIVE_POINTS_KEY);
  } catch {
    // storage full
  }
};

let persistTimer = null;
const schedulePersist = () => {
  if (persistTimer) return;
  persistTimer = setTimeout(() => {
    persistTimer = null;
    savePointsNow();
  }, 4000);
};

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) savePointsNow();
  });
}

// ---------- A new GPS point arrives ----------
const round5 = (n) => Math.round(n * 100000) / 100000;

const lookupFamous = async (lat, lon, t) => {
  if (famousBusy || !active) return;
  famousBusy = true;
  lastFamous = { lat, lon, realAt: Date.now() };
  try {
    const found = await findFamousNear(lat, lon, { signal: abortAfter(9000) });
    if (!active) return;
    const known = new Set((active.famous || []).map((f) => f.title));
    const fresh = found.filter((f) => !known.has(f.title)).slice(0, 1); // one new card at a time
    if (fresh.length > 0) {
      active = { ...active, famous: [...(active.famous || []), ...fresh.map((f) => ({ ...f, t, seen: false }))] };
      saveActive();
      notify();
    }
  } catch {
    // no internet: the story will look for famous places once more at the end
  } finally {
    famousBusy = false;
  }
};

const nameStart = async (lat, lon) => {
  try {
    const place = await reverseGeocode(lat, lon, abortAfter(9000));
    if (place && active && !active.fromPlace) {
      active = { ...active, fromPlace: place };
      saveActive();
      notify();
    }
  } catch {
    // named at the end instead
  }
};

const ingest = (lat, lon, t, accuracy) => {
  if (!active || !Number.isFinite(lat) || !Number.isFinite(lon)) return;
  if (accuracy && accuracy > MAX_ACCURACY_M) return;

  const last = points[points.length - 1];
  if (last) {
    const moved = haversineMeters({ lat: last[0], lon: last[1] }, { lat, lon });
    if (moved < MIN_STEP_M && t - last[2] < MAX_QUIET_MS) return;
  }

  points.push([round5(lat), round5(lon), t, accuracy ? Math.round(accuracy) : 0]);
  schedulePersist();

  if (status !== 'recording' || errorMessage) {
    status = 'recording';
    errorMessage = '';
    needsSettings = false;
  }

  if (points.length === 1 && !active.fromPlace) nameStart(lat, lon);

  const farEnough = !lastFamous || haversineMeters(lastFamous, { lat, lon }) >= FAMOUS_EVERY_M;
  const waitedEnough = !lastFamous || Date.now() - lastFamous.realAt >= FAMOUS_MIN_GAP_MS;
  if (farEnough && waitedEnough) lookupFamous(lat, lon, t);

  notify();
};

// ---------- Starting the tracker ----------
const setError = (message, settings = false) => {
  status = 'error';
  errorMessage = message;
  needsSettings = settings;
  notify();
};

const beginBackend = async () => {
  if (!active) return;

  // Demo trip
  if (active.demo) {
    backend = startDemoFeed(ingest, () => {
      status = 'recording';
      notify();
    });
    status = 'recording';
    notify();
    return;
  }

  // Installed Android app
  if (Capacitor.isNativePlatform()) {
    try {
      await BackgroundGeolocation.start(
        {
          backgroundTitle: 'Life Box is recording your trip',
          backgroundMessage: 'Your route stays on this phone. Tap to open the app.',
          requestPermissions: true,
          stale: false,
          distanceFilter: 15,
        },
        (location, error) => {
          if (error) {
            if (error.code === 'NOT_AUTHORIZED') setError('Location permission is needed to record your trip.', true);
            else setError(error.message || 'Could not read your location.');
            return;
          }
          if (location) ingest(location.latitude, location.longitude, location.time || Date.now(), location.accuracy);
        }
      );
      backend = { stop: () => BackgroundGeolocation.stop() };
      if (status !== 'recording') {
        status = 'starting';
        notify();
      }
    } catch (error) {
      setError((error && error.message) || 'Could not start location tracking.', true);
    }
    return;
  }

  // Browser (testing on localhost)
  if (!('geolocation' in navigator)) {
    setError('This browser cannot give your location.');
    return;
  }
  const watchId = navigator.geolocation.watchPosition(
    (position) => ingest(position.coords.latitude, position.coords.longitude, position.timestamp || Date.now(), position.coords.accuracy),
    (error) => setError(error.code === 1 ? 'Location permission was denied. Please allow it and start again.' : 'Could not get your location.'),
    { enableHighAccuracy: true, maximumAge: 5000, timeout: 30000 }
  );
  backend = { stop: () => navigator.geolocation.clearWatch(watchId) };
  status = 'starting';
  notify();
};

// ---------- What the screens use ----------

// meta: { tripId, title, mode, fromPlace, toPlace, companions, demo }
export const startRecording = async (meta) => {
  if (active) return { ok: false, message: 'A trip is already being recorded.' };

  active = {
    id: `rec-${Date.now()}`,
    tripId: meta.tripId || null,
    title: meta.title || 'My trip',
    mode: meta.mode || 'car',
    startedAt: Date.now(),
    fromPlace: meta.fromPlace || null,
    toPlace: meta.toPlace || null,
    companions: meta.companions || [],
    demo: !!meta.demo,
    famous: [],
  };
  points = [];
  lastFamous = null;
  errorMessage = '';
  needsSettings = false;
  status = 'starting';
  saveActive();
  savePointsNow();
  notify();

  await beginBackend();
  return { ok: true };
};

export const stopTracking = async () => {
  if (backend) {
    try {
      await backend.stop();
    } catch {
      // already stopped
    }
    backend = null;
  }
  if (persistTimer) {
    clearTimeout(persistTimer);
    persistTimer = null;
  }
  savePointsNow();
  if (active) {
    status = 'paused';
    notify();
  }
};

// Forget the trip completely (after the story is saved, or when it is discarded)
export const clearActive = async () => {
  await stopTracking();
  active = null;
  points = [];
  lastFamous = null;
  errorMessage = '';
  needsSettings = false;
  status = 'idle';
  saveActive();
  savePointsNow();
  notify();
};

// The app was closed during a trip: start recording again
export const resumeTracking = async () => {
  if (!active || backend || active.demo || status === 'starting') return;
  status = 'starting';
  notify();
  await beginBackend();
};

export const markFamousSeen = (title) => {
  if (!active) return;
  active = { ...active, famous: (active.famous || []).map((f) => (f.title === title ? { ...f, seen: true } : f)) };
  saveActive();
  notify();
};

export const openLocationSettings = async () => {
  try {
    await BackgroundGeolocation.openSettings();
  } catch {
    // not available in the browser
  }
};

// After a restart, continue recording by itself (the foreground service keeps the app alive in most cases)
if (active && !active.demo) setTimeout(() => resumeTracking(), 1500);
