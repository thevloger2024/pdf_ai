const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Update imports
content = content.replace(
  "const Split = React.lazy(() => import('./pages/Split'));",
  "const SplitHub = React.lazy(() => import('./pages/SplitHub'));\nconst SplitPdf = React.lazy(() => import('./pages/SplitPdf'));\nconst SplitText = React.lazy(() => import('./pages/SplitText'));"
);

// Update routes
content = content.replace(
  '<Route path="/split" element={<Split user={user} />} />',
  '<Route path="/split" element={<SplitHub />} />\n            <Route path="/split-pdf" element={<SplitPdf user={user} />} />\n            <Route path="/split-text" element={<SplitText user={user} />} />'
);

fs.writeFileSync('src/App.tsx', content, 'utf8');
