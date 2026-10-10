// Finished trips ("stories"). Each person's stories live on that person's own phone.

import { HISTORY_KEY, SKIPS_KEY, HIDDEN_MISSED_KEY, STOP_MIN_MS, DEMO_STOP_MIN_MS } from './tripConfig';
import { moveToBin } from '../../../utils/binStorage';
import { cleanPoints, detectStops, haversineMeters, simplifyPath, totalDistanceKm } from './tripAnalysis';
import { abortAfter, findFamousNear, reverseGeocode } from './placeLookup';
import { getTripPhase } from './tripModels';

const read = (key, fallback) => {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value === null || value === undefined ? fallback : value;
  } catch {
    return fallback;
  }
};

const write = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};

const changed = () => window.dispatchEvent(new Event('newlife-trip-history-changed'));

// ---------- Stories ----------
export const loadHistory = () => {
  const list = read(HISTORY_KEY, []);
  return Array.isArray(list) ? list.filter((e) => e && e.id && Array.isArray(e.path)) : [];
};

export const addHistoryEntry = (entry) => {
  const list = [entry, ...loadHistory().filter((e) => e.id !== entry.id)].sort((a, b) => b.endedAt - a.endedAt);
  const ok = write(HISTORY_KEY, list);
  changed();
  return ok;
};

// Deleting sends the story to the Trash / Bin first, so it can be restored from Settings
export const deleteHistoryEntry = (id) => {
  const list = loadHistory();
  const entry = list.find((e) => e.id === id);
  if (entry) moveToBin({ ...entry, title: entry.title, type: 'Trip story' }, HISTORY_KEY);
  write(HISTORY_KEY, list.filter((e) => e.id !== id));
  changed();
};

// ---------- "You did not go on this trip" ----------
export const loadSkips = () => read(SKIPS_KEY, []);

export const addSkip = (tripId) => {
  write(SKIPS_KEY, [...new Set([...loadSkips(), tripId])]);
  changed();
};

export const hideMissed = (tripId) => {
  write(HIDDEN_MISSED_KEY, [...new Set([...read(HIDDEN_MISSED_KEY, []), tripId])]);
  changed();
};

// Planned trips the person did not go on: skipped, or the start time passed and no trip was recorded for it
export const getMissedTrips = (trips, history, activeTripId) => {
  const skips = new Set(loadSkips());
  const hidden = new Set(read(HIDDEN_MISSED_KEY, []));
  const done = new Set(history.map((h) => h.tripId).filter(Boolean));

  return trips.filter(
    (t) =>
      t.status !== 'cancelled' &&
      t.id !== activeTripId &&
      !done.has(t.id) &&
      !hidden.has(t.id) &&
      (skips.has(t.id) || getTripPhase(t) === 'earlier')
  );
};

// ---------- Building the story when a trip is completed ----------
const safeReverse = async (lat, lon) => {
  try {
    return await reverseGeocode(lat, lon, abortAfter(8000));
  } catch {
    return null;
  }
};

const nearestTime = (pts, lat, lon) => {
  let best = pts[0];
  let bestD = Infinity;
  pts.forEach((p) => {
    const d = haversineMeters({ lat: p[0], lon: p[1] }, { lat, lon });
    if (d < bestD) {
      bestD = d;
      best = p;
    }
  });
  return best[2];
};

// Returns the saved story, or null when no location was recorded at all.
export const finishTrip = async ({ active, points, onProgress = () => {} }) => {
  if (!active || !points || points.length === 0) return null;

  onProgress('Saving your route...');
  const mode = active.mode || 'car';

  let pts = cleanPoints(points, mode);
  if (pts.length === 0) pts = points;

  const last = pts[pts.length - 1];
  const now = Date.now();
  const endedAt = active.demo ? last[2] : Math.max(last[2], now);

  // Time spent waiting at the end before pressing Complete counts as time at that place
  if (!active.demo && endedAt - last[2] > 2 * 60 * 1000) pts = [...pts, [last[0], last[1], endedAt, last[3] || 0]];

  const startedAt = Math.min(active.startedAt, pts[0][2]);
  const first = pts[0];
  const end = pts[pts.length - 1];

  // Stops (the very start and very end are not "stops")
  let stops = detectStops(pts, { minMs: active.demo ? DEMO_STOP_MIN_MS : STOP_MIN_MS }).filter(
    (s) => haversineMeters(s, { lat: first[0], lon: first[1] }) > 250 && haversineMeters(s, { lat: end[0], lon: end[1] }) > 250
  );
  stops = stops.slice(0, 8);

  // Names
  onProgress('Naming the places you visited...');
  const fromReal = active.fromPlace || (await safeReverse(first[0], first[1]));
  const from = { name: (fromReal && fromReal.name) || 'Start point', label: (fromReal && fromReal.label) || 'Start point', lat: first[0], lon: first[1] };

  let toReal = null;
  if (active.toPlace && active.toPlace.lat !== undefined && haversineMeters(active.toPlace, { lat: end[0], lon: end[1] }) < 3000) toReal = active.toPlace;
  if (!toReal) toReal = await safeReverse(end[0], end[1]);
  const to = { name: (toReal && toReal.name) || 'End point', label: (toReal && toReal.label) || 'End point', lat: end[0], lon: end[1] };

  const namedStops = [];
  for (let i = 0; i < stops.length; i++) {
    const place = await safeReverse(stops[i].lat, stops[i].lon);
    namedStops.push({ ...stops[i], name: (place && place.name) || `Stop ${i + 1}`, label: (place && place.label) || `Stop ${i + 1}` });
  }

  // Famous places: the ones found during the trip, plus a look along the route if none were found
  onProgress('Looking for famous places on your way...');
  let famous = (active.famous || []).map(({ seen, ...rest }) => rest);

  if (famous.length === 0) {
    // up to 5 spots spread evenly along the whole route, plus the end point
    const km = [0];
    for (let i = 1; i < pts.length; i++) {
      km.push(km[i - 1] + haversineMeters({ lat: pts[i - 1][0], lon: pts[i - 1][1] }, { lat: pts[i][0], lon: pts[i][1] }) / 1000);
    }
    const totalKm = km[km.length - 1];
    const count = Math.min(5, Math.floor(totalKm / 8));
    const samples = [];
    for (let k = 0; k < count; k++) {
      const target = (totalKm * (k + 0.5)) / count;
      const index = km.findIndex((value) => value >= target);
      samples.push(pts[index === -1 ? pts.length - 1 : index]);
    }
    samples.push(end);

    const started = Date.now();
    for (const sample of samples.slice(0, 6)) {
      if (Date.now() - started > 15000) break;
      try {
        const found = await findFamousNear(sample[0], sample[1], { signal: abortAfter(8000) });
        if (found[0]) famous.push({ ...found[0], t: sample[2] });
      } catch {
        // no internet: the story simply has no famous places
      }
    }
  }

  const seenTitles = new Set();
  famous = famous
    .filter((f) => {
      if (seenTitles.has(f.title)) return false;
      seenTitles.add(f.title);
      return true;
    })
    .map((f) => ({ ...f, t: f.t || nearestTime(pts, f.lat, f.lon) }))
    .sort((a, b) => a.t - b.t)
    .slice(0, 8);

  const entry = {
    id: `story-${active.id}`,
    tripId: active.tripId || null,
    title: active.title,
    mode,
    demo: !!active.demo,
    startedAt,
    endedAt,
    durationMs: endedAt - startedAt,
    distanceKm: Math.round(totalDistanceKm(pts) * 10) / 10,
    from,
    to,
    stops: namedStops,
    famous,
    companions: active.companions || [],
    path: simplifyPath(pts, 400).map((p) => [p[0], p[1], p[2]]),
    createdAt: now,
  };

  onProgress('Your story is ready!');
  addHistoryEntry(entry);
  return entry;
};
