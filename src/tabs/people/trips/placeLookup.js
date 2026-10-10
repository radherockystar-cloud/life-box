// Two lookups used while a trip is recorded:
//   reverseGeocode  -> the name of a place from its coordinates (for the start, the stops and the end)
//   findFamousNear  -> really famous places near a point (from Wikipedia)
// Both are free and need internet. If there is no internet they just fail quietly and the story uses simple names.

import { PHOTON_REVERSE_URL, photonGet } from './placeSearch';
import { FAMOUS_MIN_LANGS } from './tripConfig';

const WIKI_API = 'https://en.wikipedia.org/w/api.php';

// A signal that cancels a request after a few seconds
export const abortAfter = (ms) => {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
};

// ---------- Name of a place from coordinates ----------
const reverseCache = new Map();

export const reverseGeocode = async (lat, lon, signal) => {
  const key = `${lat.toFixed(3)},${lon.toFixed(3)}`;
  if (reverseCache.has(key)) return reverseCache.get(key);

  const data = await photonGet(`${PHOTON_REVERSE_URL}?lon=${lon}&lat=${lat}&lang=en&limit=1`, signal);
  const p = data && data.features && data.features[0] && data.features[0].properties;
  if (!p) return null;

  const name = p.name || p.street || p.city || p.district || p.county || p.state;
  if (!name) return null;

  const seen = new Set([name.toLowerCase()]);
  const context = [p.street, p.city, p.district, p.county, p.state].filter((part) => {
    if (!part) return false;
    const k = String(part).toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  const place = { name, label: [name, ...context.slice(0, 2)].join(', '), lat, lon };
  reverseCache.set(key, place);
  return place;
};

// ---------- Famous places ----------
const wikiGet = async (params, signal) => {
  const url = `${WIKI_API}?${new URLSearchParams({ ...params, format: 'json', origin: '*' })}`;
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Wikipedia failed (${response.status})`);
  return response.json();
};

// In how many languages does each page exist? A place known all over the world has many.
const countLanguages = async (pageIds, signal) => {
  const counts = {};
  let more = {};

  for (let round = 0; round < 4; round++) {
    const data = await wikiGet({ action: 'query', prop: 'langlinks', lllimit: '500', pageids: pageIds.join('|'), ...more }, signal);
    Object.values((data && data.query && data.query.pages) || {}).forEach((page) => {
      counts[page.pageid] = (counts[page.pageid] || 0) + (page.langlinks ? page.langlinks.length : 0);
    });
    if (!data.continue) break;
    more = data.continue;
  }

  return counts;
};

const famousCache = new Map();

// Returns up to 3 really famous places within a few km, best known first:
//   [{ title, extract, lat, lon, langs, dist, url }]
export const findFamousNear = async (lat, lon, { radiusM = 4000, signal } = {}) => {
  const key = `${lat.toFixed(2)},${lon.toFixed(2)}`;
  if (famousCache.has(key)) return famousCache.get(key);

  const geo = await wikiGet({ action: 'query', list: 'geosearch', gscoord: `${lat}|${lon}`, gsradius: String(radiusM), gslimit: '12' }, signal);
  const nearby = (geo && geo.query && geo.query.geosearch) || [];

  if (nearby.length === 0) {
    famousCache.set(key, []);
    return [];
  }

  const langs = await countLanguages(nearby.map((n) => n.pageid), signal);

  const famous = nearby
    .map((n) => ({ pageid: n.pageid, title: n.title, lat: n.lat, lon: n.lon, dist: n.dist, langs: langs[n.pageid] || 0 }))
    .filter((n) => n.langs >= FAMOUS_MIN_LANGS)
    .sort((a, b) => b.langs - a.langs)
    .slice(0, 3);

  if (famous.length > 0) {
    try {
      const info = await wikiGet(
        { action: 'query', prop: 'extracts', exintro: '1', explaintext: '1', exsentences: '1', redirects: '1', pageids: famous.map((f) => f.pageid).join('|') },
        signal
      );
      const pages = (info && info.query && info.query.pages) || {};
      famous.forEach((f) => {
        f.extract = (pages[f.pageid] && pages[f.pageid].extract) || '';
      });
    } catch {
      // the description is optional
    }
  }

  const result = famous.map((f) => ({
    title: f.title,
    extract: f.extract || '',
    lat: f.lat,
    lon: f.lon,
    langs: f.langs,
    dist: f.dist,
    url: `https://en.wikipedia.org/wiki/${encodeURIComponent(f.title.replace(/ /g, '_'))}`,
  }));

  famousCache.set(key, result);
  return result;
};
