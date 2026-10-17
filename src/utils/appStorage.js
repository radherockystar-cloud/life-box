// App ka saara text data (notes, memories, plans, settings...) yahan IndexedDB me rehta hai.
//
// API bilkul localStorage jaisi hai (getItem / setItem / removeItem / key / length / clear),
// isliye screens me bas `localStorage` ki jagah `appStorage` likhna hai.
//
// Kaise chalta hai:
//  - App khulte hi initAppStorage() IndexedDB ka sara data memory me le aata hai (main.jsx me await karo).
//  - Uske baad getItem turant (synchronous) chalta hai, jaise localStorage.
//  - setItem memory me turant likhta hai aur IndexedDB me peeche se (batch me) save karta hai.
//  - Pehli baar purani localStorage ka data apne aap IndexedDB me copy ho jata hai (migration).
//    Purani localStorage ko delete nahi kiya jata, wo safety copy ke roop me pada rehta hai.
//  - IndexedDB na chale (private mode wagairah) to ye chupchap localStorage par gir jata hai.

const DB_NAME = 'lifebox_data';
const DB_VERSION = 1;
const KV = 'kv';
const META = 'meta';
const MIGRATED_META = 'migrated_from_localstorage';
const LS_META_PREFIX = '__meta_';

// In keys ko kabhi nahi chhedte: Firebase login aur Capacitor ki apni keys localStorage me hi rehni chahiye.
const SKIP_PREFIXES = ['firebase', 'Capacitor', 'capacitor', LS_META_PREFIX];
const isSkipped = (key) => SKIP_PREFIXES.some((p) => key.startsWith(p));

let db = null;
let ready = false;
let useLocal = false; // IndexedDB na mile to localStorage
let readyPromise = null;
let clearedBeforeReady = false;
let keyList = null;
let scheduled = false;
let writeChain = Promise.resolve();

const cache = new Map();
const touched = new Set(); // ready hone se pehle likhi gayi keys (IndexedDB wala purana data inhe overwrite na kare)
const pendingOps = []; // ready hone se pehle ke writes
const queued = []; // batch me likhne ke liye
const listeners = new Set();

// ---------------------------------------------------------------- localStorage helpers (migration / fallback)
const lsGet = (key) => {
  try { return typeof localStorage === 'undefined' ? null : localStorage.getItem(key); } catch { return null; }
};
const lsOps = (ops) => {
  if (typeof localStorage === 'undefined') return;
  for (const op of ops) {
    if (op.type === 'put') localStorage.setItem(op.key, op.value);
    else if (op.type === 'del') localStorage.removeItem(op.key);
    else if (op.type === 'clear') {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && !isSkipped(k)) keys.push(k);
      }
      keys.forEach((k) => localStorage.removeItem(k));
    }
  }
};

// ---------------------------------------------------------------- IndexedDB
const openDb = () =>
  new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not available'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const d = req.result;
      if (!d.objectStoreNames.contains(KV)) d.createObjectStore(KV);
      if (!d.objectStoreNames.contains(META)) d.createObjectStore(META);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('IndexedDB open failed'));
    req.onblocked = () => reject(new Error('IndexedDB blocked'));
  });

const runOps = (database, ops) =>
  new Promise((resolve, reject) => {
    const tx = database.transaction(KV, 'readwrite');
    const os = tx.objectStore(KV);
    for (const op of ops) {
      if (op.type === 'put') os.put(op.value, op.key);
      else if (op.type === 'del') os.delete(op.key);
      else if (op.type === 'clear') os.clear();
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error || new Error('IndexedDB transaction aborted'));
  });

const readAll = (database) =>
  new Promise((resolve, reject) => {
    const tx = database.transaction(KV, 'readonly');
    const os = tx.objectStore(KV);
    const keysReq = os.getAllKeys();
    const valsReq = os.getAll();
    tx.oncomplete = () => resolve(keysReq.result.map((k, i) => [k, valsReq.result[i]]));
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error || new Error('IndexedDB transaction aborted'));
  });

const metaTx = (mode, work) =>
  new Promise((resolve, reject) => {
    const tx = db.transaction(META, mode);
    const req = work(tx.objectStore(META));
    let result;
    if (req) req.onsuccess = () => { result = req.result; };
    tx.oncomplete = () => resolve(result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error || new Error('IndexedDB transaction aborted'));
  });

// ---------------------------------------------------------------- writes
function drain() {
  scheduled = false;
  const ops = queued.splice(0);
  if (!ops.length || !db) return;
  writeChain = writeChain
    .then(() => runOps(db, ops))
    .catch((e) => console.warn('appStorage: IndexedDB write failed', e));
}

function persist(...ops) {
  if (!ops.length) return;
  if (useLocal) { lsOps(ops); return; }
  if (!db) { pendingOps.push(...ops); return; }
  queued.push(...ops);
  if (!scheduled) {
    scheduled = true;
    queueMicrotask(drain);
  }
}

const emit = (event) => {
  listeners.forEach((fn) => {
    try { fn(event); } catch (e) { console.warn('appStorage listener failed', e); }
  });
};

// ---------------------------------------------------------------- start
function hydrateFromLocalStorage() {
  if (typeof localStorage === 'undefined') return;
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k || isSkipped(k) || touched.has(k)) continue;
    const v = lsGet(k);
    if (typeof v === 'string') cache.set(k, v);
  }
}

async function migrateFromLocalStorage() {
  const ops = [];
  if (typeof localStorage !== 'undefined') {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || isSkipped(k) || cache.has(k) || touched.has(k)) continue;
      const v = lsGet(k);
      if (typeof v !== 'string') continue;
      cache.set(k, v);
      ops.push({ type: 'put', key: k, value: v });
    }
  }
  if (ops.length) await runOps(db, ops);
  await metaTx('readwrite', (os) => os.put(Date.now(), MIGRATED_META));
}

async function doInit() {
  try {
    db = await openDb();
    if (!clearedBeforeReady) {
      const rows = await readAll(db);
      rows.forEach(([k, v]) => {
        if (typeof k === 'string' && typeof v === 'string' && !touched.has(k)) cache.set(k, v);
      });
    }
    const migrated = await metaTx('readonly', (os) => os.get(MIGRATED_META));
    if (!migrated) await migrateFromLocalStorage();
    if (pendingOps.length) await runOps(db, pendingOps.splice(0));
  } catch (e) {
    console.warn('appStorage: IndexedDB nahi chala, localStorage use ho raha hai', e);
    db = null;
    useLocal = true;
    hydrateFromLocalStorage();
    if (pendingOps.length) {
      try { lsOps(pendingOps.splice(0)); } catch { /* storage full */ }
    }
  }
  keyList = null;
  ready = true;
  return !useLocal;
}

// App ke data ko memory me lao. main.jsx me app dikhane se pehle ek baar await karo.
export function initAppStorage() {
  if (!readyPromise) readyPromise = doInit();
  return readyPromise;
}

export const isAppStorageReady = () => ready;
export const isUsingFallback = () => useLocal;

// Sab pending writes IndexedDB me pahunchne tak ruko (sync / backup se pehle bulao)
export async function flushAppStorage() {
  await initAppStorage();
  if (queued.length) drain();
  await writeChain;
}

// ---------------------------------------------------------------- localStorage jaisa API
export const appStorage = {
  getItem(key) {
    const k = String(key);
    if (cache.has(k)) return cache.get(k);
    if (useLocal) return lsGet(k);
    // Ready hone se pehle purana localStorage ka data dikha do, taaki screen khali na dikhe
    if (!ready && !touched.has(k) && !clearedBeforeReady) return lsGet(k);
    return null;
  },

  setItem(key, value, { silent = false } = {}) {
    const k = String(key);
    const v = String(value);
    if (cache.get(k) === v) return;
    const had = cache.has(k);
    const prev = cache.get(k);
    cache.set(k, v);
    keyList = null;
    if (!ready) touched.add(k);
    if (useLocal) {
      try {
        lsOps([{ type: 'put', key: k, value: v }]);
      } catch (e) { // localStorage bhar gayi: pehle jaisa error do taaki caller false/alert dikha sake
        if (had) cache.set(k, prev); else cache.delete(k);
        keyList = null;
        throw e;
      }
    } else {
      persist({ type: 'put', key: k, value: v });
    }
    emit({ type: 'set', key: k, silent });
  },

  removeItem(key, { silent = false } = {}) {
    const k = String(key);
    if (!cache.has(k)) {
      if (!ready) { touched.add(k); persist({ type: 'del', key: k }); }
      return;
    }
    cache.delete(k);
    keyList = null;
    if (!ready) touched.add(k);
    persist({ type: 'del', key: k });
    emit({ type: 'remove', key: k, silent });
  },

  clear({ silent = false } = {}) {
    cache.clear();
    keyList = null;
    if (!ready) clearedBeforeReady = true;
    persist({ type: 'clear' });
    emit({ type: 'clear', silent });
  },

  key(i) {
    if (!keyList) keyList = [...cache.keys()];
    return keyList[i] ?? null;
  },

  get length() {
    return cache.size;
  },

  keys() {
    return [...cache.keys()];
  },

  entries() {
    return [...cache.entries()];
  },

  // Poora data badlo (cloud se aaya data lagane ke liye). keep(key) true ho to us key ko nahi chhedta.
  // Ye "silent" hai: sync ko ye local badlav nahi lagta.
  replaceAll(map, { keep = () => false } = {}) {
    const ops = [];
    for (const k of [...cache.keys()]) {
      if (!keep(k) && !(k in map)) {
        cache.delete(k);
        ops.push({ type: 'del', key: k });
      }
    }
    for (const [k, v] of Object.entries(map)) {
      if (typeof v !== 'string') continue;
      if (cache.get(k) !== v) {
        cache.set(k, v);
        ops.push({ type: 'put', key: k, value: v });
      }
      if (!ready) touched.add(k);
    }
    keyList = null;
    persist(...ops);
    emit({ type: 'replace', silent: true });
  },

  // Badlav sunne ke liye. fn({ type, key, silent }). Wapas unsubscribe function milta hai.
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};

// ---------------------------------------------------------------- meta (sync ki bookkeeping; backup me nahi jaata)
export async function getMeta(key) {
  await initAppStorage();
  if (useLocal || !db) {
    const raw = lsGet(LS_META_PREFIX + key);
    if (raw === null || raw === undefined) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }
  const v = await metaTx('readonly', (os) => os.get(key));
  return v === undefined ? null : v;
}

export async function setMeta(key, value) {
  await initAppStorage();
  if (useLocal || !db) {
    try { localStorage.setItem(LS_META_PREFIX + key, JSON.stringify(value)); } catch { /* ignore */ }
    return;
  }
  await metaTx('readwrite', (os) => os.put(value, key));
}

export async function delMeta(key) {
  await initAppStorage();
  if (useLocal || !db) {
    try { localStorage.removeItem(LS_META_PREFIX + key); } catch { /* ignore */ }
    return;
  }
  await metaTx('readwrite', (os) => os.delete(key));
}

// Sirf tests ke liye: sab kuch shuru se
export function __resetAppStorageForTests() {
  db = null; ready = false; useLocal = false; readyPromise = null; clearedBeforeReady = false;
  keyList = null; scheduled = false; writeChain = Promise.resolve();
  cache.clear(); touched.clear(); pendingOps.length = 0; queued.length = 0; listeners.clear();
}

export default appStorage;
