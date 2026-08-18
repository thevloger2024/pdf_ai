import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp, collection, addDoc, query, orderBy, limit, getDocs, increment } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { ADMIN_EMAIL, User } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Use the specific firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const storage = getStorage(app);

const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch (e) { console.warn("Persistence error:", e); }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    try {
      // Store/Update user in Firestore (Optional, don't break login if it fails)
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
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
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
