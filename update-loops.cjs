const fs = require('fs');
let content = fs.readFileSync('src/pages/ConvertTool.tsx', 'utf8');

// replace excel2json loop
content = content.replace(
  "for (let i = 0; i < wb.SheetNames.length; i++) {",
  "for (let i = 0; i < wb.SheetNames.length; i++) {\n          setProgress(10 + (i / wb.SheetNames.length) * 80);\n          setProgressLabel(`Processing sheet ${i + 1} of ${wb.SheetNames.length}...`);"
);

// replace md2json loop
content = content.replace(
  "while (startIndex < mdText.length) {",
  "while (startIndex < mdText.length) {\n            setProgress(10 + (startIndex / mdText.length) * 80);\n            setProgressLabel(`Processing chunk...`);"
);

// replace excel2md loop (from forEach to for loop and set progress)
const oldExcel2Md = `wb.SheetNames.forEach(sheetName => {
          const ws = wb.Sheets[sheetName];
          const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
          
          if (data.length > 0) {
            mdText += \`## \${sheetName}\\n\\n\`;
            
            // Render Markdown Table
            const headers = data[0] || [];
            const cols = headers.length || 1; // At least one column
            mdText += \`| \${headers.map(h => String(h || '').replace(/\\|/g, '\\\\|')).join(' | ')} |\\n\`;
            mdText += \`| \${Array(cols).fill('---').join(' | ')} |\\n\`;
            
            for (let r = 1; r < data.length; r++) {
              const row = data[r] || [];
              const paddedRow = Array.from({ length: cols }, (_, i) => row[i] || '');
              mdText += \`| \${paddedRow.map(c => String(c).replace(/\\|/g, '\\\\|')).join(' | ')} |\\n\`;
            }
            mdText += '\\n\\n';
          }
        });`;

const newExcel2Md = `for (let i = 0; i < wb.SheetNames.length; i++) {
          const sheetName = wb.SheetNames[i];
          setProgress(10 + (i / wb.SheetNames.length) * 80);
          setProgressLabel(\`Converting sheet \${i + 1} of \${wb.SheetNames.length}...\`);
          
          const ws = wb.Sheets[sheetName];
          const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
          
          if (data.length > 0) {
            mdText += \`## \${sheetName}\\n\\n\`;
            
            // Render Markdown Table
            const headers = data[0] || [];
            const cols = headers.length || 1; // At least one column
            mdText += \`| \${headers.map(h => String(h || '').replace(/\\|/g, '\\\\|')).join(' | ')} |\\n\`;
            mdText += \`| \${Array(cols).fill('---').join(' | ')} |\\n\`;
            
            for (let r = 1; r < data.length; r++) {
              const row = data[r] || [];
              const paddedRow = Array.from({ length: cols }, (_, i) => row[i] || '');
              mdText += \`| \${paddedRow.map(c => String(c).replace(/\\|/g, '\\\\|')).join(' | ')} |\\n\`;
            }
            mdText += '\\n\\n';
          }
          await new Promise(r => setTimeout(r, 10)); // Yield to UI
        }`;

content = content.replace(oldExcel2Md, newExcel2Md);

// replace all PDF loops (jpg, ppt, excel, txt/md)
const loopsRegex = /for \(let i = 1; i <= numPages; i\+\+\) \{/g;
content = content.replace(loopsRegex, `for (let i = 1; i <= numPages; i++) {
            setProgress(10 + (i / numPages) * 80);
            setProgressLabel(\`Processing page \${i} of \${numPages}...\`);`);

fs.writeFileSync('src/pages/ConvertTool.tsx', content, 'utf8');
