import React from 'react';
import { Download, Sparkles, FileSpreadsheet } from 'lucide-react';

export default function ExportManager({ currentTheme }) {
  const handleExport = () => {
    // Gather all New Life app data from localStorage
    const appData = {
      vault: JSON.parse(localStorage.getItem('newlife_vault') || '[]'),
      bin: JSON.parse(localStorage.getItem('newlife_bin') || '[]'),
      theme: localStorage.getItem('newlife_theme') || 'light',
      lang: localStorage.getItem('newlife_lang') || 'en',
      notif: localStorage.getItem('newlife_notif') || 'false',
      lockEnabled: localStorage.getItem('newlife_lock_enabled') || 'false',
      passcode: localStorage.getItem('newlife_passcode') || '',
      exportDate: new Date().toISOString()
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `NewLife_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    alert('All App Data Exported Successfully as JSON file! 📥✨');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ padding: '8px', borderRadius: '12px', background: '#e0f2fe', color: '#0284c7' }}>
          <Download size={18} />
        </div>
        <h4 style={{ fontSize: '14px', fontWeight: '900', color: currentTheme === 'dark' ? '#f9fafb' : '#111827' }}>
          Export All Data
        </h4>
      </div>

      <div style={{ padding: '16px', borderRadius: '16px', background: currentTheme === 'dark' ? '#1e293b' : '#fafafa', border: '1px solid rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <p style={{ fontSize: '11px', color: '#6b7280', fontWeight: '700', lineHeight: '1.5' }}>
          Download a complete backup copy of your memories, notes, goals, and security settings in a secure JSON file format.
        </p>
        <button 
          onClick={handleExport}
          style={{ width: '100%', padding: '12px', borderRadius: '14px', background: 'linear-gradient(135deg, #0284c7, #0369a1)', color: '#ffffff', border: 'none', fontSize: '12px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(2,132,199,0.3)' }}
        >
          <FileSpreadsheet size={16} /> Download JSON Backup File 📥
        </button>
      </div>
    </div>
  );
}
