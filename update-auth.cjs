const fs = require('fs');

let content = fs.readFileSync('src/lib/firebase.ts', 'utf8');

// Add getRedirectResult and signInWithRedirect to imports
content = content.replace(
  "import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser, setPersistence, browserLocalPersistence } from 'firebase/auth';",
  "import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged, User as FirebaseUser, setPersistence, browserLocalPersistence } from 'firebase/auth';"
);

const newLoginFunc = `export const loginWithGoogle = async () => {
  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch (e) { console.warn("Persistence error:", e); }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    return await handleAuthResult(result.user);
  } catch (error: any) {
    console.error("Popup login error:", error);
    // If popup is blocked or environment doesn't support it, fallback to redirect
    if (error.code === 'auth/popup-blocked' || error.message?.includes('popup') || error.code === 'auth/unauthorized-domain') {
      console.log("Falling back to redirect login...");
      await signInWithRedirect(auth, googleProvider);
      return null;
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
  } catch (error) {
    console.error("Redirect login error:", error);
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
};`;

content = content.replace(/export const loginWithGoogle = async \(\) => \{[\s\S]*?^export const logout/m, newLoginFunc + '\n\nexport const logout');

fs.writeFileSync('src/lib/firebase.ts', content, 'utf8');
