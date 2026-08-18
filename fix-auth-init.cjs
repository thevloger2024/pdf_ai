const fs = require('fs');

let content = fs.readFileSync('src/lib/firebase.ts', 'utf8');

// Update imports
content = content.replace(
  "import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged, User as FirebaseUser, setPersistence, browserLocalPersistence, inMemoryPersistence } from 'firebase/auth';",
  "import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged, User as FirebaseUser, setPersistence, browserLocalPersistence, indexedDBLocalPersistence, inMemoryPersistence } from 'firebase/auth';"
);

// Add global persistence setup
const authInit = `export const auth = getAuth(app);

// Attempt to set persistence globally before any auth state changes occur.
// This ensures that if local storage is available, the session persists across tab closes and browsers.
// If blocked (like in a secure iframe or strict incognito), it gracefully degrades to inMemory.
setPersistence(auth, indexedDBLocalPersistence)
  .catch(() => setPersistence(auth, browserLocalPersistence))
  .catch((e) => {
    console.warn("Storage restricted, falling back to inMemory persistence.", e);
    return setPersistence(auth, inMemoryPersistence);
  });`;

content = content.replace("export const auth = getAuth(app);", authInit);

// Remove the inline persistence setup inside loginWithGoogle since it's now global
const oldLoginStart = `export const loginWithGoogle = async () => {
  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch (e) { 
    console.warn("Local persistence error (likely iframe/incognito), falling back to inMemory:", e); 
    try {
      await setPersistence(auth, inMemoryPersistence);
    } catch (inMemError) {
      console.warn("InMemory persistence error:", inMemError);
    }
  }

  try {`;

const newLoginStart = `export const loginWithGoogle = async () => {
  try {`;

content = content.replace(oldLoginStart, newLoginStart);

fs.writeFileSync('src/lib/firebase.ts', content, 'utf8');
