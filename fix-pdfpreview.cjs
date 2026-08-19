const fs = require('fs');
let content = fs.readFileSync('src/components/PDFPreview.tsx', 'utf8');

// Modify props
content = content.replace(
  "export function PDFPreview({ file }: { file: File }) {",
  "export function PDFPreview({ file, pageNumber = 1 }: { file: File | Blob | string, pageNumber?: number }) {"
);

// Update renderPage
const oldRender = `      try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);`;

const newRender = `      try {
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
        const page = await pdf.getPage(validPageNum);`;

content = content.replace(oldRender, newRender);

// Ensure it checks file extension only if it has a name
const oldExtCheck = `      if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {`;
const newExtCheck = `      if (file instanceof File && !file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {`;

content = content.replace(oldExtCheck, newExtCheck);

// Update dependency array
content = content.replace("}, [file]);", "}, [file, pageNumber]);");

fs.writeFileSync('src/components/PDFPreview.tsx', content, 'utf8');
