// Login ke baad data ko Firebase Storage se jodta hai.
//
// Guest (bina login): data appStorage / IndexedDB me rehta hai, kuch upload nahi hota.
// Login hone par (useAuthProfile -> startCloudSync):
//   1. Cloud me kuch nahi hai      -> guest ka data cloud me upload (account ka ho jata hai)
//   2. Cloud me data hai, local khali -> cloud ka data utaro
//   3. Dono me data hai (guest + purana account) -> merge: list wali keys (jisme item.id hai) ka union,
//      baaki me cloud jeet-ta hai. Cloud ka data hi "main" hai.
// Uske baad har badlav 3 second ruk kar apne aap upload hota hai. IndexedDB ab sirf cache / offline copy hai.
//
// Cloud me layout:
//   users/{uid}/cloud/data.json          -> saari text keys + media ki list
//   users/{uid}/cloud/media/{mediaId}    -> photo / video / audio ki asli files
//
// Device ke apne settings (lock, passcode, theme, language, notification) cloud me nahi jaate.

import { appStorage, flushAppStorage, getMeta, setMeta, delMeta } from './appStorage';
import * as mediaStore from './mediaStore';

const FORMAT = 'lifebox-cloud';
const SYNC_DEBOUNCE_MS = 3000;

const META_OWNER = 'sync_owner'; // is device ka local data kis uid ka hai (null = guest)
const META_DIRTY = 'sync_dirty'; // local me aisa badlav hai jo cloud me nahi gaya
const META_VERSION = 'sync_remote_version'; // cloud ke jis version tak sync hua

// Ye keys sirf is device ki hain, cloud me nahi jaati
const LOCAL_ONLY_PREFIXES = [
  'firebase',
  'newlife_theme',
  'newlife_lang',
  'newlife_notif',
  'newlife_lock_enabled',
  'newlife_passcode',
  'newlife_system_backup_slot',
  'newlife_last_backup_time',
  'lifebox_user_profile',
];
export const isLocalOnly = (key) => LOCAL_ONLY_PREFIXES.some((p) => key.startsWith(p));

const manifestPath = (uid) => `users/${uid}/cloud/data.json`;
const mediaPath = (uid, id) => `users/${uid}/cloud/media/${id}`;
const mediaDir = (uid) => `users/${uid}/cloud/media`;

// ---------------------------------------------------------------- merge (pure function)
const parseList = (s) => {
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v : null;
  } catch {
    return null;
  }
};
const allHaveIds = (list) => list.every((it) => it && typeof it === 'object' && it.id !== undefined && it.id !== null);

// local = guest/device ka data, remote = cloud ka data. Cloud jeet-ta hai, lekin local ke naye items bach jaate hain.
export function mergeData(local, remote) {
  const out = { ...remote };
  for (const [key, lv] of Object.entries(local)) {
    if (!(key in remote)) {
      out[key] = lv;
      continue;
    }
    const rv = remote[key];
    if (lv === rv) continue;
    const ll = parseList(lv);
    const rl = parseList(rv);
    if (ll && rl && allHaveIds(ll) && allHaveIds(rl)) {
      const seen = new Set(rl.map((it) => String(it.id)));
      out[key] = JSON.stringify([...rl, ...ll.filter((it) => !seen.has(String(it.id)))]);
    }
    // warna cloud wali value rehti hai
  }
  return out;
}

// ---------------------------------------------------------------- engine (testable: saari cheezein bahar se aati hain)
export function createSyncEngine(deps) {
  const { storage, media, meta, remote, snapshot } = deps;
  let changeCounter = 0; // upload ke beech me badlav hua to dirty hi rehne do

  const collect = () => {
    const data = {};
    for (const [k, v] of storage.entries()) {
      if (typeof v === 'string' && !isLocalOnly(k)) data[k] = v;
    }
    return data;
  };

  async function markChanged() {
    changeCounter += 1;
    await meta.set(META_DIRTY, true);
  }

  async function downloadMissingMedia(uid, manifest) {
    const have = new Set(await media.list());
    for (const [id, info] of Object.entries(manifest.media || {})) {
      if (have.has(id)) continue;
      const blob = await remote.getBlob(mediaPath(uid, id), info && info.type);
      await media.save(blob, id);
    }
  }

  async function push(uid, data, remoteManifest) {
    const counterAtStart = changeCounter;
    const remoteMedia = (remoteManifest && remoteManifest.media) || {};
    const mediaMap = {};
    for (const id of await media.list()) {
      const rec = await media.getRecord(id);
      if (!rec || !rec.blob) continue;
      mediaMap[id] = { type: rec.type || rec.blob.type || '', size: rec.size || rec.blob.size || 0 };
      if (!remoteMedia[id]) await remote.putBlob(mediaPath(uid, id), rec.blob);
    }
    const manifest = {
      format: FORMAT,
      version: 1,
      updatedAt: Math.max(Date.now(), ((remoteManifest && remoteManifest.updatedAt) || 0) + 1),
      data,
      media: mediaMap,
    };
    // Manifest sabse aakhir me: tabhi cloud me naya version dikhta hai jab saari files pahunch chuki hon
    await remote.putJson(manifestPath(uid), manifest);
    for (const id of Object.keys(remoteMedia)) {
      if (!mediaMap[id]) {
        try { await remote.remove(mediaPath(uid, id)); } catch (e) { console.warn('cloud media delete failed', id, e); }
      }
    }
    await meta.set(META_OWNER, uid);
    await meta.set(META_VERSION, manifest.updatedAt);
    if (changeCounter === counterAtStart) await meta.set(META_DIRTY, false);
    return manifest;
  }

  async function applyRemote(uid, manifest) {
    await downloadMissingMedia(uid, manifest);
    const data = {};
    for (const [k, v] of Object.entries(manifest.data || {})) if (!isLocalOnly(k)) data[k] = v;
    storage.replaceAll(data, { keep: isLocalOnly });
    await storage.flush();
    await meta.set(META_OWNER, uid);
    await meta.set(META_VERSION, manifest.updatedAt);
    await meta.set(META_DIRTY, false);
  }

  async function wipeLocal() {
    storage.replaceAll({}, { keep: isLocalOnly });
    await media.clearAll();
    await storage.flush();
    await meta.del(META_OWNER);
    await meta.del(META_VERSION);
    await meta.set(META_DIRTY, false);
  }

  // Main kaam. Wapas { action, applied } deta hai. applied = cloud ka data local me laga (screens ko reload chahiye).
  async function sync(uid) {
    await storage.flush();
    let owner = await meta.get(META_OWNER);
    const dirty = !!(await meta.get(META_DIRTY));
    const lastVersion = await meta.get(META_VERSION);

    // Is device par kisi aur account ka data bacha hai: us account ka data naye account me nahi mila sakte
    if (owner && owner !== uid) {
      await wipeLocal();
      owner = null;
    }

    const remoteManifest = await remote.getJson(manifestPath(uid));
    const local = collect();
    const hasLocal = Object.keys(local).length > 0 || (await media.list()).length > 0;

    // 1. Cloud me kuch nahi
    if (!remoteManifest) {
      if (!hasLocal) {
        await meta.set(META_OWNER, uid);
        return { action: 'noop', applied: false };
      }
      await push(uid, local, null);
      return { action: 'pushed', applied: false };
    }

    // 2. Pehle se isi account ka data is device par hai
    if (owner === uid) {
      if (remoteManifest.updatedAt === lastVersion) {
        if (dirty) {
          await push(uid, local, remoteManifest);
          return { action: 'pushed', applied: false };
        }
        return { action: 'noop', applied: false };
      }
      if (!dirty) {
        await applyRemote(uid, remoteManifest);
        return { action: 'pulled', applied: true };
      }
      // dusre device ka badlav bhi aaya aur yahan bhi badlav tha: merge
    } else if (!hasLocal) {
      await applyRemote(uid, remoteManifest);
      return { action: 'pulled', applied: true };
    } else if (snapshot) {
      // Guest ka data + account ka cloud data: merge se pehle safety ke liye internal backup bana lo
      try { await snapshot(); } catch (e) { console.warn('internal snapshot failed', e); }
    }

    // 3. Merge
    const remoteData = {};
    for (const [k, v] of Object.entries(remoteManifest.data || {})) if (!isLocalOnly(k)) remoteData[k] = v;
    const merged = mergeData(local, remoteData);
    await downloadMissingMedia(uid, remoteManifest);
    storage.replaceAll(merged, { keep: isLocalOnly });
    await storage.flush();
    await push(uid, merged, remoteManifest);
    return { action: 'merged', applied: true };
  }

  // Logout se pehle: baaki badlav upload karo. true = sab cloud me hai (ab local data hata sakte hain)
  async function prepareLogout(uid) {
    const res = await sync(uid);
    const dirty = !!(await meta.get(META_DIRTY));
    return !dirty && !!res;
  }

  // Account delete: cloud ki saari files hatao; local data guest data ban jata hai
  async function deleteCloud(uid) {
    const paths = await remote.list(mediaDir(uid));
    for (const p of paths) await remote.remove(p);
    await remote.remove(manifestPath(uid));
    await meta.del(META_OWNER);
    await meta.del(META_VERSION);
    await meta.set(META_DIRTY, false);
  }

  return { sync, markChanged, prepareLogout, deleteCloud, wipeLocal, collect };
}

// ---------------------------------------------------------------- asli app ke liye jodna
let engine = null;
let currentUid = null;
let unsubscribeStorage = null;
let debounceTimer = null;
let chain = Promise.resolve();
let reloadFn = () => {
  if (typeof window !== 'undefined') window.location.reload();
};
export const __setReloadForTests = (fn) => { reloadFn = fn; };
export const __setEngineForTests = (e) => { engine = e; };

const status = { state: 'idle', lastSyncAt: null, error: null }; // idle | syncing | error
const statusListeners = new Set();
const setStatus = (patch) => {
  Object.assign(status, patch);
  statusListeners.forEach((fn) => { try { fn({ ...status }); } catch { /* ignore */ } });
};
export const getSyncStatus = () => ({ ...status });
export function subscribeSyncStatus(fn) {
  statusListeners.add(fn);
  return () => statusListeners.delete(fn);
}

async function getEngine() {
  if (engine) return engine;
  const { firebaseRemote } = await import('./cloudRemote');
  const { createInternalSnapshot } = await import('./dataBackup');
  engine = createSyncEngine({
    storage: {
      entries: () => appStorage.entries(),
      replaceAll: (map, opts) => appStorage.replaceAll(map, opts),
      flush: flushAppStorage,
    },
    media: {
      list: () => mediaStore.listMediaIds(),
      getRecord: (id) => mediaStore.getMediaRecord(id),
      save: (blob, id) => mediaStore.saveMedia(blob, id),
      clearAll: () => mediaStore.clearAllMedia(),
    },
    meta: { get: getMeta, set: setMeta, del: delMeta },
    remote: firebaseRemote,
    snapshot: createInternalSnapshot,
  });
  return engine;
}

// Ek waqt par ek hi sync chale
const exclusive = (fn) => {
  const p = chain.then(fn);
  chain = p.catch(() => {});
  return p;
};

export function syncNow() {
  const uid = currentUid;
  if (!uid) return Promise.resolve(null);
  return exclusive(async () => {
    if (uid !== currentUid) return null;
    setStatus({ state: 'syncing', error: null });
    try {
      const eng = await getEngine();
      const result = await eng.sync(uid);
      setStatus({ state: 'idle', lastSyncAt: Date.now() });
      if (result.applied) setTimeout(reloadFn, 50); // cloud ka data aaya: screens naya data padhein
      return result;
    } catch (error) {
      console.warn('Cloud sync failed:', error);
      setStatus({ state: 'error', error: String((error && error.message) || error) });
      return null;
    }
  });
}

const scheduleSync = () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(syncNow, SYNC_DEBOUNCE_MS);
};
const onOnline = () => syncNow();
const onVisibility = () => {
  if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
    clearTimeout(debounceTimer);
    syncNow(); // app background me jaane se pehle upload ki koshish
  }
};

// Login hone par (onAuthStateChanged me) bulao
export async function startCloudSync(uid) {
  if (currentUid === uid && unsubscribeStorage) return syncNow();
  stopCloudSync();
  await flushAppStorage();
  currentUid = uid;
  unsubscribeStorage = appStorage.subscribe(async (event) => {
    if (event.silent || (event.key && isLocalOnly(event.key))) return;
    try { await (await getEngine()).markChanged(); } catch (e) { console.warn('markChanged failed', e); }
    scheduleSync();
  });
  if (typeof window !== 'undefined') window.addEventListener('online', onOnline);
  if (typeof document !== 'undefined') document.addEventListener('visibilitychange', onVisibility);
  return syncNow();
}

// Logout par (onAuthStateChanged me user null aane par) bulao
export function stopCloudSync() {
  currentUid = null;
  clearTimeout(debounceTimer);
  if (unsubscribeStorage) unsubscribeStorage();
  unsubscribeStorage = null;
  if (typeof window !== 'undefined') window.removeEventListener('online', onOnline);
  if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', onVisibility);
  setStatus({ state: 'idle' });
}

// Logout se pehle bulao. true = sab cloud me pahunch gaya (wipe safe hai). Net na ho to false.
export function syncBeforeLogout(uid, timeoutMs = 15000) {
  return exclusive(async () => {
    try {
      const eng = await getEngine();
      const ok = await Promise.race([
        eng.prepareLogout(uid),
        new Promise((resolve) => setTimeout(() => resolve(false), timeoutMs)),
      ]);
      return !!ok;
    } catch (e) {
      console.warn('Sync before logout failed', e);
      return false;
    }
  });
}

// Logout ke baad (sirf tab jab upload ho chuka ho): is device se account ka data hatao aur app reload karo
export async function wipeLocalAfterLogout() {
  const eng = await getEngine();
  await exclusive(() => eng.wipeLocal());
  setTimeout(reloadFn, 50);
}

// Account delete: cloud ki saari files hatao
export async function deleteCloudData(uid) {
  const eng = await getEngine();
  await exclusive(() => eng.deleteCloud(uid));
}
