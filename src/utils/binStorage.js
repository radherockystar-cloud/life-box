// Shared helper: move any deleted item into the Trash / Bin.
// Use it everywhere something is deleted, so it can be restored from Settings > Trash / Bin.
//
//   moveToBin(item, 'storage_key_the_item_came_from')
//
// The storage key tells the Bin where to put the item back when it is restored.

export const BIN_KEY = 'newlife_bin';

export function moveToBin(item, storageKey) {
  try {
    const existing = JSON.parse(localStorage.getItem(BIN_KEY) || '[]');
    const trashItem = {
      ...item,
      deletedAt: 'Just now',
      deletedTs: Date.now(),
      ...(storageKey ? { storageKey } : {})
    };
    localStorage.setItem(BIN_KEY, JSON.stringify([trashItem, ...existing]));
    return true;
  } catch (err) {
    console.error('Could not move item to bin:', err);
    return false;
  }
}
