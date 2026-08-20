const fs = require('fs');

// Fix ConvertTool.tsx PDFPreview import
let convertTool = fs.readFileSync('src/pages/ConvertTool.tsx', 'utf8');
if (!convertTool.includes('import PDFPreview')) {
  convertTool = "import PDFPreview from '../components/PDFPreview';\n" + convertTool;
  fs.writeFileSync('src/pages/ConvertTool.tsx', convertTool, 'utf8');
}

// Fix App.tsx BatchRename import
let appTsx = fs.readFileSync('src/App.tsx', 'utf8');
if (!appTsx.includes('import BatchRename')) {
  appTsx = "import BatchRename from './pages/BatchRename';\n" + appTsx;
  fs.writeFileSync('src/App.tsx', appTsx, 'utf8');
}

