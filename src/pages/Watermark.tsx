import { useState, useEffect } from 'react';
import { toast } from "react-hot-toast";
import SEO from '../components/SEO';
import { motion } from 'motion/react';
import { FileUploader } from '../components/FileUploader';
import { PDFPreview } from '../components/PDFPreview';
import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';
import { Download, Loader2, Check, Share2, Droplets } from 'lucide-react';
import { User } from '../types';
import { logActivity, logToolAccess } from '../lib/firebase';
import { sharePdf } from '../lib/utils';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { saveToHistory } from '../lib/storage';

function parsePageRange(rangeStr: string, totalPages: number): number[] {
  if (!rangeStr || rangeStr.toLowerCase() === 'all') {
    return Array.from({ length: totalPages }, (_, i) => i);
  }
  const pages = new Set<number>();
  const parts = rangeStr.split(',');
  for (const part of parts) {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(Number);
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = start; i <= end; i++) {
          if (i > 0 && i <= totalPages) pages.add(i - 1);
        }
      }
    } else {
      const num = Number(part);
      if (!isNaN(num) && num > 0 && num <= totalPages) {
        pages.add(num - 1);
      }
    }
  }
  return Array.from(pages);
}

export default function Watermark({ user }: { user: User | null }) {
  useEffect(() => {
    logToolAccess('watermark');
  }, []);

  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  // Watermark Options
  const [text, setText] = useState('CONFIDENTIAL');
  const [pagesInput, setPagesInput] = useState('all');
  const [position, setPosition] = useState<'center' | 'diagonal' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>('diagonal');
  const [opacity, setOpacity] = useState<number>(0.3);
  const [colorHex, setColorHex] = useState<string>('#000000');
  const [fontSize, setFontSize] = useState<number>(72);

  useKeyboardShortcuts({
    onEscape: () => {
      setFile(null);
      setResultUrl(null);
    }
  });

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setResultUrl(null);
    
    const arrayBuffer = await selectedFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    setPageCount(pdfDoc.getPageCount());
  };

  const hexToRgbArray = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255
    } : { r: 0, g: 0, b: 0 };
  };

  const handleWatermark = async () => {
    if (!file || !text) {
      toast.error("Please provide a file and watermark text");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const pagesToWatermark = parsePageRange(pagesInput, pageCount);
      
      const { r, g, b } = hexToRgbArray(colorHex);
      const color = rgb(r, g, b);

      const pages = pdfDoc.getPages();

      for (const pageIndex of pagesToWatermark) {
        if (pageIndex >= pages.length) continue;
        const page = pages[pageIndex];
        const { width, height } = page.getSize();
        
        const textWidth = font.widthOfTextAtSize(text, fontSize);
        const textHeight = font.heightAtSize(fontSize);
        
        let x = 0;
        let y = 0;
        let rotateAngle = 0;
        const padding = 30;

        switch (position) {
          case 'top-left':
            x = padding; y = height - textHeight - padding; break;
          case 'top-right':
            x = width - textWidth - padding; y = height - textHeight - padding; break;
          case 'bottom-left':
            x = padding; y = padding; break;
          case 'bottom-right':
            x = width - textWidth - padding; y = padding; break;
          case 'center':
            x = (width - textWidth) / 2; y = (height - textHeight) / 2; break;
          case 'diagonal':
            const angleRadians = Math.atan2(height, width);
            rotateAngle = angleRadians * (180 / Math.PI);
            x = width / 2 - (Math.cos(angleRadians) * textWidth) / 2 + (Math.sin(angleRadians) * textHeight) / 2;
            y = height / 2 - (Math.sin(angleRadians) * textWidth) / 2 - (Math.cos(angleRadians) * textHeight) / 2;
            break;
        }

        page.drawText(text, {
          x,
          y,
          size: fontSize,
          font,
          color,
          opacity,
          rotate: degrees(rotateAngle),
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      
      // Save to history
      await saveToHistory(`watermarked_${file.name}`, blob, "Watermark PDF");

      if (user) {
        await logActivity(user.uid, 'watermark_pdf', {
          originalName: file.name,
          pagesWatermarked: pagesToWatermark.length,
          position,
          text
        });
      }
      
      toast.success("Watermark added successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to add watermark. Make sure the PDF isn't encrypted.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <SEO 
        title="Add Watermark to PDF - PDF AI"
        description="Add custom text watermarks to your PDF. Choose position, opacity, and specific pages."
      />

      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-3 bg-blue-50 dark:bg-blue-900/30 rounded-2xl mb-2">
          <Droplets className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Add Watermark to PDF
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Stamp a custom text watermark onto your PDF. Perfect for marking documents as confidential or adding your brand.
        </p>
      </div>

      {!file ? (
        <FileUploader 
          onFileSelect={handleFileSelect}
          accept=".pdf"
          title="Upload PDF"
          subtitle="to add a watermark"
        />
      ) : !resultUrl ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-10 shadow-sm border border-slate-200 dark:border-slate-700"
        >
          <div className="mb-6 w-full max-w-md mx-auto flex justify-center">
            <PDFPreview file={file} />
          </div>
          <div className="mb-8 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">{file.name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {pageCount} page{pageCount !== 1 ? 's' : ''} • {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={() => setFile(null)}
              className="text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              Change file
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Watermark Text
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  rows={3}
                  placeholder="E.g. CONFIDENTIAL"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Pages to Watermark
                </label>
                <input
                  type="text"
                  value={pagesInput}
                  onChange={(e) => setPagesInput(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="e.g., all, 1, 3-5"
                />
                <p className="text-xs text-slate-500 mt-1">Type 'all' or specific pages like '1, 3-5, 10'</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Position
                </label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value as any)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="diagonal">Diagonal (Center)</option>
                  <option value="center">Center</option>
                  <option value="top-left">Top Left</option>
                  <option value="top-right">Top Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="bottom-right">Bottom Right</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Opacity ({Math.round(opacity * 100)}%)
                  </label>
                  <input
                    type="range"
                    min="0.05"
                    max="1"
                    step="0.05"
                    value={opacity}
                    onChange={(e) => setOpacity(parseFloat(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Font Size ({fontSize}pt)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="200"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value) || 72)}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={colorHex}
                    onChange={(e) => setColorHex(e.target.value)}
                    className="h-10 w-20 rounded cursor-pointer border border-slate-200 dark:border-slate-700"
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-400 font-mono uppercase">
                    {colorHex}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleWatermark}
            disabled={isProcessing || !text}
            className="w-full flex justify-center items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg transition-all disabled:opacity-70"
          >
            {isProcessing ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Adding Watermark...</>
            ) : (
              <><Droplets className="w-5 h-5" /> Add Watermark</>
            )}
          </button>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-800 rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200 dark:border-slate-700 text-center"
        >
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Watermark Added Successfully!</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
            Your file is ready to download.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={resultUrl}
              download={`watermarked_${file.name}`}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/25"
            >
              <Download className="w-5 h-5" />
              Download PDF
            </a>
            <button
              onClick={() => sharePdf(resultUrl, `watermarked_${file.name}`)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-all border border-slate-200 dark:border-slate-700"
            >
              <Share2 className="w-5 h-5" />
              Share Link
            </button>
          </div>

          <button
            onClick={() => {
              setFile(null);
              setResultUrl(null);
            }}
            className="mt-8 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium transition-colors"
          >
            Process another file
          </button>
        </motion.div>
      )}
    </div>
  );
}
