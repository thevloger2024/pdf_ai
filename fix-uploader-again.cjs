const fs = require('fs');
let content = fs.readFileSync('src/components/FileUploader.tsx', 'utf8');

content = content.replace("if (isAccepted) {ext}\`))) {", "if (isAccepted) {");
fs.writeFileSync('src/components/FileUploader.tsx', content, 'utf8');
