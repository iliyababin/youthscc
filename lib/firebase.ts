import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyD9Jzko0jLCx_zurz2XYs6Za6o9IHF0YeA",
  authDomain: "scc-cg.firebaseapp.com",
  projectId: "scc-cg",
  storageBucket: "scc-cg.firebasestorage.app",
  messagingSenderId: "815337015634",
  appId: "1:815337015634:web:d1c3348892221626c3528b",
  measurementId: "G-F1ZVRWTJDZ"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics (only in browser environment)
export const analytics = typeof window !== 'undefined' && isSupported().then(yes => yes ? getAnalytics(app) : null);

export default app;
