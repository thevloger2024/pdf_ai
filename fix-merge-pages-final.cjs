const fs = require('fs');

let mergePages = fs.readFileSync('src/pages/MergePages.tsx', 'utf8');

// Fix 1: mapping `file => ({ file, pageRange: 'all' })` to include `id`
mergePages = mergePages.replace(
  /file => \(\{ file, pageRange: 'all' \}\)/g,
  "file => ({ id: Math.random().toString(36).substring(7), file, pageRange: 'all' })"
);

// Fix 2: updatePageRange
mergePages = mergePages.replace(
  /const updatePageRange = \(index: number, range: string\) => \{[\s\S]*?return newFiles;\n    \}\);/,
  `const updatePageRange = (id: string, range: string) => {
    setFiles(prev => {
      const newFiles = [...prev];
      const index = newFiles.findIndex(f => f.id === id);
      if (index > -1) newFiles[index].pageRange = range;
      return newFiles;
    });`
);

fs.writeFileSync('src/pages/MergePages.tsx', mergePages, 'utf8');

