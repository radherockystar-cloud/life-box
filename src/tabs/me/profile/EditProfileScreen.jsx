import React, { useState } from 'react';
import { ArrowLeft, Camera, Trash2 } from 'lucide-react';
import { useMeTheme } from '../meTheme';
import { useMeText } from '../meTexts';
import { getDisplayName, resizeImage } from './profileService';

// Profile badalne ka page. Sirf login hone par khulta hai.
// onSave(updatedProfile) -> Promise; error aaye to yahin dikhta hai.
export default function EditProfileScreen({ user, profile, onSave, onBack }) {
  const th = useMeTheme();
  const tx = useMeText();

  const [editName, setEditName] = useState(profile.name || getDisplayName(profile, user));
  const [editBio, setEditBio] = useState(profile.bio || '');
  const [editPhone, setEditPhone] = useState(profile.phone || '');
  const [editAvatar, setEditAvatar] = useState(profile.avatar || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    try {
      setEditAvatar(await resizeImage(file));
      setError('');
    } catch {
      setError(tx('alertPhotoLoad'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;
    if (!editName.trim()) {
      setError(tx('errNameRequired'));
      return;
    }
    setIsSaving(true);
    setError('');
    try {
      await onSave({ name: editName.trim(), bio: editBio, phone: editPhone, avatar: editAvatar });
    } catch (err) {
      setError(tx('alertSaveFail') + (err?.message || ''));
      setIsSaving(false);
    }
  };

  const labelStyle = { fontSize: '12px', fontWeight: 900, color: th.label };
  const fieldBase = { ...th.field, width: '100%', boxSizing: 'border-box', padding: '13px 16px', borderRadius: '16px', outline: 'none', fontSize: '14px', fontWeight: 800 };

  return (
    <div style={th.pageStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button type="button" onClick={onBack} style={th.iconBtn} aria-label="Back" className="me-press">
          <ArrowLeft size={20} />
        </button>
        <h2 style={{ fontSize: '18px', fontWeight: 900, color: th.ink }}>{tx('meEditProfileTitle')}</h2>
      </div>

      <form onSubmit={handleSubmit} className="me-rise" style={{ ...th.glass, borderRadius: '28px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '92px', height: '92px', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontSize: '34px', fontWeight: 900, background: 'linear-gradient(160deg, #fb7185 0%, #e11d48 55%, #be123c 100%)', border: '3px solid #ffffff', boxShadow: '0 10px 22px -6px rgba(225,29,72,0.6), 0 0 22px rgba(244,63,94,0.35)' }}>
            {editAvatar ? (
              <img src={editAvatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            ) : (
              (editName || '?').charAt(0).toUpperCase()
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <label className="me-press" style={{ ...th.ghostBtn, padding: '9px 14px', borderRadius: '14px', fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Camera size={14} /> {tx('meUploadPhoto')}
              <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
            </label>

            {editAvatar && (
              <button type="button" onClick={() => setEditAvatar('')} className="me-press" style={{ ...th.dangerBtn, padding: '9px 13px', borderRadius: '14px', fontSize: '11.5px', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Trash2 size={14} /> {tx('meRemove')}
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={labelStyle}>{tx('meName')}</label>
          <input type="text" className="me-field" value={editName} onChange={(e) => setEditName(e.target.value)} style={fieldBase} maxLength={40} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={labelStyle}>{tx('meBio')}</label>
          <textarea className="me-field" value={editBio} onChange={(e) => setEditBio(e.target.value)} maxLength={160} style={{ ...fieldBase, fontSize: '13px', fontWeight: 700, resize: 'none', height: '78px' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={labelStyle}>{tx('meMobile')}</label>
          <input type="tel" className="me-field" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} style={fieldBase} maxLength={20} />
        </div>

        {error && (
          <div role="alert" style={{ ...th.dangerBtn, cursor: 'default', borderRadius: '14px', padding: '10px 12px', fontSize: '12px', fontWeight: 800, lineHeight: 1.45 }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={isSaving} className="me-press" style={{ ...th.primaryBtn, width: '100%', padding: '15px', borderRadius: '18px', fontSize: '14px', marginTop: '4px', cursor: isSaving ? 'default' : 'pointer', opacity: isSaving ? 0.7 : 1 }}>
          {isSaving ? tx('meSaving') : tx('meSaveChanges')}
        </button>
      </form>
    </div>
  );
}
