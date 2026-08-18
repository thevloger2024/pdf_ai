const fs = require('fs');

let content = fs.readFileSync('src/lib/firebase.ts', 'utf8');

content = content.replace(
  "import { getFirestore, doc, getDoc, setDoc, serverTimestamp, collection, addDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';",
  "import { getFirestore, doc, getDoc, setDoc, serverTimestamp, collection, addDoc, query, orderBy, limit, getDocs, increment } from 'firebase/firestore';"
);

// Add the new tracking function
content += `
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
`;

fs.writeFileSync('src/lib/firebase.ts', content);
