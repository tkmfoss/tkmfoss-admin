import {
  collection,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  getDocs,
  query,
  orderBy
} from 'firebase/firestore';
import { db, COLLECTIONS } from '../firebase/config';
import { FosEvent, Announcement, ExecomMember, PostEventReport, ClubSettings } from '../types';
import {
  INITIAL_EVENTS,
  INITIAL_EXECOM,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_REPORTS,
  INITIAL_SETTINGS
} from '../data/seedData';

// Local storage keys for fallback cache
const LS_PREFIX = 'tkmfoss_cache_';
const getCached = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(LS_PREFIX + key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};
const setCached = <T>(key: string, data: T) => {
  try {
    localStorage.setItem(LS_PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.error('LocalStorage write error', e);
  }
};

/* ============================================================
   EVENTS SERVICE
============================================================ */

export const subscribeEvents = (
  onData: (events: FosEvent[]) => void,
  onError?: (err: Error) => void
) => {
  try {
    const q = query(collection(db, COLLECTIONS.EVENTS));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const events: FosEvent[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        })) as FosEvent[];
        // Sort descending by date
        events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setCached('events', events);
        onData(events);
      },
      (error) => {
        console.warn('Firestore events subscription error, using cached/initial data:', error);
        const cached = getCached<FosEvent[]>('events', INITIAL_EVENTS.map((e, i) => ({ ...e, id: `seed-${i}` })));
        onData(cached);
        onError?.(error);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Failed to attach Firestore listener for events:', err);
    const cached = getCached<FosEvent[]>('events', INITIAL_EVENTS.map((e, i) => ({ ...e, id: `seed-${i}` })));
    onData(cached);
    return () => {};
  }
};

export const addEvent = async (event: Omit<FosEvent, 'id'>): Promise<string> => {
  const payload = {
    ...event,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.EVENTS), payload);
    return docRef.id;
  } catch (err) {
    console.warn('Firestore addDoc error, updating local cache fallback:', err);
    const cached = getCached<FosEvent[]>('events', []);
    const newId = `local-${Date.now()}`;
    const newEvent: FosEvent = { ...payload, id: newId };
    setCached('events', [newEvent, ...cached]);
    return newId;
  }
};

export const updateEvent = async (id: string, data: Partial<FosEvent>): Promise<void> => {
  const payload = {
    ...data,
    updatedAt: new Date().toISOString()
  };
  try {
    if (!id.startsWith('local-') && !id.startsWith('seed-')) {
      const docRef = doc(db, COLLECTIONS.EVENTS, id);
      await updateDoc(docRef, payload);
    } else {
      // Local fallback update
      const cached = getCached<FosEvent[]>('events', []);
      const updated = cached.map((e) => (e.id === id ? { ...e, ...payload } : e));
      setCached('events', updated);
    }
  } catch (err) {
    console.warn('Firestore updateDoc error, updating local cache fallback:', err);
    const cached = getCached<FosEvent[]>('events', []);
    const updated = cached.map((e) => (e.id === id ? { ...e, ...payload } : e));
    setCached('events', updated);
  }
};

export const deleteEvent = async (id: string): Promise<void> => {
  try {
    if (!id.startsWith('local-') && !id.startsWith('seed-')) {
      const docRef = doc(db, COLLECTIONS.EVENTS, id);
      await deleteDoc(docRef);
    }
  } catch (err) {
    console.warn('Firestore deleteDoc error, deleting from local cache:', err);
  } finally {
    const cached = getCached<FosEvent[]>('events', []);
    setCached('events', cached.filter((e) => e.id !== id));
  }
};

/* ============================================================
   ANNOUNCEMENTS SERVICE
============================================================ */

export const subscribeAnnouncements = (
  onData: (announcements: Announcement[]) => void,
  onError?: (err: Error) => void
) => {
  try {
    const q = query(collection(db, COLLECTIONS.ANNOUNCEMENTS));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: Announcement[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        })) as Announcement[];
        list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setCached('announcements', list);
        onData(list);
      },
      (error) => {
        console.warn('Firestore announcements error, using cache:', error);
        const cached = getCached<Announcement[]>('announcements', INITIAL_ANNOUNCEMENTS.map((a, i) => ({ ...a, id: `seed-ann-${i}` })));
        onData(cached);
        onError?.(error);
      }
    );
    return unsubscribe;
  } catch (err) {
    const cached = getCached<Announcement[]>('announcements', INITIAL_ANNOUNCEMENTS.map((a, i) => ({ ...a, id: `seed-ann-${i}` })));
    onData(cached);
    return () => {};
  }
};

export const addAnnouncement = async (announcement: Omit<Announcement, 'id'>): Promise<string> => {
  const payload = {
    ...announcement,
    createdAt: new Date().toISOString()
  };
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.ANNOUNCEMENTS), payload);
    return docRef.id;
  } catch (err) {
    const cached = getCached<Announcement[]>('announcements', []);
    const newId = `local-ann-${Date.now()}`;
    setCached('announcements', [{ ...payload, id: newId }, ...cached]);
    return newId;
  }
};

export const updateAnnouncement = async (id: string, data: Partial<Announcement>): Promise<void> => {
  try {
    if (!id.startsWith('local-') && !id.startsWith('seed-')) {
      const docRef = doc(db, COLLECTIONS.ANNOUNCEMENTS, id);
      await updateDoc(docRef, data);
    }
  } catch (err) {
    console.warn('Firestore update error:', err);
  } finally {
    const cached = getCached<Announcement[]>('announcements', []);
    setCached('announcements', cached.map((a) => (a.id === id ? { ...a, ...data } : a)));
  }
};

export const deleteAnnouncement = async (id: string): Promise<void> => {
  try {
    if (!id.startsWith('local-') && !id.startsWith('seed-')) {
      await deleteDoc(doc(db, COLLECTIONS.ANNOUNCEMENTS, id));
    }
  } catch (err) {
    console.warn('Firestore delete error:', err);
  } finally {
    const cached = getCached<Announcement[]>('announcements', []);
    setCached('announcements', cached.filter((a) => a.id !== id));
  }
};

/* ============================================================
   EXECOM SERVICE
============================================================ */

export const subscribeExecom = (
  onData: (members: ExecomMember[]) => void,
  onError?: (err: Error) => void
) => {
  try {
    const q = query(collection(db, COLLECTIONS.EXECOM));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: ExecomMember[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        })) as ExecomMember[];
        list.sort((a, b) => (a.order || 99) - (b.order || 99));
        setCached('execom', list);
        onData(list);
      },
      (error) => {
        console.warn('Firestore execom error, using cache:', error);
        const cached = getCached<ExecomMember[]>('execom', INITIAL_EXECOM.map((m, i) => ({ ...m, id: `seed-ex-${i}` })));
        onData(cached);
        onError?.(error);
      }
    );
    return unsubscribe;
  } catch (err) {
    const cached = getCached<ExecomMember[]>('execom', INITIAL_EXECOM.map((m, i) => ({ ...m, id: `seed-ex-${i}` })));
    onData(cached);
    return () => {};
  }
};

export const addExecomMember = async (member: Omit<ExecomMember, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.EXECOM), member);
    return docRef.id;
  } catch (err) {
    const cached = getCached<ExecomMember[]>('execom', []);
    const newId = `local-ex-${Date.now()}`;
    setCached('execom', [...cached, { ...member, id: newId }]);
    return newId;
  }
};

export const updateExecomMember = async (id: string, data: Partial<ExecomMember>): Promise<void> => {
  try {
    if (!id.startsWith('local-') && !id.startsWith('seed-')) {
      await updateDoc(doc(db, COLLECTIONS.EXECOM, id), data);
    }
  } catch (err) {
    console.warn('Firestore execom update error:', err);
  } finally {
    const cached = getCached<ExecomMember[]>('execom', []);
    setCached('execom', cached.map((m) => (m.id === id ? { ...m, ...data } : m)));
  }
};

export const deleteExecomMember = async (id: string): Promise<void> => {
  try {
    if (!id.startsWith('local-') && !id.startsWith('seed-')) {
      await deleteDoc(doc(db, COLLECTIONS.EXECOM, id));
    }
  } catch (err) {
    console.warn('Firestore delete error:', err);
  } finally {
    const cached = getCached<ExecomMember[]>('execom', []);
    setCached('execom', cached.filter((m) => m.id !== id));
  }
};

/* ============================================================
   POST-EVENT REPORTS SERVICE
============================================================ */

export const subscribeReports = (
  onData: (reports: PostEventReport[]) => void,
  onError?: (err: Error) => void
) => {
  try {
    const q = query(collection(db, COLLECTIONS.REPORTS));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: PostEventReport[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        })) as PostEventReport[];
        list.sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
        setCached('reports', list);
        onData(list);
      },
      (error) => {
        console.warn('Firestore reports error, using cache:', error);
        const cached = getCached<PostEventReport[]>('reports', INITIAL_REPORTS.map((r, i) => ({ ...r, id: `seed-rep-${i}` })));
        onData(cached);
        onError?.(error);
      }
    );
    return unsubscribe;
  } catch (err) {
    const cached = getCached<PostEventReport[]>('reports', INITIAL_REPORTS.map((r, i) => ({ ...r, id: `seed-rep-${i}` })));
    onData(cached);
    return () => {};
  }
};

export const addReport = async (report: Omit<PostEventReport, 'id'>): Promise<string> => {
  const payload = {
    ...report,
    createdAt: new Date().toISOString()
  };
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.REPORTS), payload);
    return docRef.id;
  } catch (err) {
    const cached = getCached<PostEventReport[]>('reports', []);
    const newId = `local-rep-${Date.now()}`;
    setCached('reports', [{ ...payload, id: newId }, ...cached]);
    return newId;
  }
};

export const updateReport = async (id: string, data: Partial<PostEventReport>): Promise<void> => {
  try {
    if (!id.startsWith('local-') && !id.startsWith('seed-')) {
      await updateDoc(doc(db, COLLECTIONS.REPORTS, id), data);
    }
  } catch (err) {
    console.warn('Firestore report update error:', err);
  } finally {
    const cached = getCached<PostEventReport[]>('reports', []);
    setCached('reports', cached.map((r) => (r.id === id ? { ...r, ...data } : r)));
  }
};

export const deleteReport = async (id: string): Promise<void> => {
  try {
    if (!id.startsWith('local-') && !id.startsWith('seed-')) {
      await deleteDoc(doc(db, COLLECTIONS.REPORTS, id));
    }
  } catch (err) {
    console.warn('Firestore delete report error:', err);
  } finally {
    const cached = getCached<PostEventReport[]>('reports', []);
    setCached('reports', cached.filter((r) => r.id !== id));
  }
};

/* ============================================================
   SETTINGS SERVICE
============================================================ */

export const getClubSettings = async (): Promise<ClubSettings> => {
  try {
    const docRef = doc(db, COLLECTIONS.SETTINGS, 'general');
    const snap = await getDocs(query(collection(db, COLLECTIONS.SETTINGS)));
    if (!snap.empty) {
      return snap.docs[0].data() as ClubSettings;
    }
  } catch (e) {
    console.warn('Settings fetch error:', e);
  }
  return getCached<ClubSettings>('settings', INITIAL_SETTINGS);
};

export const saveClubSettings = async (settings: ClubSettings): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTIONS.SETTINGS, 'general');
    await setDoc(docRef, settings, { merge: true });
  } catch (e) {
    console.warn('Settings save error:', e);
  } finally {
    setCached('settings', settings);
  }
};

/* ============================================================
   BULK SEED & EXPORT UTILITIES
============================================================ */

export const seedDatabase = async (): Promise<{ count: number; collections: string[] }> => {
  let count = 0;
  const loaded: string[] = [];

  try {
    // 1. Seed events
    for (const ev of INITIAL_EVENTS) {
      await addDoc(collection(db, COLLECTIONS.EVENTS), {
        ...ev,
        createdAt: new Date().toISOString()
      });
      count++;
    }
    loaded.push('events');

    // 2. Seed Execom
    for (const ex of INITIAL_EXECOM) {
      await addDoc(collection(db, COLLECTIONS.EXECOM), ex);
      count++;
    }
    loaded.push('execom');

    // 3. Seed Announcements
    for (const an of INITIAL_ANNOUNCEMENTS) {
      await addDoc(collection(db, COLLECTIONS.ANNOUNCEMENTS), {
        ...an,
        createdAt: new Date().toISOString()
      });
      count++;
    }
    loaded.push('announcements');

    // 4. Seed Reports
    for (const rep of INITIAL_REPORTS) {
      await addDoc(collection(db, COLLECTIONS.REPORTS), {
        ...rep,
        createdAt: new Date().toISOString()
      });
      count++;
    }
    loaded.push('reports');

    // 5. Seed Settings
    await setDoc(doc(db, COLLECTIONS.SETTINGS, 'general'), INITIAL_SETTINGS);
    loaded.push('settings');

    return { count, collections: loaded };
  } catch (err) {
    console.error('Error during Firestore seed:', err);
    // Also save to cache so it is immediately visible even if offline/permission blocked
    setCached('events', INITIAL_EVENTS.map((e, i) => ({ ...e, id: `seed-ev-${i}` })));
    setCached('execom', INITIAL_EXECOM.map((m, i) => ({ ...m, id: `seed-ex-${i}` })));
    setCached('announcements', INITIAL_ANNOUNCEMENTS.map((a, i) => ({ ...a, id: `seed-ann-${i}` })));
    setCached('reports', INITIAL_REPORTS.map((r, i) => ({ ...r, id: `seed-rep-${i}` })));
    setCached('settings', INITIAL_SETTINGS);

    throw err;
  }
};
