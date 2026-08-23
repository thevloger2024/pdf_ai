const fs = require('fs');
let code = fs.readFileSync('src/pages/Compress.tsx', 'utf8');

const imports = `import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
// Setup PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = \`//cdnjs.cloudflare.com/ajax/libs/pdf.js/\${pdfjsLib.version}/pdf.worker.min.mjs\`;`;

code = code.replace("import { PDFDocument } from 'pdf-lib';", imports);

const newHandleCompress = `  const [progressLabel, setProgressLabel] = useState<string>('');

  const handleCompress = async () => {
    if (!file) return;
    setIsCompressing(true);
    setProgress(0);
    setProgressLabel('Initializing...');
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const targetBytes = unit === 'MB' ? targetSize * 1024 * 1024 : targetSize * 1024;
      
      // Load PDF using PDF.js for rasterization
      setProgressLabel('Reading PDF structure...');
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      
      // Calculate aggressive scale and quality based on compression ratio needed
      const ratio = targetBytes / file.size;
      let scale = 1.5;
      let quality = 0.8;
      
      if (ratio < 0.1) {
        scale = 0.8;
        quality = 0.4;
      } else if (ratio < 0.3) {
        scale = 1.0;
        quality = 0.6;
      } else if (ratio < 0.6) {
        scale = 1.2;
        quality = 0.7;
      }
      
      const newPdfDoc = await PDFDocument.create();
      
      for (let i = 1; i <= numPages; i++) {
        setProgress((i / numPages) * 90);
        setProgressLabel(\`Compressing page \${i} of \${numPages}...\`);
        
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) continue;
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        await page.render({ canvasContext: context, viewport } as any).promise;
        
        const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
        
        if (blob) {
          const imageBytes = await blob.arrayBuffer();
          const jpgImage = await newPdfDoc.embedJpg(imageBytes);
          const pdfPage = newPdfDoc.addPage([jpgImage.width, jpgImage.height]);
          pdfPage.drawImage(jpgImage, {
            x: 0,
            y: 0,
            width: jpgImage.width,
            height: jpgImage.height,
          });
        }
        
        // Yield to browser UI
        await new Promise(r => setTimeout(r, 10));
      }
      
      setProgressLabel('Finalizing compressed PDF...');
      const pdfBytes = await newPdfDoc.save({ useObjectStreams: false });
      setProgress(100);
      
      const compressedBlob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(compressedBlob);
      
      setResult({
        url,
        name: \`compressed_\${file.name}\`,
        originalSize: file.size,
        newSize: compressedBlob.size
      });
      
      await saveToHistory(\`compressed_\${file.name}\`, compressedBlob, 'compress');

      if (user) {
        logActivity(user.uid, 'compress_pdf', { originalSize: file.size, target: \`\${targetSize}\${unit}\` });
      }
    } catch (error) {
      console.error("Compression failed", error);
      toast.error("Failed to compress PDF. Please try again.");
    } finally {
      setIsCompressing(false);
      setProgressLabel('');
    }
  };`;

// Replace handleCompress and the progress bar UI
const regex = /const handleCompress = async \(\) => {[\s\S]*?setIsCompressing\(false\);\n    }\n  };/;
code = code.replace(regex, newHandleCompress);

// Add progress bar if it's missing or update the button label
code = code.replace(
  "{isCompressing ? <><Loader2 className=\"w-5 h-5 animate-spin\" /> Compressing...</> : 'Compress PDF'}",
  "{isCompressing ? <><Loader2 className=\"w-5 h-5 animate-spin\" /> {progressLabel || 'Compressing...'}</> : 'Compress PDF'}"
);

// We need to render the ProgressBar component if not already there, wait, Compress.tsx doesn't use ProgressBar it seems.
// Let's add a visual progress bar.
const progressBarUI = `              <div className="flex gap-4">
                <button onClick={() => setFile(null)} className="flex-1 px-6 py-3 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button 
                  onClick={handleCompress} 
                  disabled={isCompressing}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isCompressing ? <><Loader2 className="w-5 h-5 animate-spin" /> {progressLabel || 'Compressing...'}</> : 'Compress PDF'}
                </button>
              </div>
              {isCompressing && (
                <div className="mt-6">
                  <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
                    <span>{progressLabel}</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: \`\${progress}%\` }}></div>
                  </div>
                </div>
              )}`;

const oldButtons = `<div className="flex gap-4">
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
              </div>`;

code = code.replace(oldButtons, progressBarUI);
fs.writeFileSync('src/pages/Compress.tsx', code, 'utf8');
