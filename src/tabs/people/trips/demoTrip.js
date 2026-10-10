// A made-up trip, so the whole feature can be tried without travelling anywhere.
// Route: India Gate (Delhi) -> Mathura (25 min stop) -> Agra Fort -> Taj Mahal (30 min stop).
// It is fast: about 25 seconds of real time for a 3 hour drive.

import { haversineMeters } from './tripAnalysis';

const WAYPOINTS = [
  { lat: 28.6129, lon: 77.2295, stopMin: 0 },
  { lat: 27.4924, lon: 77.6737, stopMin: 25 }, // Mathura
  { lat: 27.1795, lon: 78.0211, stopMin: 0 }, // Agra Fort
  { lat: 27.1751, lon: 78.0421, stopMin: 30 }, // Taj Mahal
];

const SPEED_MS = 70 / 3.6; // 70 km/h
const STEP_M = 1000; // a point every km
const TICK_MS = 120; // real time between two points

// Same "random" numbers every time, so the demo is always the same
const makeRandom = () => {
  let seed = 12345;
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296 - 0.5;
  };
};

// All points of the demo trip, with times that end at endTime
export const buildDemoPoints = (endTime = Date.now()) => {
  const random = makeRandom();
  const relative = []; // [lat, lon, ms from start, accuracy]
  let clock = 0;

  for (let i = 0; i < WAYPOINTS.length - 1; i++) {
    const a = WAYPOINTS[i];
    const b = WAYPOINTS[i + 1];
    const meters = haversineMeters(a, b);
    const steps = Math.max(1, Math.round(meters / STEP_M));

    for (let s = 0; s < steps; s++) {
      const f = s / steps;
      // a little sideways wobble (about 15 m) so it looks like a real GPS line
      relative.push([a.lat + (b.lat - a.lat) * f + random() * 0.00025, a.lon + (b.lon - a.lon) * f + random() * 0.00025, clock, 8]);
      clock += (meters / steps / SPEED_MS) * 1000;
    }

    // waiting at the end of this leg
    const stopMs = b.stopMin * 60000;
    for (let waited = 0; waited <= stopMs && stopMs > 0; waited += 5 * 60000) {
      relative.push([b.lat + random() * 0.00006, b.lon + random() * 0.00006, clock + waited, 10]);
    }
    clock += stopMs;
  }

  const start = endTime - clock;
  return relative.map(([lat, lon, t, acc]) => [Math.round(lat * 100000) / 100000, Math.round(lon * 100000) / 100000, Math.round(start + t), acc]);
};

// Sends the demo points one by one. Returns { stop() }.
export const startDemoFeed = (ingest, onDone) => {
  const points = buildDemoPoints();
  let index = 0;

  const timer = setInterval(() => {
    if (index >= points.length) {
      clearInterval(timer);
      if (onDone) onDone();
      return;
    }
    const [lat, lon, t, acc] = points[index++];
    ingest(lat, lon, t, acc);
  }, TICK_MS);

  return { stop: () => clearInterval(timer) };
};
