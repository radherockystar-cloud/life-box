import React, { useState } from 'react';
import { Upload, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';

export default function BackupManager({ currentTheme }) {
  const [lastBackupTime, setLastBackupTime] = useState(() => {
    return localStorage.getItem('newlife_last_backup_time') || 'Never';
  });

  const handleCreateBackup = () => {
    const systemState = {
      vault: localStorage.getItem('newlife_vault'),
      bin: localStorage.getItem('newlife_bin'),
      theme: localStorage.getItem('newlife_theme'),
      lang: localStorage.getItem('newlife_lang'),
      notif: localStorage.getItem('newlife_notif'),
      lockEnabled: localStorage.getItem('newlife_lock_enabled'),
      passcode: localStorage.getItem('newlife_passcode')
    };

    localStorage.setItem('newlife_system_backup_slot', JSON.stringify(systemState));
    const timeString = new Date().toLocaleString();
    localStorage.setItem('newlife_last_backup_time', timeString);
    setLastBackupTime(timeString);

    alert('System State Backup Created Successfully on Local Storage! 🛡️✨');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ padding: '8px', borderRadius: '12px', background: '#ecfdf5', color: '#059669' }}>
          <Upload size={18} />
        </div>
        <h4 style={{ fontSize: '14px', fontWeight: '900', color: currentTheme === 'dark' ? '#f9fafb' : '#111827' }}>
          System Internal Backup
        </h4>
      </div>

      <div style={{ padding: '16px', borderRadius: '16px', background: currentTheme === 'dark' ? '#1e293b' : '#fafafa', border: '1px solid rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={14} color="#059669" />
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#059669' }}>Last Backup: {lastBackupTime}</span>
        </div>
        <p style={{ fontSize: '11px', color: '#6b7280', fontWeight: '700', lineHeight: '1.5' }}>
          Store an instant snapshot of your complete app data inside your browser storage securely.
        </p>
        <button 
          onClick={handleCreateBackup}
          style={{ width: '100%', padding: '12px', borderRadius: '14px', background: 'linear-gradient(135deg, #059669, #047857)', color: '#ffffff', border: 'none', fontSize: '12px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(5,150,105,0.3)' }}
        >
          <ShieldCheck size={16} /> Create Instant Backup 🛡️
        </button>
      </div>
    </div>
  );
}
