import {
  collection,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query
} from 'firebase/firestore';
import { db, COLLECTIONS } from '../firebase/config';
import type { FosEvent, Announcement, ExecomMember, PostEventReport, FossProject } from '../types';

/* ============================================================
   FIRESTORE PAYLOAD SANITIZER
   Strips any field whose value is `undefined` so that Firestore
   never throws "Unsupported field value: undefined".
============================================================ */
export function sanitizeFirestorePayload<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) {
      continue; // completely omit undefined fields
    }
    if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      result[key] = sanitizeFirestorePayload(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

/* ============================================================
   EVENTS SERVICE (100% FIRESTORE DYNAMIC)
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
        events.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
        onData(events);
      },
      (error) => {
        console.error('Firestore events subscription error:', error);
        onError?.(error);
      }
    );
    return unsubscribe;
  } catch (err: any) {
    console.error('Failed to attach Firestore listener for events:', err);
    return () => {};
  }
};

export const addEvent = async (event: Omit<FosEvent, 'id'>): Promise<string> => {
  const payload = sanitizeFirestorePayload({
    ...event,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  const docRef = await addDoc(collection(db, COLLECTIONS.EVENTS), payload);
  return docRef.id;
};

export const updateEvent = async (id: string, data: Partial<FosEvent>): Promise<void> => {
  const payload = sanitizeFirestorePayload({
    ...data,
    updatedAt: new Date().toISOString()
  });
  const docRef = doc(db, COLLECTIONS.EVENTS, id);
  await updateDoc(docRef, payload);
};

export const deleteEvent = async (id: string): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.EVENTS, id);
  await deleteDoc(docRef);
};

/* ============================================================
   ANNOUNCEMENTS SERVICE (100% FIRESTORE DYNAMIC)
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
        list.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
        onData(list);
      },
      (error) => {
        console.error('Firestore announcements error:', error);
        onError?.(error);
      }
    );
    return unsubscribe;
  } catch (err: any) {
    console.error('Failed to attach Firestore listener for announcements:', err);
    return () => {};
  }
};

export const addAnnouncement = async (announcement: Omit<Announcement, 'id'>): Promise<string> => {
  const payload = sanitizeFirestorePayload({
    ...announcement,
    createdAt: new Date().toISOString()
  });
  const docRef = await addDoc(collection(db, COLLECTIONS.ANNOUNCEMENTS), payload);
  return docRef.id;
};

export const updateAnnouncement = async (id: string, data: Partial<Announcement>): Promise<void> => {
  const payload = sanitizeFirestorePayload({
    ...data,
    updatedAt: new Date().toISOString()
  });
  const docRef = doc(db, COLLECTIONS.ANNOUNCEMENTS, id);
  await updateDoc(docRef, payload);
};

export const deleteAnnouncement = async (id: string): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.ANNOUNCEMENTS, id);
  await deleteDoc(docRef);
};

/* ============================================================
   EXECOM SERVICE (100% FIRESTORE DYNAMIC)
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
        onData(list);
      },
      (error) => {
        console.error('Firestore execom error:', error);
        onError?.(error);
      }
    );
    return unsubscribe;
  } catch (err: any) {
    console.error('Failed to attach Firestore listener for execom:', err);
    return () => {};
  }
};

export const addExecomMember = async (member: Omit<ExecomMember, 'id'>): Promise<string> => {
  const payload = sanitizeFirestorePayload({
    ...member,
    createdAt: new Date().toISOString()
  });
  const docRef = await addDoc(collection(db, COLLECTIONS.EXECOM), payload);
  return docRef.id;
};

export const updateExecomMember = async (id: string, data: Partial<ExecomMember>): Promise<void> => {
  const payload = sanitizeFirestorePayload({
    ...data,
    updatedAt: new Date().toISOString()
  });
  const docRef = doc(db, COLLECTIONS.EXECOM, id);
  await updateDoc(docRef, payload);
};

export const deleteExecomMember = async (id: string): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.EXECOM, id);
  await deleteDoc(docRef);
};

/* ============================================================
   POST-EVENT REPORTS SERVICE (100% FIRESTORE DYNAMIC)
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
        list.sort((a, b) => new Date(b.eventDate || 0).getTime() - new Date(a.eventDate || 0).getTime());
        onData(list);
      },
      (error) => {
        console.error('Firestore reports error:', error);
        onError?.(error);
      }
    );
    return unsubscribe;
  } catch (err: any) {
    console.error('Failed to attach Firestore listener for reports:', err);
    return () => {};
  }
};

export const addReport = async (report: Omit<PostEventReport, 'id'>): Promise<string> => {
  const payload = sanitizeFirestorePayload({
    ...report,
    createdAt: new Date().toISOString()
  });
  const docRef = await addDoc(collection(db, COLLECTIONS.REPORTS), payload);
  return docRef.id;
};

export const updateReport = async (id: string, data: Partial<PostEventReport>): Promise<void> => {
  const payload = sanitizeFirestorePayload({
    ...data,
    updatedAt: new Date().toISOString()
  });
  const docRef = doc(db, COLLECTIONS.REPORTS, id);
  await updateDoc(docRef, payload);
};

export const deleteReport = async (id: string): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.REPORTS, id);
  await deleteDoc(docRef);
};

/* ============================================================
   PROJECTS SERVICE (100% FIRESTORE DYNAMIC)
============================================================ */

export const subscribeProjects = (
  onData: (projects: FossProject[]) => void,
  onError?: (err: Error) => void
) => {
  try {
    const q = query(collection(db, COLLECTIONS.PROJECTS));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: FossProject[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        })) as FossProject[];
        list.sort((a, b) => (b.stars || 0) - (a.stars || 0));
        onData(list);
      },
      (error) => {
        console.error('Firestore projects error:', error);
        onError?.(error);
      }
    );
    return unsubscribe;
  } catch (err: any) {
    console.error('Failed to attach Firestore listener for projects:', err);
    return () => {};
  }
};

export const addProject = async (project: Omit<FossProject, 'id'>): Promise<string> => {
  const payload = sanitizeFirestorePayload({
    ...project,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  const docRef = await addDoc(collection(db, COLLECTIONS.PROJECTS), payload);
  return docRef.id;
};

export const updateProject = async (id: string, data: Partial<FossProject>): Promise<void> => {
  const payload = sanitizeFirestorePayload({
    ...data,
    updatedAt: new Date().toISOString()
  });
  const docRef = doc(db, COLLECTIONS.PROJECTS, id);
  await updateDoc(docRef, payload);
};

export const deleteProject = async (id: string): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.PROJECTS, id);
  await deleteDoc(docRef);
};

