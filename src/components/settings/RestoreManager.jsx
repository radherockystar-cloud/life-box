import React, { useState } from 'react';
import { RefreshCw, FileUp, Database } from 'lucide-react';
import {
  parseBackupFull,
  applyBackupData,
  hasInternalSnapshot,
  internalSnapshotInfo,
  restoreInternalSnapshot,
} from '../../utils/dataBackup';
import { appStorage } from '../../utils/appStorage';

const OLD_SLOT_KEY = 'newlife_system_backup_slot';

export default function RestoreManager({ currentTheme }) {
  const [busy, setBusy] = useState(false);

  // Confirm poochho, phir restore karo, phir app refresh
  const confirmAndRun = async (message, task) => {
    if (busy) return;
    if (!window.confirm(message)) return;
    setBusy(true);
    try {
      await task();
    } catch (err) {
      setBusy(false);
      alert('Restore poora nahi ho paya: phone ki storage mein jagah kam hai.');
      return;
    }
    alert('Data Restored Successfully! Refreshing app... 🔄✨');
    window.location.reload();
  };

  const runRestore = (full, sourceName) =>
    confirmAndRun(
      `${sourceName} se ${Object.keys(full.map).length} items aur ${Object.keys(full.media).length} photos/videos/voices restore honge. Ye items abhi ke data par likhe jayenge (jo items backup me nahi hain wo waise hi rahenge). Aage badhein?`,
      () => applyBackupData(full.map, full.media)
    );

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      let full = null;
      try {
        full = parseBackupFull(JSON.parse(event.target.result));
      } catch (err) {
        full = null;
      }
      if (!full) {
        alert('Invalid Backup File Format! Please upload a valid New Life backup JSON file.');
        return;
      }
      runRestore(full, 'File');
    };
    reader.onerror = () => alert('Is file ko padh nahi paye. Dobara try karo.');
    reader.readAsText(file);
  };

  const handleRestoreFromInternal = async () => {
    if (await hasInternalSnapshot()) {
      const info = await internalSnapshotInfo();
      confirmAndRun(
        `Internal snapshot se ${info ? info.items : 0} items aur ${info ? info.media : 0} photos/videos/voices restore honge. Ye items abhi ke data par likhe jayenge (jo items backup me nahi hain wo waise hi rahenge). Aage badhein?`,
        () => restoreInternalSnapshot()
      );
      return;
    }

    // Bahut purana snapshot (jo abhi tak localStorage mein hi ho)
    const savedBackup = appStorage.getItem(OLD_SLOT_KEY);
    if (!savedBackup) {
      alert('No internal system backup found!');
      return;
    }
    let full = null;
    try {
      full = parseBackupFull(JSON.parse(savedBackup));
    } catch (err) {
      full = null;
    }
    if (!full) {
      alert('Failed to restore internal backup.');
      return;
    }
    runRestore(full, 'Internal snapshot');
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
