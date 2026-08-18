import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileMinus, Combine, SplitSquareHorizontal, FileDown, 
  FileEdit, Droplets, Image as ImageIcon, Table, Presentation, 
  FileText, RefreshCw, Layers, ChevronDown, Sparkles, Home
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const compressTools = [
  { id: 'pdf', name: 'PDF Compressor', desc: 'Reduce PDF file size', icon: FileMinus, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/40', link: '/compress' },
  { id: 'png', name: 'PNG Compressor', desc: 'Compress transparent PNGs', icon: ImageIcon, color: 'text-pink-600', bg: 'bg-pink-50 dark:bg-pink-950/40', link: '/compress-tool/png' },
  { id: 'jpg', name: 'JPG Compressor', desc: 'Reduce JPG image sizes', icon: ImageIcon, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950/40', link: '/compress-tool/jpg' },
  { id: 'excel', name: 'Excel Compressor', desc: 'Optimize XLSX files', icon: Table, color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-950/40', link: '/compress-tool/excel' },
  { id: 'md', name: 'Markdown Compressor', desc: 'Minify MD documents', icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/40', link: '/compress-tool/md' },
  { id: 'ppt', name: 'PPT Compressor', desc: 'Compress PPTX files', icon: Presentation, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/40', link: '/compress-tool/ppt' },
];

const mergeTools = [
  { id: 'merge-pdfs', name: 'Merge PDFs', desc: 'Combine multiple PDFs into one document', icon: Combine, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/40', link: '/merge-pdfs' },
  { id: 'merge-pages', name: 'Merge Pages to PDF', desc: 'Select and combine specific pages', icon: Layers, color: 'text-pink-600', bg: 'bg-pink-50 dark:bg-pink-950/40', link: '/merge-pages' },
];

const convertTools = [
  { id: 'to-pdf', name: 'Convert to PDF', desc: 'Word, Excel, PPT, JPG to PDF', icon: RefreshCw, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/40', link: '/convert' },
  { id: 'from-pdf', name: 'Convert from PDF', desc: 'PDF to Word, JPG, PNG, Excel', icon: Sparkles, color: 'text-fuchsia-600', bg: 'bg-fuchsia-50 dark:bg-fuchsia-950/40', link: '/convert' },
];

const DropdownContent = ({ items, onClick }: { items: any[], onClick: () => void }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 min-w-[380px]">
    {items.map((tool) => {
      const Icon = tool.icon;
      return (
        <Link 
          key={tool.id} 
          to={tool.link} 
          onClick={onClick}
          className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors group"
        >
          <div className={`shrink-0 w-9 h-9 rounded-lg ${tool.bg} flex items-center justify-center group-hover:scale-105 transition-transform border border-slate-100 dark:border-slate-800`}>
            <Icon className={`w-4 h-4 ${tool.color}`} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-0.5">{tool.name}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">{tool.desc}</p>
          </div>
        </Link>
      );
    })}
  </div>
);

export function DesktopNavigation() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { t } = useLanguage();

  const handleMouseEnter = (menu: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(menu);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  const closeDropdown = () => setActiveDropdown(null);

  return (
    <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
      
      {/* Home */}
      <Link 
        to="/" 
        className="px-2.5 py-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50"
      >
        <Home className="w-4 h-4" />
        <span>{t('nav.home')}</span>
      </Link>

      {/* Convert with Dropdown */}
      <div 
        className="relative" 
        onMouseEnter={() => handleMouseEnter('convert')} 
        onMouseLeave={handleMouseLeave}
      >
        <Link 
          to="/convert" 
          className={`px-2.5 py-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 ${activeDropdown === 'convert' ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400' : ''}`}
        >
          <RefreshCw className="w-4 h-4" />
          <span>{t('nav.convert')}</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${activeDropdown === 'convert' ? 'rotate-180' : ''}`} />
        </Link>
        <AnimatePresence>
          {activeDropdown === 'convert' && (
            <motion.div 
              initial={{ opacity: 0, y: 8 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 8 }} 
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-2xl overflow-hidden z-50"
            >
              <DropdownContent items={convertTools} onClick={closeDropdown} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Compress with Dropdown */}
      <div 
        className="relative" 
        onMouseEnter={() => handleMouseEnter('compress')} 
        onMouseLeave={handleMouseLeave}
      >
        <Link 
          to="/compress-hub" 
          className={`px-2.5 py-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 ${activeDropdown === 'compress' ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400' : ''}`}
        >
          <FileMinus className="w-4 h-4" />
          <span>{t('nav.compress')}</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${activeDropdown === 'compress' ? 'rotate-180' : ''}`} />
        </Link>
        <AnimatePresence>
          {activeDropdown === 'compress' && (
            <motion.div 
              initial={{ opacity: 0, y: 8 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 8 }} 
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-2xl overflow-hidden z-50"
            >
              <DropdownContent items={compressTools} onClick={closeDropdown} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Merge with Dropdown */}
      <div 
        className="relative" 
        onMouseEnter={() => handleMouseEnter('merge')} 
        onMouseLeave={handleMouseLeave}
      >
        <Link 
          to="/merge-hub" 
          className={`px-2.5 py-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 ${activeDropdown === 'merge' ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400' : ''}`}
        >
          <Combine className="w-4 h-4" />
          <span>Merge</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${activeDropdown === 'merge' ? 'rotate-180' : ''}`} />
        </Link>
        <AnimatePresence>
          {activeDropdown === 'merge' && (
            <motion.div 
              initial={{ opacity: 0, y: 8 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 8 }} 
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-2xl overflow-hidden z-50"
            >
              <DropdownContent items={mergeTools} onClick={closeDropdown} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Split */}
      <Link 
        to="/split" 
        className="px-2.5 py-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50"
      >
        <SplitSquareHorizontal className="w-4 h-4" />
        <span>{t('nav.split')}</span>
      </Link>
      
      {/* Chunk */}
      <Link 
        to="/chunk" 
        className="px-2.5 py-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50"
      >
        <FileDown className="w-4 h-4" />
        <span>{t('nav.chunk')}</span>
      </Link>
      
      {/* Edit */}
      <Link 
        to="/edit" 
        className="px-2.5 py-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50"
      >
        <FileEdit className="w-4 h-4" />
        <span>{t('nav.edit')}</span>
      </Link>
      
      {/* Watermark */}
      <Link 
        to="/watermark" 
        className="px-2.5 py-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50"
      >
        <Droplets className="w-4 h-4" />
        <span>{t('nav.watermark')}</span>
      </Link>

    </nav>
  );
}
