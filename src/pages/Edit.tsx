import { toast } from "react-hot-toast";
import SEO from '../components/SEO';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FileUploader } from '../components/FileUploader';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { Download, Loader2, Save, FileText, Share2 } from 'lucide-react';
import { User } from '../types';
import { logActivity, logToolAccess } from '../lib/firebase';
import { sharePdf } from '../lib/utils';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { saveToHistory } from '../lib/storage';

// Setup PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export default function Edit({ user }: { user: User | null }) {
  useEffect(() => {
    logToolAccess('edit');
  }, []);

  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  useKeyboardShortcuts({
    onEscape: () => {
      setFile(null);
      setExtractedText('');
      setResultUrl(null);
      toast('File cleared', { icon: '🧹' });
    },
    onSave: () => {
      if (resultUrl && file) {
        const a = document.createElement('a');
        a.href = resultUrl;
        a.download = `edited_${file.name}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success('Download started successfully!');
      } else if (file && !isSaving && !isExtracting) {
        generateNewPdf();
      }
    }
  });

  const loadPdfAndExtractText = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsExtracting(true);
    setResultUrl(null);
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n\n';
      }
      
      setExtractedText(fullText.trim() || 'No readable text found in this PDF. It might be a scanned image.');
    } catch (e) {
      console.error(e);
      toast.error("Failed to read PDF text. Make sure it's a valid text-based PDF.");
      setFile(null);
    } finally {
      setIsExtracting(false);
    }
  };

  const generateNewPdf = async () => {
    if (!extractedText.trim()) return;
    setIsSaving(true);
    try {
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      
      // Basic text wrapping logic (simplified for demonstration)
      const lines = extractedText.split('\n');
      const fontSize = 12;
      const margin = 50;
      const width = 600;
      const height = 800;
      const maxWidth = width - (margin * 2);
      
      let page = pdfDoc.addPage([width, height]);
      let y = height - margin;

      for (const line of lines) {
        if (y < margin) {
          page = pdfDoc.addPage([width, height]);
          y = height - margin;
        }
        
        // Very basic single-line drawing, ideally requires full wrapping algorithm
        page.drawText(line.substring(0, 100), { // Truncating for safety in simple mode
          x: margin,
          y,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
        });
        y -= fontSize * 1.5;
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      setResultUrl(URL.createObjectURL(blob));
      
      await saveToHistory(`edited_${file.name}`, blob, 'edit');

      if (user) {
        logActivity(user.uid, 'edit_pdf_text', {});
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate new PDF.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 md:py-20 flex flex-col md:flex-row gap-8">
      <SEO title="Edit PDF Text" description="Add or modify text in your PDF document effortlessly and securely." />
      <div className="w-full md:w-1/3">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-200 mb-2 flex items-center gap-3">
            <FileText className="w-8 h-8 text-indigo-600 dark:text-indigo-400" /> Text Editor
          </h1>
          <p className="text-slate-600 dark:text-slate-400">Extracts text from your PDF so you can edit it freely, then export it as a new PDF document.</p>
        </div>

        {!file ? (
          <FileUploader onFileSelect={loadPdfAndExtractText} title="Select PDF" />
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 shadow-sm">
            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 mb-6">
              <span className="font-medium text-slate-700 dark:text-slate-300 truncate">{file.name}</span>
              <button onClick={() => { setFile(null); setExtractedText(''); setResultUrl(null); }} className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 font-medium">Clear</button>
            </div>
            
            {resultUrl ? (
              <div className="text-center">
                <div className="flex flex-col gap-3 mb-4">
                  <a 
                    href={resultUrl} 
                    onClick={() => toast.success('Download started successfully!')} download={`edited_${file.name}`}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors flex justify-center items-center gap-2"
                  >
                    <Download className="w-5 h-5" /> Download PDF
                  </a>
                  <button onClick={() => sharePdf(resultUrl, `edited_${file.name}`)} className="w-full py-3 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 text-indigo-700 rounded-xl font-medium transition-colors flex justify-center items-center gap-2">
                    <Share2 className="w-5 h-5" /> Share PDF
                  </button>
                </div>
                <button onClick={() => setResultUrl(null)} className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 underline">Continue Editing</button>
              </div>
            ) : (
              <button 
                onClick={generateNewPdf} 
                disabled={isSaving || isExtracting || !extractedText.trim()}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {isSaving ? 'Generating...' : 'Save as PDF'}
              </button>
            )}
          </motion.div>
        )}
      </div>

      <div className="w-full md:w-2/3 h-[600px]">
        {isExtracting ? (
          <div className="w-full h-full bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-700/50 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-indigo-600 dark:text-indigo-400" />
            <p className="font-medium text-lg">Extracting Text from PDF...</p>
          </div>
        ) : file ? (
          <textarea
            value={extractedText}
            onChange={(e) => setExtractedText(e.target.value)}
            className="w-full h-full p-8 bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/50 rounded-3xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-slate-700 dark:text-slate-300 leading-relaxed font-mono text-sm"
            placeholder="Edit your text here..."
          />
        ) : (
          <div className="w-full h-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 border-dashed rounded-3xl flex items-center justify-center text-slate-400">
            <p>Your editable text will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
