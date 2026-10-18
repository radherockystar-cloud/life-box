// Shared helpers for Export / Backup / Restore.
// Text data: appStorage (appStorage.js) ki SAARI keys copy hoti hain (saare tabs, settings, bin, profile...),
// isliye baad mein naya tab jud jaye to wo bhi apne aap shamil ho jata hai.
// Photo, video, audio: IndexedDB (mediaStore.js) se aate hain aur backup mein saath jaate hain.

import {
  STORES,
  SNAPSHOT_META_KEY,
  isDataUrl,
  dataUrlToBlob,
  blobToDataUrl,
  saveMedia,
  getMediaBlob,
  listMediaIds,
  deleteMedia,
  externalizeItems,
  putMeta,
  getMeta,
} from './mediaStore';
import { appStorage, flushAppStorage } from './appStorage';

const BACKUP_FORMAT = 'newlife-backup';
const OLD_SLOT_KEY = 'newlife_system_backup_slot';

// Never copied: login tokens, the backup's own bookkeeping, and the app lock (passcode must never sit in a
// backup file, and restoring "lock on" without its passcode would lock the person out of their own app)
const EXCLUDED_PREFIXES = [
  'firebase:',
  'newlife_system_backup_slot',
  'newlife_last_backup_time',
  'newlife_lock_enabled',
  'newlife_passcode',
];

const isExcluded = (key) => EXCLUDED_PREFIXES.some((p) => key.startsWith(p));

// { storageKey: "raw string value", ... } for everything in the app
export function collectAppData() {
  const data = {};
  for (let i = 0; i < appStorage.length; i++) {
    const key = appStorage.key(i);
    if (!key || isExcluded(key)) continue;
    data[key] = appStorage.getItem(key);
  }
  return data;
}

// (Purana, bina media wala tareeka. Ab Export isse nahi, buildBackupBlob se banta hai.)
export function buildBackupObject() {
  return {
    format: BACKUP_FORMAT,
    version: 2,
    exportDate: new Date().toISOString(),
    data: collectAppData()
  };
}

// Export ki file: text data + saari photo/video/audio. Bade data ke liye ek-ek karke Blob mein jodte hain.
export async function buildBackupBlob() {
  const data = collectAppData();
  const ids = await listMediaIds();
  const parts = [
    `{"format":"${BACKUP_FORMAT}","version":3,"exportDate":${JSON.stringify(new Date().toISOString())},"data":${JSON.stringify(data)},"media":{`,
  ];
  let count = 0;
  for (const id of ids) {
    const blob = await getMediaBlob(id);
    if (!blob) continue;
    const dataUrl = await blobToDataUrl(blob);
    parts.push(new Blob([`${count > 0 ? ',' : ''}${JSON.stringify(id)}:${JSON.stringify(dataUrl)}`]));
    count += 1;
  }
  parts.push('}}');
  return { blob: new Blob(parts, { type: 'application/json' }), items: Object.keys(data).length, media: count };
}

// Old backups (before all tabs were included) used these short names
const LEGACY_KEYS = {
  vault: 'newlife_vault',
  bin: 'newlife_bin',
  theme: 'newlife_theme',
  lang: 'newlife_lang',
  notif: 'newlife_notif',
  lockEnabled: 'newlife_lock_enabled',
  passcode: 'newlife_passcode'
};

const toStorageString = (v) => (typeof v === 'string' ? v : JSON.stringify(v));

// Accepts a new-format or old-format backup. Returns { key: "string" } or null if it is not a backup.
export function parseBackup(parsed) {
  if (!parsed || typeof parsed !== 'object') return null;
  const map = {};

  if (parsed.format === BACKUP_FORMAT && parsed.data && typeof parsed.data === 'object') {
    Object.entries(parsed.data).forEach(([key, value]) => {
      if (typeof value === 'string' && !isExcluded(key)) map[key] = value;
    });
  } else {
    Object.entries(LEGACY_KEYS).forEach(([shortName, key]) => {
      const value = parsed[shortName];
      if (value !== undefined && value !== null && value !== '') map[key] = toStorageString(value);
    });
  }

  return Object.keys(map).length > 0 ? map : null;
}

// Text data + media dono. Returns { map, media } ya null.
export function parseBackupFull(parsed) {
  const map = parseBackup(parsed);
  if (!map) return null;
  const media = {};
  if (parsed.format === BACKUP_FORMAT && parsed.media && typeof parsed.media === 'object') {
    Object.entries(parsed.media).forEach(([id, value]) => {
      if (isDataUrl(value)) media[id] = value;
    });
  }
  return { map, media };
}

// Writes the data back. Returns how many items were restored.
// Pehle media IndexedDB mein jaata hai, phir text data (taaki koi item bina media ke na rahe).
export async function applyBackupData(map, media = {}) {
  const data = { ...map };

  // Purane backup mein photo/voice seedha vault ke andar hoti thi: unhe IndexedDB mein le jao
  for (const key of ['newlife_vault', 'newlife_bin']) {
    if (typeof data[key] !== 'string' || !data[key].includes('data:')) continue;
    let list;
    try { list = JSON.parse(data[key]); } catch (e) { continue; }
    if (!Array.isArray(list)) continue;
    const { items, changed } = await externalizeItems(list);
    if (changed) data[key] = JSON.stringify(items);
  }

  for (const [id, dataUrl] of Object.entries(media)) {
    if (isDataUrl(dataUrl)) await saveMedia(dataUrlToBlob(dataUrl), id);
  }

  let count = 0;
  Object.entries(data).forEach(([key, value]) => {
    appStorage.setItem(key, value);
    count++;
  });
  await flushAppStorage(); // IndexedDB me pakka likh jaye (cloud sync bhi isi se shuru hota hai)
  return count;
}

// ---------------------------------------------------------------- Internal backup (phone ke andar ek copy)
export async function createInternalSnapshot() {
  const data = collectAppData();
  const ids = await listMediaIds(STORES.media);
  const copied = [];
  for (const id of ids) {
    const blob = await getMediaBlob(id);
    if (!blob) continue;
    await saveMedia(blob, id, STORES.snapshot);
    copied.push(id);
  }
  await putMeta(SNAPSHOT_META_KEY, {
    format: BACKUP_FORMAT,
    version: 3,
    exportDate: new Date().toISOString(),
    data,
    mediaIds: copied,
  });
  // Purane snapshot ka jo media ab kaam ka nahi, use hatao
  const inSnapshot = await listMediaIds(STORES.snapshot);
  for (const id of inSnapshot) {
    if (!copied.includes(id)) await deleteMedia(id, STORES.snapshot);
  }
  try { appStorage.removeItem(OLD_SLOT_KEY); } catch (e) { /* ignore */ }
  return { items: Object.keys(data).length, media: copied.length };
}

export async function hasInternalSnapshot() {
  try {
    return !!(await getMeta(SNAPSHOT_META_KEY));
  } catch (e) {
    return false;
  }
}

export async function restoreInternalSnapshot() {
  const meta = await getMeta(SNAPSHOT_META_KEY);
  if (!meta || !meta.data) throw new Error('No internal snapshot');
  for (const id of meta.mediaIds || []) {
    const blob = await getMediaBlob(id, STORES.snapshot);
    if (blob) await saveMedia(blob, id, STORES.media);
  }
  let count = 0;
  Object.entries(meta.data).forEach(([key, value]) => {
    if (typeof value === 'string' && !isExcluded(key)) {
      appStorage.setItem(key, value);
      count++;
    }
  });
  await flushAppStorage();
  return count;
}

// Snapshot mein kitne items / media hain (Restore ke confirm message ke liye)
export async function internalSnapshotInfo() {
  const meta = await getMeta(SNAPSHOT_META_KEY);
  if (!meta) return null;
  return { items: Object.keys(meta.data || {}).length, media: (meta.mediaIds || []).length };
}
