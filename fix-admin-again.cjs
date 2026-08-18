const fs = require('fs');
let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');
const actionMapRegex = /const actionMap: Record<string, \{ icon: any, label: string \}> = \{([\s\S]*?)\};/;
content = content.replace(actionMapRegex, (match, p1) => {
    if (!p1.includes('watermark_pdf')) {
        return `const actionMap: Record<string, { icon: any, label: string }> = {${p1}    watermark_pdf: { icon: Droplets, label: 'Added Watermark' },\n  };`;
    }
    return match;
});

const importRegex = /Trash2, Edit3, Type, Eye \} from 'lucide-react';/;
content = content.replace(importRegex, "Trash2, Edit3, Type, Eye, Droplets } from 'lucide-react';");

fs.writeFileSync('src/pages/Admin.tsx', content);
