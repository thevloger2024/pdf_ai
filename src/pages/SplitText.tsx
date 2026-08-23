import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SEO from '../components/SEO';
import { FileUploader } from '../components/FileUploader';
import { ProgressBar } from '../components/ProgressBar';
import { Download, Loader2, FileText, Settings, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { saveToHistory } from '../lib/storage';
import { logActivity, logToolAccess } from '../lib/firebase';
import { User } from '../types';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export default function SplitText({ user }: { user: User | null }) {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'csv';
  
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [splitMethod, setSplitMethod] = useState<'lines' | 'headers'>('lines');
  const [linesPerFile, setLinesPerFile] = useState<number>(1000);
  const [results, setResults] = useState<{name: string, url: string}[]>([]);
  const [zipUrl, setZipUrl] = useState<string | null>(null);

  useEffect(() => {
    logToolAccess('split_text_' + type);
  }, [type]);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setResults([]);
    setZipUrl(null);
  };

  const processSplit = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(0);
    
    try {
      const text = await file.text();
      const newResults: {name: string, url: string}[] = [];
      const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;

      if (type === 'md' && splitMethod === 'headers') {
        const parts = text.split(/(^#+ .*$)/m);
        let currentPart = parts[0];
        let fileIndex = 1;
        
        for (let i = 1; i < parts.length; i += 2) {
          const header = parts[i];
          const content = parts[i+1] || '';
          
          if (currentPart.trim()) {
            const blob = new Blob([currentPart], { type: 'text/markdown' });
            newResults.push({
              name: `${baseName}_part${fileIndex}.md`,
              url: URL.createObjectURL(blob)
            });
            fileIndex++;
          }
          currentPart = header + content;
          if (i % 50 === 0) {
            setProgress((i / parts.length) * 100);
            await new Promise(r => setTimeout(r, 0));
          } // Yield
        }
        
        if (currentPart.trim()) {
          const blob = new Blob([currentPart], { type: 'text/markdown' });
          newResults.push({
            name: `${baseName}_part${fileIndex}.md`,
            url: URL.createObjectURL(blob)
          });
        }
      } else {
        // High-level improvement: avoid large array allocations for massive files by using indexOf
        let currentIndex = 0;
        let chunkIndex = 1;
        const hasHeader = (type === 'csv' || type === 'excel');
        
        let headerLine = '';
        if (hasHeader) {
           const firstNewline = text.indexOf('\n');
           headerLine = firstNewline !== -1 ? text.substring(0, firstNewline) : text;
           currentIndex = firstNewline !== -1 ? firstNewline + 1 : text.length;
        }
        
        while (currentIndex < text.length) {
          let linesCollected = 0;
          let chunkStart = currentIndex;
          let chunkEnd = currentIndex;
          
          while (linesCollected < linesPerFile && chunkEnd < text.length) {
             const nextNewline = text.indexOf('\n', chunkEnd);
             if (nextNewline === -1) {
               chunkEnd = text.length;
               linesCollected++;
               break;
             }
             chunkEnd = nextNewline + 1;
             linesCollected++;
          }
          
          if (chunkEnd > chunkStart) {
             const chunkStr = text.substring(chunkStart, chunkEnd);
             const finalContent = hasHeader ? headerLine + '\n' + chunkStr : chunkStr;
             if (finalContent.trim()) {
               const blob = new Blob([finalContent], { type: type === 'csv' ? 'text/csv' : 'text/plain' });
               const ext = type === 'csv' ? 'csv' : (type === 'excel' ? 'csv' : 'txt');
               newResults.push({
                 name: `${baseName}_part${chunkIndex}.${ext}`,
                 url: URL.createObjectURL(blob)
               });
               chunkIndex++;
             }
          }
          
          currentIndex = chunkEnd;
          setProgress((currentIndex / text.length) * 100);
          // Yield to UI to prevent massive files from crashing browser
          await new Promise(r => setTimeout(r, 0));
        }
      }
      
      setResults(newResults);
      if (user) {
        logActivity(user.uid, 'split_text', { type, filesGenerated: newResults.length });
      }
      toast.success(`Split into ${newResults.length} files!`);
      
    } catch (error) {
      console.error(error);
      toast.error('Failed to split file');
    } finally {
      setIsProcessing(false);
    }
  };

  const getTitle = () => {
    if (type === 'excel') return 'Split to Excel';
    if (type === 'md') return 'Split Markdown';
    return 'Split Text/CSV';
  };

  const downloadAll = () => {
    if (zipUrl && file) {
      const a = document.createElement('a');
      a.href = zipUrl;
      a.download = `split_${file.name}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success('Downloaded archive successfully!');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 md:py-20">
      <SEO title={`${getTitle()} - PDF AI`} description="Split large text, CSV, or Markdown files easily." />
      
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-200 mb-4">{getTitle()}</h1>
        <p className="text-slate-600 dark:text-slate-400">Upload your file and choose how you want to split it.</p>
      </div>

      {!file ? (
        <FileUploader onFileSelect={handleFileSelect} title={`Select File`} />
      ) : results.length === 0 ? (
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-8 border border-slate-200 dark:border-slate-700/50 shadow-sm max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100 dark:border-slate-700">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-200">{file.name}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{(file.size / 1024).toFixed(2)} KB</p>
            </div>
          </div>
          
          <div className="space-y-6 mb-8">
            {type === 'md' && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Split Method</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={splitMethod === 'lines'} onChange={() => setSplitMethod('lines')} className="text-blue-600" />
                    <span className="text-slate-700 dark:text-slate-300">By Lines</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={splitMethod === 'headers'} onChange={() => setSplitMethod('headers')} className="text-blue-600" />
                    <span className="text-slate-700 dark:text-slate-300">By Headers</span>
                  </label>
                </div>
              </div>
            )}
            
            {splitMethod === 'lines' && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Lines per file</label>
                <input 
                  type="number" 
                  value={linesPerFile} 
                  onChange={(e) => setLinesPerFile(Number(e.target.value) || 1000)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                  min="1"
                />
              </div>
            )}
          </div>
          
          <div className="flex gap-4">
            <button onClick={() => setFile(null)} className="flex-1 py-3 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors">
              Cancel
            </button>
            <button 
              onClick={processSplit}
              disabled={isProcessing}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors flex justify-center items-center gap-2"
            >
              {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Settings className="w-5 h-5" />}
              {isProcessing ? 'Processing...' : 'Split File'}
            </button>
          </div>
          {isProcessing && (
            <div className="mt-6">
              <ProgressBar progress={progress} label="Processing file..." />
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-8 border border-slate-200 dark:border-slate-700/50 shadow-sm max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-200">Generated Files ({results.length})</h2>
            <button onClick={downloadAll} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" /> Download All (.zip)
            </button>
          </div>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto pr-2">
            {results.map((res, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate mr-4" title={res.name}>{res.name}</span>
                <a href={res.url} download={res.name} className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                  <Download className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 text-center">
            <button onClick={() => {setFile(null); setResults([]); setZipUrl(null);}} className="text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center justify-center gap-2 mx-auto">
              <ArrowLeft className="w-4 h-4" /> Split Another File
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
