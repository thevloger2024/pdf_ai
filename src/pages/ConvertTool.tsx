import { PDFPreview } from '../components/PDFPreview';
import { toast } from "react-hot-toast";
import SEO from '../components/SEO';
import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { FileUploader } from '../components/FileUploader';
import { ProgressBar } from '../components/ProgressBar';
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
import { marked } from 'marked';
import { Document, Packer, Paragraph, TextRun } from 'docx';

// Setup PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

const types: Record<string, { name: string, ext: string, mime: string, accepted?: string }> = {
docx: { name: 'PDF to Word', ext: 'docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', accepted: '.pdf' },
  jpg: { name: 'PDF to JPG', ext: 'jpg', mime: 'image/jpeg', accepted: '.pdf' },
  png: { name: 'PDF to PNG', ext: 'png', mime: 'image/png', accepted: '.pdf' },
  excel: { name: 'PDF to Excel', ext: 'xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', accepted: '.pdf' },
  ppt: { name: 'PDF to PowerPoint', ext: 'pptx', mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', accepted: '.pdf' },
  txt: { name: 'PDF to Text', ext: 'txt', mime: 'text/plain', accepted: '.pdf' },
  md: { name: 'PDF to Markdown', ext: 'md', mime: 'text/markdown', accepted: '.pdf' },
  excel2md: { name: 'Excel to Markdown', ext: 'md', mime: 'text/markdown', accepted: '.xlsx,.xls' },
  md2json: { name: 'Markdown to JSON', ext: 'json', mime: 'application/json', accepted: '.md,.markdown' },
  excel2json: { name: 'Excel to JSON', ext: 'json', mime: 'application/json', accepted: '.xlsx,.xls,.csv' },
  md2html: { name: 'Markdown to HTML', ext: 'html', mime: 'text/html', accepted: '.md,.markdown' },
  md2js: { name: 'Markdown to JavaScript', ext: 'js', mime: 'text/javascript', accepted: '.md,.markdown' },
  md2py: { name: 'Markdown to Python', ext: 'py', mime: 'text/x-python', accepted: '.md,.markdown' },
  json2js: { name: 'JSON to JavaScript', ext: 'js', mime: 'text/javascript', accepted: '.json' },
  json2py: { name: 'JSON to Python', ext: 'py', mime: 'text/x-python', accepted: '.json' }
};

export default function ConvertTool({ user }: { user: User | null }) {


  const { type } = useParams<{ type: string }>();
  useEffect(() => {
    if (type) logToolAccess('convert_' + type);
  }, [type]);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [progressLabel, setProgressLabel] = useState<string>('');
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
    setProgress(0);
    setProgressLabel('Reading file...');
    setResult(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const baseFilename = file.name.replace(/\.[^/.]+$/, '');

      if (type === 'excel2json') {
        const wb = XLSX.read(arrayBuffer, { type: 'array' });
        const resultData = {};
        
        wb.SheetNames.forEach(sheetName => {
          const ws = wb.Sheets[sheetName];
          resultData[sheetName] = XLSX.utils.sheet_to_json(ws);
        });
        
        // If there's only one sheet, we can just return its array to be cleaner, but returning the mapped object is safer to not lose data.
        const finalJson = wb.SheetNames.length === 1 ? resultData[wb.SheetNames[0]] : resultData;
        const jsonBlob = new Blob([JSON.stringify(finalJson, null, 2)], { type: toolInfo.mime });
        await handleResult(jsonBlob, `${baseFilename}.json`);
        
      } else if (type === 'md2json') {
        const textDecoder = new TextDecoder('utf-8');
        const mdText = textDecoder.decode(arrayBuffer);
        
        // High-level: Process massive markdown files in chunks to avoid UI freezing and memory limits
        const chunkSize = 1024 * 1024 * 2; // 2MB string chunks
        
        if (mdText.length > chunkSize) {
          const blobParts = ['[\n'];
          let startIndex = 0;
          let isFirst = true;
          
          while (startIndex < mdText.length) {
            setProgress(10 + (startIndex / mdText.length) * 80);
            setProgressLabel(`Processing chunk...`);
            let endIndex = startIndex + chunkSize;
            if (endIndex < mdText.length) {
               const nextNewline = mdText.indexOf('\n\n', endIndex);
               if (nextNewline !== -1 && nextNewline - endIndex < 500000) {
                 endIndex = nextNewline + 2;
               }
            } else {
               endIndex = mdText.length;
            }
            
            const chunk = mdText.substring(startIndex, endIndex);
            const tokens = marked.lexer(chunk);
            
            let jsonString = JSON.stringify(tokens, null, 2).trim();
            if (jsonString.startsWith('[')) jsonString = jsonString.substring(1);
            if (jsonString.endsWith(']')) jsonString = jsonString.substring(0, jsonString.length - 1);
            
            if (jsonString.trim().length > 0) {
               if (!isFirst) blobParts.push(',\n');
               blobParts.push(jsonString);
               isFirst = false;
            }
            
            startIndex = endIndex;
            // Yield to main thread to prevent UI freeze (High-level non-blocking processing)
            await new Promise(r => setTimeout(r, 10));
          }
          
          blobParts.push('\n]');
          const jsonBlob = new Blob(blobParts, { type: toolInfo.mime });
          await handleResult(jsonBlob, `${baseFilename}.json`);
        } else {
          const tokens = marked.lexer(mdText);
          const jsonBlob = new Blob([JSON.stringify(tokens, null, 2)], { type: toolInfo.mime });
          await handleResult(jsonBlob, `${baseFilename}.json`);
        }
        
      } else if (type === 'md2html') {
        const textDecoder = new TextDecoder('utf-8');
        const mdText = textDecoder.decode(arrayBuffer);
        const html = await marked.parse(mdText);
        const htmlBlob = new Blob([html], { type: toolInfo.mime });
        await handleResult(htmlBlob, `${baseFilename}.html`);
        
      } else if (type === 'md2js') {
        const textDecoder = new TextDecoder('utf-8');
        const mdText = textDecoder.decode(arrayBuffer);
        const escaped = mdText.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
        const jsText = `export const markdownContent = \`${escaped}\`;\n`;
        const jsBlob = new Blob([jsText], { type: toolInfo.mime });
        await handleResult(jsBlob, `${baseFilename}.js`);

      } else if (type === 'md2py') {
        const textDecoder = new TextDecoder('utf-8');
        const mdText = textDecoder.decode(arrayBuffer);
        const escaped = mdText.replace(/\\/g, '\\\\').replace(/"""/g, '\\"\\"\\"');
        const pyText = `markdown_content = """\n${escaped}\n"""\n`;
        const pyBlob = new Blob([pyText], { type: toolInfo.mime });
        await handleResult(pyBlob, `${baseFilename}.py`);

      } else if (type === 'json2js') {
        const textDecoder = new TextDecoder('utf-8');
        const jsonText = textDecoder.decode(arrayBuffer);
        JSON.parse(jsonText); // validate JSON
        const jsText = `export default ${jsonText};\n`;
        const jsBlob = new Blob([jsText], { type: toolInfo.mime });
        await handleResult(jsBlob, `${baseFilename}.js`);

      } else if (type === 'json2py') {
        const textDecoder = new TextDecoder('utf-8');
        const jsonText = textDecoder.decode(arrayBuffer);
        JSON.parse(jsonText); // validate JSON
        // Basic mapping for Python dict
        const pyStr = jsonText.replace(/\btrue\b/g, 'True').replace(/\bfalse\b/g, 'False').replace(/\bnull\b/g, 'None');
        const pyText = `data = ${pyStr}\n`;
        const pyBlob = new Blob([pyText], { type: toolInfo.mime });
        await handleResult(pyBlob, `${baseFilename}.py`);

      } else if (type === 'excel2md') {
        // Handle Excel to Markdown
        const wb = XLSX.read(arrayBuffer, { type: 'array' });
        let mdText = `# ${baseFilename}\n\n`;
        
        for (let i = 0; i < wb.SheetNames.length; i++) {
          const sheetName = wb.SheetNames[i];
          setProgress(10 + (i / wb.SheetNames.length) * 80);
          setProgressLabel(`Converting sheet ${i + 1} of ${wb.SheetNames.length}...`);
          
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
          await new Promise(r => setTimeout(r, 10)); // Yield to UI
        }
        
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
            setProgress(10 + (i / numPages) * 80);
            setProgressLabel(`Processing page ${i} of ${numPages}...`);
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
            setProgress(10 + (i / numPages) * 80);
            setProgressLabel(`Processing page ${i} of ${numPages}...`);
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
            setProgress(10 + (i / numPages) * 80);
            setProgressLabel(`Processing page ${i} of ${numPages}...`);
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
              const rowItems = rowGroups[y].sort((a: any, b: any) => a.transform[4] - b.transform[4]);
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
            setProgress(10 + (i / numPages) * 80);
            setProgressLabel(`Processing page ${i} of ${numPages}...`);
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
        } else if (type === 'docx') {
          const children = [];
          for (let i = 1; i <= numPages; i++) {
            setProgress(10 + (i / numPages) * 80);
            setProgressLabel(`Processing page ${i} of ${numPages}...`);
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            
            const rowGroups: { [y: number]: any[] } = {};
            
            textContent.items.forEach((item: any) => {
              const y = Math.round(item.transform[5] / 5) * 5;
              if (!rowGroups[y]) rowGroups[y] = [];
              rowGroups[y].push(item);
            });

            const sortedY = Object.keys(rowGroups).map(Number).sort((a, b) => b - a);
            
            sortedY.forEach(y => {
              const rowItems = rowGroups[y].sort((a, b) => a.transform[4] - b.transform[4]);
              const text = rowItems.map((item: any) => item.str).join(' ');
              children.push(new Paragraph({
                children: [new TextRun(text)]
              }));
            });
            children.push(new Paragraph({ text: '' }));
          }

          const doc = new Document({
            sections: [{
              properties: {},
              children: children.length > 0 ? children : [new Paragraph({ text: 'No readable text found.' })],
            }],
          });

          const docxBlob = await Packer.toBlob(doc);
          await handleResult(docxBlob, `${baseFilename}.docx`);
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
              
              {isProcessing && (
                <div className="mt-6 text-left">
                  <ProgressBar progress={progress} label={progressLabel} />
                </div>
              )}
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
