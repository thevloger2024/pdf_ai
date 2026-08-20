const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Add import
const importMatch = "import ConvertTool from './pages/ConvertTool';";
const newImport = "import BatchRename from './pages/BatchRename';\n" + importMatch;
content = content.replace(importMatch, newImport);

// Add Route
const routeMatch = '<Route path="/edit" element={<Edit user={user} />} />';
const newRoute = routeMatch + '\n            <Route path="/rename" element={<BatchRename />} />';
content = content.replace(routeMatch, newRoute);

fs.writeFileSync('src/App.tsx', content, 'utf8');
