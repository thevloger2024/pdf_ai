const fs = require('fs');
let content = fs.readFileSync('src/pages/Compress.tsx', 'utf8');

const oldResultUI = `        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-800/90 rounded-3xl p-8 border border-slate-200 dark:border-slate-700/50 shadow-sm">
          <div className="text-center max-w-md mx-auto">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-200 mb-2">Compression Complete!</h2>`;

const newResultUI = `        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-800/90 rounded-3xl p-8 border border-slate-200 dark:border-slate-700/50 shadow-sm">
          <div className="text-center max-w-md mx-auto">
            <div className="mb-6 w-full flex justify-center">
              <PDFPreview file={result.url} />
            </div>
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-200 mb-2">Compression Complete!</h2>`;

// Check if oldResultUI matches. Let's do a more robust replace.
let index = content.indexOf('Compression Complete!</h2>');
if (index > -1) {
  let sub = content.substring(index - 300, index);
  if (sub.includes('Check className')) {
    // just inject PDFPreview above the Check icon
    content = content.replace(
      `<div className="w-20 h-20 bg-emerald-100`,
      `<div className="mb-6 w-full flex justify-center">\n              <PDFPreview file={result.url} />\n            </div>\n            <div className="w-20 h-20 bg-emerald-100`
    );
  }
}

fs.writeFileSync('src/pages/Compress.tsx', content, 'utf8');
