const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes("import { TourGuide }")) {
    content = content.replace(
      "import { LanguageProvider, useLanguage } from './contexts/LanguageContext';",
      "import { LanguageProvider, useLanguage } from './contexts/LanguageContext';\nimport { TourGuide } from './components/TourGuide';"
    );
}

if (!content.includes("<TourGuide />")) {
    content = content.replace(
      "<Toaster position=\"top-right\" />",
      "<Toaster position=\"top-right\" />\n      <TourGuide />"
    );
}

content = content.replace(
  '<nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">',
  '<nav id="nav-tour-tools" className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">'
);

const aiRegex = /(<Link to="\/analyze"[^>]*>[\s\S]*?<\/Link>)/;
content = content.replace(aiRegex, (match) => {
    return match.replace('<Link to="/analyze"', '<Link id="nav-tour-ai" to="/analyze"');
});

const mobileMenuRegex = /onClick=\{\(\) => setIsMobileMenuOpen\(!isMobileMenuOpen\)\}/;
content = content.replace(mobileMenuRegex, `id="nav-tour-mobile-menu"\n              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}`);

fs.writeFileSync('src/App.tsx', content);
