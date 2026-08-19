const fs = require('fs');
let content = fs.readFileSync('src/pages/CompressTool.tsx', 'utf8');

// Add progress state
content = content.replace(
  "const [isProcessing, setIsProcessing] = useState(false);",
  "const [isProcessing, setIsProcessing] = useState(false);\n  const [progress, setProgress] = useState(0);"
);

// Add onProgress callback to imageCompression and JSZip
const oldImageCompression = `      if (type === 'jpg' || type === 'png') {
        const targetMB = unit === 'MB' ? targetSize : targetSize / 1024;
        const options = {
          maxSizeMB: targetMB,
          maxWidthOrHeight: 2560,
          useWebWorker: true,
          fileType: toolInfo.mime,
          initialQuality: 0.8
        };`;
const newImageCompression = `      setProgress(0);
      if (type === 'jpg' || type === 'png') {
        const targetMB = unit === 'MB' ? targetSize : targetSize / 1024;
        const options = {
          maxSizeMB: targetMB,
          maxWidthOrHeight: 2560,
          useWebWorker: true,
          fileType: toolInfo.mime,
          initialQuality: 0.8,
          onProgress: (p: number) => setProgress(p)
        };`;
content = content.replace(oldImageCompression, newImageCompression);

const oldZip = `        const compressedBlob = await zip.generateAsync({ 
          type: 'blob',
          compression: "DEFLATE",
          compressionOptions: {
            level: 9
          }
        });`;
const newZip = `        const compressedBlob = await zip.generateAsync({ 
          type: 'blob',
          compression: "DEFLATE",
          compressionOptions: {
            level: 9
          }
        }, (metadata) => {
          setProgress(metadata.percent);
        });`;
content = content.replace(oldZip, newZip);

// Update Markdown progress
const oldMd = `      } else if (type === 'md') {
        const text = await file.text();`;
const newMd = `      } else if (type === 'md') {
        setProgress(50);
        const text = await file.text();
        setProgress(100);`;
content = content.replace(oldMd, newMd);

// Update UI to show progress bar when processing
const oldUI = `          <div className="flex gap-4">
            <button onClick={() => setFile(null)} className="flex-1 px-6 py-3 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button 
              onClick={handleCompress} 
              disabled={isProcessing}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Compress File'}
            </button>
          </div>`;

const newUI = `          {isProcessing ? (
            <div className="w-full pt-2">
              <div className="flex justify-between text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" /> Compressing...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                <motion.div
                  className="bg-blue-600 h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: \`\${progress}%\` }}
                  transition={{ duration: 0.2 }}
                ></motion.div>
              </div>
            </div>
          ) : (
            <div className="flex gap-4 w-full">
              <button onClick={() => setFile(null)} className="flex-1 px-6 py-3 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button 
                onClick={handleCompress} 
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex justify-center items-center gap-2"
              >
                Compress File
              </button>
            </div>
          )}`;
content = content.replace(oldUI, newUI);

fs.writeFileSync('src/pages/CompressTool.tsx', content, 'utf8');
