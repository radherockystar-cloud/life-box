import React, { useState } from 'react';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, User, Heart, Loader2, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useMeTheme } from '../meTheme';
import { useMeText } from '../meTexts';
import { emailLogin, emailSignUp, googleSignIn, sendReset, authErrorMessage } from './authService';

const GOOGLE_G = (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.19v3.15C3.17 21.32 7.22 24 12 24z" />
    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.19C.43 8.12 0 9.99 0 12s.43 3.88 1.19 5.42l4.09-3.15z" />
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.22 0 3.17 2.68 1.19 6.58l4.09 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
  </svg>
);

// Icon wala input box
function Field({ th, icon: Icon, right, ...inputProps }) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <Icon size={17} color="#e11d48" style={{ position: 'absolute', left: '15px', pointerEvents: 'none' }} />
      <input
        className="me-field"
        {...inputProps}
        style={{ ...th.field, width: '100%', boxSizing: 'border-box', padding: right ? '14px 46px 14px 44px' : '14px 16px 14px 44px', borderRadius: '16px', outline: 'none', fontSize: '14px', fontWeight: 800 }}
      />
      {right}
    </div>
  );
}

// Login + Sign up ka page. Kaam hone par onSuccess(message) bulata hai.
export default function LoginScreen({ onBack, onSuccess }) {
  const th = useMeTheme();
  const tx = useMeText();

  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(''); // '' | 'email' | 'google' | 'reset'
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const isSignUp = mode === 'signup';
  const working = busy !== '';

  const switchMode = (next) => {
    if (working) return;
    setMode(next);
    setError('');
    setInfo('');
    setPassword('');
    setConfirm('');
    setShowPw(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (working) return;
    setError('');
    setInfo('');

    if (isSignUp) {
      if (password.length < 6) return setError(tx('errWeakPassword'));
      if (password !== confirm) return setError(tx('errPasswordMismatch'));
    }

    setBusy('email');
    try {
      if (isSignUp) {
        const { verifySent } = await emailSignUp({ name: name.trim(), email: email.trim(), password });
        onSuccess(verifySent ? tx('meSignedUpVerify') : '');
      } else {
        await emailLogin(email.trim(), password);
        onSuccess('');
      }
    } catch (err) {
      setError(tx('alertLoginFail') + authErrorMessage(err, tx));
      setBusy('');
    }
  };

  const handleGoogle = async () => {
    if (working) return;
    setError('');
    setInfo('');
    setBusy('google');
    try {
      const user = await googleSignIn();
      if (user) {
        onSuccess('');
        return;
      }
    } catch (err) {
      setError(tx('alertGoogleFail') + authErrorMessage(err, tx));
    }
    setBusy('');
  };

  const handleForgot = async () => {
    if (working) return;
    setError('');
    setInfo('');
    if (!email.trim()) return setError(tx('alertEnterEmail'));
    setBusy('reset');
    try {
      await sendReset(email.trim());
      setInfo(tx('alertResetSent'));
    } catch (err) {
      setError(tx('alertResetFail') + authErrorMessage(err, tx));
    }
    setBusy('');
  };

  const eyeButton = (
    <button
      type="button"
      onClick={() => setShowPw((v) => !v)}
      aria-label={showPw ? tx('meHidePassword') : tx('meShowPassword')}
      style={{ position: 'absolute', right: '10px', background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', color: '#a8466c', display: 'flex' }}
    >
      {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
    </button>
  );

  return (
    <div style={th.pageStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button type="button" onClick={onBack} style={th.iconBtn} aria-label="Back" className="me-press">
          <ArrowLeft size={20} />
        </button>
        <h2 style={{ fontSize: '18px', fontWeight: 900, color: th.ink }}>{isSignUp ? tx('meTabSignUp') : tx('meLoginTitle')}</h2>
      </div>

      {/* Hero */}
      <div className="me-rise" style={{ textAlign: 'center', padding: '6px 10px 0' }}>
        <div style={{ width: '78px', height: '78px', borderRadius: '28px', margin: '0 auto 14px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', background: 'linear-gradient(160deg, #fb7185 0%, #e11d48 55%, #9d174d 100%)', border: '1px solid rgba(255,255,255,0.5)', borderTop: '1px solid rgba(255,255,255,0.85)', boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,0.65), inset 0 -8px 14px -6px rgba(80,0,40,0.5), 0 14px 26px -8px rgba(225,29,72,0.7), 0 0 30px rgba(244,63,94,0.45)' }}>
          <Heart size={34} fill="#ffffff" className="me-twinkle" />
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: 900, color: th.ink, textShadow: th.light ? '0 0 16px rgba(251,113,133,0.4)' : 'none' }}>
          {isSignUp ? tx('meCreateTitle') : tx('meWelcomeBack')}
        </h1>
        <p style={{ fontSize: '12.5px', fontWeight: 700, color: th.muted, marginTop: '6px', lineHeight: 1.5 }}>
          {isSignUp ? tx('meCreateSub') : tx('meWelcomeSub')}
        </p>
      </div>

      <div className="me-rise" style={{ ...th.glass, borderRadius: '28px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Login / Sign up */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', padding: '5px', borderRadius: '18px', background: th.light ? 'rgba(244,63,94,0.08)' : th.c.inputBg, boxShadow: th.light ? 'inset 0 2px 6px rgba(244,63,94,0.15)' : 'none' }}>
          {[
            { key: 'login', label: tx('meTabLogin') },
            { key: 'signup', label: tx('meTabSignUp') },
          ].map((tab) => {
            const active = mode === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => switchMode(tab.key)}
                className="me-press"
                style={active ? { ...th.primaryBtn, padding: '10px', borderRadius: '14px', fontSize: '13px' } : { padding: '10px', borderRadius: '14px', fontSize: '13px', fontWeight: 800, color: th.label, background: 'transparent', border: '1px solid transparent', cursor: 'pointer' }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} noValidate>
          {isSignUp && (
            <Field th={th} icon={User} type="text" placeholder={tx('meNamePh')} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={40} />
          )}
          <Field th={th} icon={Mail} type="email" placeholder={tx('meEmailPh')} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" inputMode="email" required />
          <Field th={th} icon={Lock} type={showPw ? 'text' : 'password'} placeholder={tx('mePasswordPh')} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={isSignUp ? 'new-password' : 'current-password'} required right={eyeButton} />
          {isSignUp && (
            <Field th={th} icon={Lock} type={showPw ? 'text' : 'password'} placeholder={tx('meConfirmPasswordPh')} value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" required />
          )}

          {!isSignUp && (
            <div style={{ textAlign: 'right', marginTop: '-2px' }}>
              <button type="button" onClick={handleForgot} disabled={working} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 900, color: '#e11d48', padding: '2px 0', opacity: busy === 'reset' ? 0.6 : 1 }}>
                {busy === 'reset' ? '...' : tx('meForgot')}
              </button>
            </div>
          )}

          {error && (
            <div role="alert" style={{ ...th.dangerBtn, cursor: 'default', display: 'flex', alignItems: 'flex-start', gap: '8px', borderRadius: '14px', padding: '10px 12px', fontSize: '12px', fontWeight: 800, lineHeight: 1.45 }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '1px' }} /> <span>{error}</span>
            </div>
          )}
          {info && (
            <div role="status" style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', borderRadius: '14px', padding: '10px 12px', fontSize: '12px', fontWeight: 800, lineHeight: 1.45, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.4)', color: '#047857' }}>
              <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: '1px' }} /> <span>{info}</span>
            </div>
          )}

          <button type="submit" disabled={working} className="me-press" style={{ ...th.primaryBtn, width: '100%', padding: '15px', borderRadius: '18px', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: working ? 0.75 : 1, cursor: working ? 'default' : 'pointer' }}>
            {busy === 'email' && <Loader2 size={17} className="me-spin" />}
            {isSignUp ? tx('meSignUpBtn') : tx('meLoginEmailBtn')}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: th.muted, fontSize: '11px', fontWeight: 900 }}>
          <div style={{ flex: 1, height: '1px', background: th.light ? 'rgba(251,113,133,0.3)' : th.c.line }} />
          {tx('meOr')}
          <div style={{ flex: 1, height: '1px', background: th.light ? 'rgba(251,113,133,0.3)' : th.c.line }} />
        </div>

        <button type="button" onClick={handleGoogle} disabled={working} className="me-press" style={{ ...th.ghostBtn, width: '100%', padding: '14px', borderRadius: '18px', fontSize: '13.5px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', opacity: working && busy !== 'google' ? 0.6 : 1 }}>
          {busy === 'google' ? <Loader2 size={18} className="me-spin" /> : GOOGLE_G}
          {tx('meGoogle')}
        </button>
      </div>

      <p style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '11px', fontWeight: 700, color: th.muted, lineHeight: 1.55, padding: '0 6px' }}>
        <ShieldCheck size={15} color="#e11d48" style={{ flexShrink: 0, marginTop: '1px' }} /> <span>{tx('meLoginFootnote')}</span>
      </p>
    </div>
  );
}
