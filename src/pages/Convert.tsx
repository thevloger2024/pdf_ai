import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { FileImage, Presentation, Table, ArrowRight, RefreshCw, FileText , FileJson, Database} from 'lucide-react';
import { motion } from 'motion/react';

const convertTools = [
  { id: 'md2json', name: 'Markdown to JSON', desc: 'Parse Markdown files into structured JSON without data loss.', icon: FileJson, color: 'text-fuchsia-600', bg: 'bg-fuchsia-50', link: '/convert/md2json' },
  { id: 'excel2json', name: 'Excel to JSON', desc: 'Convert Excel sheets (XLSX) reliably into structured JSON.', icon: Database, color: 'text-lime-600', bg: 'bg-lime-50', link: '/convert/excel2json' },
  { id: 'md', name: 'PDF to Markdown', desc: 'Convert your PDF documents into cleanly formatted Markdown files.', icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50', link: '/convert/md' },
  { id: 'excel2md', name: 'Excel to Markdown', desc: 'Convert Excel sheets (XLSX) into Markdown tables.', icon: Table, color: 'text-teal-600', bg: 'bg-teal-50', link: '/convert/excel2md' },
  { id: 'txt', name: 'PDF to Text', desc: 'Extract all readable text from your PDF into a simple text file.', icon: FileText, color: 'text-slate-600', bg: 'bg-slate-50', link: '/convert/txt' },
  { id: 'jpg', name: 'PDF to JPG', desc: 'Convert each page of your PDF into high-quality JPG images.', icon: FileImage, color: 'text-orange-600', bg: 'bg-orange-50', link: '/convert/jpg' },
  { id: 'png', name: 'PDF to PNG', desc: 'Convert PDF pages into transparent, high-res PNG images.', icon: FileImage, color: 'text-pink-600', bg: 'bg-pink-50', link: '/convert/png' },
  { id: 'excel', name: 'PDF to Excel', desc: 'Extract tabular data and text into structured Excel (XLSX) format.', icon: Table, color: 'text-emerald-600', bg: 'bg-emerald-50', link: '/convert/excel' },
  { id: 'ppt', name: 'PDF to PowerPoint', desc: 'Turn your PDF pages into presentation slides effortlessly.', icon: Presentation, color: 'text-rose-600', bg: 'bg-rose-50', link: '/convert/ppt' },
];

export default function Convert() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <SEO title="Convert PDF" description="Convert PDFs to Word, Excel, PowerPoint, JPG, and PNG seamlessly." />
      <div className="text-center max-w-3xl mx-auto mb-16">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="w-20 h-20 bg-blue-100 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <RefreshCw className="w-10 h-10" />
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-slate-200 tracking-tight mb-6"
        >
          PDF Converters
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed"
        >
          Transform your PDF files into other formats securely and locally in your browser.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {convertTools.map((tool, i) => {
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
                  Start Converting <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
