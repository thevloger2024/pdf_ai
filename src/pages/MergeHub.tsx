import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { Combine, Layers, FilePlus, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

const mergeTools = [
  { id: 'merge-pdfs', name: 'Merge Multiple PDFs', desc: 'Combine multiple PDF files into a single, unified document.', icon: Combine, color: 'text-purple-600', bg: 'bg-purple-50', link: '/merge-pdfs' },
  { id: 'merge-pages', name: 'Merge Pages to PDF', desc: 'Select specific pages from different files to merge into one PDF.', icon: Layers, color: 'text-pink-600', bg: 'bg-pink-50', link: '/merge-pages' },
];

export default function MergeHub() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <SEO title="Merge PDF Tools" description="Combine multiple PDFs or specific pages into a single document seamlessly." />
      
      <div className="text-center max-w-3xl mx-auto mb-16">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-20 h-20 bg-purple-100 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <Combine className="w-10 h-10" />
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-slate-200 tracking-tight mb-6"
        >
          Merge PDF Tools
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed"
        >
          Choose how you want to combine your documents. Merge entire files together or extract specific pages.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {mergeTools.map((tool, i) => {
          const Icon = tool.icon;
          return (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (i + 1) }}
            >
              <Link to={tool.link} className="group flex flex-col h-full bg-white dark:bg-slate-800/90 rounded-3xl p-8 border border-slate-200 dark:border-slate-700/50 hover:border-purple-300 hover:shadow-xl hover:shadow-purple-900/5 transition-all duration-300">
                <div className={`w-16 h-16 rounded-2xl ${tool.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-8 h-8 ${tool.color}`} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-200 mb-3">{tool.name}</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-8 flex-1 text-base">{tool.desc}</p>
                <div className="flex items-center text-purple-600 dark:text-purple-400 font-semibold mt-auto">
                  Select Tool <ArrowRight className="w-5 h-5 ml-1.5 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
