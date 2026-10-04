import React, { useState } from 'react';
import { Bell, Lock, Trash2, Download, Upload, RefreshCw, ShieldCheck, Sparkles, ChevronRight } from 'lucide-react';
import NotificationManager from './NotificationManager';
import AppLockManager from './AppLockManager';
import BinManager from './BinManager';
import ExportManager from './ExportManager';
import BackupManager from './BackupManager';
import RestoreManager from './RestoreManager';
import { useBackHandler } from '../../utils/useBackHandler';

export default function SettingsView({ currentTheme }) {
  const [activeSetting, setActiveSetting] = useState(null); // 'notification', 'lock', 'bin', 'export', 'backup', 'restore'

  // Back button: leave the open setting and return to the Settings list
  useBackHandler(activeSetting !== null, () => setActiveSetting(null));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {activeSetting === null ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div style={{ padding: '8px', borderRadius: '12px', background: '#ecfdf5', color: '#059669' }}>
              <ShieldCheck size={18} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '900', color: currentTheme === 'dark' ? '#f9fafb' : '#111827' }}>
              App Settings & Control
            </h3>
          </div>

          {/* 1. Notification Menu Item */}
          <div onClick={() => setActiveSetting('notification')} style={actionCardStyle(currentTheme)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={iconBox('#fff1f2', '#f43f5e')}><Bell size={18} /></div>
              <div>
                <h4 style={titleStyle(currentTheme)}>Notifications</h4>
                <p style={subStyle}>Manage push reminders & alerts</p>
              </div>
            </div>
            <ChevronRight size={16} color="#9ca3af" />
          </div>

          {/* 2. App Lock Menu Item */}
          <div onClick={() => setActiveSetting('lock')} style={actionCardStyle(currentTheme)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={iconBox('#fef3c7', '#d97706')}><Lock size={18} /></div>
              <div>
                <h4 style={titleStyle(currentTheme)}>App Lock</h4>
                <p style={subStyle}>Secure your vault with passcode</p>
              </div>
            </div>
            <ChevronRight size={16} color="#9ca3af" />
          </div>

          {/* 3. Bin / Recycle Bin Menu Item */}
          <div onClick={() => setActiveSetting('bin')} style={actionCardStyle(currentTheme)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={iconBox('#f3e8ff', '#9333ea')}><Trash2 size={18} /></div>
              <div>
                <h4 style={titleStyle(currentTheme)}>Trash / Bin</h4>
                <p style={subStyle}>Restore or delete items</p>
              </div>
            </div>
            <ChevronRight size={16} color="#9ca3af" />
          </div>

          {/* 4. Export Data */}
          <div onClick={() => setActiveSetting('export')} style={actionCardStyle(currentTheme)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={iconBox('#e0f2fe', '#0284c7')}><Download size={18} /></div>
              <div>
                <h4 style={titleStyle(currentTheme)}>Export Data</h4>
                <p style={subStyle}>Download vault as JSON file</p>
              </div>
            </div>
            <ChevronRight size={16} color="#9ca3af" />
          </div>

          {/* 5. Backup */}
          <div onClick={() => setActiveSetting('backup')} style={actionCardStyle(currentTheme)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={iconBox('#ecfdf5', '#059669')}><Upload size={18} /></div>
              <div>
                <h4 style={titleStyle(currentTheme)}>Create Backup</h4>
                <p style={subStyle}>Save state to local storage</p>
              </div>
            </div>
            <ChevronRight size={16} color="#9ca3af" />
          </div>

          {/* 6. Restore */}
          <div onClick={() => setActiveSetting('restore')} style={actionCardStyle(currentTheme)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={iconBox('#fff1f2', '#f43f5e')}><RefreshCw size={18} /></div>
              <div>
                <h4 style={titleStyle(currentTheme)}>Restore Data</h4>
                <p style={subStyle}>Upload backup file to restore</p>
              </div>
            </div>
            <ChevronRight size={16} color="#9ca3af" />
          </div>
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button 
            onClick={() => setActiveSetting(null)}
            style={{ alignSelf: 'flex-start', background: '#fff1f2', color: '#f43f5e', border: '1px solid #ffd1d6', padding: '6px 12px', borderRadius: '10px', fontSize: '11px', fontWeight: '900', cursor: 'pointer' }}
          >
            ← Back to Settings
          </button>

          {activeSetting === 'notification' && <NotificationManager currentTheme={currentTheme} />}
          {activeSetting === 'lock' && <AppLockManager currentTheme={currentTheme} />}
          {activeSetting === 'bin' && <BinManager currentTheme={currentTheme} />}
          {activeSetting === 'export' && <ExportManager currentTheme={currentTheme} />}
          {activeSetting === 'backup' && <BackupManager currentTheme={currentTheme} />}
          {activeSetting === 'restore' && <RestoreManager currentTheme={currentTheme} />}
        </div>
      )}

    </div>
  );
}

function actionCardStyle(theme) {
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    borderRadius: '18px',
    background: theme === 'dark' ? '#1e293b' : '#fafafa',
    border: '1px solid rgba(0,0,0,0.06)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
  };
}

function titleStyle(theme) {
  return {
    fontSize: '13px',
    fontWeight: '900',
    color: theme === 'dark' ? '#f9fafb' : '#1f2937'
  };
}

const subStyle = {
  fontSize: '10px',
  fontWeight: '700',
  color: '#9ca3af',
  marginTop: '2px'
};

function iconBox(bg, color) {
  return {
    padding: '8px',
    borderRadius: '12px',
    background: bg,
    color: color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };
}
