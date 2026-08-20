const fs = require('fs');

let content = fs.readFileSync('src/pages/Convert.tsx', 'utf8');

// I need to add 'FileJson' and 'Database' icons
if (!content.includes('FileJson')) {
  content = content.replace(
    /import \{([^}]+)\} from 'lucide-react';/,
    (match, p1) => `import {${p1}, FileJson, Database} from 'lucide-react';`
  );
}

const md2jsonStr = `  { id: 'md2json', name: 'Markdown to JSON', desc: 'Parse Markdown files into structured JSON without data loss.', icon: FileJson, color: 'text-fuchsia-600', bg: 'bg-fuchsia-50', link: '/convert/md2json' },`;
const excel2jsonStr = `  { id: 'excel2json', name: 'Excel to JSON', desc: 'Convert Excel sheets (XLSX) reliably into structured JSON.', icon: Database, color: 'text-lime-600', bg: 'bg-lime-50', link: '/convert/excel2json' },`;

if (!content.includes('md2json')) {
  content = content.replace(
    "const convertTools = [",
    "const convertTools = [\n" + md2jsonStr + "\n" + excel2jsonStr
  );
}

fs.writeFileSync('src/pages/Convert.tsx', content, 'utf8');
