import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged, User as FirebaseUser, setPersistence, browserLocalPersistence, indexedDBLocalPersistence, inMemoryPersistence } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp, collection, addDoc, query, orderBy, limit, getDocs, increment } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { ADMIN_EMAIL, User } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Attempt to set persistence globally before any auth state changes occur.
// This ensures that if local storage is available, the session persists across tab closes and browsers.
// If blocked (like in a secure iframe or strict incognito), it gracefully degrades to inMemory.
setPersistence(auth, indexedDBLocalPersistence)
  .catch(() => setPersistence(auth, browserLocalPersistence))
  .catch((e) => {
    console.warn("Storage restricted, falling back to inMemory persistence.", e);
    return setPersistence(auth, inMemoryPersistence);
  });

// Use the specific firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const storage = getStorage(app);

const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return await handleAuthResult(result.user);
  } catch (error: any) {
    console.error("Popup login error:", error);
    // If popup is blocked or environment doesn't support it, fallback to redirect
    if (error.code === 'auth/popup-blocked' || error.message?.includes('popup') || error.code === 'auth/unauthorized-domain') {
      console.log("Falling back to redirect login...");
      try {
        await signInWithRedirect(auth, googleProvider);
        return null;
      } catch (redirectError: any) {
        console.error("Redirect fallback also failed:", redirectError);
        throw new Error('storage-restricted');
      }
    }
    throw error;
  }
};

export const checkRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      await handleAuthResult(result.user);
    }
    return result?.user || null;
  } catch (error: any) {
    // Suppress "Database is closing/hidden" error in preview environments
    if (error?.message?.includes('closing') || error?.message?.includes('hidden')) {
      console.warn("Redirect result skipped due to restricted storage access in this environment.");
    } else {
      console.error("Redirect login error:", error);
    }
    return null;
  }
};

const handleAuthResult = async (user: FirebaseUser) => {
  try {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      lastLogin: serverTimestamp(),
      role: user.email === ADMIN_EMAIL ? 'admin' : 'user'
    }, { merge: true });
  } catch (dbError) {
    console.warn("Firestore user sync failed, but login succeeded:", dbError);
  }
  return user;
};

export const logout = () => signOut(auth);

// Helper to get formatted current user
export const formatUser = (user: FirebaseUser | null): User | null => {
  if (!user) return null;
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    role: user.email === ADMIN_EMAIL ? 'admin' : 'user'
  };
};

export const logActivity = async (userId: string, action: string, details: any = {}) => {
  try {
    await addDoc(collection(db, 'activity_logs'), {
      userId,
      action,
      details,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error("Failed to log activity", error);
  }
};

export const logToolAccess = async (toolId: string) => {
  try {
    const statsRef = doc(db, 'stats', 'toolUsage');
    await setDoc(statsRef, {
      [toolId]: increment(1)
    }, { merge: true });
  } catch (error) {
    console.error("Failed to log tool access", error);
  }
};
