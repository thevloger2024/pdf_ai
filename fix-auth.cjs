const fs = require('fs');
let content = fs.readFileSync('src/lib/firebase.ts', 'utf8');

if (!content.includes('browserLocalPersistence')) {
  content = content.replace(
    "import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';",
    "import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser, setPersistence, browserLocalPersistence } from 'firebase/auth';"
  );

  content = content.replace(
    'export const loginWithGoogle = async () => {',
    `export const loginWithGoogle = async () => {\n  try {\n    await setPersistence(auth, browserLocalPersistence);\n  } catch (e) { console.warn("Persistence error:", e); }\n`
  );
  
  fs.writeFileSync('src/lib/firebase.ts', content, 'utf8');
}
