import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

export const firebaseConfig = {
  apiKey: "AIzaSyDg-xHaf7-hUbc_lKmL1W19-kQzzQs4SDU",
  authDomain: "admin-web-16b4a.firebaseapp.com",
  projectId: "admin-web-16b4a",
  storageBucket: "admin-web-16b4a.firebasestorage.app",
  messagingSenderId: "747387815719",
  appId: "1:747387815719:web:78557b7a5bf0ea61058b02"
};

// Initialize Firebase safely
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export const COLLECTIONS = {
  EVENTS: 'foss_events',
  ANNOUNCEMENTS: 'foss_announcements',
  EXECOM: 'foss_execom',
  REPORTS: 'foss_reports',
  SETTINGS: 'foss_settings'
} as const;

export default app;
