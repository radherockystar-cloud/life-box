import React, { useState } from 'react';
import { Upload, ShieldCheck, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { createInternalSnapshot } from '../../utils/dataBackup';
import { appStorage } from '../../utils/appStorage';

export default function BackupManager({ currentTheme }) {
  const [busy, setBusy] = useState(false);
  const [lastBackupTime, setLastBackupTime] = useState(() => {
    return appStorage.getItem('newlife_last_backup_time') || 'Never';
  });

  const handleCreateBackup = async () => {
    if (busy) return;
    setBusy(true);
    try {
      // Text data + photos/videos/voices ki copy phone ki badi storage (IndexedDB) mein
      const { items, media } = await createInternalSnapshot();
      const timeString = new Date().toLocaleString();

      appStorage.setItem('newlife_last_backup_time', timeString);
      setLastBackupTime(timeString);

      alert(`System State Backup Created Successfully (${items} items, ${media} photos/videos/voices)! 🛡️✨`);
    } catch (err) {
      // Phone ki storage full ho sakti hai
      alert('Backup nahi ban paya: phone ki storage mein jagah kam hai. Export Data se JSON file download karo.');
    } finally {
      setBusy(false);
    }
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
          Store an instant copy of your complete app data (including photos, videos and voices) on this phone. It uses extra phone storage and is lost if you uninstall the app, so also download a JSON file from Export Data for safety.
        </p>
        <button 
          onClick={handleCreateBackup}
          disabled={busy}
          style={{ width: '100%', padding: '12px', borderRadius: '14px', background: 'linear-gradient(135deg, #059669, #047857)', color: '#ffffff', border: 'none', fontSize: '12px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(5,150,105,0.3)', opacity: busy ? 0.7 : 1 }}
        >
          {busy ? <><Loader2 size={16} className="animate-spin" /> Creating backup...</> : <><ShieldCheck size={16} /> Create Instant Backup 🛡️</>}
        </button>
      </div>
    </div>
  );
}
