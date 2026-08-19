const fs = require('fs');
let content = fs.readFileSync('src/pages/MergePages.tsx', 'utf8');

const oldResultUI = `        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto bg-white dark:bg-slate-800/90 rounded-3xl p-8 border border-slate-200 dark:border-slate-700/50 shadow-sm text-center">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Merge Complete!</h2>`;

const newResultUI = `        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto bg-white dark:bg-slate-800/90 rounded-3xl p-8 border border-slate-200 dark:border-slate-700/50 shadow-sm text-center">
          <div className="mb-6 w-full flex justify-center">
            <PDFPreview file={resultUrl} />
          </div>
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Merge Complete!</h2>`;

content = content.replace(oldResultUI, newResultUI);

if (!content.includes('PDFPreview')) {
  content = content.replace(
    "import { FileUploader } from '../components/FileUploader';",
    "import { FileUploader } from '../components/FileUploader';\nimport { PDFPreview } from '../components/PDFPreview';"
  );
}

fs.writeFileSync('src/pages/MergePages.tsx', content, 'utf8');
