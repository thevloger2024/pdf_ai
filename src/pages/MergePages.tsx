import React, { useState, useRef } from 'react';
import SEO from '../components/SEO';
import { Layers, Upload, X, ArrowUp, ArrowDown, File as FileIcon, Loader2 } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { motion } from 'motion/react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { saveToHistory } from '../lib/storage';
import { logActivity } from '../lib/firebase';
import { User } from '../types';

interface FileWithPages {
  id: string;
  file: File;
  pageRange: string;
}


function SortablePageItem({ id, item, onRemove, onRangeChange }: { id: string, item: any, onRemove: () => void, onRangeChange: (val: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : 1 };

  return (
    <div ref={setNodeRef} style={style} className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border ${isDragging ? 'border-pink-500 shadow-md' : 'border-slate-100 dark:border-slate-700/50'} relative`}>
      <div className="flex items-center gap-3 flex-1 overflow-hidden">
        <button {...attributes} {...listeners} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-grab active:cursor-grabbing">
          <GripVertical className="w-5 h-5" />
        </button>
        <div className="p-2 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-lg shrink-0">
          <FileIcon className="w-5 h-5" />
        </div>
        <div className="truncate min-w-0">
          <p className="font-medium text-slate-900 dark:text-slate-100 truncate">{item.file.name}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{(item.file.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
      </div>
      <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
        <div className="flex-1 sm:w-48">
          <input 
            type="text" 
            value={item.pageRange}
            onChange={(e) => onRangeChange(e.target.value)}
            // Prevent pointer events to bubble up when typing so DND doesn't interfere with input focus
            onPointerDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            placeholder="e.g. 1, 3, 5-10"
            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 outline-none"
          />
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onRemove} className="p-1.5 text-red-400 hover:text-red-600 ml-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MergePages({ user }: { user: User | null }) {
  const [files, setFiles] = useState<FileWithPages[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState<string>('merged_pages.pdf');
  const fileInputRef = useRef<HTMLInputElement>(null);
  

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
        .filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'))
        .map(file => ({ id: Math.random().toString(36).substring(7), file, pageRange: 'all' }));
        
      if (newFiles.length > 0) {
        setFiles(prev => [...prev, ...newFiles]);
        toast.success(`Added ${newFiles.length} file(s)`);
      } else {
        toast.error('Only PDF files are allowed.');
      }
    }
  };

  const removeFile = (idToRemove: string) => {
    setFiles(prev => prev.filter(f => f.id !== idToRemove));
  };

  const updatePageRange = (id: string, range: string) => {
    setFiles(prev => {
      const newFiles = [...prev];
      const index = newFiles.findIndex(f => f.id === id);
      if (index > -1) newFiles[index].pageRange = range;
      return newFiles;
    });
  };

    const parsePageRange = (rangeStr: string, totalPages: number): number[] => {
    if (!rangeStr || rangeStr.trim().toLowerCase() === 'all') {
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
    return Array.from(pages).sort((a, b) => a - b);
  };

  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setFiles((items) => {
        const oldIndex = items.findIndex(item => item.id === String(active.id));
        const newIndex = items.findIndex(item => item.id === String(over.id));
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleMerge = async () => {
    if (files.length === 0) {
      toast.error('Please select at least one PDF file.');
      return;
    }

    setIsProcessing(true);
    try {
      const mergedPdf = await PDFDocument.create();

      for (const item of files) {
        const arrayBuffer = await item.file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const totalPages = pdfDoc.getPageCount();
        const pagesToExtract = parsePageRange(item.pageRange, totalPages);
        
        if (pagesToExtract.length > 0) {
          const copiedPages = await mergedPdf.copyPages(pdfDoc, pagesToExtract);
          copiedPages.forEach((page) => {
            mergedPdf.addPage(page);
          });
        }
      }

      const finalPageCount = mergedPdf.getPageCount();
      if (finalPageCount === 0) {
        toast.error('No pages were selected to merge. Please check your page ranges.');
        setIsProcessing(false);
        return;
      }

      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      
      const newName = `merged_pages_${files[0].file.name}`;
      setResultName(newName);

      await saveToHistory(newName, blob, 'merge');
      if (user) {
        logActivity(user.uid, 'merge_pages', { fileCount: files.length, totalPages: finalPageCount });
      }
      
      toast.success('Pages merged successfully!');
    } catch (error) {
      console.error('Error merging pages:', error);
      toast.error('Failed to merge pages. Please check if ranges are valid.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
      <SEO title="Merge Pages to PDF" description="Combine specific pages from multiple PDFs into a single file" />
      
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <Layers className="w-10 h-10" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-100 mb-4">Merge Specific Pages</h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">Upload PDFs and specify exactly which pages to extract and merge (e.g. "1, 3, 5-10").</p>
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
            <div className="w-16 h-16 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Add PDF Files</h3>
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
                  <div className="space-y-4 mb-8">
                    {files.map((item) => (
                      <SortablePageItem 
                        key={item.id} 
                        id={item.id} 
                        item={item} 
                        onRemove={() => removeFile(item.id)} 
                        onRangeChange={(val) => updatePageRange(item.id, val)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
              <button
                onClick={handleMerge}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 py-4 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-bold transition-colors disabled:opacity-70"
              >
                {isProcessing ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                ) : (
                  <><Layers className="w-5 h-5" /> Merge Selected Pages</>
                )}
              </button>
            </div>
          )}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm max-w-md mx-auto text-center">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <Layers className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Merge Complete!</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">Your selected pages have been successfully combined.</p>
          
          <a 
            href={resultUrl} 
            download={resultName}
            className="w-full flex justify-center items-center gap-2 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors mb-4"
          >
            Download PDF
          </a>
          <button 
            onClick={() => {
              setResultUrl(null);
              setFiles([]);
            }} 
            className="w-full py-4 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-colors"
          >
            Merge More Pages
          </button>
        </motion.div>
      )}
    </div>
  );
}
