import type { IncomingMessage, ServerResponse } from 'http';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc
} from 'firebase/firestore';

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

// In-memory cache for high-performance sub-millisecond responses
let memoryCache: {
  data: any;
  timestamp: number;
} | null = null;

const CACHE_TTL_MS = 2000; // 2 seconds cache to reflect Firestore changes rapidly

export async function fetchFullData(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && memoryCache && (now - memoryCache.timestamp < CACHE_TTL_MS)) {
    return memoryCache.data;
  }

  let events: any[] = [];
  let announcements: any[] = [];
  let execomMembers: any[] = [];
  let reports: any[] = [];
  let settings: any = {
    clubName: 'FOSS Cell TKMCE',
    tagline: 'Freedom to Learn, Share, and Hack.',
    manifesto: 'Promoting software freedom, open hardware, privacy, and digital autonomy since 2012 at TKM College of Engineering, Kollam.',
    email: 'fosscelltkmce@gmail.com',
    github: 'https://github.com/tkmfoss',
    instagram: 'https://instagram.com/tkmfoss',
    discord: 'https://discord.gg/uXrWyWqvWx'
  };

  // 1. Fetch Events directly from Firestore
  try {
    const eventsSnap = await getDocs(collection(db, 'foss_events'));
    events = eventsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    events.sort((a: any, b: any) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
  } catch (err) {
    console.error('[API] Firestore events fetch error:', err);
  }

  // 2. Fetch Announcements directly from Firestore
  try {
    const annSnap = await getDocs(collection(db, 'foss_announcements'));
    announcements = annSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    announcements.sort((a: any, b: any) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
  } catch (err) {
    console.error('[API] Firestore announcements fetch error:', err);
  }

  // 3. Fetch Execom directly from Firestore
  try {
    const exSnap = await getDocs(collection(db, 'foss_execom'));
    execomMembers = exSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    execomMembers.sort((a: any, b: any) => (a.order || 99) - (b.order || 99));
  } catch (err) {
    console.error('[API] Firestore execom fetch error:', err);
  }

  // 4. Fetch Reports directly from Firestore
  try {
    const repSnap = await getDocs(collection(db, 'foss_reports'));
    reports = repSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    reports.sort((a: any, b: any) => new Date(b.eventDate || 0).getTime() - new Date(a.eventDate || 0).getTime());
  } catch (err) {
    console.error('[API] Firestore reports fetch error:', err);
  }

  // 5. Fetch Settings directly from Firestore
  try {
    const setSnap = await getDoc(doc(db, 'foss_settings', 'general'));
    if (setSnap.exists()) {
      settings = setSnap.data();
    }
  } catch (err) {
    console.error('[API] Firestore settings fetch error:', err);
  }

  const currentExecom = execomMembers.filter((m: any) => m.isCurrent);
  const pastExecom = execomMembers.filter((m: any) => !m.isCurrent);

  const payload = {
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
  };

  memoryCache = {
    data: payload,
    timestamp: now
  };

  return payload;
}

export function handleApiRequest(req: IncomingMessage, res: ServerResponse): boolean {
  const url = req.url || '';

  // Only handle routes starting with /api
  if (!url.startsWith('/api')) {
    return false;
  }

  // Set standard CORS headers for any external requester
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return true;
  }

  const cleanUrl = url.split('?')[0];

  const sendJson = (statusCode: number, data: any) => {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  };

  (async () => {
    try {
      if (cleanUrl === '/api/health') {
        sendJson(200, {
          status: 'ok',
          service: 'tkmfoss-api',
          uptime: process.uptime(),
          timestamp: new Date().toISOString()
        });
        return;
      }

      if (cleanUrl === '/api/data' || cleanUrl === '/api' || cleanUrl === '/api/all') {
        const fullData = await fetchFullData();
        sendJson(200, fullData);
        return;
      }

      if (cleanUrl === '/api/events') {
        const fullData = await fetchFullData();
        sendJson(200, {
          status: 'success',
          count: fullData.events.length,
          events: fullData.events
        });
        return;
      }

      if (cleanUrl === '/api/announcements') {
        const fullData = await fetchFullData();
        sendJson(200, {
          status: 'success',
          count: fullData.announcements.length,
          announcements: fullData.announcements
        });
        return;
      }

      if (cleanUrl === '/api/execom') {
        const fullData = await fetchFullData();
        sendJson(200, {
          status: 'success',
          execom: fullData.execom
        });
        return;
      }

      if (cleanUrl === '/api/reports') {
        const fullData = await fetchFullData();
        sendJson(200, {
          status: 'success',
          count: fullData.reports.length,
          reports: fullData.reports
        });
        return;
      }

      sendJson(404, {
        status: 'error',
        message: `Endpoint ${url} not found.`
      });
    } catch (err: any) {
      console.error('[API Error]:', err);
      sendJson(500, {
        status: 'error',
        message: err.message || 'Internal server error'
      });
    }
  })();

  return true;
}
