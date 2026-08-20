const fs = require('fs');

let content = fs.readFileSync('src/pages/ConvertTool.tsx', 'utf8');

// Add import for marked
if (!content.includes("import { marked } from 'marked';")) {
  content = content.replace("import * as XLSX from 'xlsx';", "import * as XLSX from 'xlsx';\nimport { marked } from 'marked';");
}

// Add new types to the `types` object
const typesMatch = "excel2md: { name: 'Excel to Markdown', ext: 'md', mime: 'text/markdown', accepted: '.xlsx,.xls' }";
const newTypes = typesMatch + ",\n  md2json: { name: 'Markdown to JSON', ext: 'json', mime: 'application/json', accepted: '.md,.markdown' },\n  excel2json: { name: 'Excel to JSON', ext: 'json', mime: 'application/json', accepted: '.xlsx,.xls,.csv' }";
if (!content.includes('md2json:')) {
  content = content.replace(typesMatch, newTypes);
}

// Now let's inject the conversion logic in handleConvert.
// We look for where `type === 'excel2md'` block starts.
const excel2mdMatch = "if (type === 'excel2md') {";
const newBlocks = `if (type === 'excel2json') {
        const wb = XLSX.read(arrayBuffer, { type: 'array' });
        const resultData = {};
        
        wb.SheetNames.forEach(sheetName => {
          const ws = wb.Sheets[sheetName];
          resultData[sheetName] = XLSX.utils.sheet_to_json(ws);
        });
        
        // If there's only one sheet, we can just return its array to be cleaner, but returning the mapped object is safer to not lose data.
        const finalJson = wb.SheetNames.length === 1 ? resultData[wb.SheetNames[0]] : resultData;
        const jsonBlob = new Blob([JSON.stringify(finalJson, null, 2)], { type: toolInfo.mime });
        await handleResult(jsonBlob, \`\${baseFilename}.json\`);
        
      } else if (type === 'md2json') {
        const textDecoder = new TextDecoder('utf-8');
        const mdText = textDecoder.decode(arrayBuffer);
        
        // Use marked.lexer to generate a full AST (Abstract Syntax Tree) without losing any data
        const tokens = marked.lexer(mdText);
        
        const jsonBlob = new Blob([JSON.stringify(tokens, null, 2)], { type: toolInfo.mime });
        await handleResult(jsonBlob, \`\${baseFilename}.json\`);
        
      } else if (type === 'excel2md') {`;

if (!content.includes("type === 'excel2json'")) {
  content = content.replace(excel2mdMatch, newBlocks);
}

fs.writeFileSync('src/pages/ConvertTool.tsx', content, 'utf8');
