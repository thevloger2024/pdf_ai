const fs = require('fs');

const componentsToUpdate = [
  'src/pages/Compress.tsx',
  'src/pages/Split.tsx',
  'src/pages/Chunk.tsx',
  'src/pages/Edit.tsx',
  'src/pages/Watermark.tsx'
];

for (const path of componentsToUpdate) {
  let content = fs.readFileSync(path, 'utf8');
  
  // Add import if not exists
  if (!content.includes('PDFPreview')) {
    content = content.replace(
      "import { FileUploader } from '../components/FileUploader';",
      "import { FileUploader } from '../components/FileUploader';\nimport { PDFPreview } from '../components/PDFPreview';"
    );
    
    if (path.includes('Compress.tsx')) {
      content = content.replace(
        '<div className="max-w-md mx-auto">',
        '<div className="max-w-md mx-auto">\n              <div className="mb-6 w-full flex justify-center">\n                <PDFPreview file={file} />\n              </div>'
      );
    } else if (path.includes('Split.tsx') || path.includes('Chunk.tsx') || path.includes('Edit.tsx') || path.includes('Watermark.tsx')) {
      // Find the file info div to insert before
      content = content.replace(
        '<div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">',
        '<div className="mb-8 w-full max-w-sm mx-auto flex justify-center">\n            <PDFPreview file={file} />\n          </div>\n          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">'
      );
      content = content.replace(
        '<div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 mb-8">',
        '<div className="mb-6 w-full max-w-sm mx-auto flex justify-center">\n            <PDFPreview file={file} />\n          </div>\n          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 mb-8">'
      );
    }
    
    fs.writeFileSync(path, content, 'utf8');
  }
}
