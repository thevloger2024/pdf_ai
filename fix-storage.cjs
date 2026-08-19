const fs = require('fs');
let content = fs.readFileSync('src/lib/storage.ts', 'utf8');
content = content.replace('const MAX_HISTORY = 5;', 'const MAX_HISTORY = 100;');
fs.writeFileSync('src/lib/storage.ts', content, 'utf8');
