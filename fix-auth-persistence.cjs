const fs = require('fs');

let content = fs.readFileSync('src/lib/firebase.ts', 'utf8');

content = content.replace(
  "import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged, User as FirebaseUser, setPersistence, browserLocalPersistence } from 'firebase/auth';",
  "import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged, User as FirebaseUser, setPersistence, browserLocalPersistence, inMemoryPersistence } from 'firebase/auth';"
);

const oldLoginFuncStart = `export const loginWithGoogle = async () => {
  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch (e) { console.warn("Persistence error:", e); }`;

const newLoginFuncStart = `export const loginWithGoogle = async () => {
  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch (e) { 
    console.warn("Local persistence error (likely iframe/incognito), falling back to inMemory:", e); 
    try {
      await setPersistence(auth, inMemoryPersistence);
    } catch (inMemError) {
      console.warn("InMemory persistence error:", inMemError);
    }
  }`;

content = content.replace(oldLoginFuncStart, newLoginFuncStart);

const oldCheckRedirect = `export const checkRedirectResult = async () => {
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
};`;

const newCheckRedirect = `export const checkRedirectResult = async () => {
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
};`;

content = content.replace(oldCheckRedirect, newCheckRedirect);

fs.writeFileSync('src/lib/firebase.ts', content, 'utf8');
