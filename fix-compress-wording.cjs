const fs = require('fs');
let content = fs.readFileSync('src/pages/Compress.tsx', 'utf8');

// Add a warning if compression size is similar to original
const resultCheckOld = `              <div className="flex items-center justify-center gap-4 text-sm font-medium mb-8">
                <span className="text-slate-500 dark:text-slate-400 line-through">{formatSize(result.originalSize)}</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
                <span className="text-emerald-600 dark:text-emerald-400">{formatSize(result.newSize)}</span>
              </div>`;

const resultCheckNew = `              <div className="flex items-center justify-center gap-4 text-sm font-medium mb-4">
                <span className="text-slate-500 dark:text-slate-400 line-through">{formatSize(result.originalSize)}</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
                <span className="text-emerald-600 dark:text-emerald-400">{formatSize(result.newSize)}</span>
              </div>
              
              {result.newSize > result.originalSize * 0.9 && (
                <div className="mb-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                  <p className="text-sm text-amber-800 dark:text-amber-300 font-medium text-left">
                    Note: The file size didn't reduce much. This usually means your PDF contains mostly flattened images (like scans) which cannot be further compressed inside a web browser without heavy server-side processing.
                  </p>
                </div>
              )}
              
              <div className="mb-8" />`;

content = content.replace(resultCheckOld, resultCheckNew);

// Rename Start Over to Upload New File
content = content.replace(
  ">Start Over<",
  ">Compress Another File<"
);
content = content.replace(
  "                  Start Over\n                </button>",
  "                  Compress Another File\n                </button>"
);

fs.writeFileSync('src/pages/Compress.tsx', content, 'utf8');
