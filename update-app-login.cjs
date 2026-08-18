const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldHandleLogin = `  const handleLogin = async () => {
    try {
      await loginWithGoogle();
      toast.success('Successfully logged in!');
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/popup-blocked') {
        toast.error('Login popup was blocked by the browser. Please allow popups or open in a new tab.', { duration: 6000 });
      } else if (error.code !== 'auth/popup-closed-by-user') {
        toast.error('Failed to log in. If you are in a preview frame, try opening the app in a new tab.', { duration: 6000 });
      }
    }
  };`;

const newHandleLogin = `  const handleLogin = async () => {
    try {
      await loginWithGoogle();
      toast.success('Successfully logged in!');
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/popup-blocked') {
        toast.error('Login popup was blocked by the browser. Please allow popups or open in a new tab.', { duration: 6000 });
      } else if (error.message === 'storage-restricted' || error.message?.includes('closing') || error.message?.includes('hidden')) {
        toast.error('Third-party cookies/storage are blocked. Please open the app in a new tab to log in.', { duration: 8000 });
      } else if (error.code !== 'auth/popup-closed-by-user') {
        toast.error('Failed to log in. Try opening the app in a new tab if you are in preview.', { duration: 6000 });
      }
    }
  };`;

content = content.replace(oldHandleLogin, newHandleLogin);
fs.writeFileSync('src/App.tsx', content, 'utf8');
