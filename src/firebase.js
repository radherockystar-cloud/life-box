import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB0ChpmIn9CPUmafTVQXY4tcUnFfT01owc",
  authDomain: "Lifebox-44c35.firebaseapp.com",
  projectId: "Lifebox-44c35",
  storageBucket: "Lifebox-44c35.firebasestorage.app",
  messagingSenderId: "955510250696",
  appId: "1:955510250696:web:b7490c9b8aa402237699fd",
  measurementId: "G-4E037LEL4Q"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const storage = getStorage(app);
export const db = getFirestore(app);
