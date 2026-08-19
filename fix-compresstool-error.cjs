const fs = require('fs');
let content = fs.readFileSync('src/pages/CompressTool.tsx', 'utf8');
content = content.replace(
  "toast.error(`Failed to compress ${toolInfo.name} file.`);",
  "toast.error(`Failed to compress ${toolInfo.name} file. The file may be corrupted or encrypted.`);"
);
fs.writeFileSync('src/pages/CompressTool.tsx', content, 'utf8');
