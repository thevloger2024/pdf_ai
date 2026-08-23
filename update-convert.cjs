const fs = require('fs');
let code = fs.readFileSync('src/pages/Convert.tsx', 'utf8');

const docxTool = `  { id: 'docx', name: 'PDF to DOCX', desc: 'Convert PDF to Word document (DOCX) ensuring layout preservation.', icon: FileText, color: 'text-indigo-500', bg: 'bg-indigo-50', link: '/convert/docx' },
  { id: 'md2json', name: 'Markdown to JSON',`;

code = code.replace("  { id: 'md2json', name: 'Markdown to JSON',", docxTool);

fs.writeFileSync('src/pages/Convert.tsx', code, 'utf8');
