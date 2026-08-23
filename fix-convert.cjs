const fs = require('fs');

let content = fs.readFileSync('src/pages/ConvertTool.tsx', 'utf8');

// We will replace the md2json and excel2json logic with a chunked, high-level approach.
const md2jsonStart = "} else if (type === 'md2json') {";
const md2jsonRegex = /\} else if \(type === 'md2json'\) \{[\s\S]*?\} else if \(type === 'excel2md'\) \{/;

const newMd2Json = `} else if (type === 'md2json') {
        const textDecoder = new TextDecoder('utf-8');
        const mdText = textDecoder.decode(arrayBuffer);
        
        // High-level: Process massive markdown files in chunks to avoid UI freezing and memory limits
        const chunkSize = 1024 * 1024 * 2; // 2MB string chunks
        
        if (mdText.length > chunkSize) {
          const blobParts = ['[\\n'];
          let startIndex = 0;
          let isFirst = true;
          
          while (startIndex < mdText.length) {
            let endIndex = startIndex + chunkSize;
            if (endIndex < mdText.length) {
               const nextNewline = mdText.indexOf('\\n\\n', endIndex);
               if (nextNewline !== -1 && nextNewline - endIndex < 500000) {
                 endIndex = nextNewline + 2;
               }
            } else {
               endIndex = mdText.length;
            }
            
            const chunk = mdText.substring(startIndex, endIndex);
            const tokens = marked.lexer(chunk);
            
            let jsonString = JSON.stringify(tokens, null, 2).trim();
            if (jsonString.startsWith('[')) jsonString = jsonString.substring(1);
            if (jsonString.endsWith(']')) jsonString = jsonString.substring(0, jsonString.length - 1);
            
            if (jsonString.trim().length > 0) {
               if (!isFirst) blobParts.push(',\\n');
               blobParts.push(jsonString);
               isFirst = false;
            }
            
            startIndex = endIndex;
            // Yield to main thread to prevent UI freeze (High-level non-blocking processing)
            await new Promise(r => setTimeout(r, 10));
          }
          
          blobParts.push('\\n]');
          const jsonBlob = new Blob(blobParts, { type: toolInfo.mime });
          await handleResult(jsonBlob, \`\${baseFilename}.json\`);
        } else {
          const tokens = marked.lexer(mdText);
          const jsonBlob = new Blob([JSON.stringify(tokens, null, 2)], { type: toolInfo.mime });
          await handleResult(jsonBlob, \`\${baseFilename}.json\`);
        }
        
      } else if (type === 'excel2md') {`;

content = content.replace(md2jsonRegex, newMd2Json);


const excel2jsonRegex = /\} else if \(type === 'excel2json'\) \{[\s\S]*?\} else if \(type === 'md2json'\) \{/;
const newExcel2Json = `} else if (type === 'excel2json') {
        // High-level processing: setTimeout to unblock the UI thread briefly before heavy parsing
        await new Promise(r => setTimeout(r, 50)); 
        const wb = XLSX.read(arrayBuffer, { type: 'array' });
        const resultData = {};
        
        for (let i = 0; i < wb.SheetNames.length; i++) {
          const sheetName = wb.SheetNames[i];
          const ws = wb.Sheets[sheetName];
          resultData[sheetName] = XLSX.utils.sheet_to_json(ws);
          // Yield between sheets for massive workbooks
          await new Promise(r => setTimeout(r, 10));
        }
        
        const finalJson = wb.SheetNames.length === 1 ? resultData[wb.SheetNames[0]] : resultData;
        const jsonString = JSON.stringify(finalJson, null, 2);
        const jsonBlob = new Blob([jsonString], { type: toolInfo.mime });
        await handleResult(jsonBlob, \`\${baseFilename}.json\`);
        
      } else if (type === 'md2json') {`;

content = content.replace(excel2jsonRegex, newExcel2Json);

fs.writeFileSync('src/pages/ConvertTool.tsx', content, 'utf8');

