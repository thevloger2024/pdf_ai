const fs = require('fs');
let code = fs.readFileSync('src/pages/ConvertTool.tsx', 'utf8');

const docxBlock = `        } else if (type === 'docx') {
          const children = [];
          for (let i = 1; i <= numPages; i++) {
            setProgress(10 + (i / numPages) * 80);
            setProgressLabel(\`Processing page \${i} of \${numPages}...\`);
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            
            const rowGroups = {};
            
            textContent.items.forEach((item) => {
              const y = Math.round(item.transform[5] / 5) * 5;
              if (!rowGroups[y]) rowGroups[y] = [];
              rowGroups[y].push(item);
            });

            const sortedY = Object.keys(rowGroups).map(Number).sort((a, b) => b - a);
            
            sortedY.forEach(y => {
              const rowItems = rowGroups[y].sort((a, b) => a.transform[4] - b.transform[4]);
              const text = rowItems.map(item => item.str).join(' ');
              children.push(new Paragraph({
                children: [new TextRun(text)]
              }));
            });
            children.push(new Paragraph({ text: '' }));
          }

          const doc = new Document({
            sections: [{
              properties: {},
              children: children.length > 0 ? children : [new Paragraph({ text: 'No readable text found.' })],
            }],
          });

          const docxBlob = await Packer.toBlob(doc);
          await handleResult(docxBlob, \`\${baseFilename}.docx\`);
        }

        if (user) {`;

code = code.replace("        }\n\n        if (user) {", docxBlock);

fs.writeFileSync('src/pages/ConvertTool.tsx', code, 'utf8');
