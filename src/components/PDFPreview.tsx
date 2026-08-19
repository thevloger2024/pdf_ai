import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Loader2 } from 'lucide-react';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export function PDFPreview({ file, pageNumber = 1 }: { file: File | Blob | string, pageNumber?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let renderTask: any = null;

    const renderPage = async () => {
      if (!file) return;
      if (file instanceof File && !file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
        setError('Not a PDF file');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let pdfData;
        if (typeof file === 'string') {
          const response = await fetch(file);
          pdfData = await response.arrayBuffer();
        } else {
          pdfData = await file.arrayBuffer();
        }
        const loadingTask = pdfjsLib.getDocument({ data: pdfData });
        const pdf = await loadingTask.promise;
        
        // Ensure page is within bounds
        const validPageNum = Math.min(Math.max(1, pageNumber), pdf.numPages);
        const page = await pdf.getPage(validPageNum);
        
        if (!isMounted) return;

        const viewport = page.getViewport({ scale: 1.0 });
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const context = canvas.getContext('2d');
        if (!context) return;
        
        // Scale down to fit standard container widths if needed, but pdf renders at fixed scale
        const desiredWidth = 400; // max width
        let scale = desiredWidth / viewport.width;
        if (scale > 1) scale = 1;
        
        const scaledViewport = page.getViewport({ scale });
        
        canvas.height = scaledViewport.height;
        canvas.width = scaledViewport.width;
        
        const renderContext: any = {
          canvasContext: context,
          viewport: scaledViewport
        };
        
        renderTask = page.render(renderContext);
        await renderTask.promise;
      } catch (err) {
        console.error("PDF Render Error:", err);
        if (isMounted) {
          setError('Failed to generate preview');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    renderPage();

    return () => {
      isMounted = false;
      if (renderTask) {
        try {
          renderTask.cancel();
        } catch (e) {}
      }
    };
  }, [file, pageNumber]);

  if (error) {
    return (
      <div className="w-full flex items-center justify-center p-8 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="relative w-full flex items-center justify-center bg-slate-100 dark:bg-slate-900/50 rounded-xl overflow-hidden min-h-[200px] p-4 border border-slate-200 dark:border-slate-800">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100/50 dark:bg-slate-900/50 backdrop-blur-sm z-10">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      )}
      <canvas 
        ref={canvasRef} 
        className="max-w-full h-auto rounded shadow-md border border-slate-200 dark:border-slate-700 bg-white"
        style={{ opacity: loading ? 0.5 : 1 }}
      />
    </div>
  );
}
