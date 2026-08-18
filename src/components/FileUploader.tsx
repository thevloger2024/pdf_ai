import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, File as FileIcon, X, Check } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { toast } from 'react-hot-toast';
import { useLanguage } from '../contexts/LanguageContext';

export function FileUploader({ 
  onFileSelect, 
  accept = ".pdf",
  title = "Choose file",
  subtitle = "or drop files here"
}: { 
  onFileSelect: (file: File) => void, 
  accept?: string,
  title?: string,
  subtitle?: string
}) {
  const [isDragging, setIsDragging] = useState(false);
  const { t } = useLanguage();
  const safeTitle = title === 'Choose file' ? t('upload.choose') : title;
  const safeSubtitle = subtitle === 'or drop files here' ? t('upload.drop') : subtitle;
  const [isGlobalDragging, setIsGlobalDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let dragCounter = 0;

    const handleWindowDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleWindowDragEnter = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer?.types.includes('Files')) {
        dragCounter++;
        if (dragCounter === 1) {
          setIsGlobalDragging(true);
        }
      }
    };

    const handleWindowDragLeave = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer?.types.includes('Files')) {
        dragCounter--;
        if (dragCounter === 0) {
          setIsGlobalDragging(false);
        }
      }
    };

    const handleWindowDrop = (e: DragEvent) => {
      e.preventDefault();
      dragCounter = 0;
      setIsGlobalDragging(false);
      setIsDragging(false);
      
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        const ext = file.name.split('.').pop()?.toLowerCase();
        
        if (accept.includes(file.type) || (accept.includes('.pdf') && ext === 'pdf') || (accept.includes(`.${ext}`))) {
          toast.success(`File uploaded successfully: ${file.name}`);
          onFileSelect(file);
        } else {
          toast.error(`Invalid file type. Accepted formats: ${accept}`);
        }
      }
    };

    window.addEventListener('dragover', handleWindowDragOver);
    window.addEventListener('dragenter', handleWindowDragEnter);
    window.addEventListener('dragleave', handleWindowDragLeave);
    window.addEventListener('drop', handleWindowDrop);

    return () => {
      window.removeEventListener('dragover', handleWindowDragOver);
      window.removeEventListener('dragenter', handleWindowDragEnter);
      window.removeEventListener('dragleave', handleWindowDragLeave);
      window.removeEventListener('drop', handleWindowDrop);
    };
  }, [accept, onFileSelect]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // Already handled by window drop event since it bubbles/captures, but kept for isolated use cases
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      toast.success(`File uploaded successfully: ${file.name}`);
      onFileSelect(file);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isGlobalDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-blue-600/90 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="flex flex-col items-center text-white pointer-events-none"
            >
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-6 animate-bounce">
                <Upload className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-4xl font-bold mb-2">{t('upload.dropping')}</h2>
              <p className="text-blue-100 text-lg">{t('upload.support')} {accept.replace(/\./g, '').toUpperCase()}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div 
        className={twMerge(
          "w-full max-w-2xl mx-auto border-2 border-dashed rounded-3xl p-8 sm:p-12 transition-all flex flex-col items-center justify-center text-center cursor-pointer relative overflow-hidden group",
          isDragging ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-400 dark:hover:border-slate-500"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept={accept}
        />
        
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          <Upload className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">{safeTitle}</h3>
        <p className="text-slate-500 dark:text-slate-400">{safeSubtitle}</p>
      </div>
    </>
  );
}
