const fs = require('fs');

let content = fs.readFileSync('src/pages/SplitText.tsx', 'utf8');

content = content.replace(
  "import * as XLSX from 'xlsx';",
  "import * as XLSX from 'xlsx';\nimport Papa from 'papaparse';"
);

content = content.replace(
  "const worksheet = XLSX.utils.aoa_to_sheet(chunkLines.map(l => l.split(','))); // simple csv split, for robust use papaparse, but sticking to simple for now or let's use proper parsing.",
  "const parsed = Papa.parse(chunkLines.join('\\n'), { skipEmptyLines: true });\n            const worksheet = XLSX.utils.aoa_to_sheet(parsed.data as any[][]);"
);

fs.writeFileSync('src/pages/SplitText.tsx', content, 'utf8');
