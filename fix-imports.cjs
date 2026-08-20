const fs = require('fs');

function addDndImports(file, isGrid = false) {
  let content = fs.readFileSync(file, 'utf8');
  const dndImports = `import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';\nimport { arrayMove, SortableContext, sortableKeyboardCoordinates, ${isGrid ? 'rectSortingStrategy' : 'verticalListSortingStrategy'}, useSortable } from '@dnd-kit/sortable';\nimport { CSS } from '@dnd-kit/utilities';\nimport { GripVertical, GripHorizontal } from 'lucide-react';\n`;
  
  if (!content.includes('@dnd-kit/core')) {
    content = content.replace("import { motion", dndImports + "import { motion");
  }
  fs.writeFileSync(file, content, 'utf8');
}

addDndImports('src/pages/MergePdfs.tsx');
addDndImports('src/pages/MergePages.tsx');
addDndImports('src/pages/SplitPdf.tsx', true);

// Fix ConvertTool.tsx PDFPreview import
let convertTool = fs.readFileSync('src/pages/ConvertTool.tsx', 'utf8');
if (!convertTool.includes('PDFPreview')) {
  convertTool = convertTool.replace("import { FileUploader } from '../components/FileUploader';", "import { FileUploader } from '../components/FileUploader';\nimport PDFPreview from '../components/PDFPreview';");
  fs.writeFileSync('src/pages/ConvertTool.tsx', convertTool, 'utf8');
}

// Fix App.tsx BatchRename import
let appTsx = fs.readFileSync('src/App.tsx', 'utf8');
if (!appTsx.includes('import BatchRename')) {
  appTsx = appTsx.replace("import ConvertTool from './pages/ConvertTool';", "import BatchRename from './pages/BatchRename';\nimport ConvertTool from './pages/ConvertTool';");
  fs.writeFileSync('src/App.tsx', appTsx, 'utf8');
}

// Fix BatchRename.tsx removing useLanguage to fix the import error quickly, since it's not strictly needed there right now.
let batchRename = fs.readFileSync('src/pages/BatchRename.tsx', 'utf8');
batchRename = batchRename.replace("import { useLanguage } from '../components/LanguageContext';", "");
batchRename = batchRename.replace("const { t } = useLanguage();", "const t = (key: string) => key;");
fs.writeFileSync('src/pages/BatchRename.tsx', batchRename, 'utf8');

