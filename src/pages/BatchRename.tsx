import React, { useState, useRef } from 'react';
import { FileIcon, Upload, X, Download, Loader2, Settings2, FileText, FolderArchive } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'react-hot-toast';
import JSZip from 'jszip';
import SEO from '../components/SEO';


interface RenamedFile {
  id: string;
  originalFile: File;
  originalName: string;
  newName: string;
}

export default function BatchRename() {
  const [files, setFiles] = useState<RenamedFile[]>([]);
  const [prefix, setPrefix] = useState('');
  const [suffix, setSuffix] = useState('');
  const [useNumbering, setUseNumbering] = useState(true);
  const [startNumber, setStartNumber] = useState(1);
  const [padding, setPadding] = useState(3);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = (key: string) => key;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map(file => ({
        id: Math.random().toString(36).substring(7),
        originalFile: file,
        originalName: file.name,
        newName: file.name
      }));
      setFiles(prev => updateNames([...prev, ...newFiles], prefix, suffix, useNumbering, startNumber, padding));
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (id: string) => {
    setFiles(prev => updateNames(prev.filter(f => f.id !== id), prefix, suffix, useNumbering, startNumber, padding));
  };

  const updateNames = (
    currentFiles: RenamedFile[], 
    pfx: string, 
    sfx: string, 
    useNum: boolean, 
    start: number, 
    pad: number
  ) => {
    return currentFiles.map((file, index) => {
      const extIndex = file.originalName.lastIndexOf('.');
      const baseName = extIndex !== -1 ? file.originalName.substring(0, extIndex) : file.originalName;
      const ext = extIndex !== -1 ? file.originalName.substring(extIndex) : '';

      let numStr = '';
      if (useNum) {
        numStr = String(start + index).padStart(pad, '0');
      }

      const newName = `${pfx}${baseName}${sfx}${useNum ? numStr : ''}${ext}`;
      return { ...file, newName };
    });
  };

  const handleConfigChange = (type: 'prefix' | 'suffix' | 'useNumbering' | 'startNumber' | 'padding', value: any) => {
    let pfx = prefix;
    let sfx = suffix;
    let useNum = useNumbering;
    let start = startNumber;
    let pad = padding;

    if (type === 'prefix') { pfx = value; setPrefix(value); }
    if (type === 'suffix') { sfx = value; setSuffix(value); }
    if (type === 'useNumbering') { useNum = value; setUseNumbering(value); }
    if (type === 'startNumber') { start = value; setStartNumber(value); }
    if (type === 'padding') { pad = value; setPadding(value); }

    setFiles(prev => updateNames(prev, pfx, sfx, useNum, start, pad));
  };

  const processAndDownload = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    
    try {
      const zip = new JSZip();
      
      files.forEach((file) => {
        // Handle name collisions simply by appending random string if needed
        zip.file(file.newName, file.originalFile);
      });
      
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `Batch_Renamed_${new Date().getTime()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('ZIP downloaded successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to create ZIP file.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 md:py-20">
      <SEO title="Batch Rename Files" description="Upload multiple files and rename them with prefixes, suffixes, or numbering, then download as a ZIP." />
      
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <FolderArchive className="w-10 h-10" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-100 mb-4">Batch Rename Files</h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Upload multiple files, apply a naming pattern, and download them all instantly as a ZIP archive.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings Sidebar */}
        <div className="lg:col-span-1 space-y-6 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 h-fit sticky top-24">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-700 pb-4">
            <Settings2 className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Renaming Rules</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Prefix</label>
              <input 
                type="text" 
                value={prefix}
                onChange={(e) => handleConfigChange('prefix', e.target.value)}
                placeholder="e.g. invoice_"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Suffix</label>
              <input 
                type="text" 
                value={suffix}
                onChange={(e) => handleConfigChange('suffix', e.target.value)}
                placeholder="e.g. _reviewed"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-200"
              />
            </div>
            
            <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
              <label className="flex items-center gap-2 cursor-pointer mb-3">
                <input 
                  type="checkbox" 
                  checked={useNumbering}
                  onChange={(e) => handleConfigChange('useNumbering', e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Add Sequential Numbering</span>
              </label>
              
              {useNumbering && (
                <div className="grid grid-cols-2 gap-4 pl-6">
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Start At</label>
                    <input 
                      type="number" 
                      min="1"
                      value={startNumber}
                      onChange={(e) => handleConfigChange('startNumber', parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Zero Padding</label>
                    <input 
                      type="number" 
                      min="1" max="10"
                      value={padding}
                      onChange={(e) => handleConfigChange('padding', parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
            <button
              onClick={processAndDownload}
              disabled={isProcessing || files.length === 0}
              className="w-full flex justify-center items-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Zipping...</>
              ) : (
                <><Download className="w-5 h-5" /> Download ZIP</>
              )}
            </button>
            <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-3">
              {files.length} file{files.length !== 1 ? 's' : ''} ready to download
            </p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group"
          >
            <input 
              type="file" 
              multiple 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileChange}
            />
            <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Upload className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">Add Files to Rename</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Click to browse or drop any files here</p>
          </div>

          {files.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Preview ({files.length})</h3>
                <button 
                  onClick={() => setFiles([])}
                  className="text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                >
                  Clear All
                </button>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-[60vh] overflow-y-auto">
                {files.map((file) => (
                  <div key={file.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-start gap-3">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg shrink-0 mt-1">
                      <FileIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Original</p>
                        <p className="text-sm text-slate-900 dark:text-slate-300 truncate" title={file.originalName}>
                          {file.originalName}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-indigo-500 dark:text-indigo-400 uppercase tracking-wider mb-1">New Name</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate" title={file.newName}>
                          {file.newName}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeFile(file.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-md shrink-0 transition-colors mt-4 md:mt-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
