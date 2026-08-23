const fs = require('fs');
let content = fs.readFileSync('src/pages/SplitText.tsx', 'utf8');

// Replace the processing part
const oldProcessRegex = /const processSplit = async \(\) => \{[\s\S]*?if \(user\) \{/;
const newProcess = `const processSplit = async () => {
    if (!file) return;
    setIsProcessing(true);
    
    try {
      const text = await file.text();
      const newResults: {name: string, url: string}[] = [];
      const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;

      if (type === 'md' && splitMethod === 'headers') {
        const parts = text.split(/(^#+ .*$)/m);
        let currentPart = parts[0];
        let fileIndex = 1;
        
        for (let i = 1; i < parts.length; i += 2) {
          const header = parts[i];
          const content = parts[i+1] || '';
          
          if (currentPart.trim()) {
            const blob = new Blob([currentPart], { type: 'text/markdown' });
            newResults.push({
              name: \`\${baseName}_part\${fileIndex}.md\`,
              url: URL.createObjectURL(blob)
            });
            fileIndex++;
          }
          currentPart = header + content;
          if (i % 50 === 0) await new Promise(r => setTimeout(r, 0)); // Yield
        }
        
        if (currentPart.trim()) {
          const blob = new Blob([currentPart], { type: 'text/markdown' });
          newResults.push({
            name: \`\${baseName}_part\${fileIndex}.md\`,
            url: URL.createObjectURL(blob)
          });
        }
      } else {
        // High-level improvement: avoid large array allocations for massive files by using indexOf
        let currentIndex = 0;
        let chunkIndex = 1;
        const hasHeader = (type === 'csv' || type === 'excel');
        
        let headerLine = '';
        if (hasHeader) {
           const firstNewline = text.indexOf('\\n');
           headerLine = firstNewline !== -1 ? text.substring(0, firstNewline) : text;
           currentIndex = firstNewline !== -1 ? firstNewline + 1 : text.length;
        }
        
        while (currentIndex < text.length) {
          let linesCollected = 0;
          let chunkStart = currentIndex;
          let chunkEnd = currentIndex;
          
          while (linesCollected < linesPerFile && chunkEnd < text.length) {
             const nextNewline = text.indexOf('\\n', chunkEnd);
             if (nextNewline === -1) {
               chunkEnd = text.length;
               linesCollected++;
               break;
             }
             chunkEnd = nextNewline + 1;
             linesCollected++;
          }
          
          if (chunkEnd > chunkStart) {
             const chunkStr = text.substring(chunkStart, chunkEnd);
             const finalContent = hasHeader ? headerLine + '\\n' + chunkStr : chunkStr;
             if (finalContent.trim()) {
               const blob = new Blob([finalContent], { type: type === 'csv' ? 'text/csv' : 'text/plain' });
               const ext = type === 'csv' ? 'csv' : (type === 'excel' ? 'csv' : 'txt');
               newResults.push({
                 name: \`\${baseName}_part\${chunkIndex}.\${ext}\`,
                 url: URL.createObjectURL(blob)
               });
               chunkIndex++;
             }
          }
          
          currentIndex = chunkEnd;
          // Yield to UI to prevent massive files from crashing browser
          await new Promise(r => setTimeout(r, 0));
        }
      }
      
      setResults(newResults);
      if (user) {`;

content = content.replace(oldProcessRegex, newProcess);
fs.writeFileSync('src/pages/SplitText.tsx', content, 'utf8');

