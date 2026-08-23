const fs = require('fs');
let code = fs.readFileSync('src/pages/ConvertTool.tsx', 'utf8');

const docxType = `docx: { name: 'PDF to Word', ext: 'docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', accepted: '.pdf' },
  jpg:`;

code = code.replace("  jpg:", docxType);

const docxImport = `import { marked } from 'marked';
import { Document, Packer, Paragraph, TextRun } from 'docx';`;

code = code.replace("import { marked } from 'marked';", docxImport);

fs.writeFileSync('src/pages/ConvertTool.tsx', code, 'utf8');
