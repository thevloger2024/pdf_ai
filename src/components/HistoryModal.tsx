import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, Download, Trash2, BarChart2 } from 'lucide-react';
import { HistoryItem } from '../lib/storage';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onClearHistory: () => void;
}

export function HistoryModal({ isOpen, onClose, history, onClearHistory }: HistoryModalProps) {
  if (!isOpen) return null;

  const totalFiles = history.length;
  
  // Count tools usage
  const toolsUsage: Record<string, number> = {};
  history.forEach(item => {
    toolsUsage[item.tool] = (toolsUsage[item.tool] || 0) + 1;
  });

  const downloadHistoryItem = (item: HistoryItem) => {
    const url = URL.createObjectURL(item.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = item.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-3xl flex flex-col max-h-[85vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">All History & Usage Stats</h2>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="overflow-y-auto p-6 space-y-8 flex-1">
            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800/50 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800/50 rounded-full flex items-center justify-center mb-3">
                  <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-3xl font-bold text-blue-700 dark:text-blue-300">{totalFiles}</span>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-1">Total Files Processed</span>
              </div>
              
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-xl border border-emerald-100 dark:border-emerald-800/50 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-800/50 rounded-full flex items-center justify-center mb-3">
                  <BarChart2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">{Object.keys(toolsUsage).length}</span>
                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mt-1">Unique Tools Used</span>
              </div>
            </div>

            {/* Tools Breakdown */}
            {Object.keys(toolsUsage).length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-4">Tool Usage Breakdown</h3>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(toolsUsage).map(([tool, count]) => (
                    <div key={tool} className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700">
                      <span className="capitalize text-sm font-medium text-slate-700 dark:text-slate-300">{tool}</span>
                      <span className="bg-white dark:bg-slate-600 text-slate-500 dark:text-slate-400 text-xs font-bold px-2 py-0.5 rounded-full">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Full History List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider">All Recent Files</h3>
                {history.length > 0 && (
                  <button
                    onClick={() => {
                      onClearHistory();
                      onClose();
                    }}
                    className="text-xs flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-red-600 transition-colors font-medium px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear All
                  </button>
                )}
              </div>
              
              {history.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                  No history found. Process some files first!
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden shadow-sm">
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {history.map((item) => (
                      <div key={item.id} className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors gap-3">
                        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-slate-900 dark:text-slate-200 truncate">{item.name}</p>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                              <span className="capitalize">{item.tool}</span>
                              <span>•</span>
                              <span>{new Date(item.timestamp).toLocaleString()}</span>
                            </p>
                          </div>
                        </div>
                        <div className="sm:ml-4 flex-shrink-0 self-end sm:self-auto">
                          <button
                            onClick={() => downloadHistoryItem(item)}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 dark:bg-blue-500/10 dark:hover:bg-blue-600 rounded-lg transition-colors border border-transparent dark:border-blue-500/20"
                          >
                            <Download className="w-4 h-4" /> <span className="sm:hidden">Download</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
