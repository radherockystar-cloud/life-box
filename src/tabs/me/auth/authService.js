// Login / Sign up / Google / Reset / Logout / Delete account: sab Firebase ke kaam yahin hain.
// Screens me Firebase seedha nahi bulaya jata, sirf yahan ke functions bulaye jate hain.
import { Capacitor, registerPlugin } from '@capacitor/core';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithCredential,
  GoogleAuthProvider,
  EmailAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  signOut,
  deleteUser,
} from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../../../firebase';
import { syncBeforeLogout, wipeLocalAfterLogout, deleteCloudData } from '../../../utils/cloudSync';

// Android app me Google login ke liye native plugin chahiye (setup: ME_AUTH_SETUP.md dekho).
// Plugin install na ho to yeh sirf ek saaf error deta hai, app crash nahi hota.
const NativeGoogle = registerPlugin('FirebaseAuthentication');
const isNative = () => Capacitor.isNativePlatform();

const googleCancelled = (error) =>
  /cancel|closed|dismiss/i.test(String(error?.message || '')) ||
  error?.code === 'auth/popup-closed-by-user' ||
  error?.code === 'auth/cancelled-popup-request';

// Native Google se credential lo (Android app)
async function nativeGoogleCredential() {
  let result;
  try {
    result = await NativeGoogle.signInWithGoogle();
  } catch (error) {
    if (googleCancelled(error)) {
      const cancelled = new Error('cancelled');
      cancelled.code = 'lifebox/cancelled';
      throw cancelled;
    }
    const notReady = new Error('google-not-ready');
    notReady.code = 'lifebox/google-not-ready';
    notReady.cause = error;
    throw notReady;
  }
  const idToken = result?.credential?.idToken;
  const accessToken = result?.credential?.accessToken;
  if (!idToken && !accessToken) {
    const notReady = new Error('google-not-ready');
    notReady.code = 'lifebox/google-not-ready';
    throw notReady;
  }
  return GoogleAuthProvider.credential(idToken || null, accessToken || null);
}

export async function emailLogin(email, password) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function emailSignUp({ name, email, password }) {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  const user = result.user;
  if (name) {
    try { await updateProfile(user, { displayName: name }); } catch { /* naam baad me bhi bhar sakte hain */ }
  }
  let verifySent = false;
  try {
    await sendEmailVerification(user);
    verifySent = true;
  } catch { /* verification mail na jaye to bhi account ban chuka hai */ }
  return { user, verifySent };
}

// Google login. Cancel karne par null deta hai (koi error nahi).
export async function googleSignIn() {
  try {
    if (isNative()) {
      const credential = await nativeGoogleCredential();
      const result = await signInWithCredential(auth, credential);
      return result.user;
    }
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    if (error?.code === 'lifebox/cancelled' || googleCancelled(error)) return null;
    throw error;
  }
}

export async function sendReset(email) {
  await sendPasswordResetEmail(auth, email);
}

// Logout: pehle baaki data cloud me bhejo. Sab pahunch gaya to is device se account ka data hata do
// (cloud me safe hai, dobara login par aa jayega). Net na ho / upload fail ho to data device par hi rehta hai,
// taaki kuch kho na jaye (agla login usi account se ho to wahi se aage chalega).
export async function logOut() {
  const uid = auth.currentUser && auth.currentUser.uid;
  let allSynced = false;
  if (uid) allSynced = await syncBeforeLogout(uid);
  await signOut(auth);
  if (isNative()) {
    try { await NativeGoogle.signOut(); } catch { /* plugin na ho to koi baat nahi */ }
  }
  if (allSynced) {
    try { await wipeLocalAfterLogout(); } catch (e) { console.warn('Local data clear failed after logout', e); }
  }
  return { wiped: allSynced };
}

// Kaun se tareeke se login hai ('password' ya 'google.com')
export function getLoginMethods(user) {
  return (user?.providerData || []).map((p) => p.providerId);
}

// Account delete: pehle dobara pehchaan (Firebase ka niyam), phir cloud profile, phir account.
export async function deleteMyAccount({ password } = {}) {
  const user = auth.currentUser;
  if (!user) {
    const e = new Error('no-user');
    e.code = 'auth/no-current-user';
    throw e;
  }

  const methods = getLoginMethods(user);
  if (methods.includes('password')) {
    if (!password) {
      const e = new Error('password-needed');
      e.code = 'lifebox/password-needed';
      throw e;
    }
    await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, password));
  } else if (methods.includes('google.com')) {
    if (isNative()) {
      await reauthenticateWithCredential(user, await nativeGoogleCredential());
    } else {
      await reauthenticateWithPopup(user, googleProvider);
    }
  }

  // Cloud profile aur cloud ka saara data (Storage) pehle hatao (agar yeh fail ho to account nahi hatega, taaki data adhura na rahe)
  await deleteCloudData(user.uid);
  await deleteDoc(doc(db, 'users', user.uid, 'profile', 'data'));
  await deleteUser(user);
}

// Saaf, samajhne layak error message (tx = text function)
export function authErrorMessage(error, tx) {
  switch (error?.code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-login-credentials':
      return tx('errWrongCreds');
    case 'auth/invalid-email':
      return tx('errBadEmail');
    case 'auth/too-many-requests':
      return tx('errTooMany');
    case 'auth/network-request-failed':
      return tx('errNetwork');
    case 'auth/email-already-in-use':
      return tx('errEmailInUse');
    case 'auth/weak-password':
      return tx('errWeakPassword');
    case 'auth/requires-recent-login':
      return tx('errRecentLogin');
    case 'auth/user-disabled':
      return tx('errUserDisabled');
    case 'auth/popup-blocked':
      return tx('errPopupBlocked');
    case 'auth/operation-not-allowed':
    case 'auth/admin-restricted-operation':
    case 'auth/configuration-not-found':
      return tx('errNotEnabled');
    case 'lifebox/google-not-ready':
      return tx('errGoogleSetup');
    case 'lifebox/password-needed':
      return tx('errPasswordNeeded');
    default:
      return error?.message || tx('errGeneric');
  }
}
