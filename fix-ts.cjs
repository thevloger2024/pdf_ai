const fs = require('fs');
let code = fs.readFileSync('src/pages/ConvertTool.tsx', 'utf8');

code = code.replace(
  "textContent.items.forEach((item) => {",
  "textContent.items.forEach((item: any) => {"
);

code = code.replace(
  "const rowGroups = {};",
  "const rowGroups: { [y: number]: any[] } = {};"
);

code = code.replace(
  "const rowItems = rowGroups[y].sort((a, b) => a.transform[4] - b.transform[4]);",
  "const rowItems = rowGroups[y].sort((a: any, b: any) => a.transform[4] - b.transform[4]);"
);

code = code.replace(
  "const text = rowItems.map(item => item.str).join(' ');",
  "const text = rowItems.map((item: any) => item.str).join(' ');"
);

fs.writeFileSync('src/pages/ConvertTool.tsx', code, 'utf8');
