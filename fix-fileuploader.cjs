const fs = require('fs');
let content = fs.readFileSync('src/components/FileUploader.tsx', 'utf8');

// Import useKeyboardShortcuts
if (!content.includes('useKeyboardShortcuts')) {
  content = content.replace(
    "import { useLanguage } from '../contexts/LanguageContext';",
    "import { useLanguage } from '../contexts/LanguageContext';\nimport { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';"
  );
}

// Add keyboard shortcut hook
if (!content.includes('useKeyboardShortcuts({')) {
  content = content.replace(
    "const fileInputRef = useRef<HTMLInputElement>(null);",
    "const fileInputRef = useRef<HTMLInputElement>(null);\n\n  useKeyboardShortcuts({\n    onOpen: () => {\n      fileInputRef.current?.click();\n    }\n  });\n"
  );
}

fs.writeFileSync('src/components/FileUploader.tsx', content, 'utf8');
