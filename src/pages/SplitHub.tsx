import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { motion } from 'motion/react';
import { FileText, FileDown, SplitSquareHorizontal, FileSpreadsheet, FileCode2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function SplitHub() {
  const { t } = useLanguage();

  const tools = [
    {
      title: 'Split PDF',
      desc: 'Extract specific pages from your PDF documents.',
      icon: SplitSquareHorizontal,
      color: 'text-amber-600',
      bg: 'bg-amber-50 dark:bg-amber-500/10',
      link: '/split-pdf'
    },
    {
      title: 'Split Text & CSV',
      desc: 'Split large text or CSV files into smaller parts.',
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-500/10',
      link: '/split-text?type=csv'
    },
    {
      title: 'Split Text to Excel',
      desc: 'Convert and split text/CSV into multiple Excel sheets or files.',
      icon: FileSpreadsheet,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
      link: '/split-text?type=excel'
    },
    {
      title: 'Split Markdown',
      desc: 'Split markdown files by headers or lines.',
      icon: FileCode2,
      color: 'text-purple-600',
      bg: 'bg-purple-50 dark:bg-purple-500/10',
      link: '/split-text?type=md'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <SEO title="Split Tools - PDF AI" description="Split PDFs, Text, CSV, Excel, and Markdown files." />
      
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight mb-6">
          Split <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-400">Files</span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Choose a tool to split your files into smaller, manageable pieces. We support PDF, Text, CSV, Excel, and Markdown formats.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {tools.map((tool, i) => (
          <motion.div
            key={tool.link}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link 
              to={tool.link}
              className="group flex flex-col h-full bg-white dark:bg-slate-800/90 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-xl transition-all duration-300"
            >
              <div className={`w-14 h-14 rounded-xl ${tool.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <tool.icon className={`w-7 h-7 ${tool.color}`} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">{tool.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 flex-1">{tool.desc}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
