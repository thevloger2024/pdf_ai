import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

interface PDFPreviewProps {
  file: File | Blob | string | null;
  pageNumber?: number;
  showControls?: boolean;
}

export function PDFPreview({ file, pageNumber = 1, showControls = false }: PDFPreviewProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(pageNumber);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sync internal page state with prop if it changes
  React.useEffect(() => {
    setCurrentPage(pageNumber);
  }, [pageNumber]);

  if (!file) return null;

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  }

  function onDocumentLoadError(error: Error) {
    console.error("PDF Render Error:", error);
    setError('Failed to load PDF preview');
    setLoading(false);
  }

  const handlePrevious = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentPage(prev => Math.min(prev + 1, numPages || 1));
  };

  if (error) {
    return (
      <div className="w-full flex items-center justify-center p-8 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-full">
      <div className="relative flex items-center justify-center bg-slate-100 dark:bg-slate-900/50 rounded-xl overflow-hidden min-h-[200px] border border-slate-200 dark:border-slate-800 w-full">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100/50 dark:bg-slate-900/50 backdrop-blur-sm z-10 rounded-xl">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        )}
        <div className="max-w-full overflow-hidden p-4 flex justify-center">
          <Document
            file={file}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={null}
            className="flex justify-center max-w-full"
          >
            <Page
              pageNumber={currentPage}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="max-w-full shadow-md rounded overflow-hidden border border-slate-200 dark:border-slate-700 bg-white flex justify-center"
              width={Math.min(window.innerWidth - 64, 400)}
            />
          </Document>
        </div>
      </div>
      
      {showControls && numPages && numPages > 1 && (
        <div className="flex items-center gap-4 mt-4 bg-slate-50 dark:bg-slate-800/50 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700">
          <button
            onClick={handlePrevious}
            disabled={currentPage <= 1}
            className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400 min-w-[4rem] text-center">
            {currentPage} / {numPages}
          </span>
          <button
            onClick={handleNext}
            disabled={currentPage >= numPages}
            className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
