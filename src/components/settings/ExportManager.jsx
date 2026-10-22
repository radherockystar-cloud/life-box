import React, { useState } from 'react';
import { Download, Sparkles, FileSpreadsheet, Loader2 } from 'lucide-react';
import { buildBackupBlob } from '../../utils/dataBackup';
import { isNative, shareBlobNative } from '../../utils/nativeFile';

export default function ExportManager({ currentTheme }) {
  const [busy, setBusy] = useState(false);

  const handleExport = async () => {
    if (busy) return;
    setBusy(true);
    try {
      // Everything the app keeps on this phone (all tabs, notes, bin, settings, profile...) + photos, videos, voices
      const { blob, items, media } = await buildBackupBlob();
      const fileName = `NewLife_Backup_${new Date().toISOString().slice(0, 10)}.json`;

      if (isNative()) {
        // Android app: WebView me <a download> kaam nahi karta, isliye file phone me likh kar share sheet kholte hain
        // (wahan se "Drive", "Files" ya koi bhi jagah chunkar save kar lo).
        const opened = await shareBlobNative(blob, fileName, { title: 'Life Box Backup', dialogTitle: 'Save backup file' });
        if (opened) alert(`Backup ready (${items} items, ${media} photos/videos/voices). Choose where to save it: Drive, Files, etc. 📥✨`);
      } else {
        // Browser (npm run dev): seedha download
        const url = URL.createObjectURL(blob);
        const downloadAnchor = document.createElement('a');
        downloadAnchor.href = url;
        downloadAnchor.download = fileName;
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        setTimeout(() => URL.revokeObjectURL(url), 60000);
        alert(`All App Data Exported Successfully (${items} items, ${media} photos/videos/voices)! 📥✨`);
      }
    } catch (err) {
      alert('Export nahi ho paya: ' + err.message);
    } finally {
      setBusy(false);
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
          Download a complete backup copy of everything in the app (notes, memories with photos and videos, goals, voices, planner, bin, profile and settings) as one JSON file. If you have many photos or videos, the file can be large and may take a minute.
        </p>
        <button 
          onClick={handleExport}
          disabled={busy}
          style={{ width: '100%', padding: '12px', borderRadius: '14px', background: 'linear-gradient(135deg, #0284c7, #0369a1)', color: '#ffffff', border: 'none', fontSize: '12px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(2,132,199,0.3)', opacity: busy ? 0.7 : 1 }}
        >
          {busy ? <><Loader2 size={16} className="animate-spin" /> Preparing file...</> : <><FileSpreadsheet size={16} /> Download JSON Backup File 📥</>}
        </button>
      </div>
    </div>
  );
}
