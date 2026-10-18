// Login / Sign up / Google / Reset / Logout / Delete account: sab Firebase ke kaam yahin hain.
// Screens me Firebase seedha nahi bulaya jata, sirf yahan ke functions bulaye jate hain.
import { Capacitor, registerPlugin } from '@capacitor/core';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithCredential,
  getAdditionalUserInfo,
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

// Kuch kaam (jaise net/Storage atak jaye) kabhi khatam nahi hote. Itne time baad aage badh jao.
const withTimeout = (promise, ms, fallback) =>
  Promise.race([
    Promise.resolve(promise).catch(() => fallback),
    new Promise((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);

// Intezaar sirf ms tak. Error aaye to wahi error milta hai (chhupta nahi); time khatam ho to { timedOut: true }.
const withDeadline = (promise, ms) =>
  Promise.race([
    Promise.resolve(promise).then((value) => ({ timedOut: false, value })),
    new Promise((resolve) => setTimeout(() => resolve({ timedOut: true }), ms)),
  ]);

// "Login" tab se Google se aisa user aaye jiska account nahi hai, to Firebase use turant naya account bana deta hai.
// Hum use rokte hain: naya bana account hata dete hain aur "account nahi mila" batate hain.
// Is dauran (gate on) app is naye user ko "login hua" nahi maanta.
let loginGate = false;
export const AUTH_RECHECK_EVENT = 'lifebox-auth-recheck';
export const isLoginGateActive = () => loginGate;
export const isBrandNewAccount = (u) =>
  !!u && !!u.metadata && !!u.metadata.creationTime && u.metadata.creationTime === u.metadata.lastSignInTime;

// Google login. Cancel karne par null deta hai (koi error nahi).
// allowCreate=false (Login tab): sirf pehle se bane account se login hoga, naya account nahi banega.
// allowCreate=true (Sign up tab): naya account bhi ban sakta hai.
export async function googleSignIn({ allowCreate = true } = {}) {
  loginGate = !allowCreate;
  try {
    let result;
    if (isNative()) {
      const credential = await nativeGoogleCredential();
      result = await signInWithCredential(auth, credential);
    } else {
      result = await signInWithPopup(auth, googleProvider);
    }

    if (!allowCreate && getAdditionalUserInfo(result)?.isNewUser) {
      try {
        await deleteUser(result.user);
      } catch {
        try { await signOut(auth); } catch { /* ignore */ }
      }
      if (isNative()) await withTimeout(NativeGoogle.signOut(), 3000, null);
      const e = new Error('no-account');
      e.code = 'lifebox/no-account';
      throw e;
    }
    return result.user;
  } catch (error) {
    if (error?.code === 'lifebox/cancelled' || googleCancelled(error)) return null;
    throw error;
  } finally {
    loginGate = false;
    try { window.dispatchEvent(new Event(AUTH_RECHECK_EVENT)); } catch { /* ignore */ }
  }
}

export async function sendReset(email) {
  await sendPasswordResetEmail(auth, email);
}

// Logout: pehle baaki data cloud me bhejo. Sab pahunch gaya to is device se account ka data hata do
// (cloud me safe hai, dobara login par aa jayega). Net na ho / upload fail ho / bahut der lage to data device par hi rehta hai,
// taaki kuch kho na jaye. Koi bhi step 6-8 second se zyada nahi rukta, isliye logout kabhi atakta nahi.
export async function logOut() {
  const uid = auth.currentUser && auth.currentUser.uid;
  let allSynced = false;
  if (uid) allSynced = (await withTimeout(syncBeforeLogout(uid), 4000, false)) === true;
  await signOut(auth);
  if (isNative()) await withTimeout(NativeGoogle.signOut(), 3000, null);
  if (allSynced) {
    const wiped = await withTimeout(wipeLocalAfterLogout().then(() => true), 8000, false);
    if (!wiped) console.warn('Local data clear did not finish after logout');
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

  // Cloud ka saara data aur profile pehle hatao. Agar yeh fail ho (error aaye) to account nahi hatega, taaki data adhura na rahe.
  // Par agar cloud (Storage) tak pahunch hi nahi paa rahe aur bahut der lage, to wahin atke nahi rehte:
  // time khatam hone par aage badhte hain (jab tak Storage chalu nahi hai, cloud me kuch hai bhi nahi).
  const cloud = await withDeadline(deleteCloudData(user.uid), 12000);
  if (cloud.timedOut) console.warn('Cloud data delete timed out; continuing with account delete');
  const prof = await withDeadline(deleteDoc(doc(db, 'users', user.uid, 'profile', 'data')), 8000);
  if (prof.timedOut) console.warn('Profile delete timed out; continuing with account delete');
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
    case 'lifebox/google-not-ready': {
      const why = String(error?.cause?.message || '').replace(/\s+/g, ' ').trim().slice(0, 90);
      return tx('errGoogleSetup') + (why ? ` (${why})` : '');
    }
    case 'lifebox/no-account':
      return tx('errNoGoogleAccount');
    case 'lifebox/password-needed':
      return tx('errPasswordNeeded');
    default:
      return error?.message || tx('errGeneric');
  }
}
