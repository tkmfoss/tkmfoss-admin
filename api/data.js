import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || 'AIzaSyDg-xHaf7-hUbc_lKmL1W19-kQzzQs4SDU',
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || 'admin-web-16b4a.firebaseapp.com',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'admin-web-16b4a',
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || 'admin-web-16b4a.firebasestorage.app',
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '747387815719',
  appId: process.env.VITE_FIREBASE_APP_ID || '1:747387815719:web:78557b7a5bf0ea61058b02'
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  try {
    let events = [];
    let announcements = [];
    let execomMembers = [];
    let reports = [];
    let settings = {
      clubName: 'FOSS Cell TKMCE',
      tagline: 'Freedom to Learn, Share, and Hack.',
      manifesto: 'Promoting software freedom, open hardware, privacy, and digital autonomy since 2012 at TKM College of Engineering, Kollam.',
      email: 'fosscelltkmce@gmail.com',
      github: 'https://github.com/tkmfoss',
      instagram: 'https://instagram.com/tkmfoss',
      discord: 'https://discord.gg/uXrWyWqvWx'
    };

    // 1. Fetch Events
    const eventsSnap = await getDocs(collection(db, 'foss_events'));
    events = eventsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    events.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());

    // 2. Fetch Announcements
    const announcementsSnap = await getDocs(collection(db, 'foss_announcements'));
    announcements = announcementsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    // 3. Fetch Execom
    const execomSnap = await getDocs(collection(db, 'foss_execom'));
    execomMembers = execomSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    execomMembers.sort((a, b) => (a.order || 99) - (b.order || 99));

    // 4. Fetch Reports
    const repSnap = await getDocs(collection(db, 'foss_reports'));
    reports = repSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    reports.sort((a, b) => new Date(b.eventDate || 0).getTime() - new Date(a.eventDate || 0).getTime());

    // 5. Fetch Settings
    const setSnap = await getDoc(doc(db, 'foss_settings', 'general'));
    if (setSnap.exists()) {
      settings = setSnap.data();
    }

    const currentExecom = execomMembers.filter((m) => m.isCurrent);
    const pastExecom = execomMembers.filter((m) => !m.isCurrent);

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=15, s-maxage=30');

    res.status(200).json({
      status: 'success',
      timestamp: new Date().toISOString(),
      source: 'firebase-firestore',
      events,
      announcements,
      execom: {
        current: currentExecom,
        past: pastExecom,
        all: execomMembers
      },
      reports,
      settings
    });
  } catch (err) {
    console.error('[Vercel API] Error fetching data:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
}
