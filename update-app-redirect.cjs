const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  "import { auth, formatUser, loginWithGoogle, logout } from './lib/firebase';",
  "import { auth, formatUser, loginWithGoogle, checkRedirectResult, logout } from './lib/firebase';"
);

content = content.replace(
  `  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(formatUser(firebaseUser));
      setLoading(false);
    });`,
  `  useEffect(() => {
    // Check for redirect result on mount
    checkRedirectResult().then((user) => {
      if (user) toast.success('Successfully logged in!');
    });

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(formatUser(firebaseUser));
      setLoading(false);
    });`
);

fs.writeFileSync('src/App.tsx', content, 'utf8');
