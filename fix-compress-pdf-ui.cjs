const fs = require('fs');

let content = fs.readFileSync('src/pages/Compress.tsx', 'utf8');

const oldUI = `        <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-8 border border-slate-200 dark:border-slate-700/50 shadow-sm">
          <div className="mb-8 w-full max-w-sm mx-auto flex justify-center">
            <PDFPreview file={file} />
          </div>
          <div className="text-center mb-8">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-200">{file.name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
          </div>
          <div className="flex justify-between items-center pt-6 border-t border-slate-100 dark:border-slate-800">`;

const newUI = `        <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-8 border border-slate-200 dark:border-slate-700/50 shadow-sm max-w-3xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8 items-center mb-8">
            <div className="w-full md:w-1/2 flex justify-center">
              <div className="max-w-[200px] w-full">
                <PDFPreview file={file} />
              </div>
            </div>
            <div className="w-full md:w-1/2 space-y-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-200 truncate" title={file.name}>{file.name}</h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Original: {(file.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
              
              <div className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider">Target Compression Size</h3>
                <div className="flex gap-3 items-center">
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={targetSize}
                    onChange={(e) => setTargetSize(Number(e.target.value))}
                    className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-slate-100 font-medium"
                  />
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as 'MB' | 'KB')}
                    className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-slate-100 font-bold"
                  >
                    <option value="KB">KB</option>
                    <option value="MB">MB</option>
                  </select>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
                  We will optimize the document structure to get as close to the target size as possible.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center pt-6 border-t border-slate-100 dark:border-slate-800">`;

content = content.replace(oldUI, newUI);

fs.writeFileSync('src/pages/Compress.tsx', content, 'utf8');
