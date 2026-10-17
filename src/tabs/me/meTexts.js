// Me tab ke saare text yahin se aate hain.
// Pehle translations (t) dekha jata hai; agar koi key wahan nahi hai to neeche ka English text dikhta hai.
// Naya text jodna ho to sirf yahin ek line jodo (translations file badalna zaroori nahi).
import { useApp } from '../../context/AppContext';

export const ME_DEFAULTS = {
  // ---- pehle se maujood keys (fallback) ----
  meEditProfileTitle: 'Edit Profile ✨',
  meName: 'Name',
  meBio: 'Bio',
  meMobile: 'Mobile Number',
  meSaveChanges: 'Save Profile Changes ✅',
  meSaving: 'Saving...',
  meUploadPhoto: 'Upload Photo',
  meRemove: 'Remove',
  meLoginTitle: 'Login',
  meSignInEmail: 'Sign in with Email',
  meEmailPh: 'Email address',
  mePasswordPh: 'Password',
  meForgot: 'Forgot password?',
  meLoginEmailBtn: 'Login',
  meOr: 'OR',
  meGoogle: 'Continue with Google',
  meLoading: 'Loading...',
  meGuestName: 'Guest User',
  meGuestSub: 'Please login to view and sync your profile',
  meEditProfile: 'Edit Profile',
  meManageSub: 'Manage Subscription',
  meSubSoon: 'Subscription is coming soon!',
  meCloudStatus: 'Cloud Account Status',
  meCloudActive: 'Logged in (Cloud sync active)',
  meCloudLocal: 'Not logged in (Local Mode)',
  meLogout: 'Logout',
  meLogin: 'Login 🚀',
  meConfirmLogout: 'Do you want to logout?',
  alertPhotoLoad: 'Could not load this photo. Please try another one.',
  alertSaveFail: 'Could not save: ',
  alertSlow: 'Internet is slow. Your changes will sync when it is back.',
  alertLoginFail: 'Login failed: ',
  alertGoogleFail: 'Google login failed: ',
  alertEnterEmail: 'Please enter your email first.',
  alertResetSent: 'Password reset email sent. Please check your inbox.',
  alertResetFail: 'Could not send reset email: ',
  alertLogoutErr: 'Could not logout: ',
  errWrongCreds: 'Email or password is wrong.',
  errBadEmail: 'Please enter a valid email address.',
  errTooMany: 'Too many attempts. Please try again after some time.',
  errNetwork: 'No internet connection. Please check and try again.',
  errGeneric: 'Something went wrong. Please try again.',

  // ---- naye ----
  meWelcomeBack: 'Welcome back 👋',
  meWelcomeSub: 'Login to keep your profile safe and synced.',
  meCreateTitle: 'Create your account ✨',
  meCreateSub: 'It is free and takes less than a minute.',
  meTabLogin: 'Login',
  meTabSignUp: 'Sign up',
  meNamePh: 'Your name',
  meConfirmPasswordPh: 'Confirm password',
  meSignUpBtn: 'Create account',
  meShowPassword: 'Show password',
  meHidePassword: 'Hide password',
  meAlreadyHave: 'Already have an account?',
  meNoAccount: 'New here?',
  meLoginFootnote: 'Your notes, goals and memories stay on this phone. Login only keeps your profile safe in the cloud.',
  meSignedUpVerify: 'Account created. We sent a verification email to your inbox.',
  meProfileSaved: 'Profile saved ✅',
  meLoggedOut: 'You are logged out.',
  meCancel: 'Cancel',
  meDeleteAccount: 'Delete account',
  meDeleteTitle: 'Delete your account?',
  meDeleteWarn: 'This permanently deletes your cloud account and profile. Notes, goals and other data saved on this phone will stay.',
  meDeleteWarnPassword: 'Enter your password to confirm.',
  meDeleteWarnGoogle: 'You will be asked to sign in with Google once more to confirm.',
  meDeleteBtn: 'Delete forever',
  meDeleting: 'Deleting...',
  meDeleted: 'Your account was deleted.',
  meDeleteFail: 'Could not delete account: ',
  meSubTitle: 'Subscription',
  meSubComingTitle: 'Coming soon',
  errNameRequired: 'Please enter your name.',
  errEmailInUse: 'This email already has an account. Please login instead.',
  errWeakPassword: 'Password must be at least 6 characters.',
  errPasswordMismatch: 'Passwords do not match.',
  errPasswordNeeded: 'Please enter your password.',
  errRecentLogin: 'For safety, please login again and then retry.',
  errNotEnabled: 'This login method is not available yet.',
  errGoogleSetup: 'Google login needs a one-time setup in this app. Please use email login for now.',
  errUserDisabled: 'This account has been disabled.',
  errPopupBlocked: 'The login window was blocked. Please allow pop-ups and try again.',
};

// tx('key') -> t.key ya English fallback.  tx('key', { name: 'Raj' }) -> {name} badal deta hai.
export function useMeText() {
  const { t } = useApp();
  return (key, vars) => {
    const raw = (t && t[key]) ?? ME_DEFAULTS[key] ?? key;
    if (!vars) return raw;
    return String(raw).replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ''));
  };
}
