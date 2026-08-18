const fs = require('fs');

let content = fs.readFileSync('src/lib/firebase.ts', 'utf8');

const oldFallback = `    if (error.code === 'auth/popup-blocked' || error.message?.includes('popup') || error.code === 'auth/unauthorized-domain') {
      console.log("Falling back to redirect login...");
      await signInWithRedirect(auth, googleProvider);
      return null;
    }
    throw error;`;

const newFallback = `    if (error.code === 'auth/popup-blocked' || error.message?.includes('popup') || error.code === 'auth/unauthorized-domain') {
      console.log("Falling back to redirect login...");
      try {
        await signInWithRedirect(auth, googleProvider);
        return null;
      } catch (redirectError: any) {
        console.error("Redirect fallback also failed:", redirectError);
        throw new Error('storage-restricted');
      }
    }
    throw error;`;

content = content.replace(oldFallback, newFallback);
fs.writeFileSync('src/lib/firebase.ts', content, 'utf8');
