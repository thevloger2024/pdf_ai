const fs = require('fs');
let content = fs.readFileSync('src/pages/CompressTool.tsx', 'utf8');

const oldUI = `      ) : !result ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-800/90 rounded-3xl p-8 border border-slate-200 dark:border-slate-700/50 shadow-sm max-w-md mx-auto">
          <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 mb-8">`;

const newUI = `      ) : !result ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-800/90 rounded-3xl p-8 border border-slate-200 dark:border-slate-700/50 shadow-sm max-w-xl mx-auto">
          <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 mb-6">
            <span className="font-medium text-slate-700 dark:text-slate-300 truncate mr-4">{file.name}</span>
            <span className="text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">{formatSize(file.size)}</span>
          </div>

          {(type === 'jpg' || type === 'png' || type === 'excel' || type === 'ppt' || type === 'md') && (
            <div className="mb-8 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider">Target Compression Size</h3>
              <div className="flex gap-3 items-center">
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={targetSize}
                  onChange={(e) => setTargetSize(Number(e.target.value))}
                  className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-slate-100 font-medium"
                />
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as 'MB' | 'KB')}
                  className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-slate-100 font-bold"
                >
                  <option value="KB">KB</option>
                  <option value="MB">MB</option>
                </select>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
                We will optimize the file to get as close to the target size as possible.
              </p>
            </div>
          )}

          <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-6">`;

const oldUIPart2 = `          <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 mb-8">
            <span className="font-medium text-slate-700 dark:text-slate-300 truncate mr-4">{file.name}</span>
            <span className="text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">{formatSize(file.size)}</span>
          </div>
          <div className="flex gap-4">`;

content = content.replace(oldUI, newUI);
content = content.replace(oldUIPart2, `          <div className="flex w-full gap-4">`);
fs.writeFileSync('src/pages/CompressTool.tsx', content, 'utf8');
