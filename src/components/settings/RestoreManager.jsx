import React from 'react';
import { RefreshCw, FileUp, Database } from 'lucide-react';

export default function RestoreManager({ currentTheme }) {
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsedData = JSON.parse(event.target.result);
        
        if (parsedData.vault) localStorage.setItem('newlife_vault', JSON.stringify(parsedData.vault));
        if (parsedData.bin) localStorage.setItem('newlife_bin', JSON.stringify(parsedData.bin));
        if (parsedData.theme) localStorage.setItem('newlife_theme', parsedData.theme);
        if (parsedData.lang) localStorage.setItem('newlife_lang', parsedData.lang);
        if (parsedData.notif) localStorage.setItem('newlife_notif', parsedData.notif);
        if (parsedData.lockEnabled) localStorage.setItem('newlife_lock_enabled', parsedData.lockEnabled);
        if (parsedData.passcode) localStorage.setItem('newlife_passcode', parsedData.passcode);

        alert('Data Restored Successfully from file! Refreshing app... 🔄✨');
        window.location.reload();
      } catch (err) {
        alert('Invalid Backup File Format! Please upload a valid JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleRestoreFromInternal = () => {
    const savedBackup = localStorage.getItem('newlife_system_backup_slot');
    if (!savedBackup) {
      alert('No internal system backup found!');
      return;
    }

    try {
      const parsedData = JSON.parse(savedBackup);
      if (parsedData.vault) localStorage.setItem('newlife_vault', parsedData.vault);
      if (parsedData.bin) localStorage.setItem('newlife_bin', parsedData.bin);
      if (parsedData.theme) localStorage.setItem('newlife_theme', parsedData.theme);
      if (parsedData.lang) localStorage.setItem('newlife_lang', parsedData.lang);
      if (parsedData.notif) localStorage.setItem('newlife_notif', parsedData.notif);
      if (parsedData.lockEnabled) localStorage.setItem('newlife_lock_enabled', parsedData.lockEnabled);
      if (parsedData.passcode) localStorage.setItem('newlife_passcode', parsedData.passcode);

      alert('System Restored from internal snapshot successfully! Refreshing... 🔄');
      window.location.reload();
    } catch (err) {
      alert('Failed to restore internal backup.');
    }
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
