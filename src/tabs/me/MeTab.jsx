import React, { useEffect, useRef, useState } from 'react';
import { Edit3, Crown } from 'lucide-react';
import { useBackHandler } from '../../utils/useBackHandler';
import { useMeTheme, ME_CSS } from './meTheme';
import { useMeText } from './meTexts';
import { useAuthProfile } from './profile/useAuthProfile';
import { saveProfile } from './profile/profileService';
import { logOut } from './auth/authService';
import ProfileCard from './profile/ProfileCard';
import EditProfileScreen from './profile/EditProfileScreen';
import LoginScreen from './auth/LoginScreen';
import AccountStatusCard from './auth/AccountStatusCard';
import DeleteAccountModal from './auth/DeleteAccountModal';
import SubscriptionScreen from './subscription/SubscriptionScreen';
import ConfirmDialog from './ui/ConfirmDialog';
import Toast from './ui/Toast';

// Me tab: sirf screens ko jodta hai. Har kaam ki apni file hai:
//   auth/          login, sign up, logout, account delete
//   profile/       profile dikhana aur badalna
//   subscription/  plans aur subscription
//   ui/            chhote pop-up aur message
export default function MeTab() {
  const th = useMeTheme();
  const tx = useMeText();
  const { authReady, user, isLoggedIn, profile, setProfile } = useAuthProfile();

  const [currentView, setCurrentView] = useState('main'); // 'main' | 'login' | 'edit' | 'subscription'
  const [toast, setToast] = useState(null);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const toastTimer = useRef(null);

  const notify = (type, text) => {
    if (!text) return;
    setToast({ type, text });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  };

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  // Back button: andar ke page -> Me page; pop-up -> band
  useBackHandler(currentView !== 'main', () => setCurrentView('main'));
  useBackHandler(confirmLogout, () => setConfirmLogout(false));
  useBackHandler(showDelete, () => setShowDelete(false));

  // Login nahi hai to Edit Profile page nahi khul sakta
  useEffect(() => {
    if (authReady && !isLoggedIn && currentView === 'edit') setCurrentView('main');
  }, [authReady, isLoggedIn, currentView]);

  const openEditProfile = () => {
    if (!isLoggedIn) {
      setCurrentView('login');
      return;
    }
    setCurrentView('edit');
  };

  const handleSaveProfile = async (updated) => {
    if (!user) throw new Error('Please login first.');
    const { slow } = await saveProfile(user.uid, updated);
    setProfile(updated);
    setCurrentView('main');
    if (slow) notify('error', tx('alertSlow'));
    else notify('success', tx('meProfileSaved'));
  };

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logOut(); // onAuthStateChanged baaki sab reset kar deta hai (logOut khud kabhi 20 sec se zyada nahi rukta)
      notify('success', tx('meLoggedOut'));
    } catch (error) {
      notify('error', tx('alertLogoutErr') + (error?.message || ''));
    }
    // Pop-up har haal me band ho, taaki screen atki na rahe
    setConfirmLogout(false);
    setLoggingOut(false);
  };

  const shell = (content) => (
    <>
      <style>{ME_CSS}</style>
      {content}
      <Toast toast={toast} />
      {confirmLogout && (
        <ConfirmDialog
          title={tx('meLogout')}
          message={tx('meConfirmLogout')}
          confirmLabel={tx('meLogout')}
          cancelLabel={tx('meCancel')}
          danger
          busy={loggingOut}
          onConfirm={handleLogout}
          onCancel={() => setConfirmLogout(false)}
        />
      )}
      {showDelete && user && (
        <DeleteAccountModal
          user={user}
          onClose={() => setShowDelete(false)}
          onDeleted={() => {
            setShowDelete(false);
            setCurrentView('main');
            notify('success', tx('meDeleted'));
          }}
        />
      )}
    </>
  );

  // --- Edit Profile (sirf login ke baad) ---
  if (currentView === 'edit' && isLoggedIn) {
    return shell(<EditProfileScreen user={user} profile={profile} onSave={handleSaveProfile} onBack={() => setCurrentView('main')} />);
  }

  // --- Login / Sign up ---
  if (currentView === 'login') {
    return shell(
      <LoginScreen
        onBack={() => setCurrentView('main')}
        onSuccess={(message) => {
          setCurrentView('main');
          notify('success', message);
        }}
      />
    );
  }

  // --- Subscription ---
  if (currentView === 'subscription') {
    return shell(<SubscriptionScreen onBack={() => setCurrentView('main')} />);
  }

  // --- Main Me page ---
  if (!authReady) {
    return shell(
      <div style={{ padding: '60px 16px', textAlign: 'center', color: th.muted, fontSize: '12px', fontWeight: 800 }}>
        {tx('meLoading')}
      </div>
    );
  }

  return shell(
    <div style={th.pageStyle}>
      <ProfileCard user={user} profile={profile} />

      {isLoggedIn && (
        <button type="button" onClick={openEditProfile} className="me-press" style={{ ...th.ghostBtn, width: '100%', padding: '15px', borderRadius: '20px', fontSize: '14px', color: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <Edit3 size={18} /> {tx('meEditProfile')}
        </button>
      )}

      <button type="button" onClick={() => setCurrentView('subscription')} className="me-press" style={{ ...th.goldBtn, width: '100%', padding: '15px', borderRadius: '20px', fontSize: '14px', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <Crown size={18} /> {tx('meManageSub')}
      </button>

      <AccountStatusCard
        isLoggedIn={isLoggedIn}
        onLogin={() => setCurrentView('login')}
        onLogout={() => setConfirmLogout(true)}
        onDelete={() => setShowDelete(true)}
      />
    </div>
  );
}
