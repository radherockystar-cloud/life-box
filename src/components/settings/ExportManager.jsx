import React from 'react';
import { Download, Sparkles, FileSpreadsheet } from 'lucide-react';
import { buildBackupObject } from '../../utils/dataBackup';

export default function ExportManager({ currentTheme }) {
  const handleExport = () => {
    try {
      // Everything the app keeps on this phone (all tabs, notes, bin, settings, profile...)
      const backup = buildBackupObject();
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const downloadAnchor = document.createElement('a');
      downloadAnchor.href = url;
      downloadAnchor.download = `NewLife_Backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      alert(`All App Data Exported Successfully (${Object.keys(backup.data).length} items)! 📥✨`);
    } catch (err) {
      alert('Export nahi ho paya: ' + err.message);
    }
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
          Download a complete backup copy of everything in the app (home vault, notes, memories, goals, voices, people, planner, bin, profile and settings) as one JSON file.
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
