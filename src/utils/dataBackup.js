// Shared helpers for Export / Backup / Restore.
// They copy EVERYTHING the app keeps in localStorage (all tabs, settings, bin, profile...),
// so a new tab added later is included automatically.

const BACKUP_FORMAT = 'newlife-backup';

// Never copied: login tokens, and the backup's own bookkeeping
const EXCLUDED_PREFIXES = ['firebase:', 'newlife_system_backup_slot', 'newlife_last_backup_time'];

const isExcluded = (key) => EXCLUDED_PREFIXES.some((p) => key.startsWith(p));

// { storageKey: "raw string value", ... } for everything in the app
export function collectAppData() {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || isExcluded(key)) continue;
    data[key] = localStorage.getItem(key);
  }
  return data;
}

export function buildBackupObject() {
  return {
    format: BACKUP_FORMAT,
    version: 2,
    exportDate: new Date().toISOString(),
    data: collectAppData()
  };
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

// Writes the data back. Returns how many items were restored.
export function applyBackupData(map) {
  let count = 0;
  Object.entries(map).forEach(([key, value]) => {
    localStorage.setItem(key, value);
    count++;
  });
  return count;
}
