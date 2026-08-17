import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp, collection, addDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { ADMIN_EMAIL, User } from '../types';

const firebaseConfig = {
  apiKey: "AIzaSyDn2wZj3RjCBzWHKvt_RO1quvfnWtM8tq8",
  authDomain: "tera-rookery-r98sv.firebaseapp.com",
  projectId: "tera-rookery-r98sv",
  storageBucket: "tera-rookery-r98sv.firebasestorage.app",
  messagingSenderId: "274842973423",
  appId: "1:274842973423:web:c0b032fbc5ec87a997171a",
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
// Use the specific firestoreDatabaseId if needed, but getFirestore default is fine unless explicitly multi-DB.
export const db = getFirestore(app, "ai-studio-7761470c-3409-40d6-9834-e02a01b2b653");
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
