import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { FileMinus, Image as ImageIcon, Table, Presentation, FileText, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

const compressTools = [
  { id: 'pdf', name: 'PDF Compressor', desc: 'Reduce the size of your PDF documents while maintaining quality.', icon: FileMinus, color: 'text-emerald-600', bg: 'bg-emerald-50', link: '/compress' },
  { id: 'png', name: 'PNG Compressor', desc: 'Compress transparent PNG images to save space.', icon: ImageIcon, color: 'text-pink-600', bg: 'bg-pink-50', link: '/compress-tool/png' },
  { id: 'jpg', name: 'JPG Compressor', desc: 'Reduce JPG image file sizes with optimal quality settings.', icon: ImageIcon, color: 'text-orange-600', bg: 'bg-orange-50', link: '/compress-tool/jpg' },
  { id: 'excel', name: 'Excel Compressor', desc: 'Optimize and compress Excel (XLSX) spreadsheets.', icon: Table, color: 'text-teal-600', bg: 'bg-teal-50', link: '/compress-tool/excel' },
  { id: 'md', name: 'Markdown Compressor', desc: 'Minify and optimize Markdown documents.', icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50', link: '/compress-tool/md' },
  { id: 'ppt', name: 'PPT Compressor', desc: 'Compress PowerPoint (PPTX) presentations.', icon: Presentation, color: 'text-rose-600', bg: 'bg-rose-50', link: '/compress-tool/ppt' },
];

export default function CompressHub() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <SEO title="Compress Files" description="Reduce file size for PDFs, Images, and Documents while maximizing quality." />
      <div className="text-center max-w-3xl mx-auto mb-16">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="w-20 h-20 bg-blue-100 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <FileMinus className="w-10 h-10" />
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-slate-200 tracking-tight mb-6"
        >
          File Compressors
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed"
        >
          Reduce the file size of your documents and images securely directly in your browser.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {compressTools.map((tool, i) => {
          const Icon = tool.icon;
          return (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (i + 1) }}
            >
              <Link to={tool.link} className="group flex flex-col h-full bg-white dark:bg-slate-800/90 rounded-2xl p-6 border border-slate-200 dark:border-slate-700/50 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
                <div className={`w-14 h-14 rounded-xl ${tool.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-7 h-7 ${tool.color}`} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-200 mb-2">{tool.name}</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6 flex-1 text-sm">{tool.desc}</p>
                <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium text-sm mt-auto">
                  Start Compressing <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
