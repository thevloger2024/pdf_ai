const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  `    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        toast.error('Failed to log in. Please try again.');
      }
    }`,
  `    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/popup-blocked') {
        toast.error('Login popup was blocked by the browser. Please allow popups or open in a new tab.', { duration: 6000 });
      } else if (error.code !== 'auth/popup-closed-by-user') {
        toast.error('Failed to log in. If you are in a preview frame, try opening the app in a new tab.', { duration: 6000 });
      }
    }`
);

fs.writeFileSync('src/App.tsx', content, 'utf8');
