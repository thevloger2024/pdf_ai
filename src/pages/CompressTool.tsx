import { useState, useEffect } from 'react';
import SEO from '../components/SEO';
import { useParams, Navigate } from 'react-router-dom';
import { Loader2, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { FileUploader } from '../components/FileUploader';
import { toast } from 'react-hot-toast';
import { User } from '../types';
import { logActivity, logToolAccess } from '../lib/firebase';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { saveToHistory } from '../lib/storage';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';

const compressors = {
  png: { name: 'PNG', ext: 'png', mime: 'image/png', accept: '.png' },
  jpg: { name: 'JPG', ext: 'jpg', mime: 'image/jpeg', accept: '.jpg,.jpeg' },
  excel: { name: 'Excel', ext: 'xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', accept: '.xlsx' },
  md: { name: 'Markdown', ext: 'md', mime: 'text/markdown', accept: '.md' },
  ppt: { name: 'PowerPoint', ext: 'pptx', mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', accept: '.pptx' },
};

export default function CompressTool({ user }: { user: User | null }) {


  const { type } = useParams<{ type: string }>();
  useEffect(() => {
    if (type) logToolAccess('compress_' + type);
  }, [type]);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [targetSize, setTargetSize] = useState<number>(1);
  const [unit, setUnit] = useState<'MB' | 'KB'>('MB');
  const [result, setResult] = useState<{ url: string, name: string, oldSize: number, newSize: number } | null>(null);

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
      } else if (file && !isProcessing) {
        handleCompress();
      }
    }
  });

  if (!type || !(type in compressors)) {
    return <Navigate to="/compress-hub" replace />;
  }

  const toolInfo = compressors[type as keyof typeof compressors];

  const handleResult = async (blob: Blob, name: string, oldSize: number) => {
    setResult({ url: URL.createObjectURL(blob), name, oldSize, newSize: blob.size });
    await saveToHistory(name, blob, `compress_${type}`);
  };

  const handleCompress = async () => {
    if (!file) return;
    setIsProcessing(true);
    setResult(null);

    try {
      const baseFilename = file.name;

      setProgress(0);
      if (type === 'jpg' || type === 'png') {
        const targetMB = unit === 'MB' ? targetSize : targetSize / 1024;
        const options = {
          maxSizeMB: targetMB,
          maxWidthOrHeight: 2560,
          useWebWorker: true,
          fileType: toolInfo.mime,
          initialQuality: 0.8,
          onProgress: (p: number) => setProgress(p)
        };
        const compressedFile = await imageCompression(file, options);
        await handleResult(compressedFile, baseFilename, file.size);
        
      } else if (type === 'md') {
        setProgress(50);
        const text = await file.text();
        setProgress(100);
        // Minify markdown: remove excessive newlines and trailing spaces
        const minified = text.replace(/\\n{3,}/g, '\\n\\n').replace(/[ \\t]+$/gm, '');
        const blob = new Blob([minified], { type: toolInfo.mime });
        await handleResult(blob, baseFilename, file.size);
        
      } else if (type === 'excel' || type === 'ppt') {
        // Excel and PPT are ZIP files (OOXML). We can re-compress them using maximum DEFLATE.
        const arrayBuffer = await file.arrayBuffer();
        const zip = await JSZip.loadAsync(arrayBuffer);
        
        // Generate with maximum compression level
        const compressedBlob = await zip.generateAsync({ 
          type: 'blob',
          compression: "DEFLATE",
          compressionOptions: {
            level: 9
          }
        }, (metadata) => {
          setProgress(metadata.percent);
        });
        
        await handleResult(compressedBlob, baseFilename, file.size);
      }

      if (user) {
        logActivity(user.uid, `compress_${type}`);
      }
    } catch (error) {
      console.error(error);
      toast.error(`Failed to compress ${toolInfo.name} file. The file may be corrupted or encrypted.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
      <SEO title={`${toolInfo.name} Compressor`} description={`Reduce the size of your ${toolInfo.name} files instantly and securely.`} />
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-200 mb-4">Compress {toolInfo.name}</h1>
        <p className="text-slate-600 dark:text-slate-400">Reduce the file size of your {toolInfo.name} securely in your browser.</p>
      </div>

      {!file ? (
        <FileUploader 
          onFileSelect={setFile} 
          title={`Select ${toolInfo.name} file`} 
          accept={toolInfo.accept} 
        />
      ) : !result ? (
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

          <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-6">
            <span className="font-medium text-slate-700 dark:text-slate-300 truncate mr-4">{file.name}</span>
            <span className="text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">{formatSize(file.size)}</span>
          </div>

          {isProcessing ? (
            <div className="w-full pt-2">
              <div className="flex justify-between text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" /> Compressing...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                <motion.div
                  className="bg-blue-600 h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
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
          )}
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-800/90 rounded-3xl p-8 border border-slate-200 dark:border-slate-700/50 shadow-sm max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-200 mb-2">Compression Complete!</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-4">Your file is ready to download.</p>
            
            <div className="flex justify-center gap-8 bg-slate-50 dark:bg-slate-900/50 py-4 rounded-xl mb-6">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Original Size</p>
                <p className="font-bold text-slate-700 dark:text-slate-300">{formatSize(result.oldSize)}</p>
              </div>
              <div className="w-px bg-slate-200"></div>
              <div>
                <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-1">New Size</p>
                <p className="font-bold text-emerald-700 dark:text-emerald-400">{formatSize(result.newSize)}</p>
              </div>
              <div className="w-px bg-slate-200"></div>
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Saved</p>
                <p className="font-bold text-blue-700 dark:text-blue-400">
                  {Math.max(0, Math.round((1 - result.newSize / result.oldSize) * 100))}%
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={() => { setFile(null); setResult(null); }} className="flex-1 px-6 py-3 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-50 transition-colors">
              Compress Another
            </button>
            <a 
              href={result.url} 
              download={result.name}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex justify-center items-center gap-2 text-center"
            >
              Download File
            </a>
          </div>
        </motion.div>
      )}
    </div>
  );
}
