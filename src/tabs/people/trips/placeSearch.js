// Finds real places (cities, villages, stations, airports, tourist spots ...) while the person types.
// Uses Photon, a free search service built on OpenStreetMap data: https://photon.komoot.io
// It is free and needs no key, but it asks users to be fair (about 1 request per second) and
// gives no guarantee of availability. The search below waits between requests to stay polite.
// If the app grows a lot, replace PHOTON_URL with a paid / own server. Nothing else changes.

const PHOTON_URL = 'https://photon.komoot.io/api/';
export const PHOTON_REVERSE_URL = 'https://photon.komoot.io/reverse';

// Prefer places in India first (other countries still work). Set to false to switch this off.
const PREFER_INDIA = true;

const MIN_GAP_MS = 1000;

// ---------- What counts as a "place" (streets, shops and houses are left out) ----------
const AMENITY_OK = ['bus_station', 'ferry_terminal', 'place_of_worship', 'university', 'college', 'hospital', 'marketplace'];
const LEISURE_OK = ['park', 'nature_reserve', 'garden', 'beach_resort', 'stadium'];

const isTravelPlace = (key, value) => {
  switch (key) {
    case 'place':
    case 'boundary':
    case 'tourism':
    case 'natural':
    case 'historic':
      return true;
    case 'railway':
      return ['station', 'halt'].includes(value);
    case 'aeroway':
      return ['aerodrome', 'terminal'].includes(value);
    case 'amenity':
      return AMENITY_OK.includes(value);
    case 'leisure':
      return LEISURE_OK.includes(value);
    default:
      return false;
  }
};

const kindEmoji = (key, value) => {
  if (key === 'railway') return '🚉';
  if (key === 'aeroway') return '✈️';
  if (key === 'amenity' && value === 'bus_station') return '🚌';
  if (key === 'amenity' && value === 'ferry_terminal') return '⛴️';
  if (key === 'amenity' && value === 'place_of_worship') return '🛕';
  if (key === 'tourism' || key === 'natural' || key === 'historic' || key === 'leisure') return '🏞️';
  if (key === 'boundary' || (key === 'place' && ['state', 'region', 'country', 'county', 'district'].includes(value))) return '🗺️';
  if (key === 'place' && ['city', 'town'].includes(value)) return '🏙️';
  if (key === 'place') return '🏘️';
  return '📍';
};

// ---------- Photon result -> our place ----------
const toPlace = (feature) => {
  const p = feature && feature.properties;
  const coords = feature && feature.geometry && feature.geometry.coordinates;
  if (!p || !p.name || !coords || coords.length < 2) return null;
  if (p.housenumber || !isTravelPlace(p.osm_key, p.osm_value)) return null;

  const [lon, lat] = coords;
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

  const seen = new Set([p.name.toLowerCase()]);
  const context = [p.city, p.district, p.county, p.state, p.country].filter((part) => {
    if (!part) return false;
    const key = String(part).toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return {
    name: p.name,
    label: [p.name, ...context].join(', '), // e.g. "Rampur, Moradabad, Uttar Pradesh, India"
    context: context.join(', '),
    lat: Math.round(lat * 100000) / 100000,
    lon: Math.round(lon * 100000) / 100000,
    kind: kindEmoji(p.osm_key, p.osm_value),
  };
};

// ---------- Search ----------
const cache = new Map();
let lastRequestAt = 0;

const waitTurn = (signal) =>
  new Promise((resolve, reject) => {
    const wait = Math.max(0, lastRequestAt + MIN_GAP_MS - Date.now());
    const timer = setTimeout(resolve, wait);
    if (signal) {
      signal.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(Object.assign(new Error('aborted'), { name: 'AbortError' }));
      });
    }
  });

// One polite request to Photon (waits its turn). Also used to find the name of a stop.
export const photonGet = async (url, signal) => {
  await waitTurn(signal);
  lastRequestAt = Date.now();
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Place service failed (${response.status})`);
  return response.json();
};

export const searchPlaces = async (query, signal) => {
  const text = query.trim();
  const cacheKey = text.toLowerCase();
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  let url = `${PHOTON_URL}?q=${encodeURIComponent(text)}&limit=15&lang=en`;
  if (PREFER_INDIA) url += '&lat=22.5&lon=79&zoom=4&location_bias_scale=0.3';

  const data = await photonGet(url, signal);

  const unique = new Set();
  const places = (data.features || [])
    .map(toPlace)
    .filter((place) => {
      if (!place) return false;
      const key = `${place.label}|${place.lat.toFixed(2)}|${place.lon.toFixed(2)}`;
      if (unique.has(key)) return false;
      unique.add(key);
      return true;
    })
    .slice(0, 6);

  cache.set(cacheKey, places);
  return places;
};

// The small object we keep inside a trip
export const slimPlace = (place) => ({ name: place.name, label: place.label, lat: place.lat, lon: place.lon, kind: place.kind });

// Distance between two places in kilometres
export const distanceKm = (a, b) => {
  const rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
};
