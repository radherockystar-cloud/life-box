import React, { useState, useEffect } from 'react';
import { User, LogIn, Edit3, ShieldCheck, Sparkles, ArrowLeft, Camera, Mail, Lock, Crown, Trash2 } from 'lucide-react';
import { auth, googleProvider, db } from '../../firebase';
import { signInWithEmailAndPassword, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function MeTab() {
  const [profile, setProfile] = useState({
    name: 'Radhe Rocky star',
    bio: 'Chasing dreams & collecting beautiful memories ❤️',
    phone: '+91 9876543210',
    avatar: ''
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserUid, setCurrentUserUid] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [currentView, setCurrentView] = useState('main');

  const [editName, setEditName] = useState(profile.name);
  const [editBio, setEditBio] = useState(profile.bio);
  const [editPhone, setEditPhone] = useState(profile.phone);
  const [editAvatar, setEditAvatar] = useState(profile.avatar);

  // Listen to Real Firebase Auth State & Fetch Firestore Profile
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoggedIn(true);
        setCurrentUserUid(user.uid);
        setUserEmail(user.email || '');

        // Fetch user profile from Firestore securely using UID path
        try {
          const docRef = doc(db, 'users', user.uid, 'profile', 'data');
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProfile(data);
            setEditName(data.name || user.displayName || '');
            setEditBio(data.bio || '');
            setEditPhone(data.phone || '');
            setEditAvatar(data.avatar || user.photoURL || '');
          } else {
            const initialProfile = {
              name: user.displayName || 'Radhe Rocky star',
              bio: 'Chasing dreams & collecting beautiful memories ❤️',
              phone: '+91 9876543210',
              avatar: user.photoURL || ''
            };
            await setDoc(docRef, initialProfile);
            setProfile(initialProfile);
          }
        } catch (error) {
          console.error("Error fetching profile from Firestore:", error);
        }
      } else {
        setIsLoggedIn(false);
        setCurrentUserUid(null);
        setUserEmail('');
      }
    });
    return () => unsubscribe();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setEditAvatar('');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const updated = {
      name: editName,
      bio: editBio,
      phone: editPhone,
      avatar: editAvatar
    };
    setProfile(updated);

    // Save to Firestore securely under the user's UID
    if (currentUserUid) {
      try {
        const docRef = doc(db, 'users', currentUserUid, 'profile', 'data');
        await setDoc(docRef, updated, { merge: true });
      } catch (error) {
        alert('Error saving profile to cloud: ' + error.message);
      }
    }

    setCurrentView('main');
  };

  const handleManualLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      setLoginEmail('');
      setLoginPassword('');
      setCurrentView('main');
    } catch (error) {
      alert('Login Failed: ' + error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setCurrentView('main');
    } catch (error) {
      alert('Google Login Failed: ' + error.message);
    }
  };

  const handleLogout = async () => {
    const confirmLogout = window.confirm('Are you sure you want to log out?');
    if (confirmLogout) {
      try {
        await signOut(auth);
        setIsLoggedIn(false);
        setCurrentUserUid(null);
        setLoginEmail('');
        setLoginPassword('');
      } catch (error) {
        alert('Logout Error: ' + error.message);
      }
    }
  };

  // --- 1. EDIT PROFILE PAGE VIEW ---
  if (currentView === 'edit') {
    return (
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={() => setCurrentView('main')}
            style={{ background: '#fff', border: '1px solid #e5e7eb', padding: '10px', borderRadius: '14px', cursor: 'pointer', color: '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <ArrowLeft size={20} />
          </button>
          <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#111827' }}>Edit Profile ✨</h2>
        </div>

        <form onSubmit={handleSaveProfile} style={{ background: '#fff', padding: '24px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{ 
              width: '90px', 
              height: '90px', 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, #f43f5e, #ec4899)', 
              overflow: 'hidden', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: '#fff', 
              fontSize: '32px', 
              fontWeight: '900',
              border: '3px solid #fff1f2',
              boxShadow: '0 8px 20px rgba(244,63,94,0.25)',
              position: 'relative'
            }}>
              {editAvatar ? (
                <img src={editAvatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              ) : (
                editName.charAt(0)
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <label style={{ background: '#fff1f2', color: '#f43f5e', padding: '8px 14px', borderRadius: '12px', fontSize: '11px', fontWeight: '900', cursor: 'pointer', border: '1px solid rgba(244,63,94,0.3)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Camera size={14} /> Upload Photo
                <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
              </label>

              {editAvatar && (
                <button 
                  type="button" 
                  onClick={handleRemovePhoto}
                  style={{ background: '#fee2e2', color: '#dc2626', padding: '8px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: '900', cursor: 'pointer', border: '1px solid #fca5a5', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Trash2 size={14} /> Remove
                </button>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: '800', color: '#374151' }}>Name</label>
            <input 
              type="text" 
              value={editName} 
              onChange={(e) => setEditName(e.target.value)} 
              style={{ padding: '12px 16px', borderRadius: '14px', border: '1px solid #e5e7eb', outline: 'none', fontSize: '14px', fontWeight: '700', background: '#fafafa' }}
              required 
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: '800', color: '#374151' }}>Bio</label>
            <textarea 
              value={editBio} 
              onChange={(e) => setEditBio(e.target.value)} 
              style={{ padding: '12px 16px', borderRadius: '14px', border: '1px solid #e5e7eb', outline: 'none', fontSize: '13px', fontWeight: '600', background: '#fafafa', resize: 'none', height: '70px' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: '800', color: '#374151' }}>Mobile Number</label>
            <input 
              type="tel" 
              value={editPhone} 
              onChange={(e) => setEditPhone(e.target.value)} 
              style={{ padding: '12px 16px', borderRadius: '14px', border: '1px solid #e5e7eb', outline: 'none', fontSize: '14px', fontWeight: '700', background: '#fafafa' }}
            />
          </div>

          <button 
            type="submit"
            style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #f43f5e, #ec4899)', color: '#ffffff', border: 'none', borderRadius: '16px', fontWeight: '900', fontSize: '14px', cursor: 'pointer', boxShadow: '0 8px 20px rgba(244,63,94,0.3)', marginTop: '10px' }}
          >
            Save Profile Changes ✅
          </button>
        </form>
      </div>
    );
  }

  // --- 2. LOGIN PAGE VIEW ---
  if (currentView === 'login') {
    return (
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={() => setCurrentView('main')}
            style={{ background: '#fff', border: '1px solid #e5e7eb', padding: '10px', borderRadius: '14px', cursor: 'pointer', color: '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <ArrowLeft size={20} />
          </button>
          <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#111827' }}>Cloud Login 🚀</h2>
        </div>

        <div style={{ background: '#fff', padding: '24px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6' }}>
          
          <form onSubmit={handleManualLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#374151' }}>Sign in with Email</h3>
            
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail size={16} color="#9ca3af" style={{ position: 'absolute', left: '14px' }} />
              <input 
                type="email" 
                placeholder="Gmail ID" 
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                style={{ width: '100%', padding: '12px 14px 12px 40px', borderRadius: '14px', border: '1px solid #e5e7eb', outline: 'none', fontSize: '13px', fontWeight: '700', background: '#fafafa' }}
                required
              />
            </div>

            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={16} color="#9ca3af" style={{ position: 'absolute', left: '14px' }} />
              <input 
                type="password" 
                placeholder="Password" 
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                style={{ width: '100%', padding: '12px 14px 12px 40px', borderRadius: '14px', border: '1px solid #e5e7eb', outline: 'none', fontSize: '13px', fontWeight: '700', background: '#fafafa' }}
                required
              />
            </div>

            <div style={{ textAlign: 'right' }}>
              <span 
                onClick={() => alert('Password reset link will be sent to your email via Firebase Auth.')}
                style={{ fontSize: '11px', color: '#f43f5e', fontWeight: '800', cursor: 'pointer' }}
              >
                Forgot Password?
              </span>
            </div>

            <button 
              type="submit"
              style={{ width: '100%', padding: '12px', background: '#f43f5e', color: '#ffffff', border: 'none', borderRadius: '14px', fontWeight: '900', fontSize: '13px', cursor: 'pointer', boxShadow: '0 6px 16px rgba(244,63,94,0.2)' }}
            >
              Login with Email 🔓
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#9ca3af', fontSize: '12px', fontWeight: '700', textAlign: 'center' }}>
            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
            OR
            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
          </div>

          <button 
            onClick={handleGoogleLogin}
            style={{ width: '100%', padding: '12px', background: '#ffffff', color: '#374151', border: '1px solid #e5e7eb', borderRadius: '14px', fontWeight: '900', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.19v3.15C3.17 21.32 7.22 24 12 24z"/><path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.19C.43 8.12 0 9.99 0 12s.43 3.88 1.19 5.42l4.09-3.15z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.22 0 3.17 2.68 1.19 6.58l4.09 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/></svg>
            Continue with Google Account
          </button>

        </div>
      </div>
    );
  }

  // --- 3. MAIN ME TAB VIEW ---
  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '40px' }}>
      
      {isLoggedIn ? (
        <div style={{ 
          background: 'linear-gradient(135deg, #fff1f2, #ffe4e6)', 
          borderRadius: '28px', 
          padding: '24px', 
          textAlign: 'center', 
          boxShadow: '0 10px 25px rgba(244,63,94,0.15)',
          border: '1px solid rgba(255,228,230,0.8)',
          position: 'relative'
        }}>
          <div style={{ 
            width: '84px', 
            height: '84px', 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, #f43f5e, #ec4899)', 
            color: '#ffffff', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 12px auto', 
            fontSize: '32px', 
            fontWeight: '900',
            boxShadow: '0 8px 20px rgba(244,63,94,0.3)',
            overflow: 'hidden',
            border: '3px solid #ffffff'
          }}>
            {profile.avatar ? (
              <img src={profile.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            ) : (
              profile.name.charAt(0)
            )}
          </div>

          <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            {profile.name} <Sparkles size={16} color="#f43f5e" />
          </h2>
          <p style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', marginTop: '4px' }}>{profile.bio}</p>
          <p style={{ fontSize: '11px', color: '#f43f5e', fontWeight: '800', marginTop: '6px' }}>📱 {profile.phone}</p>
          {userEmail && <p style={{ fontSize: '10px', color: '#9ca3af', fontWeight: '700', marginTop: '2px' }}>✉️ {userEmail}</p>}
        </div>
      ) : (
        <div style={{ 
          background: '#f8fafc', 
          borderRadius: '28px', 
          padding: '24px', 
          textAlign: 'center', 
          boxShadow: '0 10px 25px rgba(0,0,0,0.03)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ 
            width: '72px', 
            height: '72px', 
            borderRadius: '50%', 
            background: '#e2e8f0', 
            color: '#64748b', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 12px auto'
          }}>
            <User size={32} />
          </div>
          <h2 style={{ fontSize: '16px', fontWeight: '900', color: '#334155' }}>Guest User</h2>
          <p style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginTop: '4px' }}>Please login to view and sync your profile</p>
        </div>
      )}

      <button 
        onClick={() => {
          setEditName(profile.name);
          setEditBio(profile.bio);
          setEditPhone(profile.phone);
          setEditAvatar(profile.avatar);
          setCurrentView('edit');
        }}
        style={{ 
          width: '100%', 
          padding: '14px', 
          background: '#ffffff', 
          color: '#f43f5e', 
          border: '1px solid rgba(244,63,94,0.3)', 
          borderRadius: '20px', 
          fontSize: '14px', 
          fontWeight: '900', 
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          boxShadow: '0 6px 16px rgba(244,63,94,0.1)'
        }}
      >
        <Edit3 size={18} /> Edit Profile
      </button>

      <button 
        onClick={() => alert('Subscription management screen will open here.')}
        style={{ 
          width: '100%', 
          padding: '14px', 
          background: 'linear-gradient(135deg, #fffbeb, #fef3c7)', 
          color: '#d97706', 
          border: '1px solid rgba(245, 158, 11, 0.3)', 
          borderRadius: '20px', 
          fontSize: '14px', 
          fontWeight: '900', 
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          boxShadow: '0 6px 16px rgba(245,158,11,0.1)'
        }}
      >
        <Crown size={18} /> Manage Subscription
      </button>

      <div style={{ 
        background: '#ffffff', 
        borderRadius: '24px', 
        padding: '20px', 
        boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
        border: '1px solid #f3f4f6'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#fdf2f8', color: '#db2777', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#111827' }}>Cloud Account Status</h3>
            <p style={{ fontSize: '11px', color: '#6b7280', fontWeight: '600' }}>
              {isLoggedIn ? 'Active & Logged In (Firebase Firestore Sync)' : 'Not logged in (Local Mode)'}
            </p>
          </div>
        </div>

        {isLoggedIn ? (
          <button 
            onClick={handleLogout}
            style={{ width: '100%', padding: '14px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '16px', fontWeight: '900', fontSize: '14px', cursor: 'pointer' }}
          >
            Log Out 🔓
          </button>
        ) : (
          <button 
            onClick={() => setCurrentView('login')}
            style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #f43f5e, #ec4899)', color: '#ffffff', border: '1px solid rgba(244,63,94,0.3)', borderRadius: '16px', fontWeight: '900', fontSize: '14px', cursor: 'pointer', boxShadow: '0 8px 20px rgba(244,63,94,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <LogIn size={18} /> Login 🚀
          </button>
        )}
      </div>

    </div>
  );
}
