const fs = require('fs');
let content = fs.readFileSync('src/pages/SplitPdf.tsx', 'utf8');

// Add previewPage state
content = content.replace(
  "const [selectedPages, setSelectedPages] = useState<number[]>([]);",
  "const [selectedPages, setSelectedPages] = useState<number[]>([]);\n  const [previewPage, setPreviewPage] = useState<number>(1);"
);

// Update PDFPreview to use previewPage
content = content.replace(
  "<PDFPreview file={file} />",
  "<PDFPreview file={file} pageNumber={previewPage} />"
);

// Add onMouseEnter to page buttons
const oldButton = `                <button
                  key={page}
                  onClick={() => togglePage(page)}
                  className={\`relative aspect-[1/1.4] rounded-lg border-2 flex items-center justify-center transition-all \${`;

const newButton = `                <button
                  key={page}
                  onClick={() => togglePage(page)}
                  onMouseEnter={() => setPreviewPage(page)}
                  className={\`relative aspect-[1/1.4] rounded-lg border-2 flex items-center justify-center transition-all overflow-hidden \${`;

content = content.replace(oldButton, newButton);

// Add result preview
const oldResultUI = `          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-200 mb-2">Extraction Complete!</h2>`;

const newResultUI = `          <div className="mb-6 w-full max-w-sm mx-auto flex justify-center">
            <PDFPreview file={resultUrl} />
          </div>
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-200 mb-2">Extraction Complete!</h2>`;

content = content.replace(oldResultUI, newResultUI);

fs.writeFileSync('src/pages/SplitPdf.tsx', content, 'utf8');
