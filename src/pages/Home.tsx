import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { FileDown, FileMinus, SplitSquareHorizontal, FileText, ArrowRight, Clock, Download, Trash2, Droplets, Combine, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getHistory, clearHistory, HistoryItem } from '../lib/storage';
import { HistoryModal } from '../components/HistoryModal';

const getTools = (t: any) => [
  { id: 'compress', name: t('tool.compress'), desc: t('tool.compress.desc'), icon: FileMinus, color: 'text-emerald-600', bg: 'bg-emerald-50', link: '/compress-hub' },
  { id: 'merge', name: 'Merge PDF', desc: 'Combine multiple PDFs or pages into a single document.', icon: Combine, color: 'text-purple-600', bg: 'bg-purple-50', link: '/merge-hub' },
  { id: 'convert', name: t('nav.convert'), desc: 'Convert files to and from PDF format quickly.', icon: RefreshCw, color: 'text-blue-600', bg: 'bg-blue-50', link: '/convert' },
  { id: 'split', name: t('tool.split'), desc: t('tool.split.desc'), icon: SplitSquareHorizontal, color: 'text-amber-600', bg: 'bg-amber-50', link: '/split' },
  { id: 'chunk', name: t('tool.chunk'), desc: t('tool.chunk.desc'), icon: FileDown, color: 'text-indigo-600', bg: 'bg-indigo-50', link: '/chunk' },
  { id: 'edit', name: t('tool.edit'), desc: t('tool.edit.desc'), icon: FileText, color: 'text-orange-600', bg: 'bg-orange-50', link: '/edit' },
  { id: 'watermark', name: t('tool.watermark'), desc: t('tool.watermark.desc'), icon: Droplets, color: 'text-cyan-600', bg: 'bg-cyan-50', link: '/watermark' },
];

export default function Home() {
  const { t } = useLanguage();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const items = await getHistory();
    setHistory(items);
  };

  const handleClearHistory = async () => {
    await clearHistory();
    setHistory([]);
  };

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <SEO title="Home" description="Merge, split, compress, edit, and analyze your PDFs with just a few clicks. Fast, secure, and right in your browser." />
      <div className="text-center max-w-3xl mx-auto mb-16">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-slate-200 tracking-tight mb-6"
        >
          {t('home.title')}
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed"
        >
          {t('home.subtitle')}
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getTools(t).map((tool, i) => {
          const Icon = tool.icon;
          return (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (i + 1) }}
            >
              <Link 
                to={tool.link} 
                className="group flex flex-col h-full bg-white dark:bg-slate-800/90 rounded-2xl p-6 border border-slate-200 dark:border-slate-700/50 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-xl ${tool.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-7 h-7 ${tool.color}`} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-200 mb-2">{tool.name}</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6 flex-1">{tool.desc}</p>
                <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium text-sm mt-auto">
                  Open Tool <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {history.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-20 max-w-4xl mx-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-200 flex items-center gap-2">
              <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" /> Recent Files
            </h2>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsHistoryModalOpen(true)}
                className="text-sm flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
              >
                <Clock className="w-4 h-4" /> All History
              </button>
              <button
                onClick={handleClearHistory}
                className="text-sm flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Clear History
              </button>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/50 overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {history.slice(0, 5).map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900 dark:text-slate-200 truncate">{item.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <span className="capitalize">{item.tool}</span>
                        <span>•</span>
                        <span>{new Date(item.timestamp).toLocaleString()}</span>
                      </p>
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <button
                      onClick={() => downloadHistoryItem(item)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title={t('home.downloadAgain')}
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
      <HistoryModal 
        isOpen={isHistoryModalOpen} 
        onClose={() => setIsHistoryModalOpen(false)} 
        history={history} 
        onClearHistory={handleClearHistory} 
      />
    </div>
  );
}
