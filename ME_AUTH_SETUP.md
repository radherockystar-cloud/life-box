# Me tab: login setup (ek baar karna hai)

## 1. Firebase me login ke tareeke chalu karo (free)
Firebase Console -> Authentication -> Sign-in method:
1. **Email/Password** -> Enable -> Save
2. **Google** -> Enable -> support email chuno -> Save

Email/Password aur Google dono free Spark plan me chalte hain. Account delete karna bhi free hai.

## 2. Firestore rules (profile save/delete ke liye)
Firebase Console -> Firestore Database -> Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```
Isse har user sirf apna data padh, likh aur delete kar sakta hai.

## 3. Email login: koi aur setup nahi
Step 1 ke baad Email login aur Sign up phone me seedha chalte hain.

## 4. Google login (Android app) ke liye ek baar ka native setup
Google ka popup Android app ke andar nahi khulta, isliye native plugin chahiye:
1. `npm i @capacitor-firebase/authentication` (version aapke Capacitor 8 se match hona chahiye)
2. `capacitor.config.json` me `plugins` jodo:
   ```json
   "plugins": {
     "FirebaseAuthentication": { "skipNativeAuth": true, "providers": ["google.com"] }
   }
   ```
3. Firebase Console -> Project settings -> Your apps -> Android app: **SHA-1** aur **SHA-256** jodo
4. `google-services.json` download karke `android/app/` me rakho
5. `npx cap sync android`

**Zaroori:** GitHub Actions har baar naya debug keystore banata hai, to SHA-1 har build me badal jata hai aur Google login fail hoga.
Isko theek karne ke liye ek fixed keystore GitHub Secrets me rakhna padega. Jab tak yeh setup na ho, Google button par message aayega ki email login use karo. App crash nahi hoga.

## 5. Account delete kya hata-ta hai
- Firebase ka account aur `users/{uid}/profile/data` (naam, bio, photo, mobile)
- Phone me rakhe notes, goals, memories, voices **nahi** hatte.
