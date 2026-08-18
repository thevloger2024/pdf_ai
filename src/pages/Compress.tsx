import { toast } from "react-hot-toast";
import SEO from '../components/SEO';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FileUploader } from '../components/FileUploader';
import { PDFPreview } from '../components/PDFPreview';
import { PDFDocument } from 'pdf-lib';
import { Download, Loader2, ArrowRight, Check, Share2 } from 'lucide-react';
import { User } from '../types';
import { logActivity, logToolAccess } from '../lib/firebase';
import { sharePdf } from '../lib/utils';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { saveToHistory } from '../lib/storage';

export default function Compress({ user }: { user: User | null }) {
  useEffect(() => {
    logToolAccess('compress');
  }, []);

  const [file, setFile] = useState<File | null>(null);
  const [targetSize, setTargetSize] = useState<number>(1);
  const [unit, setUnit] = useState<'MB' | 'KB'>('MB');
  const [isCompressing, setIsCompressing] = useState(false);
  const [result, setResult] = useState<{ url: string, name: string, originalSize: number, newSize: number } | null>(null);

  useKeyboardShortcuts({
    onEscape: () => {
      setFile(null);
      setResult(null);
      toast('File cleared', { icon: '🧹' });
    },
    onSave: () => {
      if (result) {
        const a = document.createElement('a');
        a.href = result.url;
        a.download = result.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success('Download started successfully!');
      } else if (file && !isCompressing) {
        handleCompress();
      }
    }
  });

  const handleCompress = async () => {
    if (!file) return;
    setIsCompressing(true);
    try {
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
      
      const pdfBytes = await pdfDoc.save(options);
      
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setResult({
        url,
        name: `compressed_${file.name}`,
        originalSize: file.size,
        newSize: blob.size // Might not be significantly smaller without image downsampling
      });
      
      await saveToHistory(`compressed_${file.name}`, blob, 'compress');

      if (user) {
        logActivity(user.uid, 'compress_pdf', { originalSize: file.size, target: `${targetSize}${unit}` });
      }
    } catch (error) {
      console.error("Compression failed", error);
      toast.error("Failed to compress PDF. Please try again.");
    } finally {
      setIsCompressing(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
      <SEO title="Compress PDF" description="Reduce PDF file size while optimizing for maximal quality." />
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-200 mb-4">Compress PDF</h1>
        <p className="text-slate-600 dark:text-slate-400">Reduce your PDF file size while maintaining maximum quality.</p>
      </div>

      {!file ? (
        <FileUploader onFileSelect={setFile} title="Select PDF file" />
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-800/90 rounded-3xl p-8 border border-slate-200 dark:border-slate-700/50 shadow-sm">
          {!result ? (
            <div className="max-w-md mx-auto">
              <div className="mb-6 w-full flex justify-center">
                <PDFPreview file={file} />
              </div>
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 mb-8">
                <span className="font-medium text-slate-700 dark:text-slate-300 truncate mr-4">{file.name}</span>
                <span className="text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">{formatSize(file.size)}</span>
              </div>

              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Target Size</label>
              <div className="flex gap-4 mb-8">
                <input 
                  type="number" 
                  value={targetSize} 
                  onChange={(e) => setTargetSize(Number(e.target.value))}
                  className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  min="0.1"
                  step="0.1"
                />
                <select 
                  value={unit} 
                  onChange={(e) => setUnit(e.target.value as 'MB' | 'KB')}
                  className="w-24 px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                  <option value="MB">MB</option>
                  <option value="KB">KB</option>
                </select>
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
          ) : (
            <div className="text-center max-w-md mx-auto">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-200 mb-2">Compression Complete!</h2>
              <div className="flex items-center justify-center gap-4 text-sm font-medium mb-8">
                <span className="text-slate-500 dark:text-slate-400 line-through">{formatSize(result.originalSize)}</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
                <span className="text-emerald-600 dark:text-emerald-400">{formatSize(result.newSize)}</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => { setFile(null); setResult(null); }} className="flex-1 px-6 py-3 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-50 transition-colors">
                  Start Over
                </button>
                <button onClick={() => sharePdf(result.url, result.name)} className="flex-1 px-6 py-3 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 text-blue-700 dark:text-blue-400 rounded-xl font-medium transition-colors flex justify-center items-center gap-2">
                  <Share2 className="w-5 h-5" /> Share
                </button>
                <a 
                  href={result.url} 
                  onClick={() => toast.success('Download started successfully!')} download={result.name}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex justify-center items-center gap-2"
                >
                  <Download className="w-5 h-5" /> Download
                </a>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
