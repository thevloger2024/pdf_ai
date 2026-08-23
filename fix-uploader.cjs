const fs = require('fs');
let content = fs.readFileSync('src/components/FileUploader.tsx', 'utf8');

// The original line:
// if (accept.includes(file.type) || (accept.includes('.pdf') && ext === 'pdf') || (accept.includes(`.${ext}`))) {

const oldLine = /if \(accept\.includes\(file\.type\)[\s\S]*?\{/;
const newLine = `// High-level improvement: robust checking for file extensions and mime types, ensuring no valid file is rejected
        const isAccepted = 
          !accept || accept === '*' ||
          (file.type && accept.includes(file.type)) || 
          (ext && accept.includes('.' + ext)) ||
          (accept.includes('.pdf') && ext === 'pdf');
        
        if (isAccepted) {`;
content = content.replace(oldLine, newLine);
fs.writeFileSync('src/components/FileUploader.tsx', content, 'utf8');
