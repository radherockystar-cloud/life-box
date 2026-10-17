// Photo, video aur audio ko IndexedDB mein rakhta hai.
// localStorage sirf ~5 MB ka hota hai, IndexedDB mein kai GB aa jaate hain.
// Item (title, date, tag...) appStorage (appStorage.js) mein rehta hai, bas uske saath
// mediaKey / audioKey likha hota hai jisse IndexedDB se asli file milti hai.
// Cloud sync (cloudSync.js) bhi isi store se media uthata / rakhta hai.

import { appStorage, initAppStorage, isAppStorageReady } from './appStorage';

const DB_NAME = 'lifebox_media';
const DB_VERSION = 1;
export const STORES = { media: 'media', snapshot: 'snapshot_media', meta: 'meta' };

const MIGRATE_KEYS = ['newlife_vault', 'newlife_bin'];
const BIN_KEY = 'newlife_bin';
const OLD_SLOT_KEY = 'newlife_system_backup_slot'; // purana internal backup (pehle localStorage mein tha)
export const SNAPSHOT_META_KEY = 'system_backup_slot';
const BIN_KEEP_MS = 7 * 24 * 60 * 60 * 1000; // BinManager jaisa 7 din
const ORPHAN_MIN_AGE_MS = 24 * 60 * 60 * 1000;
const MEDIA_ID_RE = /m_[a-z0-9]+_[a-z0-9]+/g;

// ---------------------------------------------------------------- storage backend
const openDb = () =>
  new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not available'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      Object.values(STORES).forEach((name) => {
        if (!db.objectStoreNames.contains(name)) db.createObjectStore(name);
      });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('IndexedDB open failed'));
    req.onblocked = () => reject(new Error('IndexedDB blocked'));
  });

const runTx = (db, store, mode, work) =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction(store, mode);
    const request = work(transaction.objectStore(store));
    let result;
    if (request) request.onsuccess = () => { result = request.result; };
    transaction.oncomplete = () => resolve(result);
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error || new Error('IndexedDB transaction aborted'));
  });

const makeIdbBackend = (db) => ({
  get: (store, key) => runTx(db, store, 'readonly', (os) => os.get(key)),
  put: (store, key, value) => runTx(db, store, 'readwrite', (os) => os.put(value, key)),
  del: (store, key) => runTx(db, store, 'readwrite', (os) => os.delete(key)),
  keys: (store) => runTx(db, store, 'readonly', (os) => os.getAllKeys()),
});

// Test ke liye (memory mein)
export const createMemoryBackend = () => {
  const stores = {};
  const s = (name) => {
    if (!stores[name]) stores[name] = new Map();
    return stores[name];
  };
  return {
    get: async (store, key) => s(store).get(key),
    put: async (store, key, value) => { s(store).set(key, value); },
    del: async (store, key) => { s(store).delete(key); },
    keys: async (store) => [...s(store).keys()],
  };
};

let backendPromise = null;
const getBackend = () => {
  if (!backendPromise) {
    backendPromise = openDb().then(makeIdbBackend);
    backendPromise.catch(() => { backendPromise = null; }); // agli baar dobara koshish
  }
  return backendPromise;
};
export const __setBackendForTests = (backend) => { backendPromise = Promise.resolve(backend); };

export async function isMediaStoreAvailable() {
  try {
    await getBackend();
    return true;
  } catch (e) {
    return false;
  }
}

// ---------------------------------------------------------------- helpers
export const newMediaId = () => `m_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8).padEnd(6, '0')}`;
export const isDataUrl = (v) => typeof v === 'string' && v.startsWith('data:');
export const mediaKeysOf = (item) => [item && item.mediaKey, item && item.audioKey].filter(Boolean);

export const dataUrlToBlob = (dataUrl) => {
  const comma = dataUrl.indexOf(',');
  const header = dataUrl.slice(5, comma);
  const isBase64 = /;base64$/i.test(header);
  const type = header.replace(/;base64$/i, '') || 'application/octet-stream';
  const payload = dataUrl.slice(comma + 1);
  if (!isBase64) return new Blob([decodeURIComponent(payload)], { type });
  const bin = atob(payload);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type });
};

export const blobToDataUrl = async (blob) => {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let bin = '';
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
  return `data:${blob.type || 'application/octet-stream'};base64,${btoa(bin)}`;
};

// ---------------------------------------------------------------- media (photo / video / audio)
export async function saveMedia(blob, id = newMediaId(), store = STORES.media) {
  const b = await getBackend();
  await b.put(store, id, { blob, type: blob.type || '', size: blob.size || 0, createdAt: Date.now() });
  return id;
}

export async function getMediaRecord(id, store = STORES.media) {
  if (!id) return null;
  const b = await getBackend();
  return (await b.get(store, id)) || null;
}

export async function getMediaBlob(id, store = STORES.media) {
  const rec = await getMediaRecord(id, store);
  return rec && rec.blob ? rec.blob : null;
}

export async function listMediaIds(store = STORES.media) {
  const b = await getBackend();
  return (await b.keys(store)) || [];
}

const urlCache = new Map();

// <img>/<video>/<audio> ke liye chalne wala address
export async function getMediaUrl(id) {
  if (!id) return '';
  if (urlCache.has(id)) return urlCache.get(id);
  const blob = await getMediaBlob(id);
  if (!blob) return '';
  const url = URL.createObjectURL(blob);
  urlCache.set(id, url);
  return url;
}

export async function deleteMedia(id, store = STORES.media) {
  if (!id) return;
  if (store === STORES.media && urlCache.has(id)) {
    try { URL.revokeObjectURL(urlCache.get(id)); } catch (e) { /* ignore */ }
    urlCache.delete(id);
  }
  const b = await getBackend();
  await b.del(store, id);
}

export async function deleteItemMedia(item) {
  for (const id of mediaKeysOf(item)) {
    try { await deleteMedia(id); } catch (e) { console.warn('Could not delete media', id, e); }
  }
}

// ---------------------------------------------------------------- meta (internal backup ka data)
export async function putMeta(key, value) {
  const b = await getBackend();
  await b.put(STORES.meta, key, value);
}
export async function getMeta(key) {
  const b = await getBackend();
  return (await b.get(STORES.meta, key)) || null;
}
export async function deleteMeta(key) {
  const b = await getBackend();
  await b.del(STORES.meta, key);
}

// Logout par is device se saari photo/video/audio (aur internal backup ki copy) hatao
export async function clearAllMedia() {
  for (const store of [STORES.media, STORES.snapshot]) {
    for (const id of await listMediaIds(store)) await deleteMedia(id, store);
  }
  await deleteMeta(SNAPSHOT_META_KEY);
  urlCache.forEach((url) => { try { URL.revokeObjectURL(url); } catch (e) { /* ignore */ } });
  urlCache.clear();
}

// ---------------------------------------------------------------- purani photo/voice ko IndexedDB mein le jao
const MEDIA_FIELDS = [
  ['mediaUrl', 'mediaKey'],
  ['audioUrl', 'audioKey'],
];

// Items ke andar ke data: address ko IndexedDB mein daalkar mediaKey/audioKey bana deta hai
export async function externalizeItems(items, store = STORES.media, collectIds = []) {
  let changed = false;
  const out = [];
  for (const item of items) {
    if (!item || typeof item !== 'object') {
      out.push(item);
      continue;
    }
    let next = item;
    for (const [urlField, keyField] of MEDIA_FIELDS) {
      if (isDataUrl(next[urlField])) {
        const id = newMediaId();
        await saveMedia(dataUrlToBlob(next[urlField]), id, store);
        const rest = { ...next };
        delete rest[urlField];
        next = { ...rest, [keyField]: id };
        collectIds.push(id);
        changed = true;
      }
    }
    out.push(next);
  }
  return { items: out, changed };
}

async function migrateOldSnapshot() {
  const raw = appStorage.getItem(OLD_SLOT_KEY);
  if (!raw) return false;

  if (await getMeta(SNAPSHOT_META_KEY)) {
    appStorage.removeItem(OLD_SLOT_KEY); // naya snapshot pehle se hai
    return true;
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    return false; // kharab hai: chhedo mat
  }
  if (!parsed || !parsed.data || typeof parsed.data !== 'object') return false;

  const data = { ...parsed.data };
  const mediaIds = [];
  for (const key of MIGRATE_KEYS) {
    if (typeof data[key] !== 'string') continue;
    let list;
    try { list = JSON.parse(data[key]); } catch (e) { continue; }
    if (!Array.isArray(list)) continue;
    const { items, changed } = await externalizeItems(list, STORES.snapshot, mediaIds);
    if (changed) data[key] = JSON.stringify(items);
  }
  await putMeta(SNAPSHOT_META_KEY, { format: 'newlife-backup', version: 3, exportDate: parsed.exportDate || new Date().toISOString(), data, mediaIds });
  appStorage.removeItem(OLD_SLOT_KEY); // naya snapshot likha ja chuka hai, ab purana hata sakte hain
  return true;
}

export async function migrateLocalStorageMedia() {
  let moved = 0;
  for (const key of MIGRATE_KEYS) {
    let list;
    try { list = JSON.parse(appStorage.getItem(key) || 'null'); } catch (e) { continue; }
    if (!Array.isArray(list)) continue;
    if (!list.some((it) => it && (isDataUrl(it.mediaUrl) || isDataUrl(it.audioUrl)))) continue;
    const { items, changed } = await externalizeItems(list);
    // Pehle saari files IndexedDB mein gayi, tabhi list badalte hain (beech mein kuch bigde to data safe)
    if (changed) {
      appStorage.setItem(key, JSON.stringify(items));
      moved += 1;
    }
  }
  await migrateOldSnapshot();
  return moved;
}

// ---------------------------------------------------------------- safai
// 7 din purane Bin items ka media bhi hatao (BinManager sirf Bin kholne par hatata tha)
export async function purgeExpiredBin() {
  let list;
  try { list = JSON.parse(appStorage.getItem(BIN_KEY) || '[]'); } catch (e) { return 0; }
  if (!Array.isArray(list)) return 0;
  const now = Date.now();
  const keep = [];
  const gone = [];
  list.forEach((it) => {
    if (it && it.deletedTs && now - it.deletedTs >= BIN_KEEP_MS) gone.push(it);
    else keep.push(it);
  });
  if (gone.length === 0) return 0;
  for (const it of gone) await deleteItemMedia(it);
  appStorage.setItem(BIN_KEY, JSON.stringify(keep));
  return gone.length;
}

// Jis media ka koi item nahi bacha (aur wo 1 din se purana hai) use hatao
export async function cleanupOrphans() {
  // Data abhi memory me nahi aaya ho to kuch bhi mat hatao (warna sab media "bina item ka" lagega)
  if (!isAppStorageReady()) return 0;
  const ids = await listMediaIds();
  if (ids.length === 0) return 0;
  const referenced = new Set();
  for (let i = 0; i < appStorage.length; i++) {
    const k = appStorage.key(i);
    const v = k ? appStorage.getItem(k) : null;
    if (typeof v !== 'string') continue;
    (v.match(MEDIA_ID_RE) || []).forEach((m) => referenced.add(m));
  }
  let removed = 0;
  for (const id of ids) {
    if (referenced.has(id)) continue;
    const rec = await getMediaRecord(id);
    if (rec && Date.now() - (rec.createdAt || 0) < ORPHAN_MIN_AGE_MS) continue;
    await deleteMedia(id);
    removed += 1;
  }
  return removed;
}

// App khulne se pehle ek baar chalta hai (main.jsx)
export async function runStartupMediaSetup() {
  await initAppStorage(); // pehle text data memory me aana chahiye
  try {
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); // Android storage kam hone par bhi data na hataye
  } catch (e) { /* ignore */ }

  try { await migrateLocalStorageMedia(); } catch (e) { console.warn('Media migration failed:', e); }
  try { await purgeExpiredBin(); } catch (e) { console.warn('Bin cleanup failed:', e); }
  try { await cleanupOrphans(); } catch (e) { console.warn('Media cleanup failed:', e); }
}

export const needsMediaMigration = () => {
  try {
    return MIGRATE_KEYS.some((k) => (appStorage.getItem(k) || '').includes('"data:')) || !!appStorage.getItem(OLD_SLOT_KEY);
  } catch (e) {
    return false;
  }
};
