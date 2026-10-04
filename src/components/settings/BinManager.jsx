import React, { useState, useEffect } from 'react';
import { Trash2, RotateCcw } from 'lucide-react';
import { BIN_KEY } from '../../utils/binStorage';

const KEEP_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

// Load the bin: give old items a delete-time, and remove anything older than 7 days
const loadBin = () => {
  let items = [];
  try {
    items = JSON.parse(localStorage.getItem(BIN_KEY) || '[]');
    if (!Array.isArray(items)) items = [];
  } catch {
    items = [];
  }
  const now = Date.now();
  return items
    .map((item) => (item.deletedTs ? item : { ...item, deletedTs: now }))
    .filter((item) => now - item.deletedTs < KEEP_DAYS * DAY_MS);
};

const timeAgo = (ts) => {
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
};

const daysLeft = (ts) => Math.max(1, KEEP_DAYS - Math.floor((Date.now() - ts) / DAY_MS));

const readArray = (key) => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

export default function BinManager({ currentTheme }) {
  const [binItems, setBinItems] = useState(loadBin);

  useEffect(() => {
    localStorage.setItem(BIN_KEY, JSON.stringify(binItems));
  }, [binItems]);

  const handleRestore = (index) => {
    const item = binItems[index];
    const { deletedAt, deletedTs, storageKey, ...original } = item;

    // Put the item back where it came from.
    // Older bin items have no storage key: Notes go to Notes, everything else to the vault.
    const targetKey = storageKey || (original.type === 'Note' ? 'lifebox_keep_notes' : 'newlife_vault');

    let restored = original;
    if (targetKey === 'lifebox_keep_notes') {
      restored = {
        id: original.id || Date.now(),
        title: original.title,
        content: original.content || '',
        date: original.date || new Date().toISOString().split('T')[0]
      };
    }

    const list = readArray(targetKey);
    const alreadyThere = restored.id !== undefined && list.some((x) => x && x.id === restored.id);
    if (!alreadyThere) {
      try {
        localStorage.setItem(targetKey, JSON.stringify([restored, ...list]));
      } catch {
        alert('Restore nahi ho paya: phone mein jagah kam hai.');
        return;
      }
    }

    // Tell the Home screen to reload its list if it is open
    window.dispatchEvent(new Event('newlife-vault-changed'));

    setBinItems(binItems.filter((_, i) => i !== index));
    alert(`Restored "${item.title || 'item'}" successfully! 🔄`);
  };

  const handlePermanentDelete = (index) => {
    if (!window.confirm('Ye item hamesha ke liye delete ho jayega. Pakka?')) return;
    setBinItems(binItems.filter((_, i) => i !== index));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ padding: '8px', borderRadius: '12px', background: '#f3e8ff', color: '#9333ea' }}>
          <Trash2 size={18} />
        </div>
        <h4 style={{ fontSize: '14px', fontWeight: '900', color: currentTheme === 'dark' ? '#f9fafb' : '#111827' }}>
          Recycle Bin / Trash ({binItems.length})
        </h4>
      </div>

      <p style={{ fontSize: '10px', color: '#9ca3af', fontWeight: '700' }}>
        Items here are automatically deleted permanently after 7 days.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
        {binItems.length === 0 ? (
          <p style={{ textAlign: 'center', fontSize: '12px', color: '#9ca3af', marginTop: '20px', fontWeight: '700' }}>Bin is empty.</p>
        ) : (
          binItems.map((item, index) => (
            <div key={index} style={{ padding: '12px 14px', borderRadius: '14px', background: currentTheme === 'dark' ? '#1e293b' : '#fafafa', border: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '9px', fontWeight: '900', background: '#f3e8ff', color: '#9333ea', padding: '2px 6px', borderRadius: '6px' }}>{item.type || 'Item'}</span>
                <h5 style={{ fontSize: '12px', fontWeight: '900', color: currentTheme === 'dark' ? '#f9fafb' : '#1f2937', marginTop: '4px' }}>{item.title || 'Untitled'}</h5>
                <span style={{ fontSize: '9px', color: '#9ca3af', fontWeight: '700' }}>Deleted {timeAgo(item.deletedTs)} · {daysLeft(item.deletedTs)} day(s) left</span>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button 
                  onClick={() => handleRestore(index)}
                  style={{ background: '#ecfdf5', border: 'none', padding: '6px 10px', borderRadius: '8px', color: '#059669', fontSize: '11px', fontWeight: '900', cursor: 'pointer' }}
                  title="Restore"
                >
                  <RotateCcw size={14} />
                </button>
                <button 
                  onClick={() => handlePermanentDelete(index)}
                  style={{ background: '#fef2f2', border: 'none', padding: '6px 10px', borderRadius: '8px', color: '#ef4444', fontSize: '11px', fontWeight: '900', cursor: 'pointer' }}
                  title="Delete Forever"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
