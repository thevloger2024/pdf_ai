const fs = require('fs');
let content = fs.readFileSync('src/pages/ConvertTool.tsx', 'utf8');

const oldResultUI = `          ) : (
            <div className="text-center max-w-md mx-auto">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <RefreshCw className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-200 mb-2">Conversion Complete!</h2>`;

const newResultUI = `          ) : (
            <div className="text-center max-w-md mx-auto">
              <div className="mb-6 w-full flex justify-center">
                {result.name.toLowerCase().endsWith('.pdf') ? (
                  <PDFPreview file={result.url} />
                ) : result.name.toLowerCase().match(/\\.(jpg|jpeg|png|webp|svg)$/) ? (
                  <img src={result.url} alt="Converted preview" className="max-w-full h-auto rounded shadow-md border border-slate-200 dark:border-slate-700 max-h-[300px] object-contain" />
                ) : (
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
                    <RefreshCw className="w-10 h-10" />
                  </div>
                )}
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-200 mb-2">Conversion Complete!</h2>`;

content = content.replace(oldResultUI, newResultUI);

if (!content.includes('PDFPreview')) {
  content = content.replace(
    "import { FileUploader } from '../components/FileUploader';",
    "import { FileUploader } from '../components/FileUploader';\nimport { PDFPreview } from '../components/PDFPreview';"
  );
}

fs.writeFileSync('src/pages/ConvertTool.tsx', content, 'utf8');
