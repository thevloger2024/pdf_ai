import React, { useState, useRef } from 'react';
import SEO from '../components/SEO';
import { Combine, Upload, X, ArrowUp, ArrowDown, File as FileIcon, Loader2 } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { motion, Reorder } from 'motion/react';
import { toast } from 'react-hot-toast';
import { saveToHistory } from '../lib/storage';
import { logActivity } from '../lib/firebase';
import { User } from '../types';


function SortableFileItem({ id, file, onRemove }: { id: string, file: File, onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : 1 };

  return (
    <div ref={setNodeRef} style={style} className={`flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border ${isDragging ? 'border-purple-500 shadow-md' : 'border-slate-100 dark:border-slate-700/50'} relative`}>
      <div className="flex items-center gap-3 overflow-hidden">
        <button {...attributes} {...listeners} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-grab active:cursor-grabbing">
          <GripVertical className="w-5 h-5" />
        </button>
        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg shrink-0">
          <FileIcon className="w-5 h-5" />
        </div>
        <div className="truncate">
          <p className="font-medium text-slate-900 dark:text-slate-100 truncate">{file.name}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button onClick={onRemove} className="p-2 text-red-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function MergePdfs({ user }: { user: User | null }) {
  const [files, setFiles] = useState<{id: string, file: File}[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState<string>('merged.pdf');
  const fileInputRef = useRef<HTMLInputElement>(null);
  

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
      if (newFiles.length > 0) {
        setFiles(prev => [...prev, ...newFiles.map(f => ({ id: Math.random().toString(36).substring(7), file: f }))]);
        toast.success(`Added ${newFiles.length} file(s)`);
      } else {
        toast.error('Only PDF files are allowed.');
      }
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

    
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setFiles((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      toast.error('Please select at least 2 PDF files to merge.');
      return;
    }

    setIsProcessing(true);
    try {
      const mergedPdf = await PDFDocument.create();

      for (const item of files) {
        const arrayBuffer = await item.file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        copiedPages.forEach((page) => {
          mergedPdf.addPage(page);
        });
      }

      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      
      const newName = `merged_${files[0].file.name.replace('.pdf', '')}_and_${files.length - 1}_others.pdf`;
      setResultName(newName);

      await saveToHistory(newName, blob, 'merge');
      if (user) {
        logActivity(user.uid, 'merge_pdf', { fileCount: files.length });
      }
      
      toast.success('PDFs merged successfully!');
    } catch (error) {
      console.error('Error merging PDFs:', error);
      toast.error('Failed to merge PDFs. One of the files might be corrupted or password protected.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
      <SEO title="Merge PDFs" description="Combine multiple PDFs into a single file" />
      
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <Combine className="w-10 h-10" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-100 mb-4">Merge PDFs</h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">Select multiple PDF documents and combine them into a single file. You can easily drag and drop to reorder them before merging.</p>
      </div>

      {!resultUrl ? (
        <div className="space-y-8">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-3xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group"
          >
            <input 
              type="file" 
              multiple 
              accept=".pdf" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileChange}
            />
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Select PDF Files</h3>
            <p className="text-slate-500 dark:text-slate-400">Click to browse or drop files here</p>
          </div>

          {files.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Selected Files ({files.length})</h3>
                <button 
                  onClick={() => setFiles([])}
                  className="text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                >
                  Clear All
                </button>
              </div>

              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={files.map(f => f.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3 mb-8">
                    {files.map((item) => (
                      <SortableFileItem key={item.id} id={item.id} file={item.file} onRemove={() => removeFile(item.id)} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
              <button
                onClick={handleMerge}
                disabled={isProcessing || files.length < 2}
                className="w-full flex items-center justify-center gap-2 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-colors disabled:opacity-70"
              >
                {isProcessing ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Merging...</>
                ) : (
                  <><Combine className="w-5 h-5" /> Merge PDFs</>
                )}
              </button>
            </div>
          )}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm max-w-md mx-auto text-center">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <Combine className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Merge Complete!</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">Your PDFs have been successfully combined.</p>
          
          <a 
            href={resultUrl} 
            download={resultName}
            className="w-full flex justify-center items-center gap-2 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors mb-4"
          >
            Download Merged PDF
          </a>
          <button 
            onClick={() => {
              setResultUrl(null);
              setFiles([]);
            }} 
            className="w-full py-4 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-colors"
          >
            Merge More Files
          </button>
        </motion.div>
      )}
    </div>
  );
}
