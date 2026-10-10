// Turns raw GPS points into a trip summary. No phone code in here, so it can be tested on its own.
// A point is [lat, lon, time(ms), accuracy(m)].

import { STOP_RADIUS_M, STOP_MIN_MS } from './tripConfig';

const toRad = (d) => (d * Math.PI) / 180;

export const haversineMeters = (a, b) => {
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 6371000 * 2 * Math.asin(Math.sqrt(h));
};

const P = (point) => ({ lat: point[0], lon: point[1] });
const dist = (p, q) => haversineMeters(P(p), P(q));

// Fastest believable speed (metres per second). Faster jumps are GPS glitches.
const MAX_SPEED = { flight: 350, train: 90, car: 70, bus: 60, bike: 60, walk: 15 };

// Removes bad points: poor accuracy and impossible jumps
export const cleanPoints = (points, mode = 'car') => {
  const limit = MAX_SPEED[mode] || 70;
  const result = [];

  points.forEach((point) => {
    if (point[3] && point[3] > 150) return;
    const last = result[result.length - 1];
    if (last) {
      const seconds = Math.max(1, (point[2] - last[2]) / 1000);
      if (dist(last, point) / seconds > limit) return;
    }
    result.push(point);
  });

  return result;
};

// Distance in kilometres. Small GPS shaking while standing still is ignored.
export const totalDistanceKm = (points) => {
  let meters = 0;
  let anchor = points[0];
  for (let i = 1; i < points.length; i++) {
    const d = dist(anchor, points[i]);
    if (d >= 10) {
      meters += d;
      anchor = points[i];
    }
  }
  return meters / 1000;
};

// A stop = staying inside a small circle for a long time.
// (The phone sends no points while it stands still, so a long time gap between two nearby points is a stop too.)
export const detectStops = (points, { radiusM = STOP_RADIUS_M, minMs = STOP_MIN_MS } = {}) => {
  const stops = [];
  let i = 0;

  while (i < points.length) {
    let j = i;
    while (j + 1 < points.length && dist(points[i], points[j + 1]) <= radiusM) j++;

    if (points[j][2] - points[i][2] >= minMs) {
      const slice = points.slice(i, j + 1);
      stops.push({
        lat: slice.reduce((sum, p) => sum + p[0], 0) / slice.length,
        lon: slice.reduce((sum, p) => sum + p[1], 0) / slice.length,
        startT: points[i][2],
        endT: points[j][2],
        durationMs: points[j][2] - points[i][2],
      });
      i = j + 1;
    } else {
      i++;
    }
  }

  return stops;
};

// Keeps the shape of the route with fewer points (Ramer-Douglas-Peucker)
const perpendicularMeters = (p, a, b) => {
  const lat0 = toRad(a[0]);
  const x = (q) => toRad(q[1]) * Math.cos(lat0) * 6371000;
  const y = (q) => toRad(q[0]) * 6371000;
  const ax = x(a), ay = y(a), bx = x(b), by = y(b), px = x(p), py = y(p);
  const dx = bx - ax, dy = by - ay;
  const lengthSq = dx * dx + dy * dy;
  if (lengthSq === 0) return Math.hypot(px - ax, py - ay);
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lengthSq));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
};

const rdp = (points, epsilon) => {
  if (points.length < 3) return points;
  const keep = new Array(points.length).fill(false);
  keep[0] = keep[points.length - 1] = true;
  const stack = [[0, points.length - 1]];

  while (stack.length) {
    const [start, end] = stack.pop();
    let maxD = 0;
    let index = -1;
    for (let i = start + 1; i < end; i++) {
      const d = perpendicularMeters(points[i], points[start], points[end]);
      if (d > maxD) {
        maxD = d;
        index = i;
      }
    }
    if (maxD > epsilon && index !== -1) {
      keep[index] = true;
      stack.push([start, index], [index, end]);
    }
  }

  return points.filter((_, i) => keep[i]);
};

export const simplifyPath = (points, maxPoints = 400) => {
  if (points.length <= maxPoints) return points;
  let epsilon = 5;
  let result = rdp(points, epsilon);
  while (result.length > maxPoints && epsilon < 5000) {
    epsilon *= 1.6;
    result = rdp(points, epsilon);
  }
  return result;
};

// ---------- Texts ----------
export const formatDuration = (ms) => {
  const totalMinutes = Math.max(0, Math.round(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} min`;
  return minutes === 0 ? `${hours} h` : `${hours} h ${minutes} min`;
};

export const formatKm = (km) => (km < 10 ? `${km.toFixed(1)} km` : `${Math.round(km)} km`);

export const formatClock = (ms) => {
  const d = new Date(ms);
  const h = d.getHours();
  return `${h % 12 || 12}:${String(d.getMinutes()).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};

// Bounding box of a route: [[minLon, minLat], [maxLon, maxLat]]
export const boundsOf = (points) => {
  let minLat = 90, maxLat = -90, minLon = 180, maxLon = -180;
  points.forEach((p) => {
    minLat = Math.min(minLat, p[0]);
    maxLat = Math.max(maxLat, p[0]);
    minLon = Math.min(minLon, p[1]);
    maxLon = Math.max(maxLon, p[1]);
  });
  return [[minLon, minLat], [maxLon, maxLat]];
};
