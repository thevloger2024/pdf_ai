const fs = require('fs');
let content = fs.readFileSync('src/pages/MergePages.tsx', 'utf8');

// Ensure map returns an object with `id`
if (content.includes('f => ({ file: f, pageRange: \'\' })')) {
  content = content.replace(
    /f => \({ file: f, pageRange: '' }\)/g,
    "f => ({ id: Math.random().toString(36).substring(7), file: f, pageRange: '' })"
  );
  fs.writeFileSync('src/pages/MergePages.tsx', content, 'utf8');
}

// Ensure the old drag and drop number parse error is fixed:
// MergePages.tsx(245,52): error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.
// MergePdfs.tsx(170,112): error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.

let mergePdfs = fs.readFileSync('src/pages/MergePdfs.tsx', 'utf8');
mergePdfs = mergePdfs.replace(
  "const oldIndex = items.findIndex(item => item.id === active.id);",
  "const oldIndex = items.findIndex(item => item.id === String(active.id));"
);
mergePdfs = mergePdfs.replace(
  "const newIndex = items.findIndex(item => item.id === over.id);",
  "const newIndex = items.findIndex(item => item.id === String(over.id));"
);
fs.writeFileSync('src/pages/MergePdfs.tsx', mergePdfs, 'utf8');

let mergePages = fs.readFileSync('src/pages/MergePages.tsx', 'utf8');
mergePages = mergePages.replace(
  "const oldIndex = items.findIndex(item => item.id === active.id);",
  "const oldIndex = items.findIndex(item => item.id === String(active.id));"
);
mergePages = mergePages.replace(
  "const newIndex = items.findIndex(item => item.id === over.id);",
  "const newIndex = items.findIndex(item => item.id === String(over.id));"
);
fs.writeFileSync('src/pages/MergePages.tsx', mergePages, 'utf8');

