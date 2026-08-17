import { toast } from "react-hot-toast";
import SEO from '../components/SEO';
import { useState } from 'react';
import { motion } from 'motion/react';
import { FileUploader } from '../components/FileUploader';
import { PDFDocument } from 'pdf-lib';
import { Download, Loader2, Check, Share2 } from 'lucide-react';
import { User } from '../types';
import { logActivity } from '../lib/firebase';
import { sharePdf } from '../lib/utils';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { saveToHistory } from '../lib/storage';
import JSZip from 'jszip';

export default function Chunk({ user }: { user: User | null }) {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [pagesPerChunk, setPagesPerChunk] = useState<number>(25);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrls, setResultUrls] = useState<{url: string, name: string}[]>([]);

  useKeyboardShortcuts({
    onEscape: () => {
      setFile(null);
      setResultUrls([]);
      toast('File cleared', { icon: '🧹' });
    },
    onSave: () => {
      if (resultUrls.length > 0) {
        resultUrls.forEach((res, index) => {
          setTimeout(() => {
            const a = document.createElement('a');
            a.href = res.url;
            a.download = res.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }, index * 200); // Stagger downloads
        });
        toast.success('Downloads started successfully!');
      } else if (file && !isProcessing && pagesPerChunk >= 1) {
        handleChunk();
      }
    }
  });

  const loadPdf = async (selectedFile: File) => {
    setFile(selectedFile);
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      setPageCount(pdfDoc.getPageCount());
    } catch (e) {
      console.error(e);
      toast.error("Invalid PDF file");
      setFile(null);
    }
  };

  const handleChunk = async () => {
    if (!file || pagesPerChunk < 1) return;
    setIsProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const urls: {url: string, name: string}[] = [];
      const zip = new JSZip();
      
      let startIdx = 0;
      let chunkNum = 1;

      while (startIdx < pageCount) {
        const endIdx = Math.min(startIdx + pagesPerChunk, pageCount);
        const newPdf = await PDFDocument.create();
        const indices = Array.from({length: endIdx - startIdx}, (_, i) => startIdx + i);
        
        const copiedPages = await newPdf.copyPages(pdfDoc, indices);
        copiedPages.forEach(page => newPdf.addPage(page));
        
        const pdfBytes = await newPdf.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const chunkName = `${file.name.replace('.pdf', '')}_part${chunkNum}.pdf`;
        urls.push({
          url: URL.createObjectURL(blob),
          name: chunkName
        });
        zip.file(chunkName, blob);
        
        startIdx = endIdx;
        chunkNum++;
      }
      
      setResultUrls(urls);
      
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      await saveToHistory(`chunked_${file.name}.zip`, zipBlob, 'chunk');

      if (user) {
        logActivity(user.uid, 'chunk_pdf', { chunks: urls.length, pagesPerChunk });
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to chunk PDF");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
      <SEO title="Chunk PDF" description="Split a large PDF into multiple smaller files of a specific number of pages each." />
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-200 mb-4">Chunk PDF</h1>
        <p className="text-slate-600 dark:text-slate-400">Automatically split a large PDF into multiple smaller files of a specific page length.</p>
      </div>

      {!file ? (
        <FileUploader onFileSelect={loadPdf} title="Select PDF file" />
      ) : resultUrls.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-800/90 rounded-3xl p-8 border border-slate-200 dark:border-slate-700/50 shadow-sm max-w-md mx-auto">
          <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 mb-8">
            <span className="font-medium text-slate-700 dark:text-slate-300 truncate mr-4">{file.name}</span>
            <span className="text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">{pageCount} pages</span>
          </div>

          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Pages per PDF block</label>
          <input 
            type="number" 
            value={pagesPerChunk} 
            onChange={(e) => setPagesPerChunk(parseInt(e.target.value) || 1)}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all mb-4"
            min="1"
            max={pageCount}
          />
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">This will create <strong>{Math.ceil(pageCount / Math.max(1, pagesPerChunk))}</strong> separate PDF files.</p>

          <div className="flex gap-4">
            <button onClick={() => setFile(null)} className="flex-1 px-6 py-3 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button 
              onClick={handleChunk} 
              disabled={isProcessing || pagesPerChunk < 1}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Start Chunking'}
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-800/90 rounded-3xl p-8 border border-slate-200 dark:border-slate-700/50 shadow-sm max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-200 mb-2">Successfully Chunked!</h2>
            <p className="text-slate-500 dark:text-slate-400">Your PDF was split into {resultUrls.length} files.</p>
          </div>

          <div className="space-y-3 mb-8 max-h-[40vh] overflow-y-auto">
            {resultUrls.map((res, idx) => (
              <div key={idx} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="font-medium text-slate-700 dark:text-slate-300 truncate mr-4">{res.name}</span>
                <div className="flex gap-2">
                  <button onClick={() => sharePdf(res.url, res.name)} className="flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 bg-purple-50 dark:bg-purple-500/10 hover:bg-purple-100 px-3 py-2 rounded-lg font-medium transition-colors">
                    <Share2 className="w-4 h-4" /> Share
                  </button>
                  <a href={res.url} onClick={() => toast.success('Download started successfully!')} download={res.name} className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 px-4 py-2 rounded-lg font-medium transition-colors">
                    <Download className="w-4 h-4" /> Save
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <button onClick={() => { setFile(null); setResultUrls([]); }} className="px-8 py-3 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-50 transition-colors">
              Process Another File
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
