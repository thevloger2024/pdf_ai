const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add imports
content = content.replace(
  "import { useEffect, useState, Suspense } from 'react';",
  "import { useEffect, useState, Suspense } from 'react';\nimport { LanguageProvider, useLanguage } from './contexts/LanguageContext';"
);
content = content.replace(
  "import { Globe",
  "import { Globe, Languages"
);
// Ensure Languages icon is imported
if (!content.includes('Languages')) {
    content = content.replace(
      "import { Link, BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';",
      "import { Link, BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';\nimport { Languages } from 'lucide-react';"
    );
}

// 2. Add useLanguage to Layout
content = content.replace(
  "function Layout({ children, user, loading }: { children: React.ReactNode; user: User | null; loading: boolean }) {",
  "function Layout({ children, user, loading }: { children: React.ReactNode; user: User | null; loading: boolean }) {\n  const { t, language, setLanguage } = useLanguage();"
);

// 3. Add Language Switcher to header next to dark mode toggle (desktop and mobile)
// Find the div with user actions and inject
const desktopControlsRegex = /(<button onClick=\{toggleDarkMode\} className="hidden md:flex[^\>]*>[\s\S]*?<\/button>)/;
content = content.replace(desktopControlsRegex, `$1\n            <button onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')} className="hidden md:flex p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors" title={t('lang.toggle')}>\n              <Languages className="h-5 w-5" />\n              <span className="ml-1 text-sm font-medium uppercase">{language}</span>\n            </button>`);

const mobileControlsRegex = /(<button onClick=\{toggleDarkMode\} className="md:hidden[^\>]*>[\s\S]*?<\/button>)/g;
content = content.replace(mobileControlsRegex, (match) => {
    return `${match}\n                  <button onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')} className="md:hidden p-2 rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title={t('lang.toggle')}>\n                    <Languages className="h-5 w-5" />\n                  </button>`;
});

// 4. Update texts in Nav
content = content.replace(/> Home<\/Link>/g, ">{t('nav.home')}</Link>");
content = content.replace(/> Convert<\/Link>/g, ">{t('nav.convert')}</Link>");
content = content.replace(/> Compress<\/Link>/g, ">{t('nav.compress')}</Link>");
content = content.replace(/> Split<\/Link>/g, ">{t('nav.split')}</Link>");
content = content.replace(/> Chunk<\/Link>/g, ">{t('nav.chunk')}</Link>");
content = content.replace(/> Edit<\/Link>/g, ">{t('nav.edit')}</Link>");
content = content.replace(/> AI Insights<\/Link>/g, ">{t('nav.analyze')}</Link>");
content = content.replace(/> Admin<\/Link>/g, ">{t('nav.admin')}</Link>");
content = content.replace(/> About Us<\/Link>/g, ">{t('nav.about')}</Link>");
content = content.replace(/> Privacy Policy<\/Link>/g, ">{t('nav.privacy')}</Link>");
content = content.replace(/> Contact<\/Link>/g, ">{t('nav.contact')}</Link>");
content = content.replace(/> Meet the Developer<\/Link>/g, ">{t('nav.developer')}</Link>");
content = content.replace(/> Back<\/button>/g, ">{t('nav.back')}</button>");
content = content.replace(/PDF AI\. All rights reserved\./g, "{t('footer.rights')}");
content = content.replace(/Sign In<\/button>/g, "{t('nav.signin')}</button>");

// Wrap the whole App in LanguageProvider
content = content.replace(
  "<Toaster position=\"top-right\" />\n      <Layout user={user} loading={loading}>",
  "<LanguageProvider>\n      <Toaster position=\"top-right\" />\n      <Layout user={user} loading={loading}>"
);
content = content.replace(
  "      </Layout>\n    </Router>",
  "      </Layout>\n      </LanguageProvider>\n    </Router>"
);

fs.writeFileSync('src/App.tsx', content);
