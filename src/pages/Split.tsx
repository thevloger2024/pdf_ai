import { toast } from "react-hot-toast";
import SEO from '../components/SEO';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FileUploader } from '../components/FileUploader';
import { PDFDocument } from 'pdf-lib';
import { Download, Loader2, Check, Share2 } from 'lucide-react';
import { User } from '../types';
import { logActivity, logToolAccess } from '../lib/firebase';
import { sharePdf } from '../lib/utils';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { saveToHistory } from '../lib/storage';

export default function Split({ user }: { user: User | null }) {
  useEffect(() => {
    logToolAccess('split');
  }, []);

  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  useKeyboardShortcuts({
    onEscape: () => {
      setFile(null);
      setResultUrl(null);
      setSelectedPages([]);
      toast('File cleared', { icon: '🧹' });
    },
    onSave: () => {
      if (resultUrl && file) {
        const a = document.createElement('a');
        a.href = resultUrl;
        a.download = `split_${file.name}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success('Download started successfully!');
      } else if (file && !isProcessing && selectedPages.length > 0) {
        handleExtract();
      }
    }
  });

  const loadPdf = async (selectedFile: File) => {
    setFile(selectedFile);
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      setPageCount(pdfDoc.getPageCount());
      // Select all by default or none
    } catch (e) {
      console.error(e);
      toast.error("Invalid PDF file");
      setFile(null);
    }
  };

  const togglePage = (page: number) => {
    setSelectedPages(prev => 
      prev.includes(page) ? prev.filter(p => p !== page) : [...prev, page].sort((a, b) => a - b)
    );
  };

  const handleExtract = async () => {
    if (!file || selectedPages.length === 0) return;
    setIsProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();
      
      const copiedPages = await newPdf.copyPages(pdfDoc, selectedPages.map(p => p - 1));
      copiedPages.forEach(page => newPdf.addPage(page));
      
      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      setResultUrl(URL.createObjectURL(blob));
      
      await saveToHistory(`split_${file.name}`, blob, 'split');

      if (user) {
        logActivity(user.uid, 'split_pdf', { pages: selectedPages.length });
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to split PDF");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 md:py-20">
      <SEO title="Split PDF" description="Extract pages from your PDF or save each page as a separate PDF document." />
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-200 mb-4">Split PDF</h1>
        <p className="text-slate-600 dark:text-slate-400">Select the pages you want to extract into a new PDF.</p>
      </div>

      {!file ? (
        <FileUploader onFileSelect={loadPdf} title="Select PDF file" />
      ) : !resultUrl ? (
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-8 border border-slate-200 dark:border-slate-700/50 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-200">{file.name}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{pageCount} pages total</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setSelectedPages(Array.from({length: pageCount}, (_, i) => i + 1))} className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 rounded-lg transition-colors">Select All</button>
              <button onClick={() => setSelectedPages([])} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 rounded-lg transition-colors">Clear</button>
            </div>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4 mb-8 max-h-[50vh] overflow-y-auto p-2">
            {Array.from({length: pageCount}, (_, i) => i + 1).map(page => {
              const isSelected = selectedPages.includes(page);
              return (
                <button
                  key={page}
                  onClick={() => togglePage(page)}
                  className={`relative aspect-[1/1.4] rounded-lg border-2 flex items-center justify-center transition-all ${
                    isSelected ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className={`font-bold ${isSelected ? 'text-blue-600' : 'text-slate-400'}`}>{page}</span>
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center border-2 border-white">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-slate-100 dark:border-slate-800">
            <button onClick={() => setFile(null)} className="px-6 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 rounded-xl font-medium transition-colors">
              Cancel
            </button>
            <button 
              onClick={handleExtract}
              disabled={selectedPages.length === 0 || isProcessing}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Extract Pages'}
            </button>
          </div>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-800/90 rounded-3xl p-8 border border-slate-200 dark:border-slate-700/50 shadow-sm text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-200 mb-2">Extraction Complete!</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">Created a new PDF with {selectedPages.length} pages.</p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={() => { setFile(null); setResultUrl(null); setSelectedPages([]); }} className="flex-1 px-6 py-3 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-50 transition-colors">
              Split Another
            </button>
            <button onClick={() => sharePdf(resultUrl, `split_${file.name}`)} className="flex-1 px-6 py-3 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 text-blue-700 dark:text-blue-400 rounded-xl font-medium transition-colors flex justify-center items-center gap-2">
              <Share2 className="w-5 h-5" /> Share
            </button>
            <a 
              href={resultUrl} 
              onClick={() => toast.success('Download started successfully!')} download={`split_${file.name}`}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex justify-center items-center gap-2"
            >
              <Download className="w-5 h-5" /> Download
            </a>
          </div>
        </motion.div>
      )}
    </div>
  );
}
