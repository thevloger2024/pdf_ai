const fs = require('fs');

// 1. Fix ConvertTool.tsx import PDFPreview
let convertTool = fs.readFileSync('src/pages/ConvertTool.tsx', 'utf8');
convertTool = convertTool.replace("import PDFPreview from '../components/PDFPreview';", "import { PDFPreview } from '../components/PDFPreview';");
fs.writeFileSync('src/pages/ConvertTool.tsx', convertTool, 'utf8');

// 2. Fix MergePages.tsx
let mergePages = fs.readFileSync('src/pages/MergePages.tsx', 'utf8');
mergePages = mergePages.replace(
  "const removeFile = (index: number) => {\n    setFiles(prev => prev.filter((_, i) => i !== index));\n  };",
  "const removeFile = (idToRemove: string) => {\n    setFiles(prev => prev.filter(f => f.id !== idToRemove));\n  };"
);
mergePages = mergePages.replace(
  "setFiles(prev => [...prev, ...newFiles.map(f => ({ file: f, pageRange: '' }))]);",
  "setFiles(prev => [...prev, ...newFiles.map(f => ({ id: Math.random().toString(36).substring(7), file: f, pageRange: '' }))]);"
);
// Also fix updatePageRange taking string instead of number if that failed too
if (mergePages.includes("const updatePageRange = (index: number, value: string) => {")) {
  mergePages = mergePages.replace(
    /const updatePageRange = \(index: number, value: string\) => \{[\s\S]*?\};\n/,
    `const updatePageRange = (id: string, value: string) => {
    const newFiles = [...files];
    const targetIdx = newFiles.findIndex(f => f.id === id);
    if(targetIdx > -1) {
      newFiles[targetIdx].pageRange = value;
      setFiles(newFiles);
    }
  };\n`
  );
}
fs.writeFileSync('src/pages/MergePages.tsx', mergePages, 'utf8');

// 3. Fix MergePdfs.tsx
let mergePdfs = fs.readFileSync('src/pages/MergePdfs.tsx', 'utf8');
mergePdfs = mergePdfs.replace(
  "const removeFile = (index: number) => {\n    setFiles(prev => prev.filter((_, i) => i !== index));\n  };",
  "const removeFile = (idToRemove: string) => {\n    setFiles(prev => prev.filter(f => f.id !== idToRemove));\n  };"
);
fs.writeFileSync('src/pages/MergePdfs.tsx', mergePdfs, 'utf8');

