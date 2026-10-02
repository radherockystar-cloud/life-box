import React, { useState, useEffect } from 'react';
import { Trash2, RotateCcw } from 'lucide-react';

export default function BinManager({ currentTheme }) {
  const [binItems, setBinItems] = useState(() => {
    const saved = localStorage.getItem('newlife_bin');
    return saved ? JSON.parse(saved) : [
      { title: "Old Shopping List", type: "Note", deletedAt: "3 days ago" },
      { title: "Workout Idea", type: "Goal", deletedAt: "5 days ago" }
    ];
  });

  useEffect(() => {
    localStorage.setItem('newlife_bin', JSON.stringify(binItems));
  }, [binItems]);

  const handleRestore = (index) => {
    const itemToRestore = binItems[index];
    
    // Check if item is a Note, restore to keep notes, otherwise restore to vault
    if (itemToRestore.type === 'Note') {
      const notes = JSON.parse(localStorage.getItem('lifebox_keep_notes') || '[]');
      const restoredNote = {
        id: itemToRestore.id || Date.now(),
        title: itemToRestore.title,
        content: itemToRestore.content || '',
        date: itemToRestore.date || new Date().toISOString().split('T')[0]
      };
      localStorage.setItem('lifebox_keep_notes', JSON.stringify([restoredNote, ...notes]));
    } else {
      const vault = JSON.parse(localStorage.getItem('newlife_vault') || '[]');
      localStorage.setItem('newlife_vault', JSON.stringify([itemToRestore, ...vault]));
    }

    // Remove from bin
    const updatedBin = binItems.filter((_, i) => i !== index);
    setBinItems(updatedBin);
    alert(`Restored "${itemToRestore.title}" successfully! 🔄`);
  };

  const handlePermanentDelete = (index) => {
    const updatedBin = binItems.filter((_, i) => i !== index);
    setBinItems(updatedBin);
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
        Items here are automatically deleted permanently after 1 week.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
        {binItems.length === 0 ? (
          <p style={{ textAlign: 'center', fontSize: '12px', color: '#9ca3af', marginTop: '20px', fontWeight: '700' }}>Bin is empty.</p>
        ) : (
          binItems.map((item, index) => (
            <div key={index} style={{ padding: '12px 14px', borderRadius: '14px', background: currentTheme === 'dark' ? '#1e293b' : '#fafafa', border: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '9px', fontWeight: '900', background: '#f3e8ff', color: '#9333ea', padding: '2px 6px', borderRadius: '6px' }}>{item.type}</span>
                <h5 style={{ fontSize: '12px', fontWeight: '900', color: currentTheme === 'dark' ? '#f9fafb' : '#1f2937', marginTop: '4px' }}>{item.title}</h5>
                <span style={{ fontSize: '9px', color: '#9ca3af', fontWeight: '700' }}>Deleted {item.deletedAt}</span>
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
