import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp, collection, addDoc, query, orderBy, limit, getDocs, increment } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { ADMIN_EMAIL, User } from '../types';

const firebaseConfig = {
  apiKey: "AIzaSyAzvfAKfU5smjr405uWTOXhPfHnYpZmRQ0",
  authDomain: "pdf-ai-fin.firebaseapp.com",
  projectId: "pdf-ai-fin",
  storageBucket: "pdf-ai-fin.firebasestorage.app",
  messagingSenderId: "984493970435",
  appId: "1:984493970435:web:144220359baae82a2eaa36",
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
// Use the specific firestoreDatabaseId if needed, but getFirestore default is fine unless explicitly multi-DB.
export const db = getFirestore(app);
export const storage = getStorage(app);

const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Store/Update user in Firestore
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      lastLogin: serverTimestamp(),
      role: user.email === ADMIN_EMAIL ? 'admin' : 'user'
    }, { merge: true });
    
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
