import React, { useEffect, useState } from 'react';
import { User } from '../types';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, limit, getDocs, Timestamp, writeBatch, doc } from 'firebase/firestore';
import { UserCircle, Calendar, Activity, Clock, FileText, Download, Upload, Shield, LogOut, Trash2, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'motion/react';
import { toast } from 'react-hot-toast';

interface ActivityLog {
  id: string;
  action: string;
  details: any;
  timestamp: Timestamp;
}

export default function Profile({ user }: { user: User | null }) {
  const { t } = useLanguage();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const handleClearHistory = async () => {
    if (!logs.length) return;
    setIsClearing(true);
    try {
      const batch = writeBatch(db);
      logs.forEach(log => {
        batch.delete(doc(db, 'activity_logs', log.id));
      });
      await batch.commit();
      setLogs([]);
      toast.success('Activity history cleared successfully');
    } catch (error) {
      console.error('Error clearing history:', error);
      toast.error('Failed to clear history');
    } finally {
      setIsClearing(false);
      setConfirmClear(false);
    }
  };

  useEffect(() => {
    async function fetchLogs() {
      if (!user) return;
      try {
        // Removed orderBy to prevent composite index requirement. 
        // We will sort them in memory.
        const q = query(
          collection(db, 'activity_logs'),
          where('userId', '==', user.uid),
          limit(100)
        );
        const querySnapshot = await getDocs(q);
        const fetchedLogs: ActivityLog[] = [];
        querySnapshot.forEach((doc) => {
          fetchedLogs.push({ id: doc.id, ...doc.data() } as ActivityLog);
        });
        // Sort in memory by timestamp descending
        fetchedLogs.sort((a, b) => {
          const timeA = a.timestamp?.seconds || 0;
          const timeB = b.timestamp?.seconds || 0;
          return timeB - timeA;
        });
        setLogs(fetchedLogs.slice(0, 30));
      } catch (error) {
        console.error("Error fetching logs:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchLogs();
  }, [user]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center">
        <UserCircle className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Sign in to view your profile</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm">Access your activity history, account details, and more.</p>
      </div>
    );
  }

  const getActionIcon = (action: string) => {
    if (action.includes('compress')) return <Download className="w-4 h-4 text-emerald-500" />;
    if (action.includes('split') || action.includes('chunk')) return <FileText className="w-4 h-4 text-blue-500" />;
    if (action.includes('merge')) return <Upload className="w-4 h-4 text-indigo-500" />;
    return <Activity className="w-4 h-4 text-slate-500" />;
  };

  const formatActionName = (action: string) => {
    return action.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="max-w-7xl mx-auto w-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: User Profile */}
        <div className="lg:col-span-1">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden sticky top-24"
          >
            <div className="h-32 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700"></div>
            <div className="px-8 pb-8 relative">
              <div className="flex flex-col items-center gap-6 -mt-16 mb-6">
                <div className="flex flex-col items-center gap-4 text-center">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || 'User'} className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-800 bg-white shadow-md object-cover relative z-10" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-700 flex items-center justify-center shadow-md relative z-10">
                      <UserCircle className="w-16 h-16 text-slate-400" />
                    </div>
                  )}
                  <div className="mt-2">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 leading-tight mb-1">{user.displayName || 'Anonymous User'}</h1>
                    <p className="text-slate-500 dark:text-slate-400">{user.email}</p>
                  </div>
                </div>
                
                <div className="w-full h-px bg-slate-100 dark:bg-slate-700/50 my-2"></div>
                
                <div className="flex items-center w-full justify-center">
                  {user.role === 'admin' ? (
                    <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 text-blue-700 dark:text-blue-400 text-sm font-semibold shadow-sm">
                      <Shield className="w-4 h-4" /> Administrator
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold shadow-sm">
                      <UserCircle className="w-4 h-4" /> Standard User
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Recent Activity */}
        <div className="lg:col-span-2">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col h-[600px] lg:h-[calc(100vh-8rem)]"
          >
            <div className="flex items-center justify-between p-6 sm:p-8 border-b border-slate-100 dark:border-slate-700/50 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <Activity className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Recent Activity</h2>
              </div>
              
              {logs.length > 0 && !loading && (
                <div className="relative">
                  {confirmClear ? (
                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-200">
                      <span className="text-sm text-slate-500 dark:text-slate-400 font-medium hidden sm:block">Are you sure?</span>
                      <button 
                        onClick={() => setConfirmClear(false)}
                        disabled={isClearing}
                        className="px-3 py-1.5 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleClearHistory}
                        disabled={isClearing}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400 font-medium transition-colors disabled:opacity-50"
                      >
                        {isClearing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        Confirm
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setConfirmClear(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 font-medium transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Clear History</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-6 sm:p-8 pt-6 relative custom-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                  <p className="text-slate-500 font-medium">Loading history...</p>
                </div>
              ) : logs.length > 0 ? (
                <div className="relative border-l-2 border-slate-100 dark:border-slate-700 ml-3 sm:ml-4 space-y-8 pb-4">
                  {logs.map((log, index) => (
                    <motion.div 
                      key={log.id} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + (index * 0.05) }}
                      className="relative pl-6 sm:pl-8 group"
                    >
                      <div className="absolute -left-[9px] top-1.5 w-4 h-4 bg-white dark:bg-slate-800 rounded-full border-4 border-indigo-100 dark:border-indigo-900/50 group-hover:border-indigo-500 transition-colors"></div>
                      <div className="bg-slate-50/80 hover:bg-slate-50 dark:bg-slate-900/40 dark:hover:bg-slate-900/60 transition-colors rounded-2xl p-4 sm:p-5 border border-slate-100 dark:border-slate-700/50 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                          <div className="flex items-center gap-2.5 font-bold text-slate-900 dark:text-slate-100 text-base">
                            <div className="bg-white dark:bg-slate-800 p-1.5 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                              {getActionIcon(log.action)}
                            </div>
                            {formatActionName(log.action)}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider bg-white dark:bg-slate-800 px-2.5 py-1 rounded-full border border-slate-100 dark:border-slate-700 shadow-sm">
                            <Clock className="w-3 h-3" />
                            {log.timestamp?.toDate().toLocaleString(undefined, {
                              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            }) || 'Just now'}
                          </div>
                        </div>
                        {log.details && (
                          <div className="text-sm text-slate-600 dark:text-slate-400 flex flex-wrap gap-2 sm:gap-3 mt-4">
                            {log.details.fileName && (
                              <span className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 font-medium shadow-sm">
                                <FileText className="w-4 h-4 text-slate-400" />
                                <span className="truncate max-w-[180px] sm:max-w-[250px]">{log.details.fileName}</span>
                              </span>
                            )}
                            {log.details.size && (
                              <span className="flex items-center gap-1.5 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 font-medium shadow-sm">
                                <span className="text-slate-500">{log.details.size}</span>
                              </span>
                            )}
                            {log.details.compressionSaved && (
                              <span className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800/30 font-bold shadow-sm">
                                <Download className="w-4 h-4" />
                                Saved {log.details.compressionSaved}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-50 dark:bg-slate-900/40 rounded-2xl p-10 text-center border border-slate-100 dark:border-slate-700/50 flex flex-col items-center justify-center h-full min-h-[300px]">
                  <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-300 dark:text-indigo-500/50 rounded-full flex items-center justify-center mb-5 border border-indigo-100/50 dark:border-indigo-800/30 shadow-inner">
                    <FileText className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Clean Slate</h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-sm text-center leading-relaxed">
                    You haven't processed any PDFs yet. When you merge, compress, or edit files, your history will be securely logged here.
                  </p>
                </div>
              )}
            </div>
            
            {/* Scroll Indicator Gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white dark:from-slate-800 to-transparent pointer-events-none rounded-b-3xl"></div>
          </motion.div>
        </div>
      </div>
      
      {/* Required CSS for custom scrollbar embedded */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.3);
          border-radius: 20px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(71, 85, 105, 0.4);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(156, 163, 175, 0.5);
        }
      `}</style>
    </div>
  );
}
