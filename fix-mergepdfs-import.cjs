const fs = require('fs');
let content = fs.readFileSync('src/pages/MergePdfs.tsx', 'utf8');

content = content.replace(
  "import { FileUploader } from '../components/FileUploader';",
  "import { FileUploader } from '../components/FileUploader';\nimport { PDFPreview } from '../components/PDFPreview';"
);

fs.writeFileSync('src/pages/MergePdfs.tsx', content, 'utf8');
