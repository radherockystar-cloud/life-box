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
    dob: existingCard?.dob || '',
    email: existingCard?.email || '',
    mobile: existingCard?.mobile || '',
    emergencyMsg: existingCard?.emergencyMsg || 'Ghar jaldi aao, sab intezar kar rahe hain!',
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
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#fff' }}>
            {existingCard ? '✨ Edit Family Profile' : '✨ Add New Member'}
          </h3>
          <button onClick={onClose} style={closeBtnStyle}>✕</button>
        </div>

        <div style={{ padding: '20px', overflowY: 'auto' }}>
          {!showCropper ? (
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={photoWrapStyle}>
                {photoSrc ? (
                  <img src={photoSrc} alt="preview" style={photoImgStyle} />
                ) : (
                  <span style={{ fontSize: '32px', color: '#f43f5e' }}>+</span>
                )}
              </div>
              <label style={uploadLabelStyle}>
                📷 Choose Photo
                <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
              </label>
            </div>
          ) : (
            <div>
              <div style={{ position: 'relative', width: '100%', height: '300px', background: '#000', borderRadius: '16px', overflow: 'hidden' }}>
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
                style={{ width: '100%', marginTop: '14px', accentColor: '#f43f5e' }}
              />
              <button onClick={confirmCrop} style={primaryBtnStyle}>Confirm Crop</button>
            </div>
          )}

          {!showCropper && (
            <>
              <FormField label="Full Name" value={form.name} onChange={handleChange('name')} placeholder=" jaise: Radhe" />
              <FormField label="Relation / Designation" value={form.designation} onChange={handleChange('designation')} placeholder=" jaise: Brother / Elder" />
              <FormField label="Date of Birth (Birthday Alert ke liye)" value={form.dob} onChange={handleChange('dob')} type="date" />
              <FormField label="Emergency Alert Message" value={form.emergencyMsg} onChange={handleChange('emergencyMsg')} placeholder="Ghar jaldi aao..." />
              <FormField label="Mobile Number" value={form.mobile} onChange={handleChange('mobile')} type="tel" />
              <FormField label="WhatsApp Number" value={form.whatsapp} onChange={handleChange('whatsapp')} type="tel" />
              <FormField label="Email" value={form.email} onChange={handleChange('email')} type="email" />
              <FormField label="Instagram Link" value={form.instagram} onChange={handleChange('instagram')} />
              <FormField label="Address" value={form.address} onChange={handleChange('address')} />
              <FormField label="Personal Bio / Notes" value={form.bio} onChange={handleChange('bio')} textarea />

              <button onClick={handleSubmit} style={saveBtnStyle}>Save Family Member 🚀</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function FormField({ label, value, onChange, type = 'text', textarea, placeholder }) {
  return (
    <div style={{ marginBottom: '14px', textAlign: 'left' }}>
      <label style={{ fontSize: '13px', fontWeight: '800', color: '#f43f5e', display: 'block', marginBottom: '6px' }}>
        {label}
      </label>
      {textarea ? (
        <textarea value={value} onChange={onChange} rows={3} placeholder={placeholder} style={inputStyle} />
      ) : (
        <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={inputStyle} />
      )}
    </div>
  );
}

const overlayStyle = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
  display: 'flex', alignItems: 'flex-end', zIndex: 1000,
};
const sheetStyle = {
  background: '#0f172a', width: '100%', maxHeight: '90vh', color: '#fff',
  borderTopLeftRadius: '30px', borderTopRightRadius: '30px',
  display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid rgba(244,63,94,0.3)',
};
const headerStyle = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', background: '#1e293b',
};
const closeBtnStyle = {
  border: 'none', background: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '50%',
  width: '34px', height: '34px', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
};
const photoWrapStyle = {
  width: '110px', height: '110px', borderRadius: '50%', overflow: 'hidden',
  background: '#1e293b', margin: '0 auto 12px', display: 'flex',
  alignItems: 'center', justifyContent: 'center', border: '3px solid #f43f5e',
  boxShadow: '0 0 20px rgba(244,63,94,0.4)',
};
const photoImgStyle = { width: '100%', height: '100%', objectFit: 'cover' };
const uploadLabelStyle = {
  display: 'inline-block', background: 'rgba(244,63,94,0.15)', color: '#fb7185',
  padding: '9px 18px', borderRadius: '25px', fontSize: '13px',
  fontWeight: '800', cursor: 'pointer', border: '1px solid rgba(244,63,94,0.4)',
};
const inputStyle = {
  width: '100%', padding: '12px 14px', borderRadius: '14px',
  border: '1px solid rgba(255,255,255,0.15)', background: '#1e293b', color: '#fff', fontSize: '14px', boxSizing: 'border-box', outline: 'none',
};
const primaryBtnStyle = {
  width: '100%', marginTop: '14px', padding: '14px', background: '#f43f5e',
  color: '#fff', border: 'none', borderRadius: '14px', fontWeight: '900', cursor: 'pointer',
};
const saveBtnStyle = {
  width: '100%', marginTop: '10px', marginBottom: '20px', padding: '15px', background: 'linear-gradient(135deg,#f43f5e,#be123c)',
  color: '#fff', border: 'none', borderRadius: '16px', fontWeight: '900', fontSize: '16px', cursor: 'pointer',
  boxShadow: '0 8px 25px rgba(244,63,94,0.5)',
};
