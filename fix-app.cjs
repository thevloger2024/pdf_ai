const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Remove isMobileMenuOpen state and references
content = content.replace("const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);\n", "");
content = content.replace(
  "  // Close mobile menu when route changes\n  useEffect(() => {\n    setIsMobileMenuOpen(false);\n  }, [location.pathname]);\n",
  ""
);

// Add better error message for unauthorized domain
content = content.replace(
  "      } else if (error.code !== 'auth/popup-closed-by-user') {",
  "      } else if (error.code === 'auth/unauthorized-domain') {\n        toast.error('Sign-in failed: Domain not authorized. Add this URL to Firebase Console > Authentication > Settings > Authorized Domains.', { duration: 10000 });\n      } else if (error.code !== 'auth/popup-closed-by-user') {"
);

// Remove the mobile menu button from the header
const menuButtonCode = `            <button 
              id="nav-tour-mobile-menu"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="md:hidden p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors ml-1"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>`;
content = content.replace(menuButtonCode, "");

// Remove the mobile menu dropdown block completely
const mobileMenuBlock = /\{\/\* Mobile Navigation Menu \*\/\}.*?\{\s*isMobileMenuOpen && \([\s\S]*?\}\s*<\/header>/;
content = content.replace(/\{\/\* Mobile Navigation Menu \*\/\}[\s\S]*?\}\s*<\/header>/, "</header>");

// Simplify header flex gaps on mobile so buttons fit without scrolling
content = content.replace(
  '<div className="flex items-center gap-3">',
  '<div className="flex items-center gap-1.5 md:gap-3">' // Replace first occurrence
);
content = content.replace(
  '<div className="flex items-center gap-3">',
  '<div className="flex items-center gap-1.5 md:gap-3">' // Replace second occurrence
);
content = content.replace(
  'className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full font-medium text-sm transition-colors shadow-sm"',
  'className="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-full font-medium text-xs md:text-sm transition-colors shadow-sm"'
);

fs.writeFileSync('src/App.tsx', content, 'utf8');
