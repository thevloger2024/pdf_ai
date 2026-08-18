const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace(
  '<Route path="/merge-pdfs" element={<MergePdfs />} />',
  '<Route path="/merge-pdfs" element={<MergePdfs user={user} />} />'
);
content = content.replace(
  '<Route path="/merge-pages" element={<MergePages />} />',
  '<Route path="/merge-pages" element={<MergePages user={user} />} />'
);
fs.writeFileSync('src/App.tsx', content, 'utf8');
