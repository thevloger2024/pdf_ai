const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// Replace history.map with history.slice(0, 5).map to only show recent 5 on the homepage
content = content.replace(
  "{history.map((item) => (",
  "{history.slice(0, 5).map((item) => ("
);

fs.writeFileSync('src/pages/Home.tsx', content, 'utf8');
