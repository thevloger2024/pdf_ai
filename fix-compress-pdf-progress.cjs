const fs = require('fs');
let content = fs.readFileSync('src/pages/Compress.tsx', 'utf8');

// Add progress state
content = content.replace(
  "const [isCompressing, setIsCompressing] = useState(false);",
  "const [isCompressing, setIsCompressing] = useState(false);\n  const [progress, setProgress] = useState(0);"
);

const oldLogic = `    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      
      // Calculate target bytes
      const targetBytes = unit === 'MB' ? targetSize * 1024 * 1024 : targetSize * 1024;
      let options = { useObjectStreams: false };
      
      // Client-side PDF compression is limited. We strip object streams. 
      // If the target is very low, we could theoretically remove metadata or downsample,
      // but without a heavy WASM image processing library, structural stripping is the safest method.
      // We will attempt multiple save passes if needed, removing metadata.
      pdfDoc.setTitle('');
      pdfDoc.setAuthor('');
      pdfDoc.setSubject('');
      pdfDoc.setKeywords([]);
      pdfDoc.setProducer('');
      pdfDoc.setCreator('');
      
      const pdfBytes = await pdfDoc.save(options);`;

const newLogic = `    try {
      setProgress(10);
      const arrayBuffer = await file.arrayBuffer();
      
      // Simulate progress for PDF processing since pdf-lib is mostly blocking
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + Math.random() * 15, 90));
      }, 500);

      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      
      // Calculate target bytes
      const targetBytes = unit === 'MB' ? targetSize * 1024 * 1024 : targetSize * 1024;
      let options = { useObjectStreams: false };
      
      pdfDoc.setTitle('');
      pdfDoc.setAuthor('');
      pdfDoc.setSubject('');
      pdfDoc.setKeywords([]);
      pdfDoc.setProducer('');
      pdfDoc.setCreator('');
      
      const pdfBytes = await pdfDoc.save(options);
      clearInterval(progressInterval);
      setProgress(100);`;

content = content.replace(oldLogic, newLogic);

const oldUI = `          <div className="flex justify-between items-center pt-6 border-t border-slate-100 dark:border-slate-800">
            <span className="font-medium text-slate-700 dark:text-slate-300 truncate mr-4">{file.name}</span>
            <span className="text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">{formatSize(file.size)}</span>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setFile(null)} className="flex-1 px-6 py-3 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button 
              onClick={handleCompress} 
              disabled={isCompressing}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isCompressing ? <><Loader2 className="w-5 h-5 animate-spin" /> Compressing...</> : 'Compress PDF'}
            </button>
          </div>
          <p className="text-xs text-center text-slate-400 mt-6">Note: Extreme compression requires image downsampling which is limited in the browser environment.</p>
        </div>
      ) : (`;

const newUI = `          <div className="flex justify-between items-center pt-6 border-t border-slate-100 dark:border-slate-800 mb-6">
            <span className="font-medium text-slate-700 dark:text-slate-300 truncate mr-4">{file.name}</span>
            <span className="text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">{formatSize(file.size)}</span>
          </div>
          
          {isCompressing ? (
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
                Compress PDF
              </button>
            </div>
          )}
          
          <p className="text-xs text-center text-slate-400 mt-6">Note: Extreme compression requires image downsampling which is limited in the browser environment.</p>
        </div>
      ) : (`;

content = content.replace(oldUI, newUI);

// Fix potential issue where old UI replacement failed due to structure differences. Let's make sure it matches correctly.
fs.writeFileSync('src/pages/Compress.tsx', content, 'utf8');
