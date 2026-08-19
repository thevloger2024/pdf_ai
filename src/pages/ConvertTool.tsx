import { toast } from "react-hot-toast";
import SEO from '../components/SEO';
import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { FileUploader } from '../components/FileUploader';
import { Download, Loader2, RefreshCw, Share2 } from 'lucide-react';
import { User } from '../types';
import { logActivity, logToolAccess } from '../lib/firebase';
import { sharePdf } from '../lib/utils';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { saveToHistory } from '../lib/storage';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import PptxGenJS from 'pptxgenjs';
import * as XLSX from 'xlsx';

// Setup PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

const types: Record<string, { name: string, ext: string, mime: string, accepted?: string }> = {
  jpg: { name: 'PDF to JPG', ext: 'jpg', mime: 'image/jpeg', accepted: '.pdf' },
  png: { name: 'PDF to PNG', ext: 'png', mime: 'image/png', accepted: '.pdf' },
  excel: { name: 'PDF to Excel', ext: 'xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', accepted: '.pdf' },
  ppt: { name: 'PDF to PowerPoint', ext: 'pptx', mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', accepted: '.pdf' },
  txt: { name: 'PDF to Text', ext: 'txt', mime: 'text/plain', accepted: '.pdf' },
  md: { name: 'PDF to Markdown', ext: 'md', mime: 'text/markdown', accepted: '.pdf' },
  excel2md: { name: 'Excel to Markdown', ext: 'md', mime: 'text/markdown', accepted: '.xlsx,.xls' }
};

export default function ConvertTool({ user }: { user: User | null }) {


  const { type } = useParams<{ type: string }>();
  useEffect(() => {
    if (type) logToolAccess('convert_' + type);
  }, [type]);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string, name: string } | null>(null);

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
        handleConvert();
      }
    }
  });

  if (!type || !(type in types)) {
    return <Navigate to="/convert" replace />;
  }

  const toolInfo = types[type as keyof typeof types];

  const handleResult = async (blob: Blob, name: string) => {
    setResult({ url: URL.createObjectURL(blob), name });
    await saveToHistory(name, blob, `convert_to_${type}`);
  };

  const handleConvert = async () => {
    if (!file) return;
    setIsProcessing(true);
    setResult(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const baseFilename = file.name.replace(/\.[^/.]+$/, '');

      if (type === 'excel2md') {
        // Handle Excel to Markdown
        const wb = XLSX.read(arrayBuffer, { type: 'array' });
        let mdText = `# ${baseFilename}\n\n`;
        
        wb.SheetNames.forEach(sheetName => {
          const ws = wb.Sheets[sheetName];
          const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
          
          if (data.length > 0) {
            mdText += `## ${sheetName}\n\n`;
            
            // Render Markdown Table
            const headers = data[0] || [];
            const cols = headers.length || 1; // At least one column
            mdText += `| ${headers.map(h => String(h || '').replace(/\|/g, '\\|')).join(' | ')} |\n`;
            mdText += `| ${Array(cols).fill('---').join(' | ')} |\n`;
            
            for (let r = 1; r < data.length; r++) {
              const row = data[r] || [];
              const paddedRow = Array.from({ length: cols }, (_, i) => row[i] || '');
              mdText += `| ${paddedRow.map(c => String(c).replace(/\|/g, '\\|')).join(' | ')} |\n`;
            }
            mdText += '\n\n';
          }
        });
        
        const textBlob = new Blob([mdText.trim() || 'No data found.'], { type: toolInfo.mime });
        await handleResult(textBlob, `${baseFilename}.md`);

        if (user) {
          logActivity(user.uid, `convert_excel_to_md`);
        }
      } else {
        // Handle all PDF based conversions
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const numPages = pdf.numPages;

        if (type === 'jpg' || type === 'png') {
          const zip = new JSZip();
          let singleBlob: Blob | null = null;

          for (let i = 1; i <= numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 2.0 }); // High quality scale
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            if (!context) continue;

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            // For JPG, set white background before rendering
            if (type === 'jpg') {
              context.fillStyle = '#FFFFFF';
              context.fillRect(0, 0, canvas.width, canvas.height);
            }

            await page.render({ canvasContext: context, viewport } as any).promise;

            const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, toolInfo.mime, 0.9));
            
            if (blob) {
              if (numPages === 1) {
                singleBlob = blob;
              } else {
                zip.file(`${baseFilename}_page_${i}.${toolInfo.ext}`, blob);
              }
            }
          }

          if (numPages === 1 && singleBlob) {
            await handleResult(singleBlob, `${baseFilename}.${toolInfo.ext}`);
          } else {
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            await handleResult(zipBlob, `${baseFilename}_images.zip`);
          }
        } else if (type === 'ppt') {
          const pptx = new PptxGenJS();
          
          for (let i = 1; i <= numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 2.0 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            if (!context) continue;

            canvas.height = viewport.height;
            canvas.width = viewport.width;
            context.fillStyle = '#FFFFFF'; // White bg
            context.fillRect(0, 0, canvas.width, canvas.height);

            await page.render({ canvasContext: context, viewport } as any).promise;
            const imgData = canvas.toDataURL('image/jpeg', 0.9);
            
            const slide = pptx.addSlide();
            slide.addImage({ data: imgData, x: 0, y: 0, w: '100%', h: '100%' });
          }
          
          const pptBlob = await pptx.write({ outputType: 'blob' }) as Blob;
          await handleResult(pptBlob, `${baseFilename}.pptx`);

        } else if (type === 'excel') {
          const wb = XLSX.utils.book_new();

          for (let i = 1; i <= numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            
            // Group text items by Y coordinate (rows)
            const rowGroups: { [y: number]: any[] } = {};
            
            textContent.items.forEach((item: any) => {
              const y = Math.round(item.transform[5] / 5) * 5; // Group items within 5 units of Y
              if (!rowGroups[y]) rowGroups[y] = [];
              rowGroups[y].push(item);
            });

            // Sort rows top to bottom (Y descending in PDF space)
            const sortedY = Object.keys(rowGroups).map(Number).sort((a, b) => b - a);
            
            const sheetData: string[][] = [];
            
            sortedY.forEach(y => {
              // Sort items in row left to right (X ascending)
              const rowItems = rowGroups[y].sort((a, b) => a.transform[4] - b.transform[4]);
              sheetData.push(rowItems.map(item => item.str));
            });

            const ws = XLSX.utils.aoa_to_sheet(sheetData.length > 0 ? sheetData : [['No parseable text on this page']]);
            XLSX.utils.book_append_sheet(wb, ws, `Page ${i}`);
          }

          const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
          const excelBlob = new Blob([wbout], { type: toolInfo.mime });
          await handleResult(excelBlob, `${baseFilename}.xlsx`);
        } else if (type === 'txt' || type === 'md') {
          let fullText = '';
          
          for (let i = 1; i <= numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            
            const rowGroups: { [y: number]: any[] } = {};
            
            textContent.items.forEach((item: any) => {
              const y = Math.round(item.transform[5] / 5) * 5;
              if (!rowGroups[y]) rowGroups[y] = [];
              rowGroups[y].push(item);
            });

            const sortedY = Object.keys(rowGroups).map(Number).sort((a, b) => b - a);
            
            if (type === 'md') {
              fullText += `## Page ${i}\n\n`;
            }
            
            sortedY.forEach(y => {
              const rowItems = rowGroups[y].sort((a, b) => a.transform[4] - b.transform[4]);
              fullText += rowItems.map(item => item.str).join(' ') + '\n';
            });
            fullText += '\n\n';
          }

          const textBlob = new Blob([fullText.trim() || 'No readable text found.'], { type: toolInfo.mime });
          await handleResult(textBlob, `${baseFilename}.${toolInfo.ext}`);
        }

        if (user) {
          logActivity(user.uid, `convert_pdf_to_${type}`, { pages: numPages });
        }
      }

    } catch (error) {
      console.error(error);
      toast.error(`An error occurred while converting the PDF. Please ensure the file is a valid PDF.`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
      <SEO title={toolInfo.name} description={`Convert your file securely using our ${toolInfo.name} tool.`} />
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-200 mb-4">{toolInfo.name}</h1>
        <p className="text-slate-600 dark:text-slate-400">Select a file to convert it quickly and securely in your browser.</p>
      </div>

      {!file ? (
        <FileUploader 
          onFileSelect={setFile} 
          title="Select a file" 
          accept={toolInfo.accepted || ".pdf"}
        />
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-800/90 rounded-3xl p-8 border border-slate-200 dark:border-slate-700/50 shadow-sm">
          {!result ? (
            <div className="max-w-md mx-auto text-center">
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 mb-8">
                <span className="font-medium text-slate-700 dark:text-slate-300 truncate mr-4">{file.name}</span>
                <span className="text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setFile(null)} className="flex-1 px-6 py-3 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button 
                  onClick={handleConvert} 
                  disabled={isProcessing}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> Converting...</> : 'Convert Now'}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center max-w-md mx-auto">
              <div className="mb-6 w-full flex justify-center">
                {result.name.toLowerCase().endsWith('.pdf') ? (
                  <PDFPreview file={result.url} />
                ) : result.name.toLowerCase().match(/\.(jpg|jpeg|png|webp|svg)$/) ? (
                  <img src={result.url} alt="Converted preview" className="max-w-full h-auto rounded shadow-md border border-slate-200 dark:border-slate-700 max-h-[300px] object-contain" />
                ) : (
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
                    <RefreshCw className="w-10 h-10" />
                  </div>
                )}
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-200 mb-2">Conversion Complete!</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-8">Your converted file is ready for download.</p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => { setFile(null); setResult(null); }} className="flex-1 px-6 py-3 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-50 transition-colors">
                  Convert Another
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
