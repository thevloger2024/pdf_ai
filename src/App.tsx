/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import React, { useEffect, useState, Suspense } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, formatUser, loginWithGoogle, checkRedirectResult, logout } from './lib/firebase';
import { User } from './types';
import { FileText, MessageSquare, Settings, UserCircle, LogOut, ArrowLeft, RefreshCw, Loader2, Moon, Sun, Info, Lock, Phone, User as UserIcon, Home as HomeIcon, FileMinus, SplitSquareHorizontal, FileDown, FileEdit, Sparkles, Menu, X, Languages, Droplets, Combine } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { TourGuide } from './components/TourGuide';
import { DesktopNavigation } from './components/Navigation';
import { SplashScreen } from './components/SplashScreen';

// Lazy loaded Pages to drastically improve initial load time and login speed
const Home = React.lazy(() => import('./pages/Home'));
const Compress = React.lazy(() => import('./pages/Compress'));
const SplitHub = React.lazy(() => import('./pages/SplitHub'));
const SplitPdf = React.lazy(() => import('./pages/SplitPdf'));
const SplitText = React.lazy(() => import('./pages/SplitText'));
const Chunk = React.lazy(() => import('./pages/Chunk'));
const Edit = React.lazy(() => import('./pages/Edit'));
const Watermark = React.lazy(() => import('./pages/Watermark'));
const Admin = React.lazy(() => import('./pages/Admin'));
const StaticPage = React.lazy(() => import('./pages/StaticPage'));
const Convert = React.lazy(() => import('./pages/Convert'));
const ConvertTool = React.lazy(() => import('./pages/ConvertTool'));
const Developer = React.lazy(() => import('./pages/Developer'));
const CompressHub = React.lazy(() => import('./pages/CompressHub'));
const CompressTool = React.lazy(() => import('./pages/CompressTool'));
const MergeHub = React.lazy(() => import('./pages/MergeHub'));
const MergePdfs = React.lazy(() => import('./pages/MergePdfs'));
const MergePages = React.lazy(() => import('./pages/MergePages'));
const Profile = React.lazy(() => import('./pages/Profile'));

function Layout({ children, user, loading }: { children: React.ReactNode, user: User | null, loading: boolean }) {
  const { t, language, setLanguage } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
    const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) {
      return saved === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });


  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
      toast.success('Successfully logged in!');
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/popup-blocked') {
        toast.error('Login popup was blocked by the browser. Please allow popups or open in a new tab.', { duration: 6000 });
      } else if (error.message === 'storage-restricted' || error.message?.includes('closing') || error.message?.includes('hidden')) {
        toast.error('Third-party cookies/storage are blocked. Please open the app in a new tab to log in.', { duration: 8000 });
      } else if (error.code === 'auth/unauthorized-domain') {
        toast.error('Sign-in failed: Domain not authorized. Add this URL to Firebase Console > Authentication > Settings > Authorized Domains.', { duration: 10000 });
      } else if (error.code !== 'auth/popup-closed-by-user') {
        toast.error('Failed to log in. Try opening the app in a new tab if you are in preview.', { duration: 6000 });
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully.');
    } catch (error) {
      toast.error('Failed to log out.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-blue-600 dark:text-blue-400 tracking-tight">
            <FileText className="h-6 w-6" />
            PDF AI
          </Link>
          
          <div id="nav-tour-tools" className="hidden md:flex items-center">
            <DesktopNavigation />
          </div>
          
          <div className="hidden md:flex items-center gap-4 text-sm font-medium text-slate-600 dark:text-slate-300">
            {user?.role === 'admin' && (
              <Link to="/admin" className="flex items-center gap-1 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 bg-purple-50 dark:bg-purple-900/30 px-3 py-1.5 rounded-full">
                <Settings className="h-4 w-4" /> Admin
              </Link>
            )}
            <button onClick={toggleDarkMode} className="p-2 rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title="Toggle Dark Mode">
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>

          <div className="flex items-center gap-4">
            {!loading && (
              user ? (
                <div className="flex items-center gap-1.5 md:gap-3">
                  <Link to="/profile" className="hidden sm:flex items-center gap-2 hover:opacity-80 transition-opacity" title="View Profile">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="Profile" className="h-8 w-8 rounded-full border border-slate-200 dark:border-slate-700" referrerPolicy="no-referrer" />
                    ) : (
                      <UserCircle className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                    )}
                  </Link>
                  <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors" title="Log out">
                    <LogOut className="h-5 w-5" />
                  </button>
                  <button onClick={toggleDarkMode} className="md:hidden p-2 rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title="Toggle Dark Mode">
                    {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  </button>
                  <button onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')} className="md:hidden p-2 rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title={t('lang.toggle')}>
                    <Languages className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 md:gap-3">
                  <button onClick={handleLogin} className="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-full font-medium text-xs md:text-sm transition-colors shadow-sm">
                    Sign In
                  </button>
                  <button onClick={toggleDarkMode} className="md:hidden p-2 rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title="Toggle Dark Mode">
                    {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  </button>
                  <button onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')} className="md:hidden p-2 rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title={t('lang.toggle')}>
                    <Languages className="h-5 w-5" />
                  </button>
                </div>
              )
            )}

          </div>
        </div>

        </header>

      <main className="flex-1 w-full flex flex-col">
        {location.pathname !== '/' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-6 md:pt-8 -mb-4">
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium w-fit"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          </div>
        )}
        {children}
      </main>

      <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-12 mt-auto transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-lg">
            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            PDF AI
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-500 dark:text-slate-400">
            <Link to="/about" className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
              <Info className="w-4 h-4" /> About Us
            </Link>
            <Link to="/privacy" className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
              <Lock className="w-4 h-4" /> Privacy Policy
            </Link>
            <Link to="/contact" className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
              <Phone className="w-4 h-4" /> Contact
            </Link>
            <Link to="/developer" className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
              <UserIcon className="w-4 h-4" /> Meet the Developer
            </Link>
          </div>
          <div className="text-sm text-slate-400 dark:text-slate-500">
            &copy; {new Date().getFullYear()} {t('footer.rights')}
          </div>
        </div>
      </footer>

      {/* Floating Feedback Button */}
      <a
        href="mailto:thevloger2024@gmail.com?subject=Feedback%20for%20PDF%20AI"
        className="fixed bottom-6 right-6 z-50 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 hover:scale-105 transition-all duration-200 flex items-center justify-center group"
        title="Send Feedback"
      >
        <MessageSquare className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 ease-in-out font-medium">
          Feedback
        </span>
      </a>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Check for redirect result on mount
    checkRedirectResult().then((user) => {
      if (user) toast.success('Successfully logged in!');
    });

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(formatUser(firebaseUser));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <LanguageProvider>
      <Toaster position="top-right" />
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      <TourGuide />
      <Layout user={user} loading={loading}>
        <Suspense fallback={<div className="flex h-[50vh] items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" /></div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/convert" element={<Convert />} />
            <Route path="/convert/:type" element={<ConvertTool user={user} />} />
            <Route path="/compress" element={<Compress user={user} />} />
            <Route path="/compress-hub" element={<CompressHub />} />
            <Route path="/compress-tool/:type" element={<CompressTool user={user} />} />
            <Route path="/merge-hub" element={<MergeHub />} />
            <Route path="/merge-pdfs" element={<MergePdfs user={user} />} />
            <Route path="/merge-pages" element={<MergePages user={user} />} />
            <Route path="/split" element={<SplitHub />} />
            <Route path="/split-pdf" element={<SplitPdf user={user} />} />
            <Route path="/split-text" element={<SplitText user={user} />} />
            <Route path="/chunk" element={<Chunk user={user} />} />
            <Route path="/edit" element={<Edit user={user} />} />
            <Route path="/watermark" element={<Watermark user={user} />} />
            <Route path="/admin" element={<Admin user={user} />} />
            <Route path="/profile" element={<Profile user={user} />} />
            <Route path="/developer" element={<Developer />} />
            <Route path="/about" element={<StaticPage title="About Us" content="Welcome to PDF AI. The ultimate tool for processing PDFs quickly, securely, and seamlessly directly in your browser." />} />
            <Route path="/privacy" element={<StaticPage title="Privacy Policy" content="Your privacy is paramount. Most of our tools run directly in your browser meaning your files never leave your device unless using our AI features. Files uploaded for AI analysis are processed securely and not retained." />} />
            <Route path="/contact" element={<StaticPage title="Contact Us" content="Need help? Contact our admin at thevloger2024@gmail.com." />} />
          </Routes>
        </Suspense>
      </Layout>
      </LanguageProvider>
    </Router>
  );
}
