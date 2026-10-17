import React, { useState } from 'react';
import { Bell, Lock, Trash2, Download, Upload, RefreshCw, ShieldCheck, Sparkles, ChevronRight } from 'lucide-react';
import NotificationManager from './NotificationManager';
import AppLockManager from './AppLockManager';
import BinManager from './BinManager';
import ExportManager from './ExportManager';
import BackupManager from './BackupManager';
import RestoreManager from './RestoreManager';
import { useBackHandler } from '../../utils/useBackHandler';
import { useApp } from '../../context/AppContext';

export default function SettingsView() {
  // Theme (c) + language (t) poore app wale context se
  const { c, t, currentTheme, currentLang } = useApp();
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
            <h3 style={{ fontSize: '16px', fontWeight: '900', color: c.ink }}>
              {t.setTitle}
            </h3>
          </div>

          {/* 1. Notification Menu Item */}
          <div onClick={() => setActiveSetting('notification')} style={actionCardStyle(c)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={iconBox('#fff1f2', '#f43f5e')}><Bell size={18} /></div>
              <div>
                <h4 style={titleStyle(c)}>{t.setNotif}</h4>
                <p style={subStyle}>{t.setNotifSub}</p>
              </div>
            </div>
            <ChevronRight size={16} color="#9ca3af" />
          </div>

          {/* 2. App Lock Menu Item */}
          <div onClick={() => setActiveSetting('lock')} style={actionCardStyle(c)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={iconBox('#fef3c7', '#d97706')}><Lock size={18} /></div>
              <div>
                <h4 style={titleStyle(c)}>{t.setLock}</h4>
                <p style={subStyle}>{t.setLockSub}</p>
              </div>
            </div>
            <ChevronRight size={16} color="#9ca3af" />
          </div>

          {/* 3. Bin / Recycle Bin Menu Item */}
          <div onClick={() => setActiveSetting('bin')} style={actionCardStyle(c)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={iconBox('#f3e8ff', '#9333ea')}><Trash2 size={18} /></div>
              <div>
                <h4 style={titleStyle(c)}>{t.setBin}</h4>
                <p style={subStyle}>{t.setBinSub}</p>
              </div>
            </div>
            <ChevronRight size={16} color="#9ca3af" />
          </div>

          {/* 4. Export Data */}
          <div onClick={() => setActiveSetting('export')} style={actionCardStyle(c)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={iconBox('#e0f2fe', '#0284c7')}><Download size={18} /></div>
              <div>
                <h4 style={titleStyle(c)}>{t.setExport}</h4>
                <p style={subStyle}>{t.setExportSub}</p>
              </div>
            </div>
            <ChevronRight size={16} color="#9ca3af" />
          </div>

          {/* 5. Backup */}
          <div onClick={() => setActiveSetting('backup')} style={actionCardStyle(c)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={iconBox('#ecfdf5', '#059669')}><Upload size={18} /></div>
              <div>
                <h4 style={titleStyle(c)}>{t.setBackup}</h4>
                <p style={subStyle}>{t.setBackupSub}</p>
              </div>
            </div>
            <ChevronRight size={16} color="#9ca3af" />
          </div>

          {/* 6. Restore */}
          <div onClick={() => setActiveSetting('restore')} style={actionCardStyle(c)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={iconBox('#fff1f2', '#f43f5e')}><RefreshCw size={18} /></div>
              <div>
                <h4 style={titleStyle(c)}>{t.setRestore}</h4>
                <p style={subStyle}>{t.setRestoreSub}</p>
              </div>
            </div>
            <ChevronRight size={16} color="#9ca3af" />
          </div>
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button 
            onClick={() => setActiveSetting(null)}
            style={{ alignSelf: 'flex-start', background: c.accentSoft, color: '#f43f5e', border: '1px solid ' + (c.isDark ? c.accentLine : '#ffd1d6'), padding: '6px 12px', borderRadius: '10px', fontSize: '11px', fontWeight: '900', cursor: 'pointer' }}
          >
            {t.setBack}
          </button>

          {activeSetting === 'notification' && <NotificationManager currentTheme={currentTheme} currentLang={currentLang} />}
          {activeSetting === 'lock' && <AppLockManager currentTheme={currentTheme} currentLang={currentLang} />}
          {activeSetting === 'bin' && <BinManager currentTheme={currentTheme} currentLang={currentLang} />}
          {activeSetting === 'export' && <ExportManager currentTheme={currentTheme} currentLang={currentLang} />}
          {activeSetting === 'backup' && <BackupManager currentTheme={currentTheme} currentLang={currentLang} />}
          {activeSetting === 'restore' && <RestoreManager currentTheme={currentTheme} currentLang={currentLang} />}
        </div>
      )}

    </div>
  );
}

function actionCardStyle(c) {
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    borderRadius: '18px',
    background: c.isDark ? '#1e293b' : '#fafafa',
    border: '1px solid ' + (c.isDark ? c.line : 'rgba(0,0,0,0.06)'),
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
  };
}

function titleStyle(c) {
  return {
    fontSize: '13px',
    fontWeight: '900',
    color: c.isDark ? '#f9fafb' : '#1f2937'
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
