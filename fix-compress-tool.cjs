const fs = require('fs');

let content = fs.readFileSync('src/pages/CompressTool.tsx', 'utf8');

// Add state for target size
content = content.replace(
  "const [isProcessing, setIsProcessing] = useState(false);",
  "const [isProcessing, setIsProcessing] = useState(false);\n  const [targetSize, setTargetSize] = useState<number>(1);\n  const [unit, setUnit] = useState<'MB' | 'KB'>('MB');"
);

// Update compression logic to use target size
const oldLogic = `      if (type === 'jpg' || type === 'png') {
        const options = {
          maxSizeMB: 1, // Compress to ~1MB or lower
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          fileType: toolInfo.mime
        };
        const compressedFile = await imageCompression(file, options);
        await handleResult(compressedFile, baseFilename, file.size);`;

const newLogic = `      if (type === 'jpg' || type === 'png') {
        const targetMB = unit === 'MB' ? targetSize : targetSize / 1024;
        const options = {
          maxSizeMB: targetMB,
          maxWidthOrHeight: 2560,
          useWebWorker: true,
          fileType: toolInfo.mime,
          initialQuality: 0.8
        };
        const compressedFile = await imageCompression(file, options);
        await handleResult(compressedFile, baseFilename, file.size);`;

content = content.replace(oldLogic, newLogic);

// Add UI for target size
const oldUI = `      {!file ? (
        <FileUploader onFileSelect={setFile} title={\`Select \${toolInfo.name}\`} />
      ) : !result ? (
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-8 border border-slate-200 dark:border-slate-700/50 shadow-sm max-w-2xl mx-auto">`;

const newUI = `      {!file ? (
        <FileUploader onFileSelect={setFile} title={\`Select \${toolInfo.name}\`} />
      ) : !result ? (
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-8 border border-slate-200 dark:border-slate-700/50 shadow-sm max-w-2xl mx-auto">
          {(type === 'jpg' || type === 'png') && (
            <div className="mb-8 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Target File Size</h3>
              <div className="flex gap-4 items-center">
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={targetSize}
                  onChange={(e) => setTargetSize(Number(e.target.value))}
                  className="flex-1 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-slate-100"
                />
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as 'MB' | 'KB')}
                  className="px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-slate-100 font-medium"
                >
                  <option value="KB">KB</option>
                  <option value="MB">MB</option>
                </select>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                We will optimize the image to get as close to {targetSize}{unit} as possible without losing structural integrity.
              </p>
            </div>
          )}`;

content = content.replace(oldUI, newUI);

fs.writeFileSync('src/pages/CompressTool.tsx', content, 'utf8');
