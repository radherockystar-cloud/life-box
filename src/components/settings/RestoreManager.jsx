import React from 'react';
import { RefreshCw, FileUp, Database } from 'lucide-react';
import { parseBackup, applyBackupData } from '../../utils/dataBackup';

export default function RestoreManager({ currentTheme }) {
  const runRestore = (map, sourceName) => {
    const ok = window.confirm(
      `${sourceName} se ${Object.keys(map).length} items restore honge. Abhi ka data in items se replace ho jayega. Aage badhein?`
    );
    if (!ok) return;

    try {
      applyBackupData(map);
    } catch (err) {
      alert('Restore poora nahi ho paya: phone ki storage mein jagah kam hai.');
      return;
    }
    alert('Data Restored Successfully! Refreshing app... 🔄✨');
    window.location.reload();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      let map = null;
      try {
        map = parseBackup(JSON.parse(event.target.result));
      } catch (err) {
        map = null;
      }
      if (!map) {
        alert('Invalid Backup File Format! Please upload a valid New Life backup JSON file.');
        return;
      }
      runRestore(map, 'File');
    };
    reader.readAsText(file);
  };

  const handleRestoreFromInternal = () => {
    const savedBackup = localStorage.getItem('newlife_system_backup_slot');
    if (!savedBackup) {
      alert('No internal system backup found!');
      return;
    }

    let map = null;
    try {
      map = parseBackup(JSON.parse(savedBackup));
    } catch (err) {
      map = null;
    }
    if (!map) {
      alert('Failed to restore internal backup.');
      return;
    }
    runRestore(map, 'Internal snapshot');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ padding: '8px', borderRadius: '12px', background: '#fff1f2', color: '#f43f5e' }}>
          <RefreshCw size={18} />
        </div>
        <h4 style={{ fontSize: '14px', fontWeight: '900', color: currentTheme === 'dark' ? '#f9fafb' : '#111827' }}>
          Restore Data & Recovery
        </h4>
      </div>

      <div style={{ padding: '16px', borderRadius: '16px', background: currentTheme === 'dark' ? '#1e293b' : '#fafafa', border: '1px solid rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <p style={{ fontSize: '11px', color: '#6b7280', fontWeight: '700', lineHeight: '1.5' }}>
          Upload a previously saved JSON backup file or restore instantly from internal storage.
        </p>

        {/* File Upload Restore */}
        <label style={{ width: '100%', padding: '12px', borderRadius: '14px', background: 'linear-gradient(135deg, #f43f5e, #be123c)', color: '#ffffff', fontSize: '12px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(244,63,94,0.3)', textAlign: 'center' }}>
          <FileUp size={16} /> Upload & Restore JSON File 📂
          <input type="file" accept=".json" onChange={handleFileUpload} style={{ display: 'none' }} />
        </label>

        {/* Internal Restore Button */}
        <button 
          onClick={handleRestoreFromInternal}
          style={{ width: '100%', padding: '12px', borderRadius: '14px', background: currentTheme === 'dark' ? '#334155' : '#e5e7eb', color: currentTheme === 'dark' ? '#ffffff' : '#374151', border: 'none', fontSize: '12px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <Database size={16} /> Restore from Internal Snapshot 🔄
        </button>
      </div>
    </div>
  );
}
