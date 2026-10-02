// Manual "+" button aur Template dono isi form ko use karte hain.
// Agar "template" prop mile to us design ke saath card banega, warna default template1 lagega.

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';

async function getCroppedImg(imageSrc, cropPixels) {
  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', reject);
    img.src = imageSrc;
  });
  const canvas = document.createElement('canvas');
  canvas.width = cropPixels.width;
  canvas.height = cropPixels.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(
    image,
    cropPixels.x, cropPixels.y, cropPixels.width, cropPixels.height,
    0, 0, cropPixels.width, cropPixels.height
  );
  return canvas.toDataURL('image/jpeg', 0.9);
}

export default function IDCardForm({ template, existingCard, onSave, onClose }) {
  const [photoSrc, setPhotoSrc] = useState(existingCard?.photo || null);
  const [rawPhoto, setRawPhoto] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const [form, setForm] = useState({
    name: existingCard?.name || '',
    designation: existingCard?.designation || '',
    email: existingCard?.email || '',
    mobile: existingCard?.mobile || '',
    instagram: existingCard?.instagram || '',
    whatsapp: existingCard?.whatsapp || '',
    address: existingCard?.address || '',
    bio: existingCard?.bio || '',
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setRawPhoto(reader.result);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const onCropComplete = useCallback((_, areaPixels) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const confirmCrop = async () => {
    const cropped = await getCroppedImg(rawPhoto, croppedAreaPixels);
    setPhotoSrc(cropped);
    setShowCropper(false);
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = () => {
    if (!form.name.trim()) {
      alert('Name is required');
      return;
    }
    const card = {
      id: existingCard?.id || `card_${Date.now()}`,
      templateId: template?.id || existingCard?.templateId || 'template1',
      photo: photoSrc,
      ...form,
    };
    onSave(card);
  };

  return (
    <div style={overlayStyle}>
      <div style={sheetStyle}>
        <div style={headerStyle}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#1f2937' }}>
            {existingCard ? 'Edit ID Card' : 'New ID Card'}
          </h3>
          <button onClick={onClose} style={closeBtnStyle}>✕</button>
        </div>

        <div style={{ padding: '16px', overflowY: 'auto' }}>
          {!showCropper ? (
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={photoWrapStyle}>
                {photoSrc ? (
                  <img src={photoSrc} alt="preview" style={photoImgStyle} />
                ) : (
                  <span style={{ fontSize: '32px', color: '#9ca3af' }}>+</span>
                )}
              </div>
              <label style={uploadLabelStyle}>
                Choose Photo
                <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
              </label>
            </div>
          ) : (
            <div>
              <div style={{ position: 'relative', width: '100%', height: '300px', background: '#111' }}>
                <Cropper
                  image={rawPhoto}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                style={{ width: '100%', marginTop: '10px' }}
              />
              <button onClick={confirmCrop} style={primaryBtnStyle}>Confirm Crop</button>
            </div>
          )}

          {!showCropper && (
            <>
              <FormField label="Name" value={form.name} onChange={handleChange('name')} />
              <FormField label="Designation" value={form.designation} onChange={handleChange('designation')} />
              <FormField label="Email" value={form.email} onChange={handleChange('email')} type="email" />
              <FormField label="Mobile Number" value={form.mobile} onChange={handleChange('mobile')} type="tel" />
              <FormField label="Instagram Link" value={form.instagram} onChange={handleChange('instagram')} />
              <FormField label="WhatsApp Number" value={form.whatsapp} onChange={handleChange('whatsapp')} type="tel" />
              <FormField label="Address" value={form.address} onChange={handleChange('address')} />
              <FormField label="Bio" value={form.bio} onChange={handleChange('bio')} textarea />

              <button onClick={handleSubmit} style={saveBtnStyle}>Save Card</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function FormField({ label, value, onChange, type = 'text', textarea }) {
  return (
    <div style={{ marginBottom: '12px', textAlign: 'left' }}>
      <label style={{ fontSize: '13px', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '4px' }}>
        {label}
      </label>
      {textarea ? (
        <textarea value={value} onChange={onChange} rows={3} style={inputStyle} />
      ) : (
        <input type={type} value={value} onChange={onChange} style={inputStyle} />
      )}
    </div>
  );
}

const overlayStyle = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
  display: 'flex', alignItems: 'flex-end', zIndex: 1000,
};
const sheetStyle = {
  background: '#fff', width: '100%', maxHeight: '90vh',
  borderTopLeftRadius: '24px', borderTopRightRadius: '24px',
  display: 'flex', flexDirection: 'column', overflow: 'hidden',
};
const headerStyle = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '16px', borderBottom: '1px solid #e5e7eb',
};
const closeBtnStyle = {
  border: 'none', background: '#f3f4f6', borderRadius: '50%',
  width: '32px', height: '32px', fontSize: '16px', cursor: 'pointer',
};
const photoWrapStyle = {
  width: '110px', height: '110px', borderRadius: '50%', overflow: 'hidden',
  background: '#f3f4f6', margin: '0 auto 10px', display: 'flex',
  alignItems: 'center', justifyContent: 'center', border: '3px solid #dc2626',
};
const photoImgStyle = { width: '100%', height: '100%', objectFit: 'cover' };
const uploadLabelStyle = {
  display: 'inline-block', background: '#fef2f2', color: '#dc2626',
  padding: '8px 16px', borderRadius: '20px', fontSize: '13px',
  fontWeight: '700', cursor: 'pointer',
};
const inputStyle = {
  width: '100%', padding: '10px 12px', borderRadius: '10px',
  border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box',
};
const primaryBtnStyle = {
  width: '100%', marginTop: '12px', padding: '12px', background: '#111827',
  color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer',
};
const saveBtnStyle = {
  width: '100%', marginTop: '8px', padding: '14px', background: 'linear-gradient(135deg,#dc2626,#991b1b)',
  color: '#fff', border: 'none', borderRadius: '14px', fontWeight: '800', fontSize: '15px', cursor: 'pointer',
};
